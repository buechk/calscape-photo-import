/** 
 * @file
 *  Display properties of source photos and apply properties to Calscape photos. 
 * 
*/
import { sortablegroup } from './thumbnails.js';
import { getFileData } from "./photo-selection.js";

const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
const propertiesContainer = document.getElementById('properties-container');
const ROLE = "contributor"; // or "reviewer"

const importconfig = {
    "photoimportconfig": {
        "tables": [
            {
                "table": "photo",
                "columns": [
                    {
                        "name": "DateTimeOriginal",
                        "datasources": {
                            "flickr": "photo.dates.taken",
                            "jpeg": "EXIF.DateTimeOriginal"
                        },
                        "userinterface": {
                            "label": "Photo date",
                            "default": "",
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": true,
                                    "required": false,
                                    "visible": true
                                }
                            }
                        }
                    },
                    {

                        "name": "ImageDescription",
                        "datasources": {
                            "flickr": "photo.description",
                            "jpeg": "EXIF.ImageDescription"
                        },
                        "userinterface": {
                            "label": "Image description",
                            "default": "",
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true
                                }
                            }
                        }

                    },
                    {
                        "name": "Artist",
                        "datasources": {
                            "flickr": "photo.owner.realname",
                            "jpeg": "EXIF.Artist"
                        },
                        "userinterface": {
                            "label": "Artist",
                            "default": "",
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true
                                }
                            }
                        }
                    },
                    {
                        "name": "CopyrightNotice",
                        "datasources": {
                            "flickr": "flickr.photos.getExif.Copyright",
                            "jpeg": "EXIF.Copyright"
                        },
                        "userinterface": {
                            "label": "Copyright Notice",
                            "default": "",
                            "roles": {
                                "contributor": {
                                    "readonly": true,
                                    "required": false,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": true,
                                    "required": false,
                                    "visible": true
                                }
                            }
                        }
                    }
                ]
            },
            {
                "table": "plant_photo",
                "columns": [
                    {
                        "name": "user_id",
                        "datasources": {},
                        "userinterface": {
                            "label": "Calscape user ID",
                            "default": "",
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": true,
                                    "required": true,
                                    "visible": true
                                }
                            }
                        }
                    }
                ]
            }
        ]
    }
}

// Data for selected image will be stored here
let imageData = {};
/* example data
{
    "000": {
        "DateTmeOriginal": "2023-9-27",
        "ImageDescription": "Pathway with sedges",
        "Artist": "Kristy",
        "CopyrightNotice": "Creative Commons"
    },
    "001": {
        "DateTmeOriginal": "2023-9-21",
        "ImageDescription": "Buckwheat cascading over wall",
        "Artist": "Ed",
        "CopyrightNotice": "Public"
    }
    // More entries
}
*/

// Create a new MutationObserver instance to detect changes in the thumbnail group
const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Loop through the added nodes
            mutation.addedNodes.forEach(function (addedNode) {
                // Do something with each added node
                console.log('Child element added to thumbnail-group-grid:', addedNode);
                populateThumbnailProperties(addedNode.id);
            });
        }
    });
});

// Configure the observer to watch for changes to the child nodes
const config = { childList: true };

// Start observing the thumbnail-group-grid div for changes
observer.observe(thumbnailGroupGrid, config);

/**
 * populate properties from the configured datasource for the given thumbnail
 * @param {*} id thumbnail-group-grid id
 */
export async function populateThumbnailProperties(id) {
    const fileData = getFileData();
    const photo = fileData[id];

    if (imageData === null || !imageData.hasOwnProperty(id)) {
        const imageObj = {};
        imageObj[id] = {};

        // Read the photo file and parse EXIF data once
        const exifData = await readAndParseExifData(photo);

        for (const table of importconfig.photoimportconfig.tables) {
            for (const column of table.columns) {
                // Use the parsed EXIF data for each column
                imageObj[id][column.name] = getDataSource(column.name, column.datasources, exifData);
                console.log(column.name + ": " + imageObj[id][column.name]);
            }
        }
        imageData[id] = imageObj;
    } else {
        console.log("Selected item is " + id);
    }
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
                const imageData = event.target.result;

                // Use the exif-js library to get EXIF data
                try {
                    const exifData = EXIF.readFromBinaryFile(imageData);
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
            console.error("Photo is not a jpeg file");
            reject('Photo is not a jpeg file');
        }
    });
}

