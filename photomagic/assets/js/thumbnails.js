/**
 *  @file
 * Loads thumbnails from photo source input and manages thumbnail selection and drag-and-drop functionality.
 *  
**/

import { getSourcePhotos, clearSourcePhotos, storeSourcePhoto } from "./source-photo-data.js";
import { showMultiSelectedProperties, getFullLightboxCaption } from './properties.js';
import { extractUsernameFromFlickrUrl, extractAlbumFromFlickrUrl, searchPhotosByUsername, searchPhotosByAlbum, getPhotoSizes } from './flickr-API.js';
import { displayStatusMessage } from "./status.js";
import { showCalscapePhotos } from "./sort-and-save.js";

const flickrUrl = document.getElementById('flickrUrl');

// variables for implementing standard click, shift-click, cmd-click, ctrl-click selection behavior on thumbnails
let selectedThumbnails = [];
let firstSelectedThumbnailThumbnailGrid = null; // Added variable for 'thumbnail-grid'
let firstSelectedThumbnailThumbnailGroupGrid = null; // Added variable for 'thumbnail-group-grid'
let firstSelectedThumbnailThumbnailCalscapeGrid = null; // Added variable for 'thumbnail-calscape-grid'

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
export function initializeSortableGrid(gridId, messageId, gridContentsArr, allowDragOut = true) {
    const actionsContainer = document.getElementById("photo-actions-container");
    actionsContainer.display = "block";

    const dropTarget = document.getElementById(gridId);

    // Enable drag-and-drop reordering of thumbnails
    const sortableGridOptions = {
        // autoscroll options
        /*   scroll: true, // Enable the plugin. Can be HTMLElement.
           scrollSensitivity: 50, // px, how near the mouse must be to an edge to start scrolling.
           scrollSpeed: 10, // px, speed of the scrolling
           bubbleScroll: true, // apply autoscroll to all parent elements, allowing for easier movement
           */
        // Other options
        group: 'shared-group',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        multiDrag: true,
        selectedClass: 'selected',
        onEnd: function (/**Event*/evt) {
            const draggedItem = evt.item;

            // Check if the dragged item or any ancestor has the calscape-existing class
            const isNoDragOut = (
                draggedItem.classList.contains('calscape-existing') ||
                draggedItem.closest('.calscape-existing') !== null
            );

            if (isNoDragOut && evt.to !== evt.from) {
                // Cancel the drop action if the item has calscape-existing class and is being dropped into a different grid
                evt.from.insertBefore(draggedItem, evt.from.children[evt.oldIndex]);
            }
        }
    };

    lightbox.option({
        'resizeDuration': 200,
        'alwaysShowNavOnTouchDevices': true,
    });

    const sortablegrid = new Sortable(dropTarget, sortableGridOptions);
    console.log("Initializing sortable grid: ", sortablegrid);

    const dropMessage = document.getElementById(messageId);

    if (gridContentsArr.length > 0) {
        dropMessage.style.display = 'none';
    }

    dropTarget.addEventListener('dragenter', function (event) {
        event.preventDefault();
        // Change the sortablegroup styling to indicate that it's a valid drop target
        dropTarget.style.border = '2px dashed #33cc33';
    });

    dropTarget.addEventListener('dragleave', function (event) {
        dropTarget.style.border = 'none';
        // Use a setTimeout to check after a short delay
        setTimeout(() => {
            // Check if the number of children is 1 (the dropMessage)
            if (dropTarget.childElementCount === 1) {
                // Reset the drop zone styling and redisplay the message
                dropMessage.style.display = 'block';
            }
        }, 300); // Adjust the delay as needed
    });
    /*
        // Prevent the default behavior for dragover events
        dropTarget.addEventListener('dragover', function (event) {
            event.preventDefault();
    
            // Get the current mouse position
            var mouseY = event.clientY;
    
            // Define scroll threshold (e.g., 50 pixels from the top/bottom edge)
            var scrollThreshold = 50;
    
            // Get the viewport's top position relative to the document
            var viewportTop = window.scrollY || window.pageYOffset;
    
            // Check if dragging near the top edge of the viewport
            if (mouseY < viewportTop + scrollThreshold) {
                // Scroll up by 20 pixels
                window.scrollBy(0, -20);
            }
    
            // Get the position and dimensions of the grid relative to the document
            var gridTop = dropTarget.offsetTop;
            var gridHeight = dropTarget.offsetHeight;
    
            // Check if dragging near the top edge of the grid
            if (mouseY < gridTop + scrollThreshold) {
                // Scroll up by 20 pixels
                dropTarget.scrollBy(0, -20);
            }
    
            // Check if dragging near the bottom edge of the viewport
            if (mouseY > window.innerHeight - scrollThreshold) {
                // Scroll down by 20 pixels
                window.scrollBy(0, 20);
            }
    
            // Get the position of the bottom edge of the grid relative to the viewport
            var gridBottomViewport = gridTop + gridHeight;
    
            // Check if dragging near the bottom edge of the grid
            if (mouseY > gridBottomViewport - scrollThreshold) {
                // Scroll down by 20 pixels
                dropTarget.scrollBy(0, 20);
            }
    
            const status = `scrollThreshold: ${scrollThreshold},
                    mouseY: ${mouseY},
                    viewportTop: ${viewportTop},
                    gridTop: ${gridTop},
                    gridTop: ${gridHeight},
                    gridBottomViewport: ${gridBottomViewport}`;
    
            displayStatusMessage(status, false,);
    
        });
    */
    // Variable to track whether the user is currently dragging
    var isDragging = false;

    // Function to handle the dragover event
    function handleDragOver(event) {
        event.preventDefault();
    }

    // Function to handle the mousemove event
    function handleMouseMove(event) {
        if (isDragging) {
            // Get the current mouse position
            var mouseY = event.clientY;

            // Calculate the scroll amount based on the mouse position
            var scrollSpeed = 0.1; // Adjust this value to control the scroll speed
            var scrollAmount = (mouseY - window.innerHeight / 2) * scrollSpeed;

            // Scroll the grid by the calculated amount
            dropTarget.scrollBy(0, scrollAmount);
        }
    }

    // Function to handle the scroll event
    function handleScroll(event) {
        // Update the dragging status based on whether the scrollbar is being dragged
        isDragging = (event.target === document.documentElement);
    }

    // Event listeners for the dragover, mousemove, and scroll events
    dropTarget.addEventListener('dragover', handleDragOver);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Handle the drop event
    dropTarget.addEventListener('drop', function (event) {
        event.preventDefault();
        const draggedData = event.dataTransfer.getData('text/plain');
        // Perform actions with the dropped data
        console.log('Dropped to grid:', draggedData);
        // Reset the sortablegroup styling
        dropTarget.style.border = 'none';
        // Hide the drop message
        dropMessage.style.display = 'none';
    });

    document.getElementById('expand-button').addEventListener('click', function () {
        const imageLinks = [];

        // Clear existing anchor elements
        const existingAnchors = document.querySelectorAll('a[data-lightbox="image-group"]');
        existingAnchors.forEach(anchor => anchor.remove());

        selectedThumbnails.forEach(function (tcontainer, index) {
            const image = tcontainer.querySelector('.thumbnail');
            const imageUrl = image.src.replace('_q.jpg', '_b.jpg'); // Get full-size image URL
            let caption = getFullLightboxCaption(tcontainer.id);
            if (!caption) {
                caption = tcontainer.innerText;
            }

            // Create anchor element
            const anchor = document.createElement('a');
            anchor.setAttribute('href', imageUrl);
            anchor.setAttribute('data-lightbox', 'image-group'); // Use the same group for all images
            anchor.setAttribute('data-title', caption) // Set a title for each image
            document.body.appendChild(anchor); // Append anchor to the body

            imageLinks.push(anchor); // Push anchor element to array
        });

        if (imageLinks.length > 0) {
            // Trigger click event on the first anchor element to start Lightbox2
            imageLinks[0].click();
        } else {
            alert('No images selected.');
        }
    });
}

// Function to set up the observer
export function setupMutationObserver(targetGrid, gridArray, callback) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            callback(mutation);

            // Update the contents of the existing array with the current order of elements
            updateGridArray();
        });
    });

    const config = { childList: true };
    observer.observe(targetGrid, config);

    // Function to update the contents of the array with the current order of elements
    function updateGridArray() {
        console.log(`Sync'ing ${targetGrid.id} grid array with grid contents`);
        gridArray.length = 0; // Clear the existing array
        gridArray.push(...Array.from(targetGrid.querySelectorAll('.tcontainer')));
    }
}

/**
 *  Display thumbnails from files or URLs
 * 
 * @param input is either a file list or a url
 */
export function displayThumbnails(input) {
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    // Clear previous thumbnails elements
    const thumbnails = thumbnailGrid.querySelectorAll('.tcontainer');
    thumbnails.forEach(thumbnail => {
        thumbnail.remove();
    });

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
async function displayImagesFromFilesystem(filelist) {
    // Convert filelist to an array
    const filesArray = Array.from(filelist);

    // Handle files from file input
    clearSourcePhotos();

    // Map each file to an async call of storeSourcePhoto
    const promises = filesArray.map(async file => {
        try {
            const result = await storeSourcePhoto(null, file, null, file.name);
            console.log('Photo stored successfully:', result.id, result.caption);
        } catch (error) {
            console.error('Error storing photo:', error);
        }
    });

    // Wait for all promises to be resolved before proceeding
    await Promise.all(promises);

    // All files have been processed, now display the thumbnails
    displayThumbnailsFromSourcePhotos();
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
                    /*
                    // Fetch photo sizes
                    const sizes = await getPhotoSizes(photoId);
                    // Find the object in the sizes array with label "Large"
                    const largeSize = sizes.find(size => size.label === "Large");
                    if (largeSize !== undefined) {  // ignore photos that don't have a Large size.
                        // Extract the width and height from the largeSize object
                        const width = largeSize.width;
                        const height = largeSize.height;

                        // Store photo information
                        const l_url = t_url.replace("_q.", "_b.");
                        storeSourcePhoto(photoId, l_url, t_url, title, width, height);
                    }
                    */
                    // Store photo information
                    const l_url = t_url.replace("_q.", "_b.");
                    storeSourcePhoto(photoId, l_url, t_url, title);
                }

            } else {
                // Handle the case where no photos were found for the given ID
                displayStatusMessage("No photos found for the given user/album ID.", false, -1, true);
                console.warn("No photos found for the given user/album ID.");
            }
        } else {
            // Handle the case where the ID couldn't be extracted
            displayStatusMessage("Invalid Flickr URL or unable to extract user/album ID.", true, -1, true);
            console.warn("Invalid Flickr URL or unable to extract user/album ID.");
        }
    } catch (error) {
        // Handle any errors that occur during the process

        console.error("Error fetching and displaying photos:", error);
        alert("An error occurred while fetching and displaying photos. " + error.message);
    }

    displayThumbnailsFromSourcePhotos();
}

export function createThumbnailContainer(uniqueIdentifier, url, captionText, alttext, width, height) {
    // Create a container for the thumbnail and its caption and id
    const tcontainer = document.createElement('div');
    tcontainer.classList.add('tcontainer');

    // Create an img element for the thumbnail
    const thumbnail = document.createElement('img');
    thumbnail.classList.add('thumbnail');
    thumbnail.src = url; // Set the source URL
    thumbnail.alt = alttext; // Set alt text for accessibility
    tcontainer.appendChild(thumbnail);

    // Add a checkbox for selection
    const cbtemplate = document.getElementById('photo-checkbox');
    const cbclone = cbtemplate.cloneNode(true); // Pass true to clone its children
    cbclone.id = "cb-" + uniqueIdentifier;
    // Add click event listener to toggle checkbox state
    cbclone.addEventListener('click', function (event) {
        const checkbox = event.currentTarget; // Use currentTarget instead of target
        const isChecked = checkbox.getAttribute('aria-checked') === 'true';
        checkbox.setAttribute('aria-checked', !isChecked);
    });

    tcontainer.append(cbclone)

    // Create caption div
    const caption = document.createElement('div');
    caption.classList.add('caption');

    // Create short-text span for displaying short caption
    const shortText = document.createElement('span');
    shortText.classList.add('short-text');
    // Display first 100 characters with ellipsis if captionText is longer than 100 characters
    shortText.innerHTML = captionText.length > 100 ? captionText.substring(0, 100) + '...' : captionText;

    caption.appendChild(shortText);

    // Create full-text span for displaying full caption
    const fullText = document.createElement('span');
    fullText.classList.add('full-text');
    fullText.innerHTML = captionText; // Full caption text
    caption.appendChild(fullText);

    if (width !== undefined && height != undefined) {
        const size = document.createElement('div');
        size.classList.add('caption');
        size.innerHTML = `Size: ${width}x${height}`;
        tcontainer.appendChild(size);
    }

    tcontainer.appendChild(caption);

    tcontainer.id = uniqueIdentifier;

    return tcontainer;
}

export function displayThumbnailsFromCalscape(calscapePhotos) {
    const thumbnailGrid = document.getElementById('thumbnail-calscape-grid');
    const dropMessage = document.getElementById('calscape-drag-and-drop-message');

    // Clear previous thumbnails elements
    const thumbnails = thumbnailGrid.querySelectorAll('.tcontainer');
    thumbnails.forEach(thumbnail => {
        thumbnail.remove();
    });
    Object.keys(calscapePhotos).length > 0 ? dropMessage.style.display = 'none' : dropMessage.style.display = 'block';

    for (const species in calscapePhotos) {
        if (calscapePhotos.hasOwnProperty(species)) {
            console.log(`Processing species: ${species}`);

            // Access the photos object for the current species
            const speciesPhotos = calscapePhotos[species].photos;

            // Iterate through each photo in the current species
            for (const photoID in speciesPhotos) {
                if (speciesPhotos.hasOwnProperty(photoID)) {
                    const photo = speciesPhotos[photoID];
                    console.log(`Processing photo: ${photo.FileName}`);
                    const fileName = photo.FileName;
                    let captionText = '';

                    if (photo.Title) {
                        captionText = `${photo.Title}${photo.CopyrightNotice ? ' ' + photo.CopyrightNotice : ''}`;
                    } else {
                        captionText = photo.ImageDescription || ''; // Initialize captionText with ImageDescription

                        // Check if CopyrightNotice is different from ImageDescription
                        if (photo.CopyrightNotice && photo.CopyrightNotice !== photo.ImageDescription) {
                            captionText += ` ${photo.CopyrightNotice}`;
                        }
                    }

                    // Filter out undefined or null values
                    captionText = captionText.trim();

                    const altText = (photo.ImageDescription !== undefined) && (photo.ImageDescription !== null) ? removeHtmlTags(`${photo.ImageDescription}`) : removeHtmlTags(`${photo.Title}`);
                    const turl = `/photomagic/includes/php/thumbnail.php?fileName=${fileName}&fileType=calscape-photo`;
                    const tc = createThumbnailContainer(photoID, turl, captionText, altText);
                    tc.classList.add('calscape-existing');
                    tc.draggable = true;
                    thumbnailGrid.appendChild(tc);
                }
            }
        }
    }
}

export function displayThumbnailsFromSourcePhotos() {
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    // Clear previous thumbnails elements
    const thumbnails = thumbnailGrid.querySelectorAll('.tcontainer');
    thumbnails.forEach(thumbnail => {
        thumbnail.remove();
    });

    const sourcePhotos = getSourcePhotos();
    for (const uniqueIdentifier in sourcePhotos) {
        const photo = sourcePhotos[uniqueIdentifier];
        const url = photo.thumbnail != undefined ? photo.thumbnail : photo.url;
        const captionText = photo.caption;
        const width = photo.width;
        const height = photo.height;

        const tcontainer = createThumbnailContainer(uniqueIdentifier, url, captionText, captionText, width, height);

        thumbnailGrid.appendChild(tcontainer);
    }

    const message = document.getElementById('select-photos-message');
    if (thumbnailGrid.querySelectorAll('.tcontainer').length > 0) {
        message.style.display = 'none';
    }
}

/**
 * Clear all selections
 */
export function clearSelections() {
    // Clear previous selections
    for (let i = 0; i < selectedThumbnails.length; i++) {
        const tc = selectedThumbnails[i];
        tc.classList.remove('selected');
    }
    selectedThumbnails.length = 0; // Clear the array
    updateSelectedCount();
}

function toggleSelection(event) {
    // Check if the click event originated from within the selected-properties-container
    const isWithinSelectedProperties = event.target.closest('#selected-properties-container');
    const isWithinCollectionProperties = event.target.closest('#group-properties-container');

    // If it's within selected-properties-container, do not toggle the selection in thumbnailGroupGrid
    if (isWithinSelectedProperties || isWithinCollectionProperties) {
        // reapply .selected to selected elements
        for (let i = 0; i < selectedThumbnails.length; i++) {
            const tc = selectedThumbnails[i];
            tc.classList.add('selected');
        }
        return;
    }

    if (event.target.id !== 'thumbnail-group-grid' &&
        event.target.id !== 'thumbnail-grid' &&
        event.target.id !== 'thumbnail-calscape-grid') {
        // The clicked element is a child of the parent <div>
        const clickedElement = event.target;

        let tcontainer;
        // Check if the clicked element is a thumbnail
        if (clickedElement.classList.contains('thumbnail') || clickedElement.classList.contains('caption')) {
            // Find the parent tcontainer
            tcontainer = clickedElement.parentNode;
        } else if (clickedElement.classList.contains('tcontainer')) {
            // The clicked element is already a tcontainer
            tcontainer = clickedElement;
        } else { // background clicked
            // Clear previous selections
            // clearPropertiesFields;
        }

        const thumbnailGrid = document.getElementById('thumbnail-grid');
        const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');
        const thumbnailCalscapeGrid = document.getElementById('thumbnail-calscape-grid');

        if (tcontainer !== undefined) {
            // Determine the grid name based on the clicked grid
            let gridName;
            if (tcontainer.parentNode === thumbnailGrid) {
                gridName = 'normal';
            } else if (tcontainer.parentNode === thumbnailGroupGrid) {
                gridName = 'group';
            } else if (tcontainer.parentNode === thumbnailCalscapeGrid) {
                gridName = 'calscape';
            }
            else {
                console.error("Thumbnail clicked in unkown grid", tcontainer.parentNode);
            }

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
            } else if (event.shiftKey) {   // Shift key is pressed, implement contiguous multi-select
                // Clear previous selections if no Ctrl/Cmd key is pressed
                clearSelections();

                // Determine the range between the first selected and the current one
                let startIndex;
                let endIndex;

                if (gridName === 'normal') {
                    startIndex = [...thumbnailGrid.children].indexOf(firstSelectedThumbnailThumbnailGrid);
                    endIndex = [...thumbnailGrid.children].indexOf(tcontainer);
                } else if (gridName === 'group') {
                    startIndex = [...thumbnailGroupGrid.children].indexOf(firstSelectedThumbnailThumbnailGroupGrid);
                    endIndex = [...thumbnailGroupGrid.children].indexOf(tcontainer);
                } else if (gridName === 'calscape') {
                    startIndex = [...thumbnailCalscapeGrid.children].indexOf(firstSelectedThumbnailThumbnailCalscapeGrid);
                    endIndex = [...thumbnailCalscapeGrid.children].indexOf(tcontainer);
                }

                // Ensure startIndex is less than endIndex
                if (startIndex > endIndex) {
                    [startIndex, endIndex] = [endIndex, startIndex];
                }

                for (let i = startIndex; i <= endIndex; i++) {
                    const tc = (gridName === 'normal') ? thumbnailGrid.children[i] :
                        ((gridName === 'group') ? thumbnailGroupGrid.children[i] : thumbnailCalscapeGrid.children[i]);
                    tc.classList.add('selected');
                    selectedThumbnails.push(tc);
                }
            } else {
                // No modifier key is pressed, clear previous selections and select the current one
                clearSelections();

                // Remember first selected thumbnail for future shift-click 
                if (gridName === 'normal') {
                    firstSelectedThumbnailThumbnailGrid = tcontainer;
                } else if (gridName === 'group') {
                    firstSelectedThumbnailThumbnailGroupGrid = tcontainer;
                } else if (gridName === 'calscape') {
                    firstSelectedThumbnailThumbnailCalscapeGrid = tcontainer;
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

    updateSelectedCount(selectedThumbnails.length);

    showMultiSelectedProperties(event);
    //showCalscapePhotos(event);
}

export function removeHtmlTags(html) {
    // Create a temporary DOM element
    var tempDiv = document.createElement('div');

    // Set the HTML content of the temporary element
    tempDiv.innerHTML = html;

    // Retrieve the text content (without HTML tags)
    return tempDiv.textContent || tempDiv.innerText || '';
}

// Update the selected count text
function updateSelectedCount(selectedCount = 0) {
    const selectedCountElement = document.getElementById('selected-photos-count');
    selectedCountElement.textContent = `${selectedCount} photo${selectedCount !== 1 ? 's' : ''} selected`;

    // also enable or disable expand button
    const expand = document.getElementById('expand-button');
    if (expand !== null) {
        expand.disabled = selectedCount < 1;
    }
}

export function getSelectedThumbnails() {
    return selectedThumbnails;
}

const mainContentArea = document.getElementById('main-content');
//mainContentArea.addEventListener('click', toggleSelection);
