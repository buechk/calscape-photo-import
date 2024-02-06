/**
 * @file collections-for-review.js
 */

import { setPhotoCollection } from "./collection-data.js";
import { clearCalscapePhotos } from "./sort-and-save.js";
import { displayStatusMessage } from "./status.js";

export function initCollectionsforReview() {
    initTableActions();
    getCollectionsForReview();
}

export async function getCollectionsForReview() {
    await fetch('/includes/php/collections_for_review.php')
        .then(response => response.json())
        .then(collections => {
            const collectionList = document.getElementById('collection-review-list');
            collectionList.innerHTML = '';

            // Display each collection in a row
            collections.forEach((collection, index) => {
                const row = document.createElement('tr');

                const checkBoxCell = document.createElement('td');
                const checkBox = document.createElement('input');
                checkBox.type = 'checkbox';
                checkBox.classList.add('collection-checkbox');
                checkBox.id = `select-collection-${index}`;
                checkBox.name = `select_collection_${index}`;
                checkBox.addEventListener('change', function () {
                    updateDeleteButtonState();
                    updateSelectedCount();
                });

                checkBox.checked = false;
                checkBoxCell.appendChild(checkBox);

                const nameCell = document.createElement('td');
                const speciesCell = document.createElement('td');
                const contributorCell = document.createElement('td');
                const photoCountCell = document.createElement('td');
                const fileNameHiddenCell = document.createElement('td');

                // Create a link for the collection name
                const link = document.createElement('a');
                link.textContent = collection.name;
                link.setAttribute
                link.href = '#';
                link.setAttribute('data-filename', collection.fileName); // Store the fileName as a data attribute

                // Add an event listener to handle the link click
                link.addEventListener('click', function () {
                    // Handle the collection selection, e.g., open the collection
                    console.log('Selected collection: ' + collection.name);
                    // Read the contents of the collection file
                    selectCollection(this.getAttribute('data-filename'));
                });

                // Append the link to the name cell
                nameCell.appendChild(link);

                // Set content for species and contributor cells
                speciesCell.textContent = collection.type === 'species' ? collection.species : collection.type;
                contributorCell.textContent = collection.contributor;
                photoCountCell.textContent = collection.photoCount;

                // Set content for hidden filename cell
                fileNameHiddenCell.textContent = collection.fileName;
                fileNameHiddenCell.style.display = 'none';

                // Append cells to the row
                row.appendChild(checkBoxCell);
                row.appendChild(nameCell);
                row.appendChild(speciesCell);
                row.appendChild(contributorCell);
                row.appendChild(photoCountCell);
                row.appendChild(fileNameHiddenCell);

                // Append the row to the collection list
                collectionList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching collections:', error);
        });
}

function selectCollection(fileName) {
    // Construct the URL with the filename parameter
    const url = `/includes/php/get_collection_contents.php?filename=${fileName}`;

    // Make a fetch request
    fetch(url)
        .then(response => {
            // Check if the response is successful (status code 200)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            return response.json();
        })
        .then(jsonData => {
            console.log("Collection: " + fileName + ":", jsonData);
            clearCalscapePhotos();
            setPhotoCollection(jsonData);

            // Trigger a click on the "review-collection" li element
            $('#review-collection a').click();
        })
        .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
        });
}

function initTableActions() {
    const selectAllCheckbox = document.getElementById('select-all');
    const deleteButton = document.getElementById('delete-button');

    // Select all checkboxes when the "Select All" checkbox is clicked
    selectAllCheckbox.addEventListener('change', function () {
        const collectionCheckboxes = document.querySelectorAll('.collection-checkbox');
        collectionCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });

        updateSelectedCount();
        updateDeleteButtonState();
    });
    /*
        // Handle Delete button click
        deleteButton.addEventListener('click', function () {
            const collectionCheckboxes = document.querySelectorAll('.collection-checkbox');
            const selectedCollectionFiles = Array.from(collectionCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.closest('tr').find('a').data('filename'));
    
            // Now you have the selected data-filename values
            console.log(selectedFilenames);
    
            // Display a confirmation dialog (you can use a library like SweetAlert for a nicer UI)
            const isConfirmed = confirm(`Are you sure you want to delete ${selectedCollectionIds.length} selected collection(s)?`);
    
            if (isConfirmed) {
                // Perform deletion action (you need to implement this)
                deleteCollections(selectedCollectionFiles);
            }
        });
    */

    $('#delete-button').on('click', function () {
        // Find all selected checkboxes
        var selectedCheckboxes = $('input.collection-checkbox:checked');

        // Get the data-filename values
        var selectedFilenames = [];
        selectedCheckboxes.each(function() {
            var filename = $(this).closest('tr').find('a').data('filename');
            selectedFilenames.push(filename);
        });

        // Display a confirmation dialog (you can use a library like SweetAlert for a nicer UI)
        const isConfirmed = confirm(`Are you sure you want to delete ${selectedFilenames.length} selected collection(s)?`);

        if (isConfirmed) {
            // Perform deletion action (you need to implement this)
            deleteCollections(Array.from(selectedFilenames));
        }
    });

    // Initial state
    updateDeleteButtonState();
    updateSelectedCount();
};

// Function to delete collections
function deleteCollections(fileNames) {

    // Use AJAX to send a request to the server for deletion
    // Construct the URL with the filename parameter

    // Serialize the array of filenames
    const serializedFileNames = fileNames.join(',');
    const url = `/includes/php/delete_collections.php?filenames=${encodeURIComponent(serializedFileNames)}`;
   
    // Make a fetch request
    fetch(url)
        .then(async response => {
            // Check if the response is successful (status code 200)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            return await response.json();
        })
        .then(response => {
            // Print messages
            for (let message of response.messages) {
                console.log(message);
            }
            if (response.success) {
                const message = fileNames.length === 1 ? `${fileNames.length} collection deleted.` : `${fileNames.length} collections deleted.`
                displayStatusMessage(message, false, -1, true);
                fileNames.forEach(function (filename) {
                    var trElement = $('#collection-table').find('a[data-filename="' + filename + '"]').closest('tr');
                    // Now you have the tr element associated with the filename
                    // You can remove it from the table using jQuery's remove method
                    trElement.remove();
                });
                updateSelectedCount();
            }
        })
        .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
        });
}

// Enable the Delete button when at least one checkbox is checked
function updateDeleteButtonState() {
    const deleteButton = document.getElementById('delete-button');
    const collectionCheckboxes = document.querySelectorAll('.collection-checkbox');
    deleteButton.disabled = !Array.from(collectionCheckboxes).some(checkbox => checkbox.checked);
}

// Update the selected count text
function updateSelectedCount() {
    const selectedCountElement = document.getElementById('selected-count');
    const collectionCheckboxes = document.querySelectorAll('.collection-checkbox');
    const selectedCount = Array.from(collectionCheckboxes).filter(checkbox => checkbox.checked).length;
    selectedCountElement.textContent = `${selectedCount} collection${selectedCount !== 1 ? 's' : ''} selected`;
}


