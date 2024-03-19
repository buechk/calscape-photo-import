const flickrUrl = document.getElementById('flickrUrl');
const apiKey = '7941c01c49eb07af15d032e0731e9790';

export async function searchPhotosByUsername(username) {
    
    // Construct the Flickr API request URL to search photos by username
    const searchApiUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&user_id=${username}&format=json&nojsoncallback=1`;

    try {
        const response = await fetch(searchApiUrl);
        const data = await response.json();

        if (data.stat === 'ok' && data.photos && data.photos.photo) {
            return data.photos.photo; // Return the list of photos
        } else {
            throw new Error('Photos not found or API response format is unexpected.');
        }
    } catch (error) {
        console.error('Error searching photos:', error);
        throw error; // Rethrow the error for handling at a higher level
    }
}

export async function extractUsernameFromFlickrUrl(stringUrl) {
    // Check if the URL includes 'flickr.com/photos/' as this is a common format
    if (stringUrl.includes('flickr.com/photos/')) {
        const parts = stringUrl.split('/');
        const username = parts[parts.indexOf('photos') + 1];

        return username; // Return the extracted username
    }

    // If the URL doesn't match the expected format, return null or handle it as needed
    return null;
}

export async function extractAlbumFromFlickrUrl(stringUrl) {
    const albumMatch = stringUrl.match(/\/albums\/(\d+)/);
    const albumId = albumMatch ? albumMatch[1] : null;
    return albumId;
}


export async function searchPhotosByAlbum(albumId) {
    // Construct the Flickr API request URL to search photos by album
    const albumSearchApiUrl = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${albumId}&format=json&nojsoncallback=1`;

    try {
        const response = await fetch(albumSearchApiUrl);
        const data = await response.json();

        if (data.stat === 'ok' && data.photoset && data.photoset.photo) {
            return data.photoset.photo; // Return the list of photos in the album
        } else {
            throw new Error('Photos not found or API response format is unexpected.');
        }
    } catch (error) {
        console.error('Error searching photos by album:', error);
        throw error; // Rethrow the error for handling at a higher level
    }
}

export async function getPhotoSizes(photoId) {
    // Make API request to get photo sizes
    const response = await fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${photoId}&format=json&nojsoncallback=1`);
    const data = await response.json();
    return data.sizes.size;
}