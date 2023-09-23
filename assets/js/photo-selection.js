/**
 * @file 
 * Handles the user's photo source selection.
 *
 * Selection of photos from the file system or from a Flickr
 * api service URL are supported. 
 */

/**
 *  Display thumbnails from files or URLs
 * 
 * @param input is either a File
 */
function displayThumbnails(input) {
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    // Enable drag-and-drop reordering of thumbnails
    const sortable = new Sortable(thumbnailGrid, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        multiDrag: true,
        selectedClass: 'selected'
    });

    thumbnailGrid.innerHTML = ''; // Clear previous thumbnails

    if (input instanceof FileList) {
        // Clear URL to avoid confusing the user
        document.getElementById(
            'url-input').value = '';
        // Handle files from file input
        displayImagesFromFilesystem(input);

    } else if (typeof input === 'string' && input.trim() !== '') {
        // Clear URL to avoid confusing the user
        document.getElementById(
            'file-input').value = '';
        // Handle URLs
        // Check if the input is a Flickr URL
        if (input.includes('flickr.com')) {
            // Extract image URLs from Flickr page and display thumbnails
            displayImagesFromFlickr(input)
        } else {
            alert("The URL must be a flickr.com URL");
        }
    }
}

// EVENT LISTENERS

// Get references to the file input and URL input elements
const fileInput = document.getElementById('file-input');
const urlInput = document.getElementById('url-input');

// Add an event listener for the "change" event on the file input
fileInput.addEventListener('change', function (event) {
    // Handle the selected files from the file input here
    displayThumbnails(event.target.files);
});

// Add event listener to the URL input for 'change' event
urlInput.addEventListener('change', function (event) {
    displayThumbnails(event.target.value);
});

