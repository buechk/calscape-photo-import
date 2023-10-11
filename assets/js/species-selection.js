/**
 * @file
 * Enable user to select plant species in which to assign photos
 */
const speciesInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');

const url = `your_php_script.php?query=${userInput}`;

function suggest(userInput) {
fetch(url)
    .then(response => response.json())
    .then(data => {
        // Process the JSON data and populate the suggestion dropdown
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displaySuggestions(data) {
    suggestions.innerHTML = '';

    data.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion';
        suggestionItem.textContent = item; // Customize this based on your JSON structure
        suggestions.appendChild(suggestionItem);

        suggestionItem.addEventListener('click', function() {
            // Handle the click event (e.g., populate input field with suggestion)
        });
    });
}

searchInput.addEventListener('input', function() {
    const userInput = this.value;
    
    // Send an AJAX request to your PHP script with userInput
    // Receive and parse JSON response from PHP
    // Populate and display the suggestion dropdown
});
