<?php
// collection-container.php
define('COLLECTION_CONTAINER', <<<HTML
<div id="collection-container" class="collection-container">
    <h2>Photo collection</h2>

    <div id="group-properties-container" class="group-properties-container">
        <h2>Collection properties</h2>
        <h3>Applies to all photos in the collection</h3>
        <div class="properties-scroll-container">
            <form id="group-properties-form">
                <div class="form-group">
                    <label class="label">Name</label>
                    <input type="text" id="collection-name" placeholder="enter a collection name"
                            class="auto-expand-input" autocomplete="off">
                </div>
                <fieldset id="collection-type" class="colltype-choice">
                    <legend>Collection type:</legend>
                    <div>
                        <input type="radio" id="species-choice" name="collection-type" value="species"
                            checked= />
                        <label for="species-choice">Species: <i>Photos of a single plant species</i></label>
                    </div>
                    <div>
                        <input type="radio" id="garden-choice" name="collection-type" value="garden" />
                        <label for="garden-choice">Garden: <i>Photos of different species such as garden
                            images</i></label>
                    </div>
                </fieldset>
                <div id="collection-species-container" class="form-group">
                    <label class="label">Species</label>
                    <div class="species-container">
                        <input type="text" id="collection-species" placeholder="type species name"
                            class="auto-expand-input" autocomplete="off">
                        <ul id="collection-suggestions" class="suggestions">
                            <!-- Species list will be loaded as the user types -->
                        </ul>
                    </div>
                </div>
                <!-- Properties will be loaded here -->
            </form>
        </div>
    </div>

    <div class="thumbnail-scroll-container">
        <h2>Collection photos</h2>
        <div id="thumbnail-group-grid">
            <div  id="drag-and-drop-message" class="drag-and-drop-message">Drag and drop source photo thumbnails here to add the photo to a
                collection
            </div>
            <!-- Thumbnails will be loaded here -->
        </div>
    </div>
</div>

<script type="module" src="../assets/js/species-selection.js"></script>
HTML);
