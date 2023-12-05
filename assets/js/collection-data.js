/**
 * @file collection-data.js
 */
import { removeSourcePhoto, storeSourcePhoto, getSourcePhoto } from "./source-photo-data.js";
import { importconfig, createPropertiesFields } from "./properties.js";

const FLICKR_APIKEY = "7941c01c49eb07af15d032e0731e9790";

let collectionThumbnails = []; // Store collection photo thumbnails as an array

const collectionData = {};

// Data for each image will be stored here
export let imageData = {};

/* example data
{
    "000": {
        "deleted" : false,
        "species": "Carex pansa",
        "DateTmeOriginal": "2023-9-27",
        "ImageDescription": "Pathway with sedges",
        "Artist": "Kristy",
        "CopyrightNotice": "Copyright 2023 Kristy Bueche"
        "CopyrightCategory": "Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)"
        ...
    },
    "001": {
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

export function getImageData(id) {
    return imageData[id];
}

export function getCollectionThumbnails() {
    return collectionThumbnails;
}

export function initializeCollectionData() {
    const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');

    thumbnailGroupGrid.addEventListener('click', function (event) {
        if (event.target.id === 'thumbnail-group-grid') {
            // make sure thumbnail appears selected
            const tcontainerId = document.getElementById("selected-id").textContent
            document.getElementById(tcontainerId).classList.add('selected');
        }
    });

    setupMutationObserver(thumbnailGroupGrid);

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

// Function to handle removed nodes
async function handleRemovedNodes(removedNodes) {
    // Convert NodeList to array
    const removedNodesArray = Array.from(removedNodes);
    let index = -1;
    let id = '';

    // Use map to create an array of promises
    const removalPromises = removedNodesArray.map(removedNode => {
        console.log('Child element removed:', removedNode);
        index = collectionThumbnails.findIndex(item => item.id === removedNode.id);
        id = removedNode.id;
        const caption = removedNode.caption;
        const imageObj = imageData[removedNode.id];
        if (imageObj) {
            return storeSourcePhoto(imageObj.id, imageObj.sourceImage, imageObj.CaptionTitle)
                .then(result => {
                    console.log('Source photo stored: ', id, caption);
                })
                .catch(error => {
                    console.error('Error storing source photo:', error);
                });
        }
    });

    // Wait for all promises to be fulfilled
    await Promise.all(removalPromises)
        .then(() => {
            if (imageData.hasOwnProperty(id_)) {
                imageData[id].deleted = true;
            }
//            collectionThumbnails.splice(index, 1); // Remove the removedNode from the array
        });

    // Check if there are more mutations in the queue
    if (mutationQueue.length > 0) {
        const nextMutation = mutationQueue.shift();
        await processMutation(nextMutation);
    } else {
        // Reset the processing flag
        isProcessing = false;
    }
}

// Function to process a mutation
async function processMutation(mutation) {
    isProcessing = true;

    const { addedNodes, removedNodes } = mutation;

    if (addedNodes.length > 0) {
        addedNodes.forEach(function (addedNode) {
            console.log('Child element added', addedNode);
//            collectionThumbnails.push(addedNode); // Add the addedNode to the array
            populateThumbnailProperties(addedNode.id);
            removeSourcePhoto(addedNode.id);
        });
    }

    if (removedNodes.length > 0) {
        await handleRemovedNodes(removedNodes);
    } else {
        // Reset the processing flag
        isProcessing = false;
    }
}

// Function to set up the observer
function setupMutationObserver(targetElement) {
    const observer = new MutationObserver(async function (mutations) {
        for (const mutation of mutations) {
            mutationQueue.push(mutation);

            if (!isProcessing) {
                // Process the first mutation in the queue
                await processMutation(mutationQueue.shift());
            }
        }

        // sync up collectionThumbnail order with thumbnail-group-grid order.
        const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
        collectionThumbnails = Array.from(thumbnailGroupGrid.querySelectorAll('.tcontainer'));
        
    });

    const config = { childList: true };

    observer.observe(targetElement, config);
}

/**
 * populate properties from the configured datasource for the given thumbnail
 * @param {*} id thumbnail-group-grid id
 */
async function populateThumbnailProperties(id) {
    // If we have not already stored data for this image then store it now
    if (imageData.hasOwnProperty(id)) {
        // properties for this photo have already been retrieved
        imageData[id].deleted = false;
    }
    else {
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
                        // The selected properties container is not shown and property applies to a 
                        // collection so ignore properties that apply to the selected image
                        continue;
                    }

                    // Use the parsed EXIF data for each Calscape table column
                    if (column.hasOwnProperty("valuemap")) {
                        const value = getExifPropertyValue(column.name, column.datasources, column.userinterface.multivalue, exifData);
                        if (column.valuemap.hasOwnProperty(value)) {
                            imageObj[column.name] = column.valuemap[value];
                        }
                        else {
                            imageObj[column.name] = value;
                        }
                    }
                    else {
                        imageObj[column.name] = getExifPropertyValue(column.name, column.datasources, column.userinterface.multivalue, exifData);
                    }
                    console.log(column.name + ": " + imageObj[column.name]);
                }
            }
        }
        else {
            console.log(`photo ${id} is from Flickr`);
            imageObj["sourceImage"] = getSourcePhoto(id).url;
            const flickrData = await getFlickrPhotoInfo(id, 'flickr.photos.getInfo');
            const flickrExifData = await getFlickrPhotoInfo(id, 'flickr.photos.getExif');
            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
                    const isCollectionProp = column.applies_to == "collection" ? true : false;

                    if (isCollectionProp) { 
                        // The selected properties container is not shown and property applies to a 
                        // collection so ignore properties that apply to the selected image
                        continue;
                    }

                    if (column.hasOwnProperty("valuemap")) {
                        const value = await getFlickrPropertyValue(column.name, column.datasources, column.userinterface.multivalue, flickrData, flickrExifData);
                        if (column.valuemap.hasOwnProperty(value)) {
                            imageObj[column.name] = column.valuemap[value];
                        }
                        else {
                            imageObj[column.name] = value;
                        }
                    }
                    else {
                        imageObj[column.name] = await getFlickrPropertyValue(column.name, column.datasources, column.userinterface.multivalue, flickrData, flickrExifData);
                    }
                }
            }
        }

        imageData[id] = imageObj;
    } 

    console.log('Populated image data: ');
    for (const key in imageData) {
        if (imageData.hasOwnProperty(key)) {
            const value = imageData[key];
            console.log(`Key: ${key}, Value:`, value);
        }
    }
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
 */
export function getPhotoCollection() {
    // Filter out the photos where deleted is true
    const filteredImageData = Object.fromEntries(
        Object.entries(imageData).filter(([key, value]) => !value.deleted)
    );

    // Add the filtered photos to collectionData and return the whole package
    collectionData.photos = filteredImageData;
    return collectionData;
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

    // Get the radio buttons and the species-container element
    const speciesChoice = document.getElementById('species-choice');
    const gardenChoice = document.getElementById('garden-choice');
    const collSpeciesInput = document.getElementById('collection-species');

    if (speciesChoice.checked) {
        collSpeciesInput.disabled = false;
    } else if (gardenChoice.checked) {
        collSpeciesInput.disabled = true;
        collSpeciesInput.value = '';
    }
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