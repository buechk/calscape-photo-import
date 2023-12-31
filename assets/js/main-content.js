/**
 * @file main-content.js
 */

import { displayThumbnailsFromSourcePhotos, initializeSortableGrid, initializeSortableGroupGrid } from "./thumbnails.js";
import { initializeResizer } from "./resizer.js";
import { fetchSpeciesList, initializeSpeciesInput, initializeCollectionSpeciesInput } from "./species-selection.js";
import { initializeCollectionData } from "./collection-data.js";
import { initializeSubmitContribute } from "./submit.js";
import { clearPropertiesFields } from "./properties.js";
import { initSubmitPage as initializeSubmitPage } from "./submit-page.js";
import { initWelcome } from "./side-bar-nav.js";
import { getCollectionsForReview} from "./collections-for-review.js";

/**
 * @function init
 */
export function initMainContent() {
    const mainContentArea = document.getElementById('main-content');

    if (mainContentArea.querySelector("#welcome")) {
        // When you dynamically add content that requires a column layout
        mainContentArea.classList.remove('row-layout');
        mainContentArea.classList.add('column-layout');
        initWelcome();
    }

    if (mainContentArea.querySelector('#source-photos-container')) {
        mainContentArea.classList.remove('row-layout');
        mainContentArea.classList.add('column-layout');
        initializeSortableGrid();
        displayThumbnailsFromSourcePhotos();
    }

    if (mainContentArea.querySelector('#collection-container')) {
        // Dynamically add content that requires a row layout
        mainContentArea.classList.remove('column-layout');
        mainContentArea.classList.add('row-layout');
        fetchSpeciesList();
        initializeCollectionSpeciesInput();
        initializeSortableGroupGrid();
        initializeCollectionData();
    }

    if (mainContentArea.querySelector('#selected-properties-container')) {
        // Dynamically add content that requires a row layout
        mainContentArea.classList.remove('column-layout');
        mainContentArea.classList.add('row-layout');
        clearPropertiesFields();
        fetchSpeciesList();
        initializeSpeciesInput();
    }

    if (mainContentArea.querySelector('#divider')) {
        initializeResizer();
    }

    if (mainContentArea.querySelector('#submit-button')) {
        initializeSubmitPage();
        initializeSubmitContribute()
    }

    if (mainContentArea.querySelector('#collections_for_review-container')) {
        getCollectionsForReview();
    }

}
