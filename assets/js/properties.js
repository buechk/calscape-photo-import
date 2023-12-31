/** 
 * @file
 *  Display properties of source photos and apply properties to Calscape photos. 
 * 
*/
import { getPhotoCollection, imageData } from "./collection-data.js";
import { updateSpeciesChoice } from "./species-selection.js";
import { displayStatusMessage } from "./status.js";

const ROLE = "contributor"; // or "reviewer"

export const importconfig = {
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
                        "userinterface": {
                            "label": "Caption title",
                            "default": "",
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
                        "multi_apply": true,
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
                        "name": "Ranking",
                        "datasources": {
                            "flickr": "photo.exif[tag='Rating'].raw._content",
                            "jpeg": "EXIF.xmp.Rating"
                        },
                        "multi_apply": true,
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
    const selectedIdElem = document.getElementById('selected-id');
    if (selectedIdElem != null) {
        const selectedId = selectedIdElem.textContent;
        if (selectedId !== '') {
            const currentImageObj = imageData[selectedId];
            if (currentImageObj) { // Ensure you have a selected image object

                // Get the form element
                const propertiesForm = document.getElementById('properties-form');

                // Iterate through the input elements of the properties form
                const inputElements = propertiesForm.querySelectorAll('input, select, textarea');
                inputElements.forEach(input => {
                    const property = input.id;
                    if (property !== '') {
                        // If it's not an array, set the value directly
                        currentImageObj[property] = input.value;
                    }
                });
            } else {
                console.log("No image object selected to save properties to.");
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
        const selectedIdElem = document.getElementById('selected-id');
        if (selectedIdElem != null) {
            const tcontainerId = selectedIdElem.textContent;
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
}

/**
 * Function to display the properties of the selected thumbnail
 */
export function showSelectedProperties(event) {
    if (document.querySelector('#selected-properties-container')) {
        saveSelectedProperties(); // save previously selected properties before clearing
        clearPropertiesFields();

        const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
        if (event.target.parentNode.parentNode == thumbnailGroupGrid) {
            // get the saved image data for the selected thumbnail container
            const tcontainerId = event.target.parentNode.id;
            const imageObj = imageData[tcontainerId];

            // set selected id
            document.getElementById('selected-id').textContent = tcontainerId;

            // Iterate through the selected item's properties
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
                            // enable/disable input fields acording to readonly configuration
                            const multivalueInput = input.parentElement;
                            multivalueInput.querySelectorAll('.multivalue-input').forEach(field => {
                                field.disabled = input.readonly;
                            });
                        }
                        else {
                            input.value = propertyvalue;
                            input.disabled = input.readOnly;
                        }
                    }
                    else {
                        input.value = '';
                    }
                }
            }
        }
        updateSpeciesChoice();
    }
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
        form.querySelectorAll('textarea, input').forEach(input => {
            input.value = ''; // Clear the input field
            input.disabled = true; // Disable the input field
        });

        form.querySelectorAll('.input-container').forEach(input => {
            input.remove(); // Clear the input field
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
        console.log(`Table: ${table.table}`);

        // Loop through columns within the current table
        for (const column of table.columns) {
            const uiconfig = column.userinterface.roles[ROLE];
            const isTextArea = column.userinterface.textarea ? true : false;
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

                // enable/disable input fields acording to readonly configuration
                clone.querySelectorAll('.multivalue-input').forEach(field => {
                    field.disabled = uiconfig.readonly;
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

$(document).on('focusout', '#properties-form input, #properties-form select, #properties-form textarea', function (event) {
    // Clear any previous timeouts to prevent multiple executions
    if (this.timer) {
        clearTimeout(this.timer);
    }

    // Set a new timeout to execute the function after the delay
    this.timer = setTimeout(() => {
        saveProperties(event.target);
    }, delayDuration);
});