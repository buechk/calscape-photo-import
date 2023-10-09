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
const LICENSE_ENUM = {
    0: "All Rights Reserved (ARR)",
    1: "Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)",
    2: "Attribution-NonCommercial (CC BY-NC)",
    3: "Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)",
    4: "Attribution (CC BY)",
    5: "Attribution-ShareAlike (CC BY-SA)",
    6: "Attribution-NoDerivs (CC BY-ND)",
    7: "Public Domain Dedication (CC0)",
    8: "GNU Free Documentation License (GFDL)"
}

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
                            "flickr": ["photo.exif.[tag='Artist'].raw._content", "photo.owner.realname"],
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
                            "flickr": "photo.exif[tag='CopyrightNotice'].raw._content",
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
                    },
                    {
                        "name": "Keywords",
                        "datasources": {
                            "flickr": "photo.tags.tag.raw",
                            "jpeg": "EXIF.Copyright"
                        },
                        "userinterface": {
                            "label": "Keywords",
                            "default": "",
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true,
                                    "multivalue": true
                                },
                                "reviewer": {
                                    "readonly": false,
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

// Auto Expand textarea according to length of text
let autoExpand = (selector, direction) => {

    let styles = ''
    let count = 0

    let autoWidth = tag => {

        let computed = getComputedStyle(tag)

        tag.style.width = 'inherit'

        let width = parseInt(computed.getPropertyValue('border-left-width'), 10)
            + parseInt(computed.getPropertyValue('padding-left'), 10)
            + tag.scrollWidth
            + parseInt(computed.getPropertyValue('padding-right'), 10)
            + parseInt(computed.getPropertyValue('border-right-width'), 10)

        tag.style.width = ''

        return `width: ${width}px;`

    }

    let autoHeight = tag => {

        let computed = getComputedStyle(tag)

        tag.style.height = 'inherit'

        let height = parseInt(computed.getPropertyValue('border-top-width'), 10)
            + parseInt(computed.getPropertyValue('padding-top'), 10)
            + tag.scrollHeight
            + parseInt(computed.getPropertyValue('padding-bottom'), 10)
            + parseInt(computed.getPropertyValue('border-bottom-width'), 10)

        tag.style.height = ''

        return `height: ${height}px;`

    }

    document.querySelectorAll(selector).forEach(tag => {
        if (tag.classList.contains('auto-expand-input')) {
            let attr = selector.replace(/\W/g, '')
            let rule = ''

            tag.setAttribute(`data-${attr}`, count)

            switch (direction) {

                case 'width':
                    rule += autoWidth(tag)
                    break

                case 'height':
                    rule += autoHeight(tag)
                    break

                case 'both':
                    rule += autoWidth(tag) + autoHeight(tag)
                    break

            }

            styles += `${selector}[data-${attr}="${count}"] { ${rule} }\n`
            count++
        }

    })

    return styles
}

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
            const flickrData = await getFlickrPhotoInfo(id, 'flickr.photos.getInfo');
            const flickrExifData = await getFlickrPhotoInfo(id, 'flickr.photos.getExif');
            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
                    // Use the parsed Flickr info data for each Calscape table column
                    imageObj[id][column.name] = await getFlickrPropertyValue(column.name, column.datasources, flickrData, flickrExifData);
                }
            }
        }

        imageData[id] = imageObj;
    } else {
        console.log(`Photo data for selected item ${id} already exists`);
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

async function getFlickrPropertyValue(column, datasources, flickrData, flickrExifData) {
    const sources = datasources && datasources.flickr;
    let propertyvalue = '';

    if (Array.isArray(sources)) {
        // If sources is an array of queries, evaluate each query until a non-empty result is found
        for (const source of sources) {
            const expression = jsonata(source);
            try {
                if (source.includes('exif')) {
                    propertyvalue = await expression.evaluate(flickrExifData);
                } else {
                    propertyvalue = await expression.evaluate(flickrData);
                }
                if (propertyvalue !== undefined && propertyvalue !== '') {
                    break; // Exit the loop if a valid propertyvalue is found
                }
            } catch (error) {
                console.error('Error evaluating expression:', error);
            }
        }
    } else if (sources !== undefined) {
        // If sources is a single query, evaluate it
        const expression = jsonata(sources);
        try {
            if (sources.includes('exif')) {
                propertyvalue = await expression.evaluate(flickrExifData);
            } else {
                propertyvalue = await expression.evaluate(flickrData);
            }
        } catch (error) {
            console.error('Error evaluating expression:', error);
        }
    }

    console.log('getDataSource: ' + column + ': ' + propertyvalue);
    return propertyvalue;
}

/**
 * Create new input field for multivalue property
 */
function createInputField(value) {
    // Create container for text input and delete button
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    // Create a text input element
    const inputField = document.createElement('input');
    inputField.classList.add('input');
    inputField.value = value;
    inputContainer.appendChild(inputField);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerText = 'X';
    deleteBtn.addEventListener('click', (event) => {
        event.target.parentNode.innerHTML = '';
    });
    inputContainer.appendChild(deleteBtn);
    return inputContainer;
}

/**
 * Function to display the properties of the selected thumbnail
 */
export function showSelectedProperties(event) {
    clearPropertiesFields();
    if (event.target.parentNode.parentNode == thumbnailGroupGrid) {
        // get the saved image data for the selected thumbnail container
        const tcontainerId = event.target.parentNode.id;
        const imageObj = imageData[tcontainerId];

        // Iterate through the children elements of propertiesContainer
        for (const property in imageObj[tcontainerId]) {
            const input = document.getElementById(property);
            if (input !== null && input !== undefined) {
                const propertyvalue = imageObj[tcontainerId][property];
                if (propertyvalue !== undefined) {
                    if (Array.isArray(propertyvalue)) {
                        // create new controls to show all array values
                        propertyvalue.map((value) => {
                            if (value != undefined) {
                                const inputContainer = createInputField(value);
                                input.appendChild(inputContainer);
                            }
                        });
                    }
                    else {
                        input.value = propertyvalue;
                    }
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

/**
 * Function to clear property text fields
 */
export function clearPropertiesFields() {
    const form = document.getElementById('properties-form');

    // Iterate through all child elements of the form
    form.querySelectorAll('textarea').forEach(input => {
        input.value = ''; // Clear the input field
    });

    // Iterate through all child elements of the form
    form.querySelectorAll('input').forEach(input => {
        input.value = ''; // Clear the input field
    });

    form.querySelectorAll('.input-container').forEach(input => {
        input.remove(); // Clear the input field
    });
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

            if (uiconfig.multivalue == true) {
                // Clone the template element
                const template = document.getElementById('multivalue-input-container');
                const clone = template.cloneNode(true); // Pass true to clone its children
                clone.style.display = 'block';
                const multiinput = clone.querySelector('.multivalue-input-inner');
                multiinput.id = column.name;

                const addBtn = clone.querySelector('.add-btn');
                // Add a click event handler to the addBtn
                addBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    const userInput = clone.querySelector('.new-multivalue-input');
                    // Create a new input element
                    const inputContainer = createInputField(userInput.value);

                    userInput.value = '';
                    // Append the new input element to multivalue-input-inner
                    multiinput.appendChild(inputContainer);
                    multiinput.scrollTop = multiinput.scrollHeight;
                });

                formgroup.appendChild(clone);
            }
            else {
                // Create a text input element
                const textField = document.createElement('textarea');
                textField.classList.add('auto-expand-input');
                textField.id = column.name;
                textField.required = uiconfig.required;
                textField.readOnly = uiconfig.readonly;

                formgroup.appendChild(textField);
            }

            // Create a line break element for spacing
            const lineBreak = document.createElement('br');

            form.appendChild(formgroup);
            form.appendChild(lineBreak);
        }
    }

    propertiesContainer.appendChild(form);
    // Call autoExpand and get the generated styles
    const styles = autoExpand('textarea', 'height');

    // Create a <style> element and set its content to the generated styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;

    // Append the <style> element to the <head> of your document
    document.head.appendChild(styleElement);
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