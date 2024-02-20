/**
 * @file collection-data.js
 */
import { removeSourcePhoto, storeSourcePhoto, getSourcePhoto } from "./source-photo-data.js";
import { importconfig, createPropertiesFields } from "./properties.js";
import { updateSpeciesChoice } from "./species-selection.js";
import { displayStatusMessage } from "./status.js";
import { ROLE, Mode } from "./side-bar-nav.js";
import { createThumbnailContainer, setupMutationObserver, initializeSortableGrid, displayThumbnailsFromSourcePhotos } from "./thumbnails.js";

const FLICKR_APIKEY = "7941c01c49eb07af15d032e0731e9790";

let collectionThumbnails = []; // Store collection photo thumbnails as an array

let collectionData = {
    "collection-name": "",
    "collection-type": "species",
    "user_id": "",
};

/*
Example of collectionData

{
  "collection-name": "Test Collection",
  "collection-species": "Cornus sericea",
  "collection-type": "species",
  "user_id": "buechk6164",
  "photos": {
    "0": {
      "id": "263622339",
      "sourceImage": "https://farm1.staticflickr.com/79/263622339_70fb0695ee_b.jpg",
      "CaptionTitle": "Cornus sericea - Redtwig or Creek Dogwood",
      "CaptionDescription": "",
      "DateTimeOriginal": "2006-09-30 21:57:48",
      "ImageDescription": "",
      "LandscaperName": "",
      "LandscapeDesigner": "",
      "Artist": "pete veilleux",
      "CopyrightCategory": "All Rights Reserved (ARR)",
      "Ranking": "0",
      "Keywords": [
        "'autumn",
        "colors'",
      ],
      "FileName": "Cornus_sericea_263622339_70fb0695ee_b.jpg"
    },
    "1": {
      "id": "264780915",
      "sourceImage": "https://farm1.staticflickr.com/97/264780915_9cd3287e6e_b.jpg",
      "CaptionTitle": "Cornus sericea - Redtwig or Creek Dogwood and Populus tremuloides - Quaking Aspen",
      "CaptionDescription": "",
      "DateTimeOriginal": "2006-10-01 00:01:31",
      "ImageDescription": "",
      "LandscaperName": "",
      "LandscapeDesigner": "",
      "Artist": "pete veilleux",
      "CopyrightCategory": "All Rights Reserved (ARR)",
      "Ranking": "0",
      "Keywords": [
        "'autumn",
        "colors'",
        "'fall",
        "'leaf",
        "'colorful",
        "foliage'",
        "yearroundbeauty"
      ],
      "FileName": "Cornus_sericea_264780915_9cd3287e6e_b.jpg"
    },
    "2": {
      "id": "264781491",
      "sourceImage": "https://farm1.staticflickr.com/83/264781491_12abaf97e4_b.jpg",
      "CaptionTitle": "Cornus sericea - Redtwig or Creek Dogwood",
      "CaptionDescription": "",
      "DateTimeOriginal": "2006-10-01 00:26:01",
      "ImageDescription": "",
      "LandscaperName": "",
      "LandscapeDesigner": "",
      "Artist": "pete veilleux",
      "CopyrightCategory": "All Rights Reserved (ARR)",
      "Ranking": "0",
      "Keywords": [
        "'autumn",
        "colors'",
        "'fall",
        "yearroundbeauty"
      ],
      "FileName": "Cornus_sericea_264781491_12abaf97e4_b.jpg"
    }
    ...<more entries>
  }
}
*/

// Data for each image will be stored here
export let imageData = {};

/* example data
{
    "000": {
        "id" : "000",
        "deleted" : false,
        "species": "Carex pansa",
        "DateTimeOriginal": "2023-9-27",
        "ImageDescription": "Pathway with sedges",
        "Artist": "Kristy",
        "CopyrightNotice": "Copyright 2023 Kristy Bueche"
        "CopyrightCategory": "Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)"
        ...
    },
    "001": {
        "id" : "000"
        "deleted" : true,
        "species": "Eriogonum fasciculatum 'Warriner Lytle'",
        "DateTmeOriginal": "2023-9-21",
        "ImageDescription": "Buckwheat cascading over wall",
        "Artist": "Ed",
        "CopyrightNotice": ""
        "CopyrightCategory": "Attribution (CC BY)"
        ...
    }
    // More entries
}
*/

