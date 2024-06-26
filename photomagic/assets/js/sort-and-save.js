/**
 * @file sort-and-save.js
 * 
 * Sort collection photos into existing Calscape photos
 */
import { clearPhotoCollection, getImageData, getPhotoCollection, getUserIDfromEmail, setCollectionSpecies, validatePhotoCollection } from "./collection-data.js";
import { displayThumbnailsFromCalscape, initializeSortableGrid, setupMutationObserver, getSelectedThumbnails } from "./thumbnails.js";
import { displayStatusMessage } from "./status.js";

let calscapePhotos = {};

let calscapeThumbnails = []; // Store calscape photo thumbnails as an array

// The structure of calscapePhotos is as follows:
/*
{
    "Prunus ilicifolia ssp. lyonii": {
        "plantID": 3082,
        "photos": {
            "1": {
                "Title": null,
                "FileName": "Prunus_ilicifolia_ssp_lyonii_image_5.jpg",
                "photoID": "29202"
            },
            // ... (other photos)
        }
    },
    // ... (other species)
};
*/

export async function initPhotoSort() {
    // initialize message to be displayed when grid is empty
    const dropMessage = document.getElementById('drag-and-drop-message');
    dropMessage.innerText = "Finished sorting and saving photos...Thank you"

    initializeSortableGrid('thumbnail-calscape-grid', 'calscape-drag-and-drop-message', Object.entries(calscapePhotos), false);

    const calscapePhotoGrid = document.getElementById('thumbnail-calscape-grid');
    setupMutationObserver(calscapePhotoGrid, calscapeThumbnails, processMutation);

    displayCalscapePhotos();

    // Download button handler
    const downloadButton = document.getElementById('save-to-csv-button');
    downloadButton.disabled = false;
    downloadButton.addEventListener('click', async function (event) {
        const delayDuration = 500; // milliseconds
        // Wait for the autosave to complete (adjust the delay if needed)
        setTimeout(async () => {
            if (!await validatePhotoCollection()) {
                return;
            }

            const saveData = await prepareSaveData();

            // Count the number of new photos being added
            let count = 0;

            const message = `Starting photo package download...`;
            displayStatusMessage(message);

            // Call the download function
            download(saveData)
                .then(result => {
                    let resultMessage = '';
                    if (result["success"] && result["new_succeeded"].length === 0 && result["update_succeeded"].length === 0) {
                        resultMessage = "There were no new or updated photos";
                    }
                    else {
                        resultMessage = result["success"] ? "CSV download complete" : "Failed to download CSV";
                    }
                    displayStatusMessage(`${resultMessage}`, false, -1, true);
                })
                .catch(error => {
                    console.error("Error occurred during download:", error);
                    displayStatusMessage("Error occurred during download", false, -1, true);
                });

        }, delayDuration);
    });

    // Save button handler
    const saveButton = document.getElementById('save-button');
    saveButton.disabled = false;

    saveButton.addEventListener('click', async function (event) {
        const delayDuration = 500; // milliseconds
        // Wait for the autosave to complete (adjust the delay if needed)
        setTimeout(async () => {
            if (!await validatePhotoCollection()) {
                return;
            }

            const saveData = await prepareSaveData();

            // Count the number of new photos being added
            let count = 0;

            for (const key in saveData.photos) {
                if (saveData.photos[key].hasOwnProperty('sourceImage')) {
                    count++;
                }
            }
            const message = count === 1 ? `Saving ${count} new photo to Calscape...` : `Saving ${count} new photos to Calscape...`;
            displayStatusMessage(message);

            const result = await save(saveData);
            if (result && result.success) {
                const resultMessage = getSaveStatus(result);
                displayStatusMessage(`${resultMessage}`, false, -1, true);
                clearPhotoCollection();
                clearCalscapePhotos();
                displayCalscapePhotos(true);
            }
            else if (result && !result.success) {
                result.messages.forEach(message => {
                    console.error(message);
                });
                displayStatusMessage(`Error saving photos.`, true);
            }
            else {
                displayStatusMessage(`Error saving photos.`, true);
            }
        }, delayDuration);
    });
}

