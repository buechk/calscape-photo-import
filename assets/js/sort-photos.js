/**
 * @file sort-existing-photos.js
 * 
 * Sort collection photos into existing Calscape photos
 */
import { getPhotoCollection } from "./collection-data.js";
import { displayThumbnailsFromCalscape, initializeSortableGrid } from "./thumbnails.js";

let calscapePhotos = {};

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
    const collection = getPhotoCollection();
    const species = collection["collection-type"] === 'species' ? collection["collection-species"] : '';
    if (species !== '') {
        await fetchExistingPhotos(species);
        displayThumbnailsFromCalscape(calscapePhotos);
    }
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


function populateCalscapePhotos(speciesName, results) {
    results.forEach(result => {
        const plantID = result.ID;
        const photoOrder = result.plant_photo_order !== null? result.plant_photo_order : result.plant_photo_calphotos_order;

        if (!(speciesName in calscapePhotos)) {
            calscapePhotos[speciesName] = {};
            calscapePhotos[speciesName]["plantID"] = plantID;
            calscapePhotos[speciesName]["photos"] =  {};
        }

        calscapePhotos[speciesName]["photos"][photoOrder] = {
            "CaptionTitle": result.Copyright,
            "FileName": result.FileName,
            "photoID": result.photo_id
        };
    });
}