export function getPhotoById(photoId) {
    // Check if the 'photos' property exists in the collection object
    if ('photos' in collectionData) {
        // Iterate through the photos
        for (const photoIndex in collectionData.photos) {
            const photo = collectionData.photos[photoIndex];

            // Check if the current photo has the desired ID
            if (photo.id === photoId) {
                return photo; // Return the photo object if found
            }
        }
    }

    // Return null if the photo with the given ID is not found
    return null;
}

export function getImageData(id) {
    return imageData[id];
}

export function getCollectionThumbnails() {
    return collectionThumbnails;
}

export function addCollectionThumbnail(tcontainer) {
    collectionThumbnails.push(tcontainer);
}

export function initializeCollectionData() {
    const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');

    const dropMessage = document.getElementById('drag-and-drop-message');
    dropMessage.innerText = "Drag and drop source photo thumbnails here photos to a collection"

    initializeSortableGrid('thumbnail-group-grid', 'drag-and-drop-message', getCollectionThumbnails());

    setupMutationObserver(thumbnailGroupGrid, collectionThumbnails, processMutation);

    createPropertiesFields();
    showCollectionProperties();

    // add collection thumbnails to group grid
    collectionThumbnails.forEach(function (thumbnail) {
        thumbnailGroupGrid.appendChild(thumbnail);
    });
}

// Queue for storing mutations
const mutationQueue = [];
// Flag to indicate if the observer is currently processing a mutation
let isProcessing = false;

async function handleRemovedNode(removedNode) {
    console.log('Child element removed from collection grid:', removedNode);
    const id = removedNode.id;
    const imageObj = imageData[id];

    if (imageObj) {
        try {
            imageObj.deleted = true;
            if (ROLE == Mode.CONTRIBUTE) {
                await storeSourcePhoto(imageObj.id, imageObj.sourceImage, imageObj.thumbnail, imageObj.CaptionTitle);
                console.log('Source photo stored: ', id, imageObj.CaptionTitle);
            }
        } catch (error) {
            console.error('Error storing source photo:', error);
        }
    }
}

async function handleAddedNode(addedNode) {
    try {
        if (addedNode.classList.contains('calscape-existing')) {
            return;
        }
        console.log('Child element added', addedNode);
        await populateThumbnailProperties(addedNode.id);
        console.log('Thumbnail properties populated successfully.');
        await removeSourcePhoto(addedNode.id);
        if (document.querySelector('#source-photos-container')) {
            displayThumbnailsFromSourcePhotos();
        }
    } catch (error) {
        console.error('Error processing added node:', error);
    }
}

export function processMutation(mutation) {
    mutation.addedNodes.forEach((addedNode) => {
        console.log('Child element added', addedNode);
        handleAddedNode(addedNode);
    });

    mutation.removedNodes.forEach((removedNode) => {
        console.log('Child element removed:', removedNode);
        handleRemovedNode(removedNode);
    });
}

/* Old implementation

async function handleRemovedNodes(removedNodes) {
    const removedNodesArray = Array.from(removedNodes);

    for (const removedNode of removedNodesArray) {
        console.log('Child element removed:', removedNode);
        const id = removedNode.id;
        const caption = removedNode.caption;
        const imageObj = imageData[id];

        if (imageObj) {
            try {
                await storeSourcePhoto(imageObj.id, imageObj.sourceImage, imageObj.thumbnail, imageObj.CaptionTitle);
                console.log('Source photo stored: ', id, caption);
            } catch (error) {
                console.error('Error storing source photo:', error);
            }
        }
    }

    // Reset the processing flag
    isProcessing = false;

    // Check if there are more mutations in the queue
    if (mutationQueue.length > 0) {
        const nextMutation = mutationQueue.shift();
        await processMutation(nextMutation);
    }
}

async function processMutation(mutation) {
    isProcessing = true;

    const { addedNodes, removedNodes } = mutation;

    for (const addedNode of addedNodes) {
        try {
            console.log('Child element added', addedNode);
            await populateThumbnailProperties(addedNode.id);
            console.log('Thumbnail properties populated successfully.');
            await removeSourcePhoto(addedNode.id);
        } catch (error) {
            console.error('Error processing added node:', error);
        }
    }

    if (removedNodes.length > 0) {
        await handleRemovedNodes(removedNodes);
    } else {
        // Reset the processing flag
        isProcessing = false;
    }
}
*/

