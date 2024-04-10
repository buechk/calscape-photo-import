import { getPhotoCollection } from "./collection-data.js";
import { clearTable } from './submit.js';

export async function initSubmitPage() {
    const collectionData = getPhotoCollection();
    const tableBody = document.getElementById('review-table-body');
    tableBody.innerHTML = ''; // Clear the table body

    const collectionNameElement = document.getElementById('collection-name');
    collectionNameElement.textContent = collectionData['collection-name'];


    // Iterate over each photo and create a row
    Object.values(collectionData.photos).forEach((photo, index) => {
        const photoRow = document.createElement('tr');

        // Add a checkbox at the beginning of each photo row
        let cell = document.createElement('td');
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.className = 'select-photo';
        checkBox.id = `select-photo-${index}`;
        checkBox.name = `select_photo_${index}`;
        checkBox.checked = true; // Default to checked
        cell.appendChild(checkBox);
        photoRow.appendChild(cell);

        // Add cell for species
        cell = document.createElement('td');
        cell.innerHTML = escapeHtml(collectionData['collection-species']);
        photoRow.appendChild(cell);

        // Add cell for caption
        cell = document.createElement('td');
        var tempElement = document.createElement('div');
        tempElement.innerHTML = photo.Title;
        cell.appendChild(tempElement);
        photoRow.appendChild(cell);

        // Add cell for date
        cell = document.createElement('td');
        cell.textContent = escapeHtml(photo.DateTimeOriginal);
        photoRow.appendChild(cell);

        // // Add cell for collection name
        // cell = document.createElement('td');
        // cell.textContent = escapeHtml(collectionData['collection-name']);
        // photoRow.appendChild(cell);

        checkBox.addEventListener('change', function () {
            collectionData.photos[photoId].isSelected = this.checked;
        });

        tableBody.appendChild(photoRow);
    });
};

// Function to escape HTML content
function escapeHtml(unsafe) {
    if (unsafe === undefined) {
        return '';
    }
    else {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
