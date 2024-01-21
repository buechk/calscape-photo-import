/**
 * @file sort-and-save.js
 * 
 * Sort collection photos into existing Calscape photos
 */
import { getPhotoById, getPhotoCollection, validatePhotoCollection } from "./collection-data.js";
import { displayThumbnailsFromCalscape, initializeSortableGrid } from "./thumbnails.js";
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
    initializeSortableGrid('thumbnail-calscape-grid', 'calscape-drag-and-drop-message', Object.entries(calscapePhotos), false);

    const calscapePhotoGrid = document.getElementById('thumbnail-calscape-grid');
    setupMutationObserver(calscapePhotoGrid);

    const collection = getPhotoCollection();
    const species = collection["collection-type"] === 'species' ? collection["collection-species"] : '';
    if (species !== '') {
        await fetchExistingPhotos(species);
        displayThumbnailsFromCalscape(calscapePhotos);
    }

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', function (event) {
        const delayDuration = 500; // milliseconds
        // Wait for the autosave to complete (adjust the delay if needed)
        setTimeout(() => {
            displayStatusMessage(`Saving "${collection['collection-species']}" photos to Calscape...`);
            const saveData = prepareSaveData();
            // save();
            // Convert the collectionData object to a JSON string with proper indentation
            const jsonString = JSON.stringify(saveData, null, 2);
            console.log(jsonString);
        }, delayDuration);
    });
}

// Function to set up the observer
function setupMutationObserver(targetElement) {
    const observer = new MutationObserver(async function (mutations) {
        /*
        for (const mutation of mutations) {
            const { addedNodes, removedNodes } = mutation;

            if (addedNodes.length > 0) {
                addedNodes.forEach(function (addedNode) {
                    console.log('Child element added', addedNode);

                    const foundPhoto = getPhotoById(addedNode.id);                  
                    if (foundPhoto) {
                      console.log("Photo added to Calscape photos:", foundPhoto);
                      calscapePhotos[id] = foundPhoto;
                    } else {
                      console.log("Unable to add photo to Calscape photos. Photo not found in collection.", addedNode.id);
                    }
                });
            }
        
            if (removedNodes.length > 0) {
                console.log("Removed nodes should not occur.")
            } 
        }
        */

        // sync up calscapeThumbnail order with target element order.
        calscapeThumbnails = Array.from(targetElement.querySelectorAll('.tcontainer'));
    });

    const config = { childList: true };

    observer.observe(targetElement, config);
}

async function fetchExistingPhotos(speciesName) {
    try {
        const response = await fetch("/includes/php/get_species_photos.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: speciesName,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        populateCalscapePhotos(speciesName, data);
        console.log("Calscape photo data: ", calscapePhotos);
    } catch (error) {
        console.error("Error:", error);
    }
}

function prepareSaveData() {
    const saveData = {}

    const collection = getPhotoCollection();

    saveData["species"] = collection["collection-type"] === 'species' ? collection["collection-species"] : '';
    saveData["collection-type"] = collection["collection-type"];
    saveData["user_id"] = collection["user_id"];
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
            photo = getPhotoById(tcontainer.id);
        }
        if (photo !== undefined) {
            saveData["photos"][order] = photo;
        } else {
            console.error("Photo not found. ID: ", tcontainer.id);
        }

    });

    return saveData;
}

function populateCalscapePhotos(speciesName, results) {
    results.forEach(result => {
        const plantID = result.ID;
        const photoOrder = result.plant_photo_order !== null ? result.plant_photo_order : result.plant_photo_calphotos_order;
        const photoID = result.photo_id

        if (!(speciesName in calscapePhotos)) {
            calscapePhotos[speciesName] = {};
            calscapePhotos[speciesName]["plantID"] = plantID;
            calscapePhotos[speciesName]["photos"] = {};
        }

        calscapePhotos[speciesName]["photos"][photoOrder] = {
            "id": photoID,
            "CaptionTitle": result.Copyright,
            "Artist": result.Artist,
            "FileName": result.FileName
        };
    });
}

async function save(speciesName) {
    try {
        const response = await fetch("/includes/php/save-to-db.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: speciesName,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Save to Calscape data: ", data);
    } catch (error) {
        console.error("Error:", error);
    }
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