/*
// Function to set up the observer - uses DomNodeInserted and DomNodeRemoved events
function setupMutationObserver(targetGrid, gridArray, callback,) {
    // Listen for the DOMNodeInserted event to capture added nodes
    targetGrid.addEventListener('DOMNodeInserted', handleNodeInserted);
 
    // Listen for the DOMNodeRemoved event to capture removed nodes
    targetGrid.addEventListener('DOMNodeRemoved', handleNodeRemoved);
 
    // Function to handle added nodes
    function handleNodeInserted(event) {
        const addedNode = event.target;
        console.log('Child element added', addedNode);
        callback(addedNode, targetGrid, gridArray);
        // Update the contents of the existing array with the current order of elements
        updateGridArray();
    }
 
    // Function to handle removed nodes
    function handleNodeRemoved(event) {
        const removedNode = event.target;
        console.log('Child element removed:', removedNode);
        // Process the removal and update the array
        callback(removedNode, targetGrid, gridArray);
        updateGridArray();
    }
 
    // Function to update the contents of the array with the current order of elements
    function updateGridArray() {
        console.log("Sync'ing grid array with grid contents: ", targetGrid.querySelectorAll('.tcontainer'));
        gridArray.length = 0; // Clear the existing array
        gridArray.push(...Array.from(targetGrid.querySelectorAll('.tcontainer')));
    }
}
*/

/*
// Function to set up the observer
function setupMutationObserver(targetGrid, gridArray, callback,) {
    const observer = new MutationObserver(async function (mutations) {
        for (const mutation of mutations) {
            console.log("Processing mutations to mutation target: ", mutation.target);
            console.log("Added nodes:", mutation.addedNodes);
            console.log("Removed nodes", mutation.removedNodes);
            mutationQueue.push(mutation);
 
            if (!isProcessing) {
                // Process the first mutation in the queue
                await callback(mutationQueue.shift(), targetGrid, gridArray);
            }
        }
 
        // After processing mutations, update the contents of the existing array with the current order of elements
        // Note: This is outside the for loop, so it's called after all mutations have been processed.
        setTimeout(() => updateGridArray(targetGrid, gridArray), 500);
    });
 
    const config = { childList: true };
    observer.observe(targetGrid, config);
 
    // Function to update the contents of the array with the current order of elements
    function updateGridArray(targetGrid, gridArray) {
        console.log("Sync'ing grid array with grid contents: ", targetGrid.querySelectorAll('.tcontainer'));
        gridArray.length = 0; // Clear the existing array
        gridArray.push(...Array.from(targetGrid.querySelectorAll('.tcontainer')));
    }
}
 
*/

/**
 * populate properties from the configured datasource for the given thumbnail
 * @param {*} id thumbnail-group-grid id
 */
