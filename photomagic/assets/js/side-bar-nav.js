/**
 * @file side-bar-nav.js
 * Handle user selection of side navigation items
 */

import { initMainContent } from "./main-content.js";
import { clearPhotoCollection, getCollectionThumbnails, savePhotoCollection, validateLeavePage } from "./collection-data.js";
import { saveSelectedProperties, initProperties } from "./properties.js"
import { dismissStatusOnNavigation } from "./status.js";
import { clearCalscapePhotos, getCalscapeThumbnails } from "./sort-and-save.js";
import { clearSourcePhotos } from "./source-photo-data.js";
import { clearSelections } from "./thumbnails.js";

export const Mode = {
    UNSPECIFIED: 'unspecified',
    CONTRIBUTE: 'contributor',
    REVIEW: 'reviewer'
};

$(document).ready(async function () {
    try {
        const response = await fetch('/photomagic/includes/php/version.php');
        const data = await response.json();
        window.calscapeVersion = data.calscape_version;
        window.photoMagicianVersion = data.photo_magician_version;
    } catch (error) {
        console.error('Error fetching version:', error);
    }

    initProperties(window.calscapeVersion);
    
    // Load default content on page load
    fetchContent('home');

    $(document).on('click', '#contributeButton', async function (event) {
        event.preventDefault();

        if (ROLE !== Mode.CONTRIBUTE) {
            if (getCollectionThumbnails().length > 0 || getCalscapeThumbnails().length > 0) {
                if (!confirm("Changes made to the selected collection during this Review session will not be saved if you switch to Contribute mode. \
                \n\r\Press OK to switch to Contribute or Cancel to remain in Review mode.")) {
                    return;
                }
            }
            await clearPhotoCollection(); // user is switching roles so clear the current collection
            clearCalscapePhotos();
            clearSourcePhotos();
        }

        const targetMenu = $(this).data('menu');
        const nav = $(this).data('nav');
        fetchMenu(targetMenu, nav);
        ROLE = Mode.CONTRIBUTE;
    });

    $(document).on('click', '#reviewButton', function (event) {
        event.preventDefault();

        if (ROLE !== Mode.REVIEW) {
            if (getCollectionThumbnails().length > 0) {
                if (!confirm("Changes made to the current collection will not be saved if you switch to Review mode. \
            \n\rPress OK to switch to Review or Cancel to remain in Contribute mode.")) {
                    return;
                }
            }
            clearPhotoCollection(); // user is switching roles so clear the current collection
            clearSourcePhotos();
        }

        const targetMenu = $(this).data('menu');
        const nav = $(this).data('nav');
        fetchMenu(targetMenu, nav);
        ROLE = Mode.REVIEW;
    });

    $(function () {
        // Trigger a click on the "Welcome" li element when the page loads
        $('li#welcome-link a').click();
    });
});

// Represent's the user's choice of Review or Contribute
export let ROLE = Mode.UNSPECIFIED;

export function initWelcome() {
    console.log("Welcome page initialized")
}

export function initNavigation() {
    // Attach click event listeners to the navigation items
    $('#left-nav a').click(function (event) {
        event.preventDefault(); // Prevent the default link behavior

        // save current values before replacing page content
        savePhotoCollection();
        saveSelectedProperties();

        // remove grid selections before navigating
        clearSelections();  

        if (event.target.id === 'save' || event.target.id === 'submit')
            // Validate required fields before leaving
            if (!validateLeavePage()) {
                return;
            }

        // Add selected class to clicked menu item
        $('li a.selected').removeClass('selected'); // Remove the class from previously selected items
        $(this).addClass('selected'); // Add the class to the clicked item

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
};

function fetchContent(page, append = false) {
    // Use jQuery's AJAX function to get the content from the server
    $.ajax({
        url: '/photomagic/includes/php/side-bar-nav.php?nav=' + page,
        method: 'GET',
        dataType: 'html',
        success: async function (data) {
            // Replace the main content with the fetched data
            $('#main-content').html(data);
            await initMainContent();

            //comment updateNavigationBar(page) to show all options on home page
            //update navigation bar based on the fetched page
            updateNavigationBar(page);

            updateSelectedPhotoActions(page);
        },
        error: function (error) {
            console.error('Error fetching content:', error);
        }
    });
}

function fetchMenu(menu, navigate, append = false) {
    // Use jQuery's AJAX function to get the content from the server
    $.ajax({
        url: '/photomagic/includes/php/side-bar-nav.php?nav=' + menu,
        method: 'GET',
        dataType: 'html',
        success: function (data) {
            // Replace the main content with the fetched data
            $('#left-nav').html(data);

            initNavigation()

            if (navigate) {
                $('#' + navigate).trigger('click');
            }
        },
        error: function (error) {
            console.error('Error fetching menu:', error);
        }
    });
}

function updateNavigationBar(currentPage) {
    if (currentPage === 'home') {
        // Hide all nav items except 'Welcome' when on the home page
        $('#left-nav a:not(#welcome-link a)').hide();
    } else {
        // Show all nav items on other pages
        $('#left-nav a').show();
    }

    dismissStatusOnNavigation();
}

function updateSelectedPhotoActions(currentPage) {
    const photoActionsElem = document.getElementById('photo-actions-container');
    if (photoActionsElem !== null) {
        if (currentPage === 'home' || 
        currentPage === 'submit-for-review' || 
        currentPage === 'select-collection') {
            photoActionsElem.style.display = 'none';
        } else {
            photoActionsElem.style.display = 'block';
        }
    }
}

function openSelectionDialog(id) {
    if (id === 'selectFilesLink') {
        fileModal.style.display = 'block';
    }
    else if (id === 'selectFromFlickrLink') {
        flickrModal.style.display = 'block';
    }
}
