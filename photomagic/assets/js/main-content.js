/**
 * @file main-content.js
 */
import { initPhotoSelection } from "./photo-selection.js";
import { initializeResizer } from "./resizer.js";
import { fetchSpeciesList, initializeSpeciesInput, initializeCollectionSpeciesInput } from "./species-selection.js";
import { initializeCollectionData } from "./collection-data.js";
import { initializeSubmitContribute } from "./submit.js";
import { clearPropertiesFields } from "./properties.js";
import { initSubmitPage as initializeSubmitPage } from "./submit-page.js";
import { initWelcome } from "./side-bar-nav.js";
import { initCollectionsforReview} from "./collections-for-review.js";
import { initPhotoSort } from "./sort-and-save.js";

/**
 * @function init
 */
export async function initMainContent() {
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
        initPhotoSelection();
    }

    if (mainContentArea.querySelector('#collection-container')) {
        // Dynamically add content that requires a row layout
        mainContentArea.classList.remove('column-layout');
        mainContentArea.classList.add('row-layout');
        fetchSpeciesList();
        initializeCollectionSpeciesInput();
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
        await initializeSubmitPage();
        initializeSubmitContribute()
    }

    if (mainContentArea.querySelector('#collections_for_review-container')) {
        initCollectionsforReview();
    }

    if (mainContentArea.querySelector('#calscape-photos-container')) {
        initPhotoSort();
    }

}
