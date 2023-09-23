/**
 *  @file
 * Loads thumbnails from photo source input and manages thumbnail selection and drag-and-drop functionality.
 *  
**/

// Initialize an array to keep track of selected thumbnails
const selectedThumbnails = [];

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

/**
 * 
 * Displays the given thumbnail URL in the thumbnail grid
 * 
 * @param {*} t_url 
 */
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