export async function updateCollectionSpecies(species) {
    clearCalscapePhotos();
    setCollectionSpecies (species);

    const calscapePhotoGrid = document.getElementById('thumbnail-calscape-grid');
    if (calscapePhotoGrid !== null && calscapePhotoGrid !== undefined) {
        displayCalscapePhotos(true); // refresh the Calscape photos with new species
    }
}

async function displayCalscapePhotos(refresh = false) {
    const calscapePhotoGrid = document.getElementById('thumbnail-calscape-grid');

    const collection = getPhotoCollection();
    const species = collection["collection-type"] === 'species' ? collection["collection-species"] : '';

    if (species !== '') {
        if (refresh || calscapeThumbnails.length === 0) {
            clearCalscapePhotos();
            await fetchExistingPhotos(species);
            displayThumbnailsFromCalscape(calscapePhotos);
        }
        else {
            // add collection thumbnails to group grid
            calscapeThumbnails.forEach(function (thumbnail) {
                calscapePhotoGrid.appendChild(thumbnail);
            });
        }
    }
}

function getSaveStatus(jsonResponse) {
    // Assuming jsonResponse is the JSON-decoded response from PHP
    // You may get it through an AJAX call or however you're communicating with the PHP backend

    let statusMessage = '';

    if (jsonResponse.success) {
        // Success message
        console.log("Save operation successful!");

        // Print messages
        for (let message of jsonResponse.messages) {
            console.log(message);
        }

        const newPhotosAdded = jsonResponse.new_succeeded.length;
        const existingPhotosUpdated = jsonResponse.update_succeeded.length;
        const newPhotosFailed = jsonResponse.new_failed.length;
        const existingPhotosUpdateFailed = jsonResponse.update_failed.length;


        statusMessage += `Added ${jsonResponse.new_succeeded.length} new ${newPhotosAdded === 1 ? 'photo' : 'photos'}. `;

        // Check if any existing photos had their positions updated
        if (existingPhotosUpdated > 0) {
            statusMessage += `Updated positions for ${existingPhotosUpdated} existing ${existingPhotosUpdated === 1 ? 'photo' : 'photos'}. `;
        }

        // Check if there were any failed attempts to add new photos
        if (newPhotosFailed > 0) {
            statusMessage += `Failed to add ${newPhotosFailed} new ${newPhotosFailed === 1 ? 'photo' : 'photos'}. `;
        }

        // Check if there were any failed attempts to update positions of existing photos
        if (existingPhotosUpdateFailed > 0) {
            statusMessage += `Failed to update positions for ${existingPhotosUpdateFailed} existing ${existingPhotosUpdateFailed === 1 ? 'photo' : 'photos'}. `;
        }
    } else {
        // Failure message
        console.error("Save operation failed!");

        // Print error messages
        for (let message of jsonResponse.messages) {
            console.error(message);
        }
    }
    return statusMessage;
}

