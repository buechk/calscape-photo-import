/**
 * @file
 * Enable user to select plant species in which to assign photos
 */
import { getPhotoCollection } from "./collection-data.js";
import { getSelectedThumbnails } from "./thumbnails.js";

let specieslist = [];

export function initializeSpeciesInput() {
    const selectedSpeciesInput = document.getElementById('selected-species');
    const selectedSpeciesSuggestions = document.getElementById('selected-suggestions');

    selectedSpeciesInput.addEventListener('focus', handleFocusAndInput);
    selectedSpeciesInput.addEventListener('input', handleFocusAndInput);
    selectedSpeciesSuggestions.addEventListener('click', handleSuggestionsClick);

    const speciesChoice = document.getElementById('species-choice');
    selectedSpeciesInput.disabled = speciesChoice.checked;

    // Function to handle focus and input events
    function handleFocusAndInput(event) {
        // Show unfiltered suggestions when the input is focused
        if (event.type === 'focus') {
            loadSuggestions(specieslist, selectedSpeciesSuggestions);
        }

        // Handle input events
        if (event.type === 'input') {
            const userInput = selectedSpeciesInput.value;
            loadSuggestions(filterData(specieslist, userInput), selectedSpeciesSuggestions);
        }
    }

    // Function to handle click events on suggestions
    function handleSuggestionsClick(event) {
        // Update the input value when a suggestion is clicked
        if (event.target.tagName === 'LI') {
            selectedSpeciesInput.value = event.target.textContent;
            selectedSpeciesSuggestions.innerHTML = ''; // Clear the suggestions
        }
    }

    // Add an event listener to close the suggestions list when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInside = selectedSpeciesInput.contains(event.target) || selectedSpeciesSuggestions.contains(event.target);
        if (!isClickInside) {
            selectedSpeciesSuggestions.innerHTML = ''; // Clear the suggestions
            //hideTargetElement(selectedSpeciesSuggestions);
        }
    });

    // Add an event listener to close the suggestions list when pressing Esc
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            selectedSpeciesSuggestions.innerHTML = ''; // Clear the suggestions
            //hideTargetElement(selectedSpeciesSuggestions);
        }
    });

    updateSpeciesChoice();
}

export function initializeCollectionSpeciesInput() {
    const collectionSpeciesInput = document.getElementById('collection-species');
    const collectionSpeciesSuggestions = document.getElementById('collection-suggestions');

    collectionSpeciesInput.addEventListener('focus', handleCollectionFocusAndInput);
    collectionSpeciesInput.addEventListener('input', handleCollectionFocusAndInput);
    collectionSpeciesSuggestions.addEventListener('click', handleCollectionSuggestionsClick);

    // Function to handle focus and input events
    function handleCollectionFocusAndInput(event) {
        // Show unfiltered suggestions when the input is focused
        if (event.type === 'focus') {
            loadSuggestions(specieslist, collectionSpeciesSuggestions);
        }

        // Handle input events
        if (event.type === 'input') {
            const userInput = collectionSpeciesInput.value;
            loadSuggestions(filterData(specieslist, userInput), collectionSpeciesSuggestions);
        }
    }

    // Function to handle click events on suggestions
    function handleCollectionSuggestionsClick(event) {
        // Update the input value when a suggestion is clicked
        if (event.target.tagName === 'LI') {
            collectionSpeciesInput.value = event.target.textContent;
            collectionSpeciesSuggestions.innerHTML = ''; // Clear the suggestions
        }
    }

    // Add an event listener to close the suggestions list when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInside = collectionSpeciesInput.contains(event.target) || collectionSpeciesSuggestions.contains(event.target);
        if (!isClickInside) {
            collectionSpeciesSuggestions.innerHTML = ''; // Clear the suggestions
            //hideTargetElement(collectionSpeciesSuggestions);
        }
    });

    // Add an event listener to close the suggestions list when pressing Esc
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            collectionSpeciesSuggestions.innerHTML = ''; // Clear the suggestions
            //hideTargetElement(collectionSpeciesSuggestions);
        }
    });
}

/**
 * @function
 * Function to get species list from Calscape
 */
export function fetchSpeciesList() {
    if (specieslist.length === 0) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/includes/php/calscape_query.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.error) {
                            console.log(response.error);
                        } else {
                            specieslist = response.map((x) => x);
                            console.log(specieslist);
                        }
                    } catch (error) {
                        // Handle JSON parsing error
                        console.error("Error parsing JSON response:", error);
                        console.error("Response text:", xhr.responseText);
                    }
                } else {
                    // Handle HTTP status error
                    console.error("HTTP status error:", xhr.status);
                    console.error("Response text:", xhr.responseText);
                }
            }
        };
        xhr.send();
    }
}

/**
 * @function
 * @param {*} data 
 * @param {*} element 
 * 
 * Given an array, data, load each item in data into element
 */
function loadSuggestions(data, element) {
    if (data) {
        element.innerHTML = "";
        let innerElement = "";
        data.forEach(item => {
            innerElement += `
            <li>${item}</li>`
        });

        element.innerHTML = innerElement;
    }
}

/**
 * @function
 * 
 * Given an array, data, and a search string, searchText, return an array
 * of strings from data that include searchText
 * 
 * @param {*} data 
 * @param {*} searchText 
 * @returns filtered array
 */
function filterData(data, searchText) {
    return data.filter((x) => x.toLowerCase().includes(searchText.toLowerCase()));
}

export function updateSpeciesChoice() {
     // Get the radio buttons and the species-container element
     const speciesChoice = document.getElementById('species-choice');
     const gardenChoice = document.getElementById('garden-choice');
     const collSpeciesContainer = document.getElementById('collection-species-container');
     const selSpeciesContainer = document.getElementById('selected-species-container');
     const collectionSpeciesInput = document.getElementById('collection-species');
     const selectedSpeciesInput = document.getElementById('selected-species');
 
     if (speciesChoice.checked) {
         if (collSpeciesContainer != null) {
             collectionSpeciesInput.disabled = false;
             collectionSpeciesInput.placeholder = 'type species name';
         }
         if (selSpeciesContainer != null) {
             selectedSpeciesInput.disabled = true;
             selectedSpeciesInput.value = '';
             selectedSpeciesInput.placeholder = 'applied from collection';
         }
     } else if (gardenChoice.checked) {
         if (collSpeciesContainer != null) {
             collectionSpeciesInput.disabled = true;
             collectionSpeciesInput.value = '';
             collectionSpeciesInput.placeholder = 'not applicable';
         }
         if (selSpeciesContainer != null) {
             selectedSpeciesInput.disabled = getSelectedThumbnails().length < 1;
             selectedSpeciesInput.placeholder = 'type species name';
         }
     }   
}

// Add an event listener for radio button changes
const mainContent = document.getElementById('main-content');
mainContent.addEventListener('change', (event) => {
    const targetId = event.target.id;
    if (targetId === 'species-choice' || targetId === 'garden-choice') {
        updateSpeciesChoice();
    }
});
