// Handle photo source input, load thumbnails and manage drag-and-drop functionality. 

// Initialize an array to keep track of selected thumbnails
const selectedThumbnails = [];

// Function to display thumbnails from files or URLs
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

function displayImagesFromFilesystem(input) {
    // Handle files from file input
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    for (let i = 0; i < input.length; i++) {
        const file = input[i];
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail');

        // Create a FileReader to read the file as a data URL
        const reader = new FileReader();
        reader.onload = function () {
            thumbnail.style.backgroundImage = `url(${reader.result})`;
        };

        // Read the file as a data URL
        reader.readAsDataURL(file);

        thumbnailGrid.appendChild(thumbnail);
    }
}

function displayImagesFromFlickr(input) {
    var parameters = {
        "async": true,
        "crossDomain": true,
        "url": input,
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

                        // Construct the thumbnail URL
                        var t_url = "https://farm" + farmId + ".staticflickr.com/" + serverId + "/" + id + "_" + secret + "_" + "q.jpg";
                        loadThumbnailImage(t_url);
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

function loadThumbnailImage(t_url) {
    const image = new Image();
    image.src = t_url;
    const thumbnail = document.createElement('div');
    thumbnail.classList.add('thumbnail');

    image.onload = function () {
        // Once the image is loaded, set it as the background image for the thumbnail
        thumbnail.style.backgroundImage = `url(${t_url})`;

        // Add the thumbnail to the grid
        const thumbnailGrid = document.getElementById('thumbnail-grid');
        thumbnailGrid.appendChild(thumbnail);
    };

    image.onerror = function () {
        // Handle image loading errors here
        console.error(`Error loading image: ${t_url}`);
        // You can display a placeholder image or take other actions.
    };
}


/*
function handlePhotoSelection(event) {
    // pass selected photos to properties code
}
*/

/*
EVENT LISTENERS
*/
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

/*
urlInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        displayThumbnails(event.target.value);
    }
});
*/
