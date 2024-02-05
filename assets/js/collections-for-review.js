/**
 * @file collections-for-review.js
 */

import { setPhotoCollection } from "./collection-data.js";
import { clearCalscapePhotos } from "./sort-and-save.js";

export async function getCollectionsForReview() {
    await fetch('/includes/php/collections_for_review.php')
        .then(response => response.json())
        .then(collections => {
            const collectionList = document.getElementById('collection-review-list');
            collectionList.innerHTML = '';

            // Display each collection in a row
            collections.forEach(collection => {
                const row = document.createElement('tr');

                // Create cells for name, type, and species
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