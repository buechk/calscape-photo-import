/** 
 * @file
 *  Display properties of source photos and apply properties to Calscape photos. 
 * 
*/
import { sortablegroup } from './thumbnails.js';
import { getFileData } from "./photo-selection.js";

const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
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
                            "jpeg": "EXIF.DateTimeOriginal"
                        },
                        "userinterface": {
                            "label": "Photo description",
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
                            "jpeg": "EXIF.MWG.Creator"
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
                            "jpeg": "EXIF.MWG.Copyright"
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

let imageData = {}; // Data for each image will be stored here

export function setSelectedProperties(event) {
    // To get the selected items
    const id = event.target.parentElement.id;
    const fileData = getFileData();
    const photo = fileData[id];

    // check if imageData exists
    if (imageData === null || !imageData.hasOwnProperty(id)) {
        // if not, create it
        const imageObj = {};
        imageObj.id = id;
        for (const table of importconfig.photoimportconfig.tables) {
            for (const column of table.columns) {
                imageObj[column.name] = getDataSource(column.name, column.datasources, photo);
                console.log(column.name + ": " + imageObj[column.name]);
            }
        }
    } else {
        console.log("Selected item is " + parent.id);
    }
}

function getDataSource(column, datasources, photo) {
    let data = '';
    if (photo instanceof File) {
        getDataSourceforFile(column, photo, function (propertyvalue, error) {
            if (error) {
                console.error(error);
            } else {
                console.log(propertyvalue);
                data = propertyvalue;
            }
        });
    }
    else {
        data = getDataSourceforFlickr(datasources, photo);
    }
    return data;
}

function getDataSourceforFile(source, photo, callback) {
    const property = source.slice(source.indexOf('.') + 1);

    if (photo instanceof File && photo.type === 'image/jpeg') {
        const reader = new FileReader();

        reader.onload = function (event) {
            const imageData = event.target.result;

            // Use the exif-js library to parse EXIF data
            try {
                const exifData = EXIF.readFromBinaryFile(imageData);
                console.log('EXIF : ' + exifData);
                const propertyvalue = exifData[property];
                // Call the callback with the property value
                callback(propertyvalue);
            } catch (exifError) {
                console.error('Error parsing EXIF data:', exifError);
                // Call the callback with an error
                callback(null, 'Error parsing EXIF data');
            }
        };

        reader.onerror = function (event) {
            console.error('Error occurred while reading the file', event);
            // Call the callback with an error if needed
            callback(null, 'Error occurred while reading the file');
        };

        reader.readAsArrayBuffer(photo);
    } else {
        console.error("Photo is not a jpeg file");
        // Call the callback with an error if needed
        callback(null, 'Photo is not a jpeg file');
    }
}


function getDataSourceforFlickr(column) {
    return '';
}

// Function to create text fields
function createPropertiesFields() {

    const form = document.createElement('form');

    for (const table of importconfig.photoimportconfig.tables) {
        console.log(`Table: ${table.table}`);

        // Loop through columns within the current table
        for (const column of table.columns) {
            console.log(`Column Name: ${column.name}`);

            const datasources = column.datasources;
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

    document.getElementById('properties-container').appendChild(form);
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