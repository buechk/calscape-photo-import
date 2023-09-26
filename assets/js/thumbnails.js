/**
 *  @file
 * Loads thumbnails from photo source input and manages thumbnail selection and drag-and-drop functionality.
 *  
**/

// Initialize an array to keep track of selected thumbnails
const selectedThumbnails = [];

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
 * 
 * @param {*} filelist 
 */
function displayImagesFromFilesystem(filelist) {
    // Handle files from file input
    const thumbnailGrid = document.getElementById('thumbnail-grid');

    for (let i = 0; i < filelist.length; i++) {
        const file = filelist[i];
        // create a container for the thumbnail and its caption
        const tcontainer = document.createElement('div');
        const thumbnail = document.createElement('div');
        tcontainer.classList.add('tcontainer');
        thumbnail.classList.add('thumbnail');
        tcontainer.appendChild(thumbnail);
        const caption = document.createElement('div')
        caption.innerText = file.name;
        tcontainer.appendChild(caption);

        // Create a FileReader to read the file as a data URL
        const reader = new FileReader();
        reader.onload = function () {
            thumbnail.style.backgroundImage = `url(${reader.result})`;
        };

        // Read the file as a data URL
        reader.readAsDataURL(file);

        thumbnailGrid.appendChild(tcontainer);
    }
}

/**
 * Calls the Flickr API using the given url to get photos
 * 
 * @param {*} url 
 */
function displayImagesFromFlickr(url) {
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
 * 
 * Displays the given thumbnail URL in the thumbnail grid
 * 
 * @param {*} t_url 
 */
function loadThumbnailImage(t_url, title) {
    const image = new Image();
    image.src = t_url;
    const thumbnail = document.createElement('div');
    thumbnail.classList.add('thumbnail');

    // create a container for the thumbnail and its caption
    const tcontainer = document.createElement('div');
    tcontainer.classList.add('tcontainer');
    const caption = document.createElement('div')
    caption.innerText = title;
    tcontainer.appendChild(thumbnail);
    tcontainer.appendChild(caption);

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

/*
function handlePhotoSelection(event) {
    // pass selected photos to properties code
}
*/