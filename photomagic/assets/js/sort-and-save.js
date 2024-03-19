/**
 * @file sort-and-save.js
 * 
 * Sort collection photos into existing Calscape photos
 */
import { clearPhotoCollection, getImageData, getPhotoCollection, getUserIDfromEmail, validatePhotoCollection } from "./collection-data.js";
import { displayThumbnailsFromCalscape, initializeSortableGrid, setupMutationObserver } from "./thumbnails.js";
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
                "CaptionTitle": null,
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
    dropMessage.innerText = "The selected photos have been added to Calscape...Thank you"

    initializeSortableGrid('thumbnail-calscape-grid', 'calscape-drag-and-drop-message', Object.entries(calscapePhotos), false);

    const calscapePhotoGrid = document.getElementById('thumbnail-calscape-grid');
    setupMutationObserver(calscapePhotoGrid, calscapeThumbnails, processMutation);

    displayCalscapePhotos();

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
                saveButton.disabled = true;
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
    if (!Array.isArray(results)) {
        console.error("Calscape photo results not provided.", results);
        return;
    }
    results.forEach(result => {
        const plantID = result.ID;
        const photoOrder = result.plant_photo_order !== null ? result.plant_photo_order : result.plant_photo_calphotos_order;
        const photoID = result.photo_id;

        if (!(speciesName in calscapePhotos)) {
            calscapePhotos[speciesName] = {};
            calscapePhotos[speciesName]["plantID"] = plantID;
            calscapePhotos[speciesName]["photos"] = {};
        }

        calscapePhotos[speciesName]["photos"][photoOrder] = {
            "id": photoID,
            "CaptionTitle": result.CaptionTitle,
            "Copyright": result.Copyright,
            "CopyrightNotice": result.CopyrightNotice,
            "Artist": result.Artist,
            "CaptionDescription": result.CaptionDescription,
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