function populateThumbnailProperties(id) {
    return new Promise(async (resolve, reject) => {
        // If we have not already stored data for this image then store it now
        if (imageData.hasOwnProperty(id)) {
            // properties for this photo have already been retrieved
            imageData[id].deleted = false;
            resolve();
        } else {
            try {
                const imageObj = {};
                imageObj["id"] = id;

                const photo = getSourcePhoto(id);

                if (photo.hasOwnProperty('file') && photo.file instanceof File) {
                    imageObj["sourceImage"] = photo.file;
                    // Read the photo file and parse EXIF data once
                    const exifData = await readAndParseExifData(photo.file);

                    for (const table of importconfig.photoimportconfig.tables) {
                        for (const column of table.columns) {
                            const isCollectionProp = column.applies_to == "collection" ? true : false;

                            if (isCollectionProp) {
                                // The selected properties container is not shown, and property applies to a 
                                // collection, so ignore properties that apply to the selected image
                                continue;
                            }

                            // Use the parsed EXIF data for each Calscape table column
                            if (column.hasOwnProperty("valuemap")) {
                                const value = getExifPropertyValue(column.name, column.datasources, column.userinterface.multivalue, exifData);
                                if (column.valuemap.hasOwnProperty(value)) {
                                    imageObj[column.name] = column.valuemap[value];
                                } else {
                                    imageObj[column.name] = value;
                                }
                            } else {
                                imageObj[column.name] = getExifPropertyValue(column.name, column.datasources, column.userinterface.multivalue, exifData);
                            }
                            console.log(column.name + ": " + imageObj[column.name]);
                        }
                    }
                } else {
                    console.log(`photo ${id} is from Flickr`);
                    imageObj["sourceImage"] = getSourcePhoto(id).url;
                    imageObj["thumbnail"] = getSourcePhoto(id).thumbnail;
                    const flickrData = await getFlickrPhotoInfo(id, 'flickr.photos.getInfo');
                    const flickrExifData = await getFlickrPhotoInfo(id, 'flickr.photos.getExif');
                    for (const table of importconfig.photoimportconfig.tables) {
                        for (const column of table.columns) {
                            const isCollectionProp = column.applies_to == "collection" ? true : false;

                            if (isCollectionProp) {
                                // The selected properties container is not shown, and property applies to a 
                                // collection, so ignore properties that apply to the selected image
                                continue;
                            }

                            if (column.hasOwnProperty("valuemap")) {
                                const value = await getFlickrPropertyValue(column.name, column.datasources, column.userinterface.multivalue, flickrData, flickrExifData);
                                if (column.valuemap.hasOwnProperty(value)) {
                                    imageObj[column.name] = column.valuemap[value];
                                } else {
                                    imageObj[column.name] = value;
                                }
                            } else {
                                imageObj[column.name] = await getFlickrPropertyValue(column.name, column.datasources, column.userinterface.multivalue, flickrData, flickrExifData);
                            }
                        }
                    }
                }

                imageData[id] = imageObj;

                console.log('Populated image data: ');
                for (const key in imageData) {
                    if (imageData.hasOwnProperty(key)) {
                        const value = imageData[key];
                        console.log(`Key: ${key}, Value:`, value);
                    }
                }

                resolve(); // Resolve the promise when everything is done
            } catch (error) {
                reject(error); // Reject the promise if there's an error
            }
        }
    });
}

async function readAndParseExifData(photo) {
    return new Promise((resolve, reject) => {
        if (photo instanceof File && photo.type === 'image/jpeg') {
            const reader = new FileReader();
            reader.onload = function (event) {
                const fileData = event.target.result;

                // Use the exif-js library to get EXIF data
                try {
                    const exifData = EXIF.readFromBinaryFile(fileData);
                    resolve(exifData);
                } catch (exifError) {
                    console.error('Error parsing EXIF data:', exifError);
                    reject('Error parsing EXIF data');
                }
            };

            reader.onerror = function (event) {
                console.error('Error occurred while reading the file', event);
                reject('Error occurred while reading the file');
            };

            reader.readAsArrayBuffer(photo);
        } else {
            console.error('Photo is not a jpeg file');
            reject('Photo is not a jpeg file');
        }
    });
}

function getExifPropertyValue(column, datasources, ismultivalue, exifData) {
    let data = '';
    if (exifData) {
        const source = datasources && datasources.jpeg;
        if (source) {
            const propertyvalue = exifData[source.slice(source.indexOf('.') + 1)];
            console.log('getDataSource: ' + column + ': ' + propertyvalue);
            data = propertyvalue;
        }
    } else {
        console.error('Exif data is not available');
    }

    if (ismultivalue && !Array.isArray(data)) {
        const newArray = [];
        if (data !== undefined) {
            newArray.push(data);
        }
        data = newArray;
    }

    return data;
}

async function getFlickrPhotoInfo(id, method) {
    return new Promise((resolve, reject) => {
        const apiKey = FLICKR_APIKEY;
        const photoId = id;

        // Construct the API URL
        const apiUrl = 'https://www.flickr.com/services/rest/';

        // Make an AJAX request to the Flickr API to getInfo
        $.ajax({
            url: apiUrl,
            type: 'GET',
            dataType: 'json',
            data: {
                method: method,
                api_key: apiKey,
                photo_id: photoId,
                format: 'json',
                nojsoncallback: 1,
            },
            success: function (flickrInfo) {
                // Handle the API response here
                console.log(`Flicker ${method} call return data: ${flickrInfo}`);
                resolve(flickrInfo);
            },
            error: function (error) {
                // Handle errors here
                console.error(error);
            },
        });
    });
}

