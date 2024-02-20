/**
 * @file 
 * Enables source photo information to be stored and retrieved
 */
let sourcePhotos = {}; // Object to store file data with unique identifiers
/*
Format of sourcePhotos
from fileInput:

sourcePhotos :
{
uniqueId1: 
    url: 'url', 
    caption: '<caption>',
    file: <File>
uniqueId2: 
    url: 'url', 
    caption: '<caption>'
    file: <File>
...
}

from urlInput:

{
uniqueId1: 
    url: 'url', 
    caption: '<caption>',
uniqueId2: 
    url: 'url', 
    caption: '<caption>'
...
}
*/

function generateUniqueIdentifier() {
    // Generate a unique identifier using a timestamp and a random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000); // Adjust the range as needed
    return `${timestamp}-${random}`;
}

export function storeSourcePhoto(id, photo, thumbnail, caption, width, height) {
    return new Promise((resolve, reject) => {
        if (photo instanceof File) {
            if (id === null) {
                id = generateUniqueIdentifier();
            }
            const reader = new FileReader();
            reader.onload = function () {
                const img = new Image();
                img.onload = function () {
                    sourcePhotos[id] = {
                        url: reader.result,
                        caption: caption ? caption: photo.name,
                        file: photo,
                        width: img.width,
                        height: img.height
                    };
                    resolve({
                        id: id,
                        caption: caption,
                        width: img.width,
                        height: img.height
                    });
                };
                img.onerror = function (error) {
                    reject(error);
                };
                img.src = reader.result;
            };
            reader.onerror = function (error) {
                reject(error);
            };

            // Read the file as a data URL
            reader.readAsDataURL(photo);
        } else {
            sourcePhotos[id] = {
                url: photo,
                thumbnail: thumbnail,
                caption: caption,
                width: width,
                height: height
            };
            console.log(`Stored photo with identifier: ${id}, ${sourcePhotos[id].url}`);
            resolve({
                id: id,
                caption: caption,
                thumbnail: thumbnail,
                width: width,
                height: height
            });
        }
    });
}

export function getSourcePhoto(id) {
    return sourcePhotos[id];
}

// Function to remove an entry by uniqueId
export function removeSourcePhoto(id) {
    return new Promise((resolve, reject) => {
        if (sourcePhotos.hasOwnProperty(id)) {
            delete sourcePhotos[id];
            console.log(`Photo with id ${id} removed successfully.`);
        } else {
            console.log(`Photo with id ${id} not found.`);
        }
        resolve({
            success: true
        });
    });
}

export function getSourcePhotos() {
    return sourcePhotos;
}

export function clearSourcePhotos() {
    sourcePhotos = {};
}