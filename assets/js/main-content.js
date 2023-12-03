/**
 * @file main-content.js
 */

import { displayThumbnailsFromSourcePhotos, initializeSortableGrid, initializeSortableGroupGrid } from "./thumbnails.js";
import { initializeResizer } from "./resizer.js";
import { fetchSpeciesList, initializeSpeciesInput, initializeCollectionSpeciesInput } from "./species-selection.js";
import { initializeCollectionData } from "./collection-data.js";
import { initializeSubmitContribute } from "./submit.js";

/**
 * @function init
 */
export function initMainContent() {
    const mainContentArea = document.getElementById('main-content');

    if (mainContentArea.querySelector("#welcome")) {
        // When you dynamically add content that requires a column layout
        mainContentArea.classList.remove('row-layout');
        mainContentArea.classList.add('column-layout'); 
    }

    if (mainContentArea.querySelector('#source-photos-container')) {
        mainContentArea.classList.remove('row-layout');
        mainContentArea.classList.add('column-layout'); 
        initializeSortableGrid();
        displayThumbnailsFromSourcePhotos();
    }

    if (mainContentArea.querySelector('#collection-container')) {
        // When you dynamically add content that requires a row layout
        mainContentArea.classList.remove('column-layout'); 
        mainContentArea.classList.add('row-layout');
        fetchSpeciesList();
        initializeCollectionSpeciesInput();
        initializeSortableGroupGrid();
        initializeCollectionData();

    }

    if (mainContentArea.querySelector('#selected-properties-container')) {
        // When you dynamically add content that requires a row layout
        mainContentArea.classList.remove('column-layout'); 
        mainContentArea.classList.add('row-layout');
        fetchSpeciesList();
        initializeSpeciesInput();
    }

    if (mainContentArea.querySelector('#divider')) {
        initializeResizer();
    }

    if (mainContentArea.querySelector('#submit-button')) {
        initializeSubmitContribute()
    }

}