async function getFlickrPropertyValue(column, datasources, ismultivalue, flickrData, flickrExifData) {
    const sources = datasources && datasources.flickr;

    let propertyvalue = '';

    // If sources is an array of queries, evaluate each query until a non-empty result is found
    if (Array.isArray(sources)) {
        for (const source of sources) {
            try {
                const expression = jsonata(source);
                propertyvalue = source.includes('exif') ? await expression.evaluate(flickrExifData) : await expression.evaluate(flickrData);
                if (propertyvalue !== undefined && propertyvalue !== '') {
                    if (ismultivalue && !Array.isArray(propertyvalue)) {
                        const newArray = [];
                        if (propertyvalue !== undefined) {
                            newArray.push(propertyvalue);
                        }
                        propertyvalue = newArray;
                    }
                    console.log('getDataSource: ' + column + ': ' + propertyvalue);
                }
            } catch (error) {
                console.error('Error evaluating expression:', error);
            }
        }
    } else if (sources) {
        // If sources is a single query, evaluate it
        try {
            const expression = jsonata(sources);
            propertyvalue = sources.includes('exif') ? await expression.evaluate(flickrExifData) : await expression.evaluate(flickrData);
            if (ismultivalue && !Array.isArray(propertyvalue)) {
                const newArray = [];
                if (propertyvalue !== undefined) {
                    newArray.push(propertyvalue);
                }
                propertyvalue = newArray;
            }

            console.log('getDataSource: ' + column + ': ' + propertyvalue);
        } catch (error) {
            console.error('Error evaluating expression:', error);
        }
    }

    return propertyvalue;
}

/**
 * Function to save properties from input element to collectionData
 * @param {HTMLElement} inputElement - The input element to save.
 */
function saveCollectionProperties(inputElement) {
    if (inputElement) {
        if (!inputElement.parentElement.parentElement.classList.contains("multivalue-input-container") &&
            (inputElement.tagName === "INPUT" || inputElement.tagName === "TEXTAREA" || inputElement.tagName === 'RADIO')) {
            const propertyName = inputElement.type === 'radio' ? getParentFieldsetId(inputElement) : inputElement.id;
            const propertyValue = inputElement.value;
            console.log(`Saving collection property - ${propertyName}: ${propertyValue}`);
            if (propertyValue) {
                collectionData[propertyName] = propertyValue;
            } else {
                delete collectionData[propertyName];
            }
        }
    }
}

export async function setPhotoCollection(data, filename = null) {
    await clearPhotoCollection();
    collectionData["collection-name"] = data["collection-name"];
    collectionData["collection-type"] = data["collection-type"];
    collectionData["collection-species"] = data["collection-species"];
    collectionData["user_id"] = data["user_id"];
    collectionData["filename"] = filename;
    imageData = {};

    const photos = data['photos'];

    // Add thumbnails to group thumbnail grid
    // and populate imageData with photo data
    for (const photoKey in photos) {
        if (photos.hasOwnProperty(photoKey)) {
            const photo = photos[photoKey];
            const uniqueIdentifier = photo.id;
            imageData[uniqueIdentifier] = { ...photo };

            const fileName = photo.FileName;
            const captionText = `${photo.CaptionTitle}<br><br>${photo.ImageDescription}`; // This is treated as a short copyright in Calscape
            const altText = photo.CaptionTitle;
            const turl = `/includes/php/thumbnail.php?fileName=${fileName}&fileType=collection-photo`;
            const tc = createThumbnailContainer(uniqueIdentifier, turl, captionText, altText);
            addCollectionThumbnail(tc);
        }
    }
}

export function savePhotoCollection() {
    if (document.querySelector('#group-properties-container')) {
        // Iterate through the children elements of group-properties-container

        const groupform = document.getElementById('group-properties-form');

        if (groupform) {
            // Iterate through all child elements of the form and save the value
            groupform.querySelectorAll('textarea').forEach(inputElement => {
                saveCollectionProperties(inputElement);
            });

            groupform.querySelectorAll('input').forEach(inputElement => {
                saveCollectionProperties(inputElement);
            });

            groupform.querySelectorAll('fieldset').forEach(inputElement => {
                saveRadioPropertyValue(inputElement);
            });
        }
    }
}