function getDataSource(column, datasources, exifData) {
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
    return data;
}

function getDataSourceforFlickr(column) {
    return '';
}

/**
 * Function to display the properties of the selected thumbnail
 */
export function showSelectedProperties(event) {
    if (event.target.parentNode.parentNode == thumbnailGroupGrid) {
        // get the saved image data for the selected thumbnail container
        const tcontainerId = event.target.parentNode.id;
        const imageObj = imageData[tcontainerId];

        // Iterate through the children elements of propertiesContainer
        for (let i = 0; i < propertiesContainer.children.length; i++) {
            const formgroup = propertiesContainer.children[i];
            const input = formgroup.querySelector('.input');
            const property = input.id;
            input.value = imageObj[tcontainerId][property];
        }
    }
}

/**
* Function to create text fields
*/
function createPropertiesFields() {

    const form = document.createElement('form');

    for (const table of importconfig.photoimportconfig.tables) {
        console.log(`Table: ${table.table}`);

        // Loop through columns within the current table
        for (const column of table.columns) {
            const uiconfig = column.userinterface.roles[ROLE];

            // Create form-group
            const formgroup = document.createElement('div');
            formgroup.classList.add('form-group');

            // Create a label element
            const label = document.createElement('label');
            label.classList.add('label');
            label.textContent = column.userinterface.label;
            formgroup.appendChild(label);

            // Create a text input element
            const textField = document.createElement('input');
            textField.classList.add('input');
            textField.type = 'text';
            textField.id = column.name;
            textField.required = uiconfig.required;
            textField.readOnly = uiconfig.readonly;

            formgroup.appendChild(textField);

            // Create a line break element for spacing
            const lineBreak = document.createElement('br');

            form.appendChild(formgroup);
            form.appendChild(lineBreak);
        }
    }

    propertiesContainer.appendChild(form);
}

document.addEventListener('DOMContentLoaded', createPropertiesFields);

/*
const 
function handlePhotoSelection(event) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
        const filename = selectedFile.name;
        const author = 'John Doe'; // Replace with actual author data if available
        const keywords = ['file', 'example', 'data']; // Replace with actual keywords if available
        const creationDate = selectedFile.lastModified; // Timestamp of file creation date
        const modificationDate = selectedFile.lastModifiedDate; // Date object of file modification date

        const fileInfo = {
            filename,
            author,
            keywords,
            creationDate,
            modificationDate,
        };

        displayFileProperties(fileInfo);
    } else {
        // Clear properties if no file is selected
        propertiesContainer.innerHTML = '';
    }
}

function displayFileProperties(fileInfo) {
    // Clear previous properties
    propertiesContainer.innerHTML = '';

    const filenameElement = document.createElement('p');
    filenameElement.textContent = `Filename: ${fileInfo.filename}`;

    const authorElement = document.createElement('p');
    authorElement.textContent = `Author: ${fileInfo.author}`;

    const keywordsElement = document.createElement('p');
    keywordsElement.textContent = `Keywords: ${fileInfo.keywords.join(', ')}`;

    const creationDateElement = document.createElement('p');
    creationDateElement.textContent = `Creation Date: ${new Date(fileInfo.creationDate)}`;

    const modificationDateElement = document.createElement('p');
    modificationDateElement.textContent = `Modification Date: ${fileInfo.modificationDate}`;

    propertiesContainer.appendChild(filenameElement);
    propertiesContainer.appendChild(authorElement);
    propertiesContainer.appendChild(keywordsElement);
    propertiesContainer.appendChild(creationDateElement);
    propertiesContainer.appendChild(modificationDateElement);
}

String.prototype.hashCode = function () {
    var hash = 0,
        i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
*/