/**
 * @file
 * Enable user to select plant species in which to assign photos
 */
const speciesinput = document.getElementById('speciesInput');
const suggestions = document.getElementById('suggestions');

let specieslist = [];
/**
 * @function
 * Function to get species list from Calscape
 */
function fetchSpeciesList() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "calscape_query.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.error) {
                document.getElementById("results").textContent = response.error;
            } else {
                specieslist = response.map((x) => x);
                console.log(specieslist);
            }
        }
    };
    xhr.send();
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

/* EVENT LISTENERS */

speciesinput.addEventListener('input', function () {
    const userInput = this.value;
    console.log(userInput);

    // populate suggestions
    loadSuggestions(filterData(specieslist,userInput), suggestions);

});

suggestions.addEventListener('click', function (event) {
    if (event.target.tagName === 'LI') {
        speciesinput.value = event.target.textContent;
        suggestions.innerHTML = ''; // Clear the suggestions
    }
});


document.addEventListener('DOMContentLoaded', fetchSpeciesList);