/**
 * Function to save the value of the selected radio button in a fieldset.
 * @param {HTMLFieldSetElement} fieldset - The fieldset element containing radio buttons.
 */
function saveRadioPropertyValue(fieldset) {
    const selectedRadio = fieldset.querySelector('input[type="radio"]:checked');
    const propertyName = fieldset.id;

    if (selectedRadio) {
        const propertyValue = selectedRadio.value;
        collectionData[propertyName] = propertyValue;
    } else {
        // No radio button selected
        delete collectionData[propertyName];
    }
}

/**
 * Function to get the id of the parent fieldset.
 * @param {HTMLElement} element - The input element.
 * @returns {string} - The id of the parent fieldset.
 */
function getParentFieldsetId(element) {
    const fieldset = element.closest('fieldset');
    return fieldset ? fieldset.id : '';
}

/**
 * @function
 * Return the collectionData ordered according to the thumbnail ordering,
 * filtered to remove deleted thumbnails and remove the deleted property
 * from each photo object.
 * 
 * @param {boolean} [restoreDeleted=false] If true, the deleted photos from imageData will
 * be added in to the returned collection. But the deleted flag for these will be removed as well
 */
export function getPhotoCollection(restoreDeleted = false, removeDeleted = false) {
    // Create a new array with the correct order based on collectionThumbnails
    const orderedImageData = collectionThumbnails.map(thumbnail => imageData[thumbnail.id]);

    // Separate deleted photos if restoreDeleted is true
    const deletedPhotos = Object.values(imageData).filter(photo => photo.deleted);

    // Concatenate deleted photos with non-deleted photos if restoreDeleted is true
    const filteredImageData = restoreDeleted ? orderedImageData.concat(deletedPhotos) : orderedImageData;

    // Remove the 'deleted' property from each photo
    const cleanedImageData = removeDeleted ? filteredImageData.map(photo => {
        const { deleted, ...cleanPhoto } = photo;
        return cleanPhoto;
    }) : filteredImageData;

    // Add the filtered and cleaned photos to collectionData and return the whole package
    collectionData.photos = cleanedImageData;

    if (collectionData["collection-type"] === 'garden') {
        collectionData["collection-species"] = '';
    }

    return collectionData;
}

export async function clearPhotoCollection() {
    // Move collectionThumbnails back to source photos and clear the collection.
    const removedNodesArray = Array.from(collectionThumbnails);
    for (const removedNode of removedNodesArray) {
        await handleRemovedNode(removedNode);
    }
    collectionThumbnails.length = 0;
    imageData = {};
    collectionData = {};

    const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
    if (thumbnailGroupGrid != null) {
        const tcontainers = thumbnailGroupGrid.querySelectorAll('.tcontainer');
        tcontainers.forEach(tcontainer => {
            tcontainer.remove();
        });

        const dropMessage = document.getElementById('drag-and-drop-message')
        dropMessage.style.display = 'block';
    }
}

export function validateLeavePage() {
    const form = document.getElementById("group-properties-form");
    if (form === null) {
        // The group-properties-form is not shown. It's okay to switch pages.
        return true;
    }

    // Report validity and display validation messages
    const isFormValid = form.reportValidity();

    if (isFormValid) {
        // Form is valid, you can proceed with further actions
        console.log('Form is valid');
        return true;
    } else {
        // Form is not valid, handle accordingly (e.g., display error messages)
        console.log('Form is not valid');
        return false;
    }
}

function getRequiredColumnsForRole(importConfig, roleName) {
    const requiredColumns = [];

    if (importConfig && importConfig.photoimportconfig && importConfig.photoimportconfig.tables) {
        const tables = importConfig.photoimportconfig.tables;

        for (const table of tables) {
            if (table.columns) {
                const columns = table.columns;

                for (const column of columns) {
                    const roles = column.userinterface?.roles;

                    if (roles && roles[roleName] && roles[roleName].required) {
                        requiredColumns.push(column.name);
                    }
                }
            }
        }
    }

    return requiredColumns;
}

function checkRequiredData(collectionData, requiredColumns) {
    const missingData = [];

    for (const key of Object.keys(collectionData)) {
        // Check if the key is in the requiredColumns array
        if (requiredColumns.includes(key)) {
            const value = collectionData[key];

            // Check if the value is blank or undefined
            if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
                missingData.push(key);
            }
        }

        // Recursively check nested objects
        if (typeof collectionData[key] === 'object') {
            const nestedMissingData = checkRequiredData(collectionData[key], requiredColumns);
            missingData.push(...nestedMissingData.map(nestedKey => `${key}.${nestedKey}`));
        }
    }

    return missingData;
}

export async function getUserIDfromEmail(email) {
    let userID = '';
    try {
        const response = await fetch("/includes/php/get_user_id.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: email,
        });

        const jsonResponse = await response.json();

        if (!jsonResponse.success) {
            console.log(jsonResponse.message);
            return false;
        }

        userID = jsonResponse.userID;
        console.log(`userID for ${email}: ${userID}`);
    } catch (error) {
        console.error("Error:", error);
        return false;
    }

    return userID;
}

export async function validatePhotoCollection() {
    // Verify there is at least one photo in the collection
    if (!collectionData.hasOwnProperty("photos") || Object.keys(collectionData.photos).length === 0) {
        console.log('Validation failure: Empty collection. There must be at least 1 photo in the collection');
        displayStatusMessage(`There must be at least 1 photo in the collection.`, true, -1, true);
        return false;
    }

    // validate user email
    if (! await getUserIDfromEmail(collectionData["user_id"])) {
        const message = `A Calscape user account with email ${collectionData["user_id"]} was not found.\n\nPlease create a user account in <a href="https://calscape.org/" target="_blank">https://calscape.org/</a> before continuing.`;
        displayStatusMessage(message, true);
        return false;
    }


    const requiredColumns = getRequiredColumnsForRole(importconfig, ROLE);

    console.log(`Required columns for ${ROLE}:`, requiredColumns);

    // validate collection properties
    const missingRequiredData = checkRequiredData(collectionData, requiredColumns);

    if (missingRequiredData.length > 0) {
        console.log('Missing required data:', missingRequiredData);
        displayStatusMessage(`The following fields require input values: ${missingRequiredData.join('\r\n')}`, true, -1, false)
        return false;
    } else {
        console.log('All required data is present.');
        return true;
    }
}

/**
 * @function
 * Function to display the collection properties
 */
function showCollectionProperties() {
    if (document.querySelector('#group-properties-container')) {
        // Iterate through the children elements of group-properties-container
        for (const property in collectionData) {
            const inputElement = document.getElementById(property);
            if (inputElement !== null && inputElement !== undefined) {
                const propertyvalue = collectionData[property];
                if (propertyvalue !== undefined) {
                    if (Array.isArray(propertyvalue)) {
                        // create new controls to show all array values
                        propertyvalue.map((value) => {
                            if (value !== undefined) {
                                const inputContainer = createInputField(value);
                                inputElement.appendChild(inputContainer);
                            }
                        });
                    } else if (inputElement.tagName === 'FIELDSET') {
                        // Handle fieldset with radio buttons
                        showRadioPropertyValue(inputElement, propertyvalue);
                    } else {
                        inputElement.value = propertyvalue;
                    }
                } else {
                    inputElement.value = '';
                }
            } else {
                console.log('Input element not found for property: ', property);
            }
        }
    }
}

/**
 * Function to check the child radio buttons in a fieldset according to the property value.
 * @param {HTMLFieldSetElement} fieldset - The fieldset element containing radio buttons.
 * @param {string} propertyValue - The value to set for the radio buttons.
 */
function showRadioPropertyValue(fieldset, propertyValue) {
    const radioToCheck = fieldset.querySelector(`input[type="radio"][value="${propertyValue}"]`);

    if (radioToCheck) {
        radioToCheck.checked = true;
    }
    else {
        console.log('Radio property value did not match any radio buttons: ', propertyValue);
    }

    updateSpeciesChoice();
}

/* EVENT LISTENERS */

// Delay duration in milliseconds (e.g., 500 milliseconds)
const delayDuration = 500;

$(document).on('focusout', '#group-properties-form input, #group-properties-form select, #group-properties-form textarea', function (event) {
    // Clear any previous timeouts to prevent multiple executions
    if (this.timer) {
        clearTimeout(this.timer);
    }

    // Set a new timeout to execute the function after the delay
    this.timer = setTimeout(() => {
        saveCollectionProperties(event.target);
    }, delayDuration);
});