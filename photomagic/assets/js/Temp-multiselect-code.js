// in thumbnails.js

export function getSelectedThumbnails() {
    const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
    
    if (thumbnailGroupGrid) {
        // Use querySelectorAll for more flexibility and modern syntax
        const selectedElements = thumbnailGroupGrid.querySelectorAll('.selected');
        
        // Reset selectedThumbnails array to ensure it only contains currently selected items
        selectedThumbnails = [];

        // Iterate over selected elements and add their details to selectedThumbnails
        selectedElements.forEach(element => {
            // Here you can push the entire element, its ID, or any other data you need
            selectedThumbnails.push({
                id: element.id,
                element: element // Including the element itself can be useful for further manipulation
                // Add more properties as needed
            });
        });

        return selectedThumbnails;
    } else {
        console.error("Element with id 'thumbnail-group-grid' not found.");
        return [];
    }
}

// in properties.js

export function saveSelectedProperties() {
    const selectedThumbnails = getSelectedThumbnails(); // Use the updated selection logic

    selectedThumbnails.forEach(thumbnail => {
        const currentImageObj = imageData[thumbnail.id];

        if (currentImageObj) {
            const propertiesForm = document.getElementById('properties-form');
            const inputElements = propertiesForm.querySelectorAll('input, select, textarea');

            inputElements.forEach(input => {
                const property = input.id;
                const value = input.value.trim();

                if (property !== '') {
                    // For multivalue inputs, ensure an array is initialized and the value is added if it's new
                    if (input.classList.contains('multivalue-input')) {
                        currentImageObj[property] = currentImageObj[property] || [];
                        if (!currentImageObj[property].includes(value)) {
                            currentImageObj[property].push(value);
                        }
                    } else {
                        // For single value inputs, just set the value directly
                        currentImageObj[property] = value;
                    }
                }
            });
        }
    });
}


function saveProperties(inputElement) {
    const selectedThumbnails = getSelectedThumbnails(); // Use the updated selection logic

    selectedThumbnails.forEach(thumbnail => {
        if (!imageData[thumbnail.id]) {
            imageData[thumbnail.id] = {}; // Initialize image object if it doesn't exist
        }

        const currentImageObj = imageData[thumbnail.id];
        const propertyName = inputElement.id;
        const propertyValue = inputElement.value.trim();

        if (propertyName) {
            if (propertyValue) {
                // Set the property value
                currentImageObj[propertyName] = propertyValue;
            } else {
                // If the input is empty, consider removing the property or setting it to a default value
                delete currentImageObj[propertyName]; // or set a default value if appropriate
            }
        }
    });
}



export function showSelectedProperties(event) {
    if (document.querySelector('#selected-properties-container')) {
        saveSelectedProperties(); // Save any previously selected properties
        clearPropertiesFields(); // Clear existing fields

        const selectedThumbnails = getSelectedThumbnails(); // Implement based on your selection logic
        const multiApplyProperties = getMultiApplyProperties(); // Extract multi_apply info from importConfig

        if (selectedThumbnails.length > 1) {
            handleMultipleSelections(selectedThumbnails, multiApplyProperties);
        } else if (selectedThumbnails.length === 1) {
            const tcontainerId = selectedThumbnails[0].id; // Adapt based on your data structure
            const imageObj = imageData[tcontainerId];
            document.getElementById('selected-id').textContent = tcontainerId;
            updatePropertiesForSingleSelection(imageObj);
        }
        updateSpeciesChoice(); // Update other UI elements as needed
    }
}

function getMultiApplyProperties() {
    const multiApplyProperties = {};
    importconfig.photoimportconfig.tables.forEach(table => {
        table.columns.forEach(column => {
            if (column.multi_apply) {
                multiApplyProperties[column.name] = true;
            }
        });
    });
    return multiApplyProperties;
}

function handleMultipleSelections(multiApplyProperties) {
    // Retrieve the array of selected thumbnail objects
    const selectedThumbnails = getSelectedThumbnails();

    // Object to store the comparison results for each multi-apply property
    let propertyValues = {};

    // Initialize propertyValues with keys for each multi-apply property and set their values to an empty set
    for (const property in multiApplyProperties) {
        propertyValues[property] = new Set();
    }

    // Iterate over each selected thumbnail object
    selectedThumbnails.forEach(thumbnailObj => {
        const imageObj = imageData[thumbnailObj.id]; // Assuming imageData holds the properties for each thumbnail

        // For each multi-apply property, add its value from the current thumbnail to the set
        for (const property in multiApplyProperties) {
            if (imageObj && imageObj.hasOwnProperty(property)) {
                propertyValues[property].add(imageObj[property]);
            }
        }
    });

    // Now, update the UI for each property based on the collected values
    for (const property in propertyValues) {
        const input = document.getElementById(property);
        if (input) {
            // If all selected thumbnails have the same value for this property, display it
            if (propertyValues[property].size === 1) {
                input.value = propertyValues[property].values().next().value;
                input.placeholder = ''; // Clear placeholder if any
            } else {
                // If selected thumbnails have different values for this property, indicate it
                input.value = '';
                input.placeholder = 'Multiple values for selected photos';
            }
        }
    }
}


function updatePropertiesForSingleSelection(imageObj) {
   
    if (imageObj) {
        const propertiesForm = document.getElementById('properties-form');
        const inputElements = propertiesForm.querySelectorAll('input, select, textarea, .quill-container');

        inputElements.forEach(input => {
            if (input.classList.contains('multivalue-input')) {
                // Handle multivalue inputs
                const container = input.closest('.multivalue-input-container');
                const innerContainer = container.querySelector('.multivalue-input-inner');
                const property = innerContainer.id;
                const value = input.value.trim();

                if (property && value !== '') {
                    imageObj[property] = imageObj[property] || [];
                    if (!imageObj[property].includes(value)) {
                        imageObj[property].push(value);
                    }
                }
            }
            else if (input.classList.contains('quill-container')) {
                // Handle Quill rich text editor inputs
                const propertyName = input.id;
                const quillInstance = quillInstances.get(input.id); // Assuming quillInstances is a Map or similar structure holding Quill instances

                if (quillInstance) {
                    const htmlContent = quillInstance.root.innerHTML; // Get the HTML content from the Quill editor
                    imageObj[propertyName] = htmlContent; // Update the image object with the HTML content
                }
                else {
                    console.error('Quill instance not found for property: ', propertyName);
                }
            }
            else {
                // Handle standard input, select, and textarea elements
                const property = input.id;
                if (property !== '') {
                    imageObj[property] = input.value; // Directly update the image object with the input value
                }
            }
        });
    }
    else {
        console.log("No image object provided to update properties for.");
    }
}