/**
 * @file
 * Handle submission including file upload and upload of metadata
 */

import { getPhotoCollection } from "./collection-data.js";
import { displayStatusMessage } from "./status.js";

/**
 * 
 * @param {*} file 
 * @param {function} callback - Callback function to handle the uploaded filename
 */
function uploadFile(source, rootname, callback) {
    const formData = new FormData();
    formData.append('rootname', rootname);
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
                callback(data.filename); // Call the callback function with the uploaded filename
            } else {
                // Handle errors from the JSON response
                console.error(`File upload: Upload failed: ${data.message}`);
            }
        })
        .catch(error => {
            // Handle network errors or other exceptions
            console.error('Error:', error);
        });
}

/**
 * Submit, i.e. save metadata and upload each photo in the collection
 */
function submit(collection) {
    // Array to store promises for each file upload
    const uploadPromises = [];

    // Upload files
    for (const photoId in collection.photos) {
        const photo = collection.photos[photoId];
        const species = (collection["collection-type"] === 'species') ? collection["collection-species"] : photo["selected-species"];
        const source = photo["sourceImage"];

        // Create a promise for each file upload
        const uploadPromise = new Promise((resolve, reject) => {
            // Pass a callback to handle the uploaded filename so it gets saved back to the collection photo
            uploadFile(source, species, (filename) => {
                // Store the filename in the photo object
                collection.photos[photoId]["FileName"] = filename;
                resolve(); // Resolve the promise once the file upload is complete
            });
        });

        // Add the promise to the array
        uploadPromises.push(uploadPromise);
    }

    // Wait for all file uploads to complete
    Promise.all(uploadPromises)
        .then(() => {
            // All file uploads are complete, now save the collection
            saveCollection(collection);
        })
        .catch(error => {
            // Handle errors from file uploads
            console.error('Error during file uploads:', error);
        });
}

function saveCollection(collection) {
    // Convert the collection object to JSON
    const jsonData = JSON.stringify(collection, null, 2);

    // Make an AJAX request to save the collection
    fetch('/includes/php/save-collection.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {
            // Handle the response (if needed)
            console.log('Collection saved to file: ', data.filename);
            displayStatusMessage(`Thank you! The photo collection, "${collection['collection-name']}", has been submitted.`, false, false);
        })
        .catch(error => {
            // Handle network errors or other exceptions
            console.error('Error:', error);
            displayStatusMessage(`Error submitting photo collection, "${collection['collection-name']}": ${error.message}`, true, false);
        });
}


/* EVENT LISTENERS */

// Delay duration in milliseconds (e.g., 500 milliseconds)
const delayDuration = 500;

export function initializeSubmitContribute() {
    // Handler for the submit button click event
    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', function (event) {
        // Wait for the autosave to complete (adjust the delay if needed)
        setTimeout(() => {
            const collection = getPhotoCollection();
            submit(collection);
            // Convert the collectionData object to a JSON string with proper indentation
            const jsonString = JSON.stringify(collection, null, 2);
            console.log(jsonString);

        }, delayDuration);
    });
}
