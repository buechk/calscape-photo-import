import { getPhotoCollection } from "./collection-data.js";

export function initSubmitPage() {
    const collectionData = getPhotoCollection();
    const tableBody = document.getElementById('review-table-body');
    tableBody.innerHTML = ''; // Clear the table body

    // Create a row for collection-species and collection-name
    const collectionInfoRow = document.createElement('tr');
    collectionInfoRow.innerHTML = `
        <td>${escapeHtml(collectionData['collection-species'])}</td>
        <td>${escapeHtml(collectionData['collection-name'])}</td>
        <td colspan="4">Other Collection Details</td> <!-- colspan to span remaining columns -->
    `;
    tableBody.appendChild(collectionInfoRow);

    Object.values(collectionData.photos).forEach((photo, index) => {
        const photoRow = document.createElement('tr');

        // Add a checkbox at the beginning of each row
        const checkBoxTd = document.createElement('td');
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.className = 'select-photo';
        checkBox.id = `select-photo-${index}`;
        checkBox.name = `select_photo_${index}`;
        checkBox.checked = true; // Default to checked; adjust as needed
        checkBoxTd.appendChild(checkBox);
        photoRow.appendChild(checkBoxTd);

        photoRow.innerHTML += `
            <td>${escapeHtml(photo.CaptionTitle)}</td>
            <td>${escapeHtml(photo.DateTimeOriginal)}</td>
            <td>${escapeHtml(photo.Artist)}</td>
            // ... other cells with properties from the photo object
        `;

        tableBody.appendChild(photoRow);
    });
};

//     // Loop through each submission and append a row to the table body
//     collectionData.forEach(function(data, index) {
//         const row = document.createElement('tr');

//         const checkBoxTd = document.createElement('td');
//         const checkBox = document.createElement('input');
//         checkBox.type = 'checkbox';
//         checkBox.className = 'select-photo';
//         checkBox.id = `select-photo-${index}`;
//         checkBox.name = `select_photo_${index}`;
//         checkBox.checked = true;
//         checkBoxTd.appendChild(checkBox);
//         row.appendChild(checkBoxTd);

//         row.innerHTML += `
//             <td>${escapeHtml(data['collection-species'])}</td>
//             <td>${escapeHtml(data.CaptionTitle)}</td>
//             <td>${escapeHtml(data.DateTimeOriginal)}</td>
//             <td>${escapeHtml(data['collection-name'])}</td>
//         `;

//         tableBody.appendChild(row);
//     });
// });

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
