/**
 * @file
 * Handle submission including file upload and upload of metadata
 */

import { imageData } from "./properties.js";

const submitButton = document.getElementById('submit-button')

/**
 * 
 * @param {*} file 
 * @returns path of uploaded file or '' if file failed to upload
 */
function uploadFile(obj) {
    const file = obj["sourceImage"];
    const species = obj["species"];
    if (file) {
        const formData = new FormData(); // Create a new FormData object
        formData.append('file', file); // Append the File object to the form data
        formData.append('rootname', species);
        // Send a POST request to the server
        fetch('/includes/php/file_upload.php', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json()) // Parse response as JSON
            .then(data => {
                if (data.success) {
                    // Handle a successful upload
                    console.log(`file_upload: ${data.filename}, ${data.message}`);
                    obj["FileName"] = data.filename;
                } else {
                    // Handle errors
                    console.error('file_upload: Upload failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}


/**
 * Submit entry point
 */
function submit() {
    // Upload files and update imageData
    for (const id in imageData) {
        const obj = imageData[id];

        // If it's a file, upload the file
        if (obj["sourceImage"] instanceof File) {
            uploadFile(obj);
        }
        // Upload serialized imageData 
    }


}

/* EVENT LISTENERS */

// Delay duration in milliseconds (e.g., 500 milliseconds)
const delayDuration = 500;

// Handler for the submit button click event
submitButton.addEventListener('click', function (event) {
    // Trigger blur event on the currently focused input element
    const focusedInput = document.activeElement;
    if (focusedInput) {
        focusedInput.blur(); // Trigger the blur event

        // Wait for the autosave to complete (adjust the delay if needed)
        setTimeout(() => {
            // Convert the imageData object to a JSON string with proper indentation
            const jsonString = JSON.stringify(imageData, null, 2);
            console.log(jsonString);

            submit();
        }, delayDuration);
    } else {
        // If no input element is focused, we can directly submit
        submit();
    }
});
