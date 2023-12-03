/**
 * @file side-bar-nav.js
 * Handle user selection of side navigation items
 */

import { initMainContent } from "./main-content.js";
import { savePhotoCollection } from "./collection-data.js";

const Mode = {
    UNSPECIFIED: 'unspecified',
    CONTRIBUTE: 'contribute',
    REVIEW: 'review'
};

// Represent's the user's choice of Review or Contribute
let mode = Mode.UNSPECIFIED;

function initNavigation() {
    if (mode === Mode.UNSPECIFIED) {

    }
}

$(function () {
    // Attach the click event handler to the specific li element containing "Welcome"
    $('li a').click(function () {
        $('li a.selected').removeClass('selected'); // Remove the class from previously selected items
        $(this).addClass('selected'); // Add the class to the clicked item
    });

    // Trigger a click on the "Welcome" li element when the page loads
    $('li#welcome-link a').click();
});

$(document).ready(function () {
    // Attach click event listeners to the navigation items
    $('#left-nav a').click(function (event) {
        event.preventDefault(); // Prevent the default link behavior
        // If it's not a submenu, fetch and append the content to the main content area
        var targetPage = $(this).data('page');
        fetchContent(targetPage);

        // Check if this is a submenu that should open a modal based on specific IDs
        var clickedId = event.target.id;
        if (clickedId === 'selectFilesLink' || clickedId === 'selectFromFlickrLink') {
            // Call the existing event handler to open the modal
            openSelectionDialog(clickedId);
        }
    });

    // Load default content on page load
    fetchContent('home');
});

function fetchContent(page, append = false) {
    // Use jQuery's AJAX function to get the content from the server
    $.ajax({
        url: '/includes/php/side-bar-nav.php?nav=' + page,
        method: 'GET',
        dataType: 'html',
        success: function (data) {
            savePhotoCollection(); // save current values before replacing page content
            
            // Replace the main content with the fetched data
            $('#main-content').html(data);
            initMainContent();
        },
        error: function (error) {
            console.error('Error fetching content:', error);
        }
    });
}

function openSelectionDialog(id) {
    if (id === 'selectFilesLink') {
        fileModal.style.display = 'block';
    }
    else if (id === 'selectFromFlickrLink') {
        flickrModal.style.display = 'block';
    }
}
