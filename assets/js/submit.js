/**
 * @file
 * Handle submission including file upload and upload of metadata
 */

import { getPhotoCollection, imageData } from "./collection-data.js";

/**
 * 
 * @param {*} file 
 * @returns path of uploaded file or '' if file failed to upload
 */
function uploadFile(obj) {
    const source = obj["sourceImage"];
    const species = obj["species"];
    const formData = new FormData();
    formData.append('rootname', species);
    let method = '';

    if (source instanceof File) {
        formData.append('file', source);
        method = '/includes/php/file_upload.php';
    } else {
        formData.append('url', source);
        method = '/includes/php/file_from_url.php';
    }

    // Send a POST request to the server
    fetch(method, {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {
            if (data.success) {
                // Handle a successful upload
                console.log(`File upload: ${data.filename}, ${data.message}`);
                obj["FileName"] = data.filename;
            } else {
                // Handle errors from the JSON response
                console.error(`fFile upload: Upload failed: ${data.message}`);
            }
        })
        .catch(error => {
            // Handle network errors or other exceptions
            console.error('Error:', error);
        });
}

/**
 * Submit entry point
 */
function submit() {
    // Upload files and update imageData
    for (const id in imageData) {
        const obj = imageData[id];
        uploadFile(obj);
    }
}

/* EVENT LISTENERS */

// Delay duration in milliseconds (e.g., 500 milliseconds)
const delayDuration = 500;

export function initializeSubmitContribute() {
    // Handler for the submit button click event
    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', function (event) {
        // Trigger blur event on the currently focused input element
        const focusedInput = document.activeElement;
        if (focusedInput) {
            focusedInput.blur(); // Trigger the blur event

            // Wait for the autosave to complete (adjust the delay if needed)
            setTimeout(() => {
                // Convert the imageData object to a JSON string with proper indentation
                const jsonString = JSON.stringify(getPhotoCollection(), null, 2);
                console.log(jsonString);

                submit();
            }, delayDuration);
        } else {
            // If no input element is focused, we can directly submit
            submit();
        }
    });
}
