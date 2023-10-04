/**
 * @file 
 * Enables source photo information to be stored and retrieved
 */
let sourcePhotos = {}; // Object to store file data with unique identifiers
/*
Format of sourcePhotos
from fileInput:

{
uniqueId1: File1, 
uniqueId2: File2,
...}

from urlInput:

{
url1, 
url2,
...}
*/

function generateUniqueIdentifier() {
    // Generate a unique identifier using a timestamp and a random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000); // Adjust the range as needed
    return `${timestamp}-${random}`;
}

export function storeSourcePhoto(photo) {
    if (photo instanceof File) {
        const uniqueIdentifier = generateUniqueIdentifier();
        sourcePhotos[uniqueIdentifier] = photo;

        console.log(`Stored file with unique identifier: ${uniqueIdentifier}, File Name: ${photo.name}`);
    }
    else {
        sourcePhotos[photo.id] = photo;
        console.log(`Stored photo with identifier: ${photo.id}, ${photo}`);
    }
}

export function getSourcePhotos() {
    return sourcePhotos;
}

export function clearSourcePhotos() {
    sourcePhotos = {};
}