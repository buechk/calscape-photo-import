/**
 *  @file
 * Loads thumbnails from photo source input and manages thumbnail selection and drag-and-drop functionality.
 *  
**/

import { getFileData } from "./photo-selection.js";
import { setSelectedProperties } from './properties.js';

// Initialize an array to keep track of selected thumbnails
const selectedThumbnails = [];

export const thumbnailGroupGrid = document.getElementById('thumbnail-group-grid');

// Enable drag-and-drop reordering of thumbnails
export const sortablegroup = new Sortable(thumbnailGroupGrid, {
    animation: 150,
    group: 'shared-group',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    multiDrag: true,
    selectedClass: 'selected'
});

/**
 *  Display thumbnails from files or URLs
 * 
 * @param input is either a file list or a url
 */
export function displayThumbnails(input) {
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

    thumbnailGrid.innerHTML = ''; // Clear previous thumbnails
    thumbnailGroupGrid.innerHTML = ''; // Clear previous thumbnails

    if (input instanceof FileList) {
        // Handle files from file input
        displayImagesFromFilesystem();

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
 * 
 * @param {*} filelist 
 */
function displayImagesFromFilesystem() {
    // Handle files from file input
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    const fileData = getFileData();
    for (const uniqueIdentifier in fileData) {
        const file = fileData[uniqueIdentifier];
        if (fileData.hasOwnProperty(uniqueIdentifier)) {
            // create a container for the thumbnail and its caption and id
            const tcontainer = document.createElement('div');
            const thumbnail = document.createElement('div');
            tcontainer.classList.add('tcontainer');
            thumbnail.classList.add('thumbnail');
            tcontainer.appendChild(thumbnail);
            const caption = document.createElement('div');
            caption.classList.add('caption');
            caption.innerText = file.name;
            tcontainer.appendChild(caption);
            const id = document.createElement('div');
            tcontainer.id = uniqueIdentifier;

            // listen for when a thumbnail is selected so properties can be updated
            tcontainer.addEventListener('click', setSelectedProperties);

            // Create a FileReader to read the file as a data URL
            const reader = new FileReader();
            reader.onload = function () {
                thumbnail.style.backgroundImage = `url(${reader.result})`;
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);

            thumbnailGrid.appendChild(tcontainer);
        }
        else {
            console.error("Error: Unexpected value in fileData ${fileData}", fileData);
        }
    }
}

/**
 * Calls the Flickr API using the given url to get photos
 * 
 * @param {*} url 
 */
function displayImagesFromFlickr(url) {
    // Instead of directly issuing URL that user input. Let user input their home page URL
    // and parse the user_id out and construct the REST URL
    var parameters = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "POST",
        "headers": {}
    }
    // Currently, we're calling the Flickr REST service URL that the user directly input.
    // but later, we will allow the user more user friendly input and construct
    // the url from the user's input

    $.ajax(parameters)
        .done(function (data) {
            console.log(data);

            // Check if 'photos' property exists and 'total' property exists within 'photos'
            if (data && data.photos) {
                for (var i = 0; i < data.photos.total; i++) {
                    var photo = data.photos.photo[i]; // Declare photo variable here
                    if (photo) {
                        var farmId = photo.farm;
                        var serverId = photo.server;
                        var id = photo.id;
                        var secret = photo.secret;
                        var title = photo.title;

                        // Construct the thumbnail URL
                        var t_url = "https://farm" + farmId + ".staticflickr.com/" + serverId + "/" + id + "_" + secret + "_" + "q.jpg";
                        loadThumbnailImage(t_url, title);
                    }
                }
            } else {
                // Handle the case where 'photos' or 'total' is missing or not of the expected type
                alert("Flickr return data does not include photos. Message from Flickr is: " + data.message);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            // Handle the error here
            console.error("AJAX Error: " + textStatus, errorThrown);
            alert("AJAX Error: " + textStatus);
        });
}

/**
 * Displays the given thumbnail URL in the thumbnail grid
 * 
 * @param {string} t_url - URL of the thumbnail image
 * @param {string} title - Title for the thumbnail
 */
function loadThumbnailImage(t_url, title) {
    // create a container for the thumbnail and its caption
    const tcontainer = document.createElement('div');
    tcontainer.classList.add('tcontainer');

    const image = new Image();
    image.src = t_url;
    const thumbnail = document.createElement('div');
    thumbnail.classList.add('thumbnail');
    tcontainer.appendChild(thumbnail);

    // add a visible caption
    const caption = document.createElement('div')
    caption.classList.add('caption');
    caption.innerText = title;
    tcontainer.appendChild(caption);

    // set tcontainer id to unique identifier
    const idElement = document.createElement('div');
    var imageid = extractIdFromUrl(t_url);
    tcontainer.id = imageid;

    image.onload = function () {
        // Once the image is loaded, set it as the background image for the thumbnail
        thumbnail.style.backgroundImage = `url(${t_url})`;

        // Add the thumbnail to the grid
        const thumbnailGrid = document.getElementById('thumbnail-grid');
        thumbnailGrid.appendChild(tcontainer);
    };

    image.onerror = function () {
        // Handle image loading errors here
        console.error(`Error loading image: ${t_url}`);
        // You can display a placeholder image or take other actions.
    };
}

/**
 *  create a container for the thumbnail and its caption
 */
function createThumbnailContainer(t_url) {
    // create a container for the thumbnail and its caption
    const tcontainer = document.createElement('div');
    tcontainer.classList.add('tcontainer');

    const image = new Image();
    image.src = t_url;
    const thumbnail = document.createElement('div');
    thumbnail.classList.add('thumbnail');
    tcontainer.appendChild(thumbnail);

    // add a visible caption
    const caption = document.createElement('div')
    caption.classList.add('caption');
    caption.innerText = title;
    tcontainer.appendChild(caption);

    // set tcontainer id to unique identifier
    var imageid = extractIdFromUrl(t_url);
    tcontainer.id = imageid;

    return tcontainer;
}

function extractIdFromUrl(t_url) {
    // Split the URL by underscores
    var urlParts = t_url.split('_');

    // Extract the third-to-last part as the 'id'
    var extractedId = urlParts[urlParts.length - 3];

    return extractedId;
}

/*
/** 
 * Store the selected thumbnails
//
// Function to toggle selection state
function toggleSelection(event) {
    if (event.target !== thumbnailGroupGrid) {
        // The clicked element is a child of the parent <div>
        var tcontainer = event.target;

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

        selectedThumbnails = sortablegroup.selected;
    }
}

// EVENT LISTENERS

// Add a click event listener to toggle selection
thumbnailGroupGrid.addEventListener('click', toggleSelection);

*/