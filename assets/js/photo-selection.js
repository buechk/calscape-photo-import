/**
 * @file 
 * Handles the user's photo source selection.
 *
 * Selection of photos from the file system or from a Flickr
 * api service URL are supported. 
 */
import { displayThumbnails } from './thumbnails.js'

const fileModal = document.getElementById('fileModal');
const flickrModal = document.getElementById('flickrModal');

// Get the close buttons for the modals
const fileModalClose = document.getElementById('fileModalClose');
const flickrModalClose = document.getElementById('flickrModalClose');

// Get references to the menu links
const selectFilesLink = document.getElementById('selectFilesLink');
const selectFromFlickrLink = document.getElementById('selectFromFlickrLink');

const fileInput = document.getElementById('fileInput');
const flickrUrl = document.getElementById('flickrUrl');

/**
 * Upload files to Calscape. This will be moved to another file.
 */
function uploadFiles() {
    // Iterate through the stored file data and upload files
    for (const uniqueIdentifier in fileData) {
        if (fileData.hasOwnProperty(uniqueIdentifier)) {
            const file = fileData[uniqueIdentifier];

            // Simulate uploading the file (replace with actual upload code)
            console.log(`Uploading file with unique identifier: ${uniqueIdentifier}, File Name: ${file.name}`);

            // Remove the file data after uploading if needed
            delete fileData[uniqueIdentifier];
        }
    }
}

// EVENT LISTENERS

// Open the File selection modal
selectFilesLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default behavior of the link (e.g., navigating to a new page)  
    fileModal.style.display = 'block';
});

// Close the file selection modal
fileModalClose.addEventListener('click', () => {
    fileModal.style.display = 'none';
});

// Add an event listener for the "change" event on the file input
fileInput.addEventListener('change', function (event) {
    // Handle the selected files from the file input here
    // store files with a unique identifier for later upload
    // Display thumbnails
    displayThumbnails(fileInput.files);
    fileInput.value = '';
    fileModal.style.display = 'none';
});

// Open the Flickr selection modal
selectFromFlickrLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default behavior of the link (e.g., navigating to a new page)
    flickrModal.style.display = 'block';
});

// Close the Flickr import modal
flickrModalClose.addEventListener('click', () => {
    flickrModal.style.display = 'none';
});

// Open the Flickr import modal
flickrUrl.addEventListener('change', () => {
    displayThumbnails(flickrUrl.value);
    flickrModal.style.display = 'none';
});

// When the user clicks anywhere outside of the modals, close them
window.addEventListener('click', (event) => {
    if (event.target === fileModal) {
        fileModal.style.display = 'none';
    }
    if (event.target === flickrModal) {
        flickrModal.style.display = 'none';
    }
});

