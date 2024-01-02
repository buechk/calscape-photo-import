/**
 *  @file
 * Loads thumbnails from photo source input and manages thumbnail selection and drag-and-drop functionality.
 *  
**/

import { getSourcePhotos, clearSourcePhotos, storeSourcePhoto } from "./source-photo-data.js";
import { showSelectedProperties } from './properties.js';
import { clearPropertiesFields } from "./properties.js";
import { extractUsernameFromFlickrUrl, extractAlbumFromFlickrUrl, searchPhotosByUsername, searchPhotosByAlbum } from './flickr-API.js';
import { getCollectionThumbnails } from './collection-data.js';
import { displayStatusMessage } from "./status.js";

const flickrUrl = document.getElementById('flickrUrl');

// variables for implementing standard click, shift-click, cmd-click, ctrl-click selection behavior on thumbnails
let selectedThumbnails = [];
let firstSelectedThumbnailThumbnailGrid = null; // Added variable for 'thumbnail-grid'
let firstSelectedThumbnailThumbnailGroupGrid = null; // Added variable for 'thumbnail-group-grid'

export function getSelectedThumbnailCount() {
    const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');

    // Check if the element with the given id exists
    if (thumbnailGroupGrid) {
        // Get all elements with the 'selected' class within thumbnailGroupGrid
        const selectedThumbnails = thumbnailGroupGrid.getElementsByClassName('selected');

        // Return the count of selected thumbnails
        return selectedThumbnails.length;
    } else {
        // Handle the case where the element with the given id doesn't exist
        console.error("Element with id 'thumbnail-group-grid' not found.");
        return 0;
    }
}

// Enable drag-and-drop reordering of thumbnails
export function initializeSortableGrid() {
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    // Enable drag-and-drop reordering of thumbnails
    const sortable = new Sortable(thumbnailGrid, {
        animation: 150,
        group: 'shared-group',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        multiDrag: true,
        selectedClass: 'selected'
    });

    const dropTarget = document.getElementById('thumbnail-grid');

    // Prevent the default behavior for dragenter and dragover events
    dropTarget.addEventListener('dragenter', function (event) {
        event.preventDefault();
        // Change the sortablegroup styling to indicate that it's a valid drop target
        dropTarget.style.border = '2px dashed #33cc33';
    });

    dropTarget.addEventListener('dragleave', function () {
        dropTarget.style.border = 'none';
    });

    // Prevent the default behavior for dragover events
    dropTarget.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    // Handle the drop event
    dropTarget.addEventListener('drop', function (event) {
        event.preventDefault();
        // Access the dragged data (you might have additional logic here)
        const draggedData = event.dataTransfer.getData('text/plain');
        // Perform actions with the dropped data
        console.log('Dropped to source grid:', draggedData);
        // Reset the sortablegroup styling
        dropTarget.style.border = 'none';
    });
}

// Enable drag-and-drop reordering of thumbnails
export function initializeSortableGroupGrid() {
    const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');

    // Enable drag-and-drop reordering of thumbnails
    const sortablegroup = new Sortable(thumbnailGroupGrid, {
        animation: 150,
        group: 'shared-group',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        multiDrag: true,
        selectedClass: 'selected'
    });

    const dropTarget = document.getElementById('thumbnail-group-grid');
    const dropMessage = document.getElementById('drag-and-drop-message');

    if (getCollectionThumbnails().length > 0) {
        dropMessage.style.display = 'none';
    }

    // Prevent the default behavior for dragenter and dragover events
    dropTarget.addEventListener('dragenter', function (event) {
        event.preventDefault();
        // Change the sortablegroup styling to indicate that it's a valid drop target
        dropTarget.style.border = '2px dashed #33cc33';
    });

    dropTarget.addEventListener('dragleave', function () {
        dropTarget.style.border = 'none';
        // Use a setTimeout to check after a short delay
        setTimeout(() => {
            // Check if the number of children is 1 (the dropMessage)
            if (dropTarget.childElementCount === 1) {
                // Reset the drop zone styling and redisplay the message
                dropMessage.style.display = 'block';
            }
        }, 100); // Adjust the delay as needed
    });

    // Prevent the default behavior for dragover events
    dropTarget.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    // Handle the drop event
    dropTarget.addEventListener('drop', function (event) {
        event.preventDefault();
        // Access the dragged data (you might have additional logic here)
        const draggedData = event.dataTransfer.getData('text/plain');
        // Perform actions with the dropped data
        console.log('Dropped to collection grid:', draggedData);
        // Reset the sortablegroup styling
        dropTarget.style.border = 'none';
        // Hide the drop message
        dropMessage.style.display = 'none';
    });
}

/**
 *  Display thumbnails from files or URLs
 * 
 * @param input is either a file list or a url
 */
export function displayThumbnails(input) {
    const thumbnailGrid = document.getElementById('thumbnail-grid');
    thumbnailGrid.innerHTML = ''; // Clear previous thumbnails

    if (input instanceof FileList) {
        // Handle files from file input
        displayImagesFromFilesystem(input);

    } else if (typeof input === 'string' && input.trim() !== '') {
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

/**
 * 
 * Displays the thumbnails given in the file list
 *  @param {*} filelist 
 */
function displayImagesFromFilesystem(filelist) {
    // Convert filelist to an array
    const filesArray = Array.from(filelist);

    // Handle files from file input
    clearSourcePhotos();

    // Map each file to a promise returned by storeSourcePhoto
    const promises = filesArray.map(file => {
        return storeSourcePhoto(null, file, file.name)
            .then(result => {
                console.log('Photo stored successfully: ', result.id, result.caption);
            })
            .catch(error => {
                console.error('Error storing photo:', error);
            });
    });

    // Wait for all promises to be resolved before proceeding
    Promise.all(promises)
        .then(() => {
            // All files have been processed, now display the thumbnails
            displayThumbnailsFromSourcePhotos();
        });
}

/**
 * Calls the Flickr API using the given url to get photos
 * 
 * @param {*} photosApiUrl 
 */

async function displayImagesFromFlickr(photosApiUrl) {
    clearSourcePhotos();

    try {
        // Extract the user ID or album ID from the Flickr URL
        const userId = await extractUsernameFromFlickrUrl(flickrUrl.value);
        const albumId = await extractAlbumFromFlickrUrl(flickrUrl.value);

        if (userId !== null || albumId !== null) {
            let id;
            let photos;

            if (albumId !== null) {
                // It's an album URL
                id = albumId;
                console.log("Displaying photos from album with ID:", albumId);
                photos = await searchPhotosByAlbum(albumId);
            } else {
                // It's a user profile URL
                id = userId;
                console.log("Displaying photos from user profile with ID:", userId);
                photos = await searchPhotosByUsername(userId);
            }

            if (photos && photos.length > 0) {
                for (const photo of photos) {
                    const farmId = photo.farm;
                    const serverId = photo.server;
                    const photoId = photo.id;
                    const secret = photo.secret;
                    const title = photo.title;

                    const t_url = `https://farm${farmId}.staticflickr.com/${serverId}/${photoId}_${secret}_q.jpg`;
                    console.log("Photo title:", title);
                    console.log("Image URL:", t_url);

                    // Store photo information
                    const l_url = t_url.replace("_q.", "_b.");
                    storeSourcePhoto(photoId, l_url, title);
                }
            } else {
                // Handle the case where no photos were found for the given ID
                displayStatusMessage("No photos found for the given user/album ID.", false, false);
                console.warn("No photos found for the given user/album ID.");
            }
        } else {
            // Handle the case where the ID couldn't be extracted
            displayStatusMessage("Invalid Flickr URL or unable to extract user/album ID.", true, false);
            console.warn("Invalid Flickr URL or unable to extract user/album ID.");
        }
    } catch (error) {
        // Handle any errors that occur during the process

        console.error("Error fetching and displaying photos:", error);
        alert("An error occurred while fetching and displaying photos. " + error.message);
    }

    displayThumbnailsFromSourcePhotos();
}

export function displayThumbnailsFromSourcePhotos() {
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    thumbnailGrid.innerHTML = ''; // Clear previous thumbnails

    const sourcePhotos = getSourcePhotos();
    for (const uniqueIdentifier in sourcePhotos) {
        const photo = sourcePhotos[uniqueIdentifier];
        const url = photo.url;
        const captionText = photo.caption;

        // create a container for the thumbnail and its caption and id
        const tcontainer = document.createElement('div');
        const thumbnail = document.createElement('div');
        tcontainer.classList.add('tcontainer');
        thumbnail.classList.add('thumbnail');
        thumbnail.style.backgroundImage = `url(${url})`;
        tcontainer.appendChild(thumbnail);
        const caption = document.createElement('div');
        caption.classList.add('caption');
        caption.innerText = captionText;
        tcontainer.appendChild(caption);
        tcontainer.id = uniqueIdentifier;

        // listen for when a thumbnail is selected so properties can be updated
        tcontainer.addEventListener('click', showSelectedProperties);

        thumbnailGrid.appendChild(tcontainer);
    }
}

/**
 * Clear all selections
 */
function clearSelections() {
    // Clear previous selections
    for (let i = 0; i < selectedThumbnails.length; i++) {
        const tc = selectedThumbnails[i];
        tc.classList.remove('selected');
    }
    selectedThumbnails.length = 0; // Clear the array
}

/** 
 *  Function to toggle selection state
*/

function toggleSelection(event) {
    // Check if the click event originated from within the selected-properties-container
    const isWithinSelectedProperties = event.target.closest('#selected-properties-container');

    // If it's within selected-properties-container, do not toggle the selection in thumbnailGroupGrid
    if (isWithinSelectedProperties) {
        // reapply .selected to selected elements
        for (let i = 0; i < selectedThumbnails.length; i++) {
            const tc = selectedThumbnails[i];
            tc.classList.add('selected');
        }
        return;
    }

    if (event.target.id !== 'thumbnail-group-grid' && event.target.id !== 'thumbnail-grid') {
        // The clicked element is a child of the parent <div>
        const clickedElement = event.target;

        let tcontainer;
        // Check if the clicked element is a thumbnail
        if (clickedElement.classList.contains('thumbnail')) {
            // Find the parent tcontainer
            tcontainer = clickedElement.parentNode;
        } else if (clickedElement.classList.contains('thumbnail-container')) {
            // The clicked element is already a tcontainer
            tcontainer = clickedElement;
        } else { // background clicked
            // Clear previous selections
            // clearPropertiesFields;
        }

        const thumbnailGrid = document.getElementById('thumbnail-grid');
        const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');

        if (tcontainer !== undefined) {
            if (event.ctrlKey || event.metaKey) {
                // Ctrl or Cmd key is pressed, toggle selection without clearing others
                if (selectedThumbnails.includes(tcontainer)) {
                    // Deselect if already selected
                    tcontainer.classList.remove('selected');
                    const index = selectedThumbnails.indexOf(tcontainer);
                    if (index > -1) {
                        selectedThumbnails.splice(index, 1);
                    }
                } else {
                    // Select if not already selected
                    tcontainer.classList.add('selected');
                    selectedThumbnails.push(tcontainer);
                }
            } else if (event.shiftKey) {
                // Shift key is pressed, implement contiguous multi-select

                // Remember first selected thumbnail for future shift-click 
                const gridName = tcontainer.parentNode === thumbnailGroupGrid ? 'group' : 'normal';
                if (gridName === 'normal') {
                    if (firstSelectedThumbnailThumbnailGrid === null) {
                        firstSelectedThumbnailThumbnailGrid = tcontainer; // Set the first selected thumbnail for 'thumbnail-grid'
                    }
                } else if (gridName === 'group') {
                    if (firstSelectedThumbnailThumbnailGroupGrid === null) {
                        firstSelectedThumbnailThumbnailGroupGrid = tcontainer; // Set the first selected thumbnail for 'thumbnail-group-grid'
                    }
                }

                const firstSelectedThumbnail = gridName === 'normal' ? firstSelectedThumbnailThumbnailGrid : firstSelectedThumbnailThumbnailGroupGrid;

                if (firstSelectedThumbnail === null) {
                    // No previous first selected thumbnail, set the first one
                    firstSelectedThumbnail = tcontainer;
                } else {
                    // Determine the range between the first selected and the current one
                    const firstSelectedIndex = [...(gridName === 'normal' ? thumbnailGrid : thumbnailGroupGrid).children].indexOf(firstSelectedThumbnail);
                    const currentIndex = [...(gridName === 'normal' ? thumbnailGrid : thumbnailGroupGrid).children].indexOf(tcontainer);

                    // Determine the start and end indexes for the range
                    const startIndex = Math.min(firstSelectedIndex, currentIndex);
                    const endIndex = Math.max(firstSelectedIndex, currentIndex);

                    // Clear previous selections
                    clearSelections();

                    // Select the thumbnails in the determined range
                    for (let i = startIndex; i <= endIndex; i++) {
                        const tc = [...(gridName === 'normal' ? thumbnailGrid : thumbnailGroupGrid).children][i];
                        tc.classList.add('selected');
                        selectedThumbnails.push(tc);
                    }
                }
            } else {
                // No modifier key is pressed, clear previous selections and select the current one
                clearSelections();

                // Remember first selected thumbnail for future shift-click 
                const gridName = tcontainer.parentNode === thumbnailGroupGrid ? 'group' : 'normal';
                if (gridName === 'normal') {
                    firstSelectedThumbnailThumbnailGrid = tcontainer; // Set the first selected thumbnail for 'thumbnail-grid'
                } else if (gridName === 'group') {
                    firstSelectedThumbnailThumbnailGroupGrid = tcontainer; // Set the first selected thumbnail for 'thumbnail-group-grid'
                }

                // Add new selection
                tcontainer.classList.add('selected');
                selectedThumbnails.push(tcontainer);
            }
        }
    }
    else {
        // clicked in grid causing all to be unselected
        clearSelections();
    }
    if (selectedThumbnails.length != 1) {
        clearPropertiesFields();
    }
}

const mainContentArea = document.getElementById('main-content');
mainContentArea.addEventListener('click', toggleSelection);