async function fetchExistingPhotos(speciesName) {
    try {
        const response = await fetch(`/photomagic/includes/php/get_species_photos.php?speciesName=${encodeURIComponent(speciesName)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Log the response body
        const responseBody = await response.text();
        console.log("Response body:", responseBody);

        // Attempt to parse the response body as JSON
        const result = JSON.parse(responseBody);
        console.log(result);
        if (result.status === "success") {
            populateCalscapePhotos(speciesName, result.data);
            console.log("Calscape photo data: ", calscapePhotos);
        }
        else {
            console.error("Error:", "Failed to retrieve Calscape photos for " + speciesName);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function updateReviewStatus(collection) {
    collection.status = "reviewed";
    collection.reviewDate = new Date().toLocaleString();
}

async function prepareSaveData() {
    const saveData = {}

    const collection = getPhotoCollection(true);

    // Persistently save any changes to the properties of the collection made by the reviewer
    updateReviewStatus(collection);
    saveCollection(collection);

    saveData["collection-name"] = collection["collection-name"];
    saveData["species"] = collection["collection-type"] === 'species' ? collection["collection-species"] : '';
    saveData["collection-type"] = collection["collection-type"];
    saveData["user_id"] = await getUserIDfromEmail(collection["user_id"]);
    saveData["photos"] = {}
    // Convert child nodes of the grid to an array
    const thumbnailGrid = document.getElementById('thumbnail-calscape-grid');
    calscapeThumbnails = Array.from(thumbnailGrid.querySelectorAll('.tcontainer'));

    let i = 0;
    calscapeThumbnails.forEach(function (tcontainer) {
        let photo;
        const isExisting = tcontainer.classList.contains('calscape-existing');
        const order = calscapeThumbnails.indexOf(tcontainer);

        if (isExisting) {
            photo = findPhotoById(calscapePhotos, tcontainer.id);
        }
        else {
            photo = getImageData(tcontainer.id);
        }
        if (photo !== undefined) {
            saveData["photos"][order] = photo;
            delete saveData["photos"][order].deleted; // removed deleted flag or database will complain
        } else {
            console.error("Photo not found. ID: ", tcontainer.id);
        }

    });

    // Convert the collectionData object to a JSON string with proper indentation
    const jsonString = JSON.stringify(saveData, null, 2);
    console.log("Saving to Calscape: ", jsonString);

    return saveData;
}

async function save(saveData) {
    try {
        const response = await fetch("/photomagic/includes/php/save-to-db.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(saveData), // Automatically converts the object to JSON
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("HTTP error! Status:", response.status);
            return false;
        }

        return data;

    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}

async function download(saveData) {
    try {
        const response = await fetch("/photomagic/includes/php/download_csv.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(saveData), // Automatically converts the object to JSON
        });

        const responseData = await response.json();

        if (response.ok) {
            if (responseData.success && responseData.download_url) {
                // Create a hidden iframe
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // Set the iframe source to initiate the download
                iframe.src = responseData.download_url;

                return responseData; // Indicate successful download initiation
            } else {
                console.error("Download package creation failed:", responseData.messages);
                return responseData; // Download failure
            }
        } else {
            console.error("HTTP error! Status:", response.status);
            return { success: false, message: `HTTP error! Status: ${response.status}` }; // HTTP error
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Error occurred while downloading" }; // Download failure due to error
    }
}

function saveCollection(collection) {
    // Convert the collection object to JSON
    const jsonData = JSON.stringify(collection, null, 2);
    const fileName = collection.filename;

    // Construct the URL with the optional fileName parameter
    const url = `/photomagic/includes/php/save-collection.php${fileName ? `?fileName=${fileName}` : ''}`;

    // Make an AJAX request to save the collection
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {
            // Handle the response (if needed)
            console.log('Collection saved to file: ', data.filename);
        })
        .catch(error => {
            // Handle network errors or other exceptions
            console.error('Error:', error);
        });
}

function populateCalscapePhotos(speciesName, results) {
    if (!(speciesName in calscapePhotos)) {
        calscapePhotos[speciesName] = {};
        calscapePhotos[speciesName]["photos"] = {};
    }

    if (!Array.isArray(results)) {
        console.error("Calscape photo results not provided.", results);
        return;
    }
    results.forEach(result => {
        const plantID = result.ID;
        if (!(calscapePhotos[speciesName] && "plantID" in calscapePhotos[speciesName])) {
            calscapePhotos[speciesName]["plantID"] = plantID;
        }

        const photoOrder = result.plant_photo_order !== null ? result.plant_photo_order : result.plant_photo_calphotos_order;
        const photoID = result.photo_id;

        calscapePhotos[speciesName]["photos"][photoOrder] = {
            "id": photoID,
            "Title": result.Title,
            "ImageDescription": result.ImageDescription,
            "CopyrightNotice": result.CopyrightNotice,
            "UsageTerms": result.UsageTerms,
            "License": result.License,
            "Artist": result.Artist,
            "DateTimeOriginal": result.DateTimeOriginal,
            "Landscaper": result.Landscaper,
            "LandscapeDesigner": result.LandscapeDesigner,
            "Nursery": result.Nursery,
            "FileName": result.FileName,
            "plant_photo_order": result.plant_photo_order,
            "plant_photo_calphotos_order": result.plant_photo_calphotos_order
        };
    });
}

function findPhotoById(speciesData, photoId) {
    // Iterate through each species
    for (const speciesName in speciesData) {
        const species = speciesData[speciesName];

        // Check if the species has a "photos" property
        if (species.photos !== undefined) {
            return species.photos[photoId];
        }
    }
    // If no matching photo is found, return null
    return null;
}

function deletePhoto(photoIdToDelete) {
    const speciesKey = Object.keys(calscapePhotos)[0];

    if (calscapePhotos.photos) {
        Object.keys(calscapePhotos[speciesKey].photos).forEach(key => {
            const photo = calscapePhotos.photos[key];
            if (photo && photo.id === photoIdToDelete) {
                delete calscapePhotos[speciesKey].photos[key];
                console.log(`Photo with ID ${photoIdToDelete} deleted successfully from Calscape photos.`);
            }
        });
    } else {
        console.log("No photos found.");
    }
}


function handleRemovedNode(removedNode) {
    try {
        console.log('Child element removed from Calscape photos', removedNode);
        if (removedNode.classList.contains("calscape-existing")) {
            return;
        }

        deletePhoto(removedNode.id);

        console.log("Photo removed from Calscape photos:", getImageData(removedNode.id));

    } catch (error) {
        console.error('Error processing removed node:', error);
    }
}

async function handleAddedNode(addedNode) {
    try {
        console.log('Child element added to Calscape photos', addedNode);
        if (addedNode.classList.contains("calscape-existing")) {
            return;
        }

        // Find collection imageData photo and add it to calscapePhotos
        const collectionPhoto = getImageData(addedNode.id);
        if (collectionPhoto) {
            const speciesKey = Object.keys(calscapePhotos)[0];
            const addedPhotoID = Object.keys(calscapePhotos[speciesKey].photos).length + 1;

            calscapePhotos[speciesKey].photos[addedPhotoID] = collectionPhoto;

            console.log("Photo added to Calscape photos:", calscapePhotos[speciesKey].photos[addedPhotoID]);
        } else {
            console.log("Unable to add photo to Calscape photos. Photo not found in collection.", addedNode.id);
        }
    } catch (error) {
        console.error('Error processing added node:', error);
    }
}

export function processMutation(mutation) {
    mutation.addedNodes.forEach((addedNode) => {
        handleAddedNode(addedNode);
    });
}

export function getCalscapeThumbnails() {
    return calscapeThumbnails;
}

export async function clearCalscapePhotos() {
    const removedNodesArray = Array.from(calscapeThumbnails);
    for (const removedNode of removedNodesArray) {
        handleRemovedNode(removedNode);
    }
    calscapeThumbnails.length = 0;
    calscapePhotos = {};
}

export function showCalscapePhotos() {
    if (document.querySelector('#thumbnail-calscape-grid')) {
        // Check if the user has selected multiple thumbnails
        const selectedThumbnails = getSelectedThumbnails();
        const properties = {};

        saveSelectedProperties(); // save previously selected properties before clearing
        clearPropertiesFields();
        const heading = document.getElementById('properties-for-selected-heading');

        // set selected id
        saveSelectedThumbnailIds(selectedThumbnails);

        if (selectedThumbnails.length > 1) {
            if (heading != null) {
                heading.textContent = 'Properties apply to multiple selected photos'
            }
            // Iterate over the selected thumbnails and get their properties
            selectedThumbnails.forEach(tcontainer => {
                // Extract the properties of each selected thumbnail
                const imageObj = getImageData(tcontainer.id);
                if (imageObj !== null && imageObj !== undefined) {
                    properties[tcontainer.id] = imageObj;
                }
            });

            // Display the common properties that can be modified for all selected thumbnails
            showCommonProperties(properties);

        } else if (selectedThumbnails.length === 1) {
            if (heading != null) {
                heading.textContent = 'Properties apply to the selected photo'
            }

            // Handle the case when only one thumbnail is selected
            showSelectedProperties(selectedThumbnails[0]);
        }

        else {
            // no thumbnails are selected
            return;
        }
    }
}


