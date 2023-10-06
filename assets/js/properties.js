/** 
 * @file
 *  Display properties of source photos and apply properties to Calscape photos. 
 * 
*/
import { getSourcePhotos } from "./source-photo-data.js";

const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
const propertiesContainer = document.getElementById('properties-container');
const ROLE = "contributor"; // or "reviewer"
const FLICKR_APIKEY = "7941c01c49eb07af15d032e0731e9790";

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
                            "flickr": "photo.description._content",
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
    const photoData = getSourcePhotos();

    // If we have not already stored data for this image then store it now
    if (imageData === null || !imageData.hasOwnProperty(id)) {
        const imageObj = {};
        imageObj[id] = {};

        const photo = photoData[id];

        if (photo instanceof File) {
            // Read the photo file and parse EXIF data once
            const exifData = await readAndParseExifData(photo);

            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
                    // Use the parsed EXIF data for each Calscape table column
                    imageObj[id][column.name] = getExifPropertyValue(column.name, column.datasources, exifData);
                    console.log(column.name + ": " + imageObj[id][column.name]);
                }
            }
        }
        else {
            console.log(`photo ${id} is from Flickr`);
            const flickrData = await getFlickrPhotoInfo(id);
            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
                    // Use the parsed Flickr info data for each Calscape table column
                    imageObj[id][column.name] = getFlickrPropertyValue(column.name, column.datasources, flickrData);
                    console.log(column.name + ": " + imageObj[id][column.name]);
                }
            } 
        }

        imageData[id] = imageObj;
    } else {
        console.log(`Photo data for selected item ${id} already exists`);
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
            console.error('Photo is not a jpeg file');
            reject('Photo is not a jpeg file');
        }
    });
}

function getExifPropertyValue(column, datasources, exifData) {
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

async function getFlickrPhotoInfo(id) {
    return new Promise((resolve, reject) => {
    const apiKey = FLICKR_APIKEY;
    const photoId = id; // Replace with your photo ID

    // Construct the API URL
    const apiUrl = 'https://www.flickr.com/services/rest/';

    // Make an AJAX request to the Flickr API
    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        data: {
            method: 'flickr.photos.getInfo',
            api_key: apiKey,
            photo_id: photoId,
            format: 'json',
            nojsoncallback: 1,
        },
        success: function (flickrInfo) {
            // Handle the API response here
            console.log(flickrInfo);
            resolve(flickrInfo);
        },
        error: function (error) {
            // Handle errors here
            console.error(error);
        },
    });
});
}

function navigateBracketNotation(obj, path, defaultValue = undefined) {
  const pathArray = path.split('.');
  let notation = obj;

  try {
    for (const prop of pathArray) {
      if (!notation.hasOwnProperty(prop)) {
        throw new Error(`Property '${prop}' not found in path '${path}'`);
      }
      notation = notation[prop];
    }
    return notation;
  } catch (error) {
    console.error(error.message);
    return defaultValue;
  }
}

function getFlickrPropertyValue(column, datasources, flickrData) {
    let data = '';
    if (flickrData) {
        const source = datasources && datasources.flickr;
        if (source) {
            const propertyvalue = navigateBracketNotation(flickrData, source);
            console.log('getDataSource: ' + column + ': ' + propertyvalue);
            data = propertyvalue;
        }
    } else {
        console.error('Exif data is not available');
    }
    return data;
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
        for (const property in imageObj[tcontainerId]) {
            const input = document.getElementById(property);
            if (input !== null && input !== undefined) {
                const value = imageObj[tcontainerId][property];
                if (value !== undefined) {
                    input.value = imageObj[tcontainerId][property];
                }
                else {
                    input.value = '';
                }
            } else {
                console.log('Input element not found for property:', property);
            }

        }
    }
}

export function clearSelectedProperties(event) {
    
}

/**
* Function to create text fields
*/
function createPropertiesFields() {

    const form = document.createElement('form');
    form.id = ('properties-form');

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