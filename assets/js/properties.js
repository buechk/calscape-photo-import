/** 
 * @file
 *  Display properties of source photos and apply properties to Calscape photos. 
 * 
*/
import { getSourcePhoto } from "./source-photo-data.js";

const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
const propertiesContainer = document.getElementById('selected-properties-container');


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
                                    "readonly": false,
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
                            "textarea": true,
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
                        "name": "CopyrightCategory",
                        "datasources": {
                            "flickr": "photo.license",
                            "jpeg": "EXIF.Copyright"
                        },
                        "userinterface": {
                            "label": "Copyright Category",
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
                        },
                        "valuemap": {
                            "0": "All Rights Reserved (ARR)",
                            "1": "Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)",
                            "2": "Attribution-NonCommercial (CC BY-NC)",
                            "3": "Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)",
                            "4": "Attribution (CC BY)",
                            "5": "Attribution-ShareAlike (CC BY-SA)",
                            "6": "Attribution-NoDerivs (CC BY-ND)",
                            "7": "Public Domain Dedication (CC0)",
                            "8": "GNU Free Documentation License (GFDL)"
                        },
                    },
                    {
                        "name": "CaptionTitle",
                        "datasources": {
                            "flickr": "photo.title._content",
                            "jpeg": "EXIF.ImageDescription"
                        },
                        "userinterface": {
                            "label": "Caption title",
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
                        "name": "CaptionDescription",
                        "datasources": {
                            "flickr": "",
                            "jpeg": ""
                        },
                        "userinterface": {
                            "label": "Caption description",
                            "default": "",
                            "textarea": true,
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
                        "name": "Keywords",
                        "datasources": {
                            "flickr": "photo.tags.tag.raw",
                            "jpeg": "EXIF.Copyright"
                        },
                        "userinterface": {
                            "label": "Keywords",
                            "default": "",
                            "multivalue": true,
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true,
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
                        "name": "Ranking",
                        "datasources": {
                            "flickr": "photo.exif[tag='Rating'].raw._content",
                            "jpeg": "EXIF.xmp.Rating"
                        },
                        "userinterface": {
                            "label": "Ranking",
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
                        "name": "LandscaperName",
                        "datasources": {
                            "flickr": "",
                            "jpeg": ""
                        },
                        "userinterface": {
                            "label": "Landscaper name",
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
                        "name": "LandscapeDesigner",
                        "datasources": {
                            "flickr": "",
                            "jpeg": ""
                        },
                        "userinterface": {
                            "label": "Landscaper designer",
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
export let imageData = {};
/* example data
{
    "000": {
        "species": "Carex pansa"
        "DateTmeOriginal": "2023-9-27",
        "ImageDescription": "Pathway with sedges",
        "Artist": "Kristy",
        "CopyrightNotice": "Copyright 2023 Kristy Bueche"
        "CopyrightCategory": "Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)"
    },
    "001": {
        "species": "Eriogonum fasciculatum 'Warriner Lytle'"
        "DateTmeOriginal": "2023-9-21",
        "ImageDescription": "Buckwheat cascading over wall",
        "Artist": "Ed",
        "CopyrightNotice": ""
        "CopyrightCategory": "Attribution (CC BY)"
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
        if (mutation.type === 'childList') {
            if (mutation.addedNodes.length > 0) {
                // Loop through the added nodes and populate the metadata for their thumbnail
                mutation.addedNodes.forEach(function (addedNode) {
                    console.log('Child element added to thumbnail-group-grid:', addedNode);
                    populateThumbnailProperties(addedNode.id);
                });
            }
            if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(function (removedNode) {
                    console.log('Child element removed from thumbnail-group-grid:', removedNode);
                    delete imageData[removedNode.id];
                });
            }
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
async function populateThumbnailProperties(id) {
    // If we have not already stored data for this image then store it now
    if (imageData === null || !imageData.hasOwnProperty(id)) {
        const imageObj = {};
        imageObj["id"] = id;

        const photo = getSourcePhoto(id);
        imageObj["sourceImage"] = photo;

        if (photo instanceof File) {
            // Read the photo file and parse EXIF data once
            const exifData = await readAndParseExifData(photo);

            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
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
            const flickrData = await getFlickrPhotoInfo(id, 'flickr.photos.getInfo');
            const flickrExifData = await getFlickrPhotoInfo(id, 'flickr.photos.getExif');
            for (const table of importconfig.photoimportconfig.tables) {
                for (const column of table.columns) {
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
        const propertyValue = event.target.previousSibling.value;
        const tcontainerId = document.getElementById("selected-id").textContent;
        const propertyName = event.target.parentElement.parentElement.id;

        // Remove the property if it has no value
        if (imageData[tcontainerId][propertyName]) {
            const index = imageData[tcontainerId][propertyName].indexOf(propertyValue);
            if (index !== -1) {
                imageData[tcontainerId][propertyName].splice(index, 1);
            }
        }

        event.target.parentNode.innerHTML = '';
    });
    inputContainer.appendChild(deleteBtn);
    return inputContainer;
}

/**
 * Function to save the properties from the form to the image object
 */
export function saveSelectedProperties() {
    const selectedId = document.getElementById('selected-id').textContent;
    const currentImageObj = imageData[selectedId];
    if (currentImageObj) { // Ensure you have a selected image object

        // Iterate through the children elements of propertiesContainer
        for (const property in currentImageObj) {
            const input = document.getElementById(property);
            if (input !== null && input !== undefined) {
                if (Array.isArray(currentImageObj[property])) {
                    // If the property is an array, collect the values
                    const propertyValues = [];
                    const inputContainers = input.querySelectorAll(".array-value-input");
                    inputContainers.forEach((container) => {
                        const value = container.querySelector("input").value;
                        if (value.trim() !== "") {
                            propertyValues.push(value);
                        }
                    });
                    currentImageObj[property] = propertyValues;
                } else {
                    // If it's not an array, set the value directly
                    currentImageObj[property] = input.value;
                }
            } else {
                console.log('Input element not found for property:', property);
            }
        }
    } else {
        console.log("No image object selected to save properties to.");
    }
}

function addMultiValueProperty() {
    if (inputElement.parentElement.parentElement.classList.contains("multivalue-input-container")) {
        const childInputs = inputElement.parentElement.parentElement.querySelectorAll('.input');
        childInputs.forEach((childInput) => {
            const propertyName = childInput.id;
            const propertyValue = childInput.value;

            if (propertyValue) {
                if (!imageData[tcontainerId][propertyName]) {
                    imageData[tcontainerId][propertyName] = [];
                }
                imageData[tcontainerId][propertyName].push(propertyValue);
            } else {
                // Remove the property if it has no value
                if (imageData[tcontainerId][propertyName]) {
                    const index = imageData[tcontainerId][propertyName].indexOf(propertyValue);
                    if (index !== -1) {
                        imageData[tcontainerId][propertyName].splice(index, 1);
                    }
                }
            }
        });
    }
}

/**
 * Function to save properties from input element to imageObj
 * @param {HTMLElement} inputElement - The input element to save.
 */
function saveGroupProperties(inputElement) {
    if (inputElement) {
        const tcontainerId = document.getElementById("selected-id").textContent;
        if (!imageData[tcontainerId]) {
            imageData[tcontainerId] = {}; // Initialize image object if not exists
        }
        if (!inputElement.parentElement.parentElement.classList.contains("multivalue-input-container") &&
            inputElement.tagName === "INPUT" || inputElement.tagName === "TEXTAREA") {
            const propertyName = inputElement.id;
            const propertyValue = inputElement.value;

            if (propertyValue) {
                imageData[tcontainerId][propertyName] = propertyValue;
            } else {
                delete imageData[tcontainerId][propertyName];
            }
        }
    }
}

/**
 * Function to save properties from input element to imageObj
 * @param {HTMLElement} inputElement - The input element to save.
 */
function saveProperties(inputElement) {
    if (inputElement) {
        const tcontainerId = document.getElementById("selected-id").textContent;
        if (!imageData[tcontainerId]) {
            imageData[tcontainerId] = {}; // Initialize image object if not exists
        }
        if (!inputElement.parentElement.parentElement.classList.contains("multivalue-input-container") &&
            inputElement.tagName === "INPUT" || inputElement.tagName === "TEXTAREA") {
            const propertyName = inputElement.id;
            const propertyValue = inputElement.value;

            if (propertyValue) {
                imageData[tcontainerId][propertyName] = propertyValue;
            } else {
                delete imageData[tcontainerId][propertyName];
            }
        }
    }
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

        // set selected id
        document.getElementById('selected-id').textContent = tcontainerId;

        // Iterate through the children elements of propertiesContainer
        for (const property in imageObj) {
            const input = document.getElementById(property);
            if (input !== null && input !== undefined) {
                const propertyvalue = imageObj[property];
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

    // clear selected id
    document.getElementById('selected-id').textContent = '';

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

    const form = document.getElementById('properties-form');

    for (const table of importconfig.photoimportconfig.tables) {
        console.log(`Table: ${table.table}`);

        // Loop through columns within the current table
        for (const column of table.columns) {
            const uiconfig = column.userinterface.roles[ROLE];
            const isTextArea = column.userinterface.textarea ? true : false;

            // Create form-group
            const formgroup = document.createElement('div');
            formgroup.classList.add('form-group');

            // Create a label element
            const label = document.createElement('label');
            label.classList.add('label');
            label.textContent = column.userinterface.label;
            formgroup.appendChild(label);

            if (column.userinterface.multivalue == true) {
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

                    // save the new value to imageData
                    const tcontainerId = document.getElementById("selected-id").textContent;
                    const propertyValue = userInput.value;
                    const propertyName = multiinput.id;
                    if (!imageData[tcontainerId][propertyName]) {
                        imageData[tcontainerId][propertyName] = [];
                    }
                    imageData[tcontainerId][propertyName].push(propertyValue);

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
                let field;
                if (isTextArea) {
                    field = document.createElement('textarea');
                    field.classList.add('auto-expand-input');
                }
                else {
                    field = document.createElement('input');
                    field.classList.add('auto-expand-input');
                }
                field.id = column.name;
                field.required = uiconfig.required;
                field.readOnly = uiconfig.readonly;

                formgroup.appendChild(field);
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

/* EVENT LISTENERS */

document.addEventListener('DOMContentLoaded', createPropertiesFields);

// Delay duration in milliseconds (e.g., 500 milliseconds)
const delayDuration = 500;

$('#properties-form').on('blur', 'input, select, textarea', function (event) {
    // Clear any previous timeouts to prevent multiple executions
    if (this.timer) {
        clearTimeout(this.timer);
    }

    // Set a new timeout to execute the function after the delay
    this.timer = setTimeout(() => {
        saveProperties(event.target);
    }, delayDuration);
});

propertiesContainer.addEventListener('click', function () {
    // make sure thumbnail appears selected
    const tcontainerId = document.getElementById("selected-id").textContent
    document.getElementById(tcontainerId).classList.add('selected');
});