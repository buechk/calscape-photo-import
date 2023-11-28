/**
 * @file
 * Enable user to select plant species in which to assign photos
 */

let specieslist = [];

export function initializeSpeciesInput() {
    const selectedSpeciesInput = document.getElementById('selected-species');
    const selectedSpeciesSuggestions = document.getElementById('selected-suggestions');

    selectedSpeciesInput.addEventListener('focus', handleFocusAndInput);
    selectedSpeciesInput.addEventListener('input', handleFocusAndInput);
    selectedSpeciesSuggestions.addEventListener('click', handleSuggestionsClick);

    // Function to handle focus and input events
    function handleFocusAndInput(event) {
        // Show unfiltered suggestions when the input is focused
        if (event.type === 'focus') {
            loadSuggestions(specieslist, selectedSpeciesSuggestions);
        }

        // Handle input events
        if (event.type === 'input') {
            const userInput = inputElement.value;
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
}

export function initializeCollectionSpeciesInput() {
    const collectionSpeciesInput = document.getElementById('collection-species-input');
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

// Add event listeners to the common parent element ('main-content')
/*
mainContent.addEventListener('focus', handleFocusAndInput, true);
mainContent.addEventListener('input', handleFocusAndInput, true);
mainContent.addEventListener('click', handleSuggestionsClick, true);
*/
// Add an event listener for radio button changes
const mainContent = document.getElementById('main-content');
mainContent.addEventListener('change', (event) => {
    const targetId = event.target.id;

    // Get the radio buttons and the species-container element
    const speciesChoice = document.getElementById('species-choice');
    const gardenChoice = document.getElementById('garden-choice');
    const collSpeciesContainer = document.getElementById('collection-species-container');
    const selSpeciesContainer = document.getElementById('selected-species-container');

    if (targetId === 'species-choice' && speciesChoice.checked) {
        if (collSpeciesContainer != null) {
            collSpeciesContainer.style.visibility = 'visible';
        }
        if (selSpeciesContainer != null) {
            selSpeciesContainer.style.visibility = 'hidden';
        }
    } else if (targetId === 'garden-choice' && gardenChoice.checked) {
        if (collSpeciesContainer != null) {
            collSpeciesContainer.style.visibility = 'hidden';
        }
        if (selSpeciesContainer != null) {
            selSpeciesContainer.style.visibility = 'visible';
        }
    }
});