/** 
 * @file
 *  Display properties of source photos and apply properties to Calscape photos. 
 * 
*/
import { imageData, getImageData } from "./collection-data.js";
import { updateSpeciesChoice } from "./species-selection.js";
import { ROLE } from "./side-bar-nav.js";
import { getSelectedThumbnails } from "./thumbnails.js";

const importconfig1 = {
    "photoimportconfig": {
        "tables": [
            {
                "table": "photo",
                "columns": [
                    {
                        "name": "CaptionTitle",
                        "datasources": {
                            "flickr": "photo.title._content",
                            "jpeg": "EXIF.ImageDescription"
                        },
                        "multi_apply": true,
                        "userinterface": {
                            "label": "Caption title",
                            "default": "",
                            "richtext": true,
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                }
                            }
                        }
                    },
                    {
                        "name": "CaptionDescription",
                        "datasources": {
                            "flickr": "photo.description._content",
                            "jpeg": "EXIF.ImageDescription"
                        },
                        "multi_apply": true,
                        "userinterface": {
                            "label": "Caption description",
                            "default": "",
                            "richtext": true,
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                }
                            }
                        }
                    },
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
                        "name": "Artist",
                        "datasources": {
                            "flickr": ["photo.exif.[tag='Artist'].raw._content", "photo.owner.realname"],
                            "jpeg": "EXIF.Artist"
                        },
                        "multi_apply": true,
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
                        "name": "ImageDescription",
                        "datasources": {
                            "flickr": "photo.exif[tag='CopyrightNotice'].raw._content",
                            "jpeg": "EXIF.Copyright"
                        },
                        "multi_apply": true,
                        "userinterface": {
                            "label": "Copyright",
                            "default": "",
                            "placeholder": `Copyright owner year(s). Example: Copyright Ron Smith 2024`,
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": false,
                                    "required": true,
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
                        "multi_apply": true,
                        "userinterface": {
                            "label": "Copyright Category",
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": false,
                                    "required": true,
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
                        "picklist": [
                            "All Rights Reserved (ARR)",
                            "Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)",
                            "Attribution-NonCommercial (CC BY-NC)",
                            "Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)",
                            "Attribution (CC BY)",
                            "Attribution-ShareAlike (CC BY-SA)",
                            "Attribution-NoDerivs (CC BY-ND)",
                            "Public Domain Dedication (CC0)",
                            "GNU Free Documentation License (GFDL)"
                        ]
                    },
                    {
                        "name": "CopyrightNotice",
                        "datasources": {
                            "flickr": "photo.exif[tag='CopyrightNotice'].raw._content",
                            "jpeg": "EXIF.Copyright"
                        },
                        "multi_apply": true,
                        "userinterface": {
                            "label": "Copyright Notice",
                            "default": "",
                            "richtext": true,
                            "placeholder": "Optional extended copyright information",
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
                        "name": "QualityRanking",
                        "datasources": {
                            "flickr": "photo.exif[tag='Rating'].raw._content",
                            "jpeg": "EXIF.xmp.Rating"
                        },
                        "multi_apply": true,
                        "validation": function(value) {
                            if (value >= 0 && value <= 5) {
                                return true; // Validation passed
                            } else {
                                return 'The Quality Ranking value must be between 0 and 5'; // Validation failed
                            }
                        },
                        "userinterface": {
                            "label": "Quality ranking - 0 (worst) to 5 (best)",
                            "placeholder": "Enter 0 to 5",
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
                        "multi_apply": true,
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
                        "multi_apply": true,
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
                    },
                    {
                        "name": "Keywords",
                        "datasources": {
                            "flickr": "photo.tags.tag.raw",
                            "jpeg": "EXIF.Copyright"
                        },
                        "multi_apply": true,
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
                    }
                ]
            },
            {
                "table": "plant_photo",
                "columns": [
                    {
                        "name": "user_id",
                        "datasources": {},
                        "applies_to": "collection",
                        "userinterface": {
                            "label": "Calscape email",
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

const importconfig2 = {
    "photoimportconfig": {
        "tables": [
            {
                "table": "plant_images",
                "columns": [
                    {
                        "name": "ImageDescription",
                        "datasources": {
                            "flickr": "photo.title._content",
                            "jpeg": "EXIF.ImageDescription"
                        },
                        "multi_apply": true,
                        "userinterface": {
                            "label": "Image description",
                            "default": "",
                            "richtext": true,
                            "roles": {
                                "contributor": {
                                    "readonly": false,
                                    "required": false,
                                    "visible": true
                                },
                                "reviewer": {
                                    "readonly": false,
                                    "required": true,
                                    "visible": true
                                }
                            }
                        }
                    },
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
                        "name": "Artist",
                        "datasources": {
                            "flickr": ["photo.exif.[tag='Artist'].raw._content", "photo.owner.realname"],
                            "jpeg": "EXIF.Artist"
                        },
                        "multi_apply": true,
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
                        "multi_apply": true,
                        "userinterface": {
                            "label": "Copyright Notice",
                            "default": "",
                            "richtext": true,
                            "placeholder": "Optional extended copyright information",
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
                        "multi_apply": true,
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
                    }
                ]
            } ,
            {
                "table": "plant_photo",
                "columns": [
                    {
                        "name": "user_id",
                        "datasources": {},
                        "applies_to": "collection",
                        "userinterface": {
                            "label": "Calscape email",
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

export let importconfig = null;

let multiApplyProperties = null;

export function initProperties(version) {
    importconfig = version == '1.0' ? importconfig1 : importconfig2;
    multiApplyProperties = getMultiApplyProperties();
}

// Create a Map to store Quill instances
const quillInstances = new Map();

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

/**
 * Create new input field for multivalue property
 */
function createInputField(value) {
    // Create container for text input and delete button
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    // Create a text input element
    const inputField = document.createElement('input');
    inputField.classList.add('multivalue-input');
    inputField.value = value;
    inputContainer.appendChild(inputField);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerText = 'X';
    deleteBtn.addEventListener('click', (event) => {
        const propertyValue = event.target.previousSibling.value;
        const propertyName = event.target.parentElement.parentElement.id;

        const selectedIdElem = document.getElementById("selected-id");
        const selectedIds = selectedIdElem.textContent.split(',').filter(Boolean); // Get an array of selected thumbnail IDs
        selectedIds.forEach(tcontainerId => {
            // Remove the property if it has no value
            if (imageData[tcontainerId][propertyName]) {
                const index = imageData[tcontainerId][propertyName].indexOf(propertyValue);
                if (index !== -1) {
                    imageData[tcontainerId][propertyName].splice(index, 1);
                }
            }
        });

        event.target.parentNode.innerHTML = '';
    });

    inputContainer.appendChild(deleteBtn);
    return inputContainer;
}

export function saveSelectedProperties() {
    const propertiesForm = document.getElementById('properties-form');
    if (propertiesForm != null) {
        const selectedIdElem = document.getElementById('selected-id');
        if (selectedIdElem != null) {
            const selectedIds = selectedIdElem.textContent.split(',').filter(Boolean); // Get an array of selected thumbnail IDs
            if (selectedIds.length > 0) {
                // Iterate through the input elements of the properties form
                const inputElements = propertiesForm.querySelectorAll('input, select:not(.ql-header), textarea, .quill-container');
                inputElements.forEach(input => {
                    saveProperties(input);
                });
            }
        }
    }
}

/**
 * Function to save properties from input element to imageObj
 * @param {HTMLElement} inputElement - The input element to save.
 */
function saveProperties(inputElement) {
    if (inputElement && !inputElement.disabled) {
        const selectedIdElem = document.getElementById('selected-id');
        if (selectedIdElem != null) {
            const selectedIds = selectedIdElem.textContent.split(',').filter(Boolean); // Get an array of selected thumbnail IDs
            selectedIds.forEach(tcontainerId => { // Iterate over each selected thumbnail ID
                if (!imageData[tcontainerId]) {
                    imageData[tcontainerId] = {}; // Initialize image object if not exists
                }

                if (inputElement.classList.contains('multivalue-input')) {
                    // Handle multivalue inputs
                    const container = inputElement.closest('.multivalue-input-container');
                    const innerContainer = container.querySelector('.multivalue-input-inner');

                    // Find the id from the multivalue-input-inner element
                    const property = innerContainer.id;

                    // Add the value to the multivalue array if it doesn't already exist
                    const value = inputElement.value.trim();
                    if (property && value !== '') {
                        imageData[tcontainerId][property] = imageData[tcontainerId][property] || [];

                        if (!imageData[tcontainerId][property].includes(value)) {
                            imageData[tcontainerId][property].push(value);
                        }
                    }
                }

                else if (!inputElement.parentElement.parentElement.classList.contains("multivalue-input-container") &&
                    (inputElement.tagName === "INPUT" || inputElement.tagName === "TEXTAREA" || inputElement.tagName === "SELECT")) {
                    const propertyName = inputElement.id;
                    const propertyValue = inputElement.value !== null ? inputElement.value : '';

                    if (propertyName) {
                        imageData[tcontainerId][propertyName] = propertyValue;
                    }

                } else if (inputElement.classList.contains('quill-container')) {
                    const propertyName = inputElement.id;
                    if (propertyName !== '') {
                        // Get the HTML content of the Quill editor
                        const quillInstance = quillInstances.get(inputElement.id);
                        if (quillInstance) {
                            if (quillInstance.root.contentEditable === "true") {
                                // Get the content of the Quill editor
                                const propertyValue = quillInstance.root.innerHTML !== '<p><br></p>' ? quillInstance.root.innerHTML : '';

                                console.log(`Quill content for ${propertyName}: `, propertyValue);
                                imageData[tcontainerId][propertyName] = propertyValue;
                            }
                        }
                        else {
                            console.error('Quill instance not found for property: ', propertyName);
                        }
                    }
                }
                else if (inputElement.classList.contains('ql-editor')) {
                    const propertyName = inputElement.parentElement.id.replace('-ql', '');
                    if (propertyName !== '') {
                        if (inputElement.contentEditable === "true") {
                            const propertyValue = inputElement.innerHTML !== '<p><br></p>' ? inputElement.innerHTML : '';

                            console.log(`Quill content for ${propertyName}: `, propertyValue);
                            imageData[tcontainerId][propertyName] = propertyValue;
                        }
                    }
                }
            });
        }
    }
}

function showSelectedProperties(tcontainer) {
    if (document.querySelector('#selected-properties-container')) {
        const tcontainerId = tcontainer.id;
        const imageObj = imageData[tcontainerId];

        // Iterate through the selected item's properties
        for (const property in imageObj) {
            const propertyvalue = imageObj[property] !== undefined ? imageObj[property] : '';
            displayPropertyInputField(property, propertyvalue)
        }

        updateSpeciesChoice();
    }
}

function displayPropertyInputField(property, propertyvalue, placeholder = '', disabled = false) {
    // Display input field or UI control for modifying the property
    const input = document.getElementById(property);
    if (input !== null && input !== undefined) {
        if (input.classList.contains('multivalue-input-inner')) {
            // create new controls to show all array values
            if (Array.isArray(propertyvalue)) {
                propertyvalue.map((value) => {
                    if (value != undefined) {
                        const inputContainer = createInputField(value);
                        input.appendChild(inputContainer);
                    }
                });
            }
            // enable/disable input fields according to readonly configuration
            const multivalueInput = input.parentElement;
            multivalueInput.querySelectorAll('.multivalue-input').forEach(field => {
                field.disabled = input.readonly || disabled;
            });

            // Get the input-button-container element
            const btncontainer = input.nextElementSibling;

            if (btncontainer !== null) {
                // Get the multivalue-input element inside the container
                const btninput = btncontainer.querySelector('.multivalue-input');
                if (btninput !== null && placeholder !== '') {
                    btninput.placeholder = placeholder;
                }
            }

        }

        else {
            if (input.classList.contains('quill-container')) {
                // Get the HTML content of the Quill editor
                const quillInstance = quillInstances.get(input.id);
                if (quillInstance) {
                    // Set the content of the Quill editor
                    const delta = quillInstance.clipboard.convert(propertyvalue);
                    quillInstance.setContents(delta, 'api');
                    quillInstance.enable(!(input.readOnly || disabled));
                    if (placeholder !== '') {
                        quillInstance.root.dataset.placeholder = placeholder
                    }

                    // Find the input field inside the Quill editor
                    const linkInput = document.querySelector('.ql-tooltip input[type="text"]');

                    // Remove the disabled attribute
                    if (linkInput) {
                        linkInput.removeAttribute('disabled');

                        // Listen for input event to handle clearing of link input field
                        linkInput.addEventListener('input', function () {
                            // Update placeholder text if input field is empty
                            if (!this.value.trim()) {
                                this.setAttribute('placeholder', `https://calscape.org/`);
                            }
                        });
                    }
                }
            }
            else {
                input.value = propertyvalue;
                if (input.tagName === "SELECT") {
                    const blankOption = input.querySelector('option[value=""]');
                    if (blankOption) {
                        blankOption.textContent = placeholder;
                    }
                }
                else {
                    input.placeholder = placeholder;
                }
                input.disabled = input.readOnly || disabled;
            }
        }
    }
}

/**
 * Function to save the IDs of selected thumbnails in the 'selected-id' element.
 * @param {Array} selectedThumbnails - Array of selected thumbnail objects.
 */
function saveSelectedThumbnailIds(selectedThumbnails) {
    const selectedIds = selectedThumbnails.map(tcontainer => tcontainer.id); // Extract IDs from selected thumbnails
    const selectedIdElem = document.getElementById('selected-id');
    if (selectedIdElem != null) {
        selectedIdElem.textContent = selectedIds.join(','); // Save IDs as a comma-separated string in 'selected-id' element
    }
}

export function showMultiSelectedProperties() {
    if (document.querySelector('#selected-properties-container')) {
        // Check if the user has selected multiple thumbnails
        const selectedThumbnails = getSelectedThumbnails();
        const properties = {};

        saveSelectedProperties(); // save previously selected properties before clearing
        clearPropertiesFields();
        const heading = document.getElementById('properties-for-selected-heading');

        // set selected id
        saveSelectedThumbnailIds(selectedThumbnails);

        if (selectedThumbnails.length > 1) {
            if (heading != null) {
                heading.textContent = 'Properties apply to multiple selected photos'
            }
            // Iterate over the selected thumbnails and get their properties
            selectedThumbnails.forEach(tcontainer => {
                // Extract the properties of each selected thumbnail
                const imageObj = getImageData(tcontainer.id);
                if (imageObj !== null && imageObj !== undefined) {
                    properties[tcontainer.id] = imageObj;
                }
            });

            // Display the common properties that can be modified for all selected thumbnails
            showCommonProperties(properties);

        } else if (selectedThumbnails.length === 1) {
            if (heading != null) {
                heading.textContent = 'Properties apply to the selected photo'
            }

            // Handle the case when only one thumbnail is selected
            showSelectedProperties(selectedThumbnails[0]);
        }

        else {
            // no thumbnails are selected
            return;
        }
    }
}

function showCommonProperties(properties) {
    const commonProperties = getCommonProperties(properties);

    // Get the keys of the first selected thumbnail
    const initialKeys = Object.keys(properties[Object.keys(properties)[0]]);

    // Iterate over the values of the properties of the first selected thumbnail
    initialKeys.forEach(property => {
        const canModifyProperty = multiApplyProperties.includes(property) && commonProperties.includes(property);
        const inconsistentValues = multiApplyProperties.includes(property) && !commonProperties.includes(property);

        // Check if the property can be modified for all selected thumbnails
        if (canModifyProperty) {
            // Display the value and its input field for modification
            const value = properties[Object.keys(properties)[0]][property];
            displayPropertyInputField(property, value);

        } else if (inconsistentValues) {
            // Display the different values message and disable modifications
            const placeholder = 'Selected photos have different values';
            displayPropertyInputField(property, '', placeholder, true);

        } else { // not a multi_apply field
            // Display the can't multiApply message and disable modifications
            const placeholder = 'Cannot apply to multiple selected photos';
            displayPropertyInputField(property, '', placeholder, true);
        }
    });

    // Update species field display depending on multi apply conditions
    if (!commonProperties.includes('selected-species')) {
        // Display the different values message and disable modifications
        updateSpeciesChoice(true, 'Selected photos have different values');
    }
    else {
        updateSpeciesChoice();
    }
}

function getCommonProperties(properties) {
    // Check if the property is common among all selected thumbnails
    // Step 1: Extract all keys from the first object
    const initialKeys = Object.keys(properties[Object.keys(properties)[0]]);

    // Step 2: Loop through each key and compare values
    const commonProperties = initialKeys.filter(key => {
        // Get the value of the property in the first object
        const firstValue = properties[Object.keys(properties)[0]][key];

        // Check if the value is empty string, undefined, or an empty array
        const isEmptyOrUndefined = value => {
            if (Array.isArray(value)) {
                return value.length === 0;
            } else {
                return value === "" || value === undefined;
            }
        };

        // Check if all objects have the same value for this property
        return Object.values(properties).every(obj => {
            const propValue = obj[key];
            if (Array.isArray(firstValue) && Array.isArray(propValue)) {
                // Check if the arrays have the same length and contain the same elements
                return firstValue.length === propValue.length && firstValue.every((element, index) => element === propValue[index]);
            } else {
                // Compare non-array values using strict equality
                return isEmptyOrUndefined(firstValue) ? isEmptyOrUndefined(propValue) : propValue === firstValue;
            }
        });

    });

    // Step 3: Print keys with common values
    console.log("Properties with common values:");
    commonProperties.forEach(key => console.log(key));

    return commonProperties;
}

function getMultiApplyProperties() {
    const multiApplyColumns = ['selected-species'];

    // Loop through each table in the tables array
    importconfig.photoimportconfig.tables.forEach(table => {
        // Loop through each column in the table
        table.columns.forEach(column => {
            // Check if the column has multi_apply set to true
            if (column.multi_apply === true) {
                // If it does, add its name to the multiApplyColumns array
                multiApplyColumns.push(column.name);
            }
        });
    });
    return multiApplyColumns;
}

function getPlaceholder(property) {
    for (const table of importconfig.photoimportconfig.tables) {
        for (const column of table.columns) {
            if (column.name == property && column.userinterface.hasOwnProperty("placeholder")) {
                return column.userinterface.placeholder;
            }
        }
    }
    return null;
}

/**
 * Function to clear property text fields
 */
export function clearPropertiesFields() {
    const form = document.getElementById('properties-form');

    if (form) {
        // clear selected id
        document.getElementById('selected-id').textContent = '';

        // Iterate through all child elements of the form
        form.querySelectorAll('textarea, input, select:not(.ql-header)').forEach(input => {
            input.value = ''; // Clear the input field
            input.disabled = true; // Disable the input field
            if (input.tagName === "SELECT") {
                const blankOption = input.querySelector('option[value=""]');
                if (blankOption) {
                    blankOption.textContent = "-- Please choose an option --";
                }
            }
            else {

                const placeholder = getPlaceholder(input.id);
                input.placeholder = placeholder !== null ? placeholder : '';
            }
        });

        form.querySelectorAll('.input-container').forEach(input => {
            input.remove(); // Clear the input field
        });

        // Disable the Quill editors
        form.querySelectorAll('.quill-container').forEach(container => {
            const quillInstance = quillInstances.get(container.id);
            if (quillInstance) {
                // Set the content of the Quill editor
                const delta = quillInstance.clipboard.convert("");
                quillInstance.setContents(delta, 'api');
                quillInstance.enable(false);
                const placeholder = getPlaceholder(container.id);
                quillInstance.root.dataset.placeholder = placeholder !== null ? placeholder : '';
            }
        });
    }
}


/**
* Function to create text fields
*/
export function createPropertiesFields() {

    const form = document.getElementById('properties-form');
    const collectionform = document.getElementById('group-properties-form');

    for (const table of importconfig.photoimportconfig.tables) {
        console.log(`Creating fields for database table: ${table.table}`);

        // Loop through columns within the current table
        for (const column of table.columns) {
            const uiconfig = column.userinterface.roles[ROLE];
            const isRichText = column.userinterface.richtext ? true : false;
            const hasPicklist = column.hasOwnProperty('picklist') ? true : false;
            const isCollectionProp = column.applies_to == "collection" ? true : false;

            if (!isCollectionProp && form === null) {
                // The selected properties container is not shown and property applies to a 
                // collection so ignore properties that apply to the selected image
                continue;
            }

            if (isCollectionProp && collectionform.querySelector('#' + column.name)) {
                // The control for the column already exists on the collection form so don't create another one
                continue;
            }

            // Create form-group
            const formgroup = document.createElement('div');
            formgroup.classList.add('form-group');

            // Create a label element
            const label = document.createElement('label');
            label.classList.add('label');
            label.htmlFor = column.name;

            if (uiconfig.required) {
                const asterisk = document.createElement('span');
                asterisk.innerHTML = '*';
                asterisk.classList.add('required-asterisk');
                // Append the asterisk span before the label text
                label.appendChild(asterisk);
                label.appendChild(document.createTextNode(' ')); // Add a space for separation
            }

            // Use innerHTML to set the label text
            label.innerHTML += column.userinterface.label;

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

                    // Find the closest ancestor with the class "multivalue-input-container"
                    const container = event.target.closest('.input-button-container');

                    // Query for the input element within the found container
                    const userInput = container.querySelector('.multivalue-input');

                    const propertyValue = userInput.value;
                    const propertyName = multiinput.id;

                    // save the new value to imageData
                    const selectedIdElem = document.getElementById("selected-id");
                    const selectedIds = selectedIdElem.textContent.split(',').filter(Boolean); // Get an array of selected thumbnail IDs
                    selectedIds.forEach(tcontainerId => {
                        if (!imageData[tcontainerId][propertyName]) {
                            imageData[tcontainerId][propertyName] = [];
                        }
                        imageData[tcontainerId][propertyName].push(propertyValue);
                    });
                    // Create a new input element
                    const inputContainer = createInputField(userInput.value);

                    userInput.value = '';
                    // Append the new input element to multivalue-input-inner
                    multiinput.appendChild(inputContainer);
                    multiinput.scrollTop = multiinput.scrollHeight;
                });

                // enable/disable input fields acording to readonly configuration
                clone.querySelectorAll('.multivalue-input').forEach(field => {
                    field.disabled = uiconfig.readonly;
                });

                formgroup.appendChild(clone);
            }
            else if (isRichText) {
                // Create a div element to serve as the Quill container
                const quillContainer = document.createElement('div');
                quillContainer.classList.add('quill-container');
                quillContainer.classList.add('auto-expand-input');
                quillContainer.id = column.name;
                quillContainer.required = uiconfig.required;

                const snowContainer = document.createElement('div');
                snowContainer.classList.add('ql-editor');
                snowContainer.id = column.name + "-ql";
                snowContainer.required = uiconfig.required;

                quillContainer.appendChild(snowContainer);

                // Append the Quill container
                formgroup.appendChild(quillContainer);

                const SELECTOR_CONTAINER = '.quill-container';

                // Create a Quill instance and associate it with the container
                const quill = new Quill(snowContainer, {
                    theme: 'snow',  // theme/style
                    bounds: SELECTOR_CONTAINER,
                    placeholder: column.userinterface.hasOwnProperty("placeholder") ? column.userinterface.placeholder : "",
                    readOnly: uiconfig.readonly, // Set readOnly based on the uiconfig value
                });

                // Store the Quill instance in the Map
                quillInstances.set(quillContainer.id, quill);
            }
            else {
                let field;

                if (hasPicklist) {
                    // Create a select element
                    field = document.createElement("select");
                    const blankOption = document.createElement("option");
                    blankOption.value = "";
                    blankOption.text = "-- Please choose an option --";
                    field.appendChild(blankOption);

                    // Iterate over the array and create an option for each value
                    column.picklist.forEach((value, index) => {
                        const optionElement = document.createElement("option");
                        optionElement.value = value; // Assign a value (you can use any unique identifier)
                        optionElement.text = value; // Set the text of the option
                        field.appendChild(optionElement); // Append the option to the select element
                    });

                    field.classList.add('auto-expand-input');
                }
                else {
                    field = document.createElement('input');
                    field.classList.add('auto-expand-input');
                }
                field.id = column.name;
                field.required = uiconfig.required;
                field.readOnly = uiconfig.readonly;
                field.placeholder = column.userinterface.hasOwnProperty("placeholder") ? column.userinterface.placeholder : "";
                if (field.readOnly) {
                    field.disabled = true;
                }

                formgroup.appendChild(field);
            }

            if (isCollectionProp) {
                collectionform.appendChild(formgroup);
            }
            else {
                form.appendChild(formgroup);
            }
        }
    }

    // Call autoExpand and get the generated styles
    const styles = autoExpand('textarea', 'height');

    // Create a <style> element and set its content to the generated styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;

    // Append the <style> element to the <head> of the document
    document.head.appendChild(styleElement);
}

/* EVENT LISTENERS */

// Delay duration in milliseconds (e.g., 500 milliseconds)
const delayDuration = 500;

// Autosave properties
$(document).on('focusout', '#properties-form input, #properties-form select, #properties-form textarea, #properties-form .quill-container', function (event) {
    // Clear any previous timeouts to prevent multiple executions
    if (this.timer) {
        clearTimeout(this.timer);
    }

    // Set a new timeout to execute the function after the delay
    this.timer = setTimeout(() => {
        saveProperties(event.target);
    }, delayDuration);
});