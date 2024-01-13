/**
 * @file sort-existing-photos.js
 * 
 * Sort collection photos into existing Calscape photos
 */
import { getPhotoCollection } from "./collection-data.js";
import { displayThumbnailsFromCalscape, initializeSortableGrid } from "./thumbnails.js";

let calscapePhotos = {};

export function initPhotoSort() {
    initializeSortableGrid('thumbnail-calscape-grid', 'calscape-drag-and-drop-message', Object.entries(calscapePhotos));
    const collection = getPhotoCollection();
    const species = collection["collection-type"] === 'species' ? collection["collection-species"] : '';
    if (species !== '') {
        fetchExistingPhotos(species);
    }

    displayThumbnailsFromCalscape(calscapePhotos);
}

function fetchExistingPhotos(speciesName) {
    // Use fetch to send the plant species name to your PHP script
    fetch("/includes/php/get_species_photos.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: speciesName,
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            populateCalscapePhotos(speciesName, data);
            console.log("Calscape photo data: ",calscapePhotos);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function populateCalscapePhotos(speciesName, results) {
    results.forEach(result => {
        const plantID = result.ID;
        const photoOrder = result.plant_photo_order;

        if (!(speciesName in calscapePhotos)) {
            calscapePhotos[speciesName] = {};
            calscapePhotos[speciesName]["plantID"] = plantID;
            calscapePhotos[speciesName]["photos"] =  {};
        }

        calscapePhotos[speciesName]["photos"][photoOrder] = {
            "CaptionTitle": result.CaptionTitle,
            "FileName": result.FileName,
            "photoID": result.photo_id
        };
    });
}
