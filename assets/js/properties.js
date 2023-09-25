/**
 * 
 * @file
 *  Display properties of source photos and apply properties to Calscape photos. 
 * 
*/

/*
const 
function handlePhotoSelection(event) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
        const filename = selectedFile.name;
        const author = 'John Doe'; // Replace with actual author data if available
        const keywords = ['file', 'example', 'data']; // Replace with actual keywords if available
        const creationDate = selectedFile.lastModified; // Timestamp of file creation date
        const modificationDate = selectedFile.lastModifiedDate; // Date object of file modification date

        const fileInfo = {
            filename,
            author,
            keywords,
            creationDate,
            modificationDate,
        };

        displayFileProperties(fileInfo);
    } else {
        // Clear properties if no file is selected
        propertiesContainer.innerHTML = '';
    }
}

function displayFileProperties(fileInfo) {
    // Clear previous properties
    propertiesContainer.innerHTML = '';

    const filenameElement = document.createElement('p');
    filenameElement.textContent = `Filename: ${fileInfo.filename}`;

    const authorElement = document.createElement('p');
    authorElement.textContent = `Author: ${fileInfo.author}`;

    const keywordsElement = document.createElement('p');
    keywordsElement.textContent = `Keywords: ${fileInfo.keywords.join(', ')}`;

    const creationDateElement = document.createElement('p');
    creationDateElement.textContent = `Creation Date: ${new Date(fileInfo.creationDate)}`;

    const modificationDateElement = document.createElement('p');
    modificationDateElement.textContent = `Modification Date: ${fileInfo.modificationDate}`;

    propertiesContainer.appendChild(filenameElement);
    propertiesContainer.appendChild(authorElement);
    propertiesContainer.appendChild(keywordsElement);
    propertiesContainer.appendChild(creationDateElement);
    propertiesContainer.appendChild(modificationDateElement);
}

String.prototype.hashCode = function () {
    var hash = 0,
        i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
*/