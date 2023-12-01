<?php
// selected-properties.php

define('SELECTED_PROPERTIES', <<<HTML
<div id="selected-properties-container" class="outer-properties-container">
    <h2>Selected photo properties</h2>
    <div class="properties-scroll-container">
        <h3>Properties apply to the selected photo</h3>
        <form id="properties-form">
            <div id="selected-species-container" class="form-group" style="visibility: hidden;">
                <label class="label">Species</label>
                <div class="species-container">
                    <input type="text" id="selected-species" placeholder="type species name"
                        class="auto-expand-input" autocomplete="off">
                    <ul id="selected-suggestions" class="suggestions">
                        <!-- Species list will be loaded as the user types -->
                    </ul>
                </div>
            </div>
            <br></br>
            <!-- Properties will be loaded here -->
            <!-- Hidden div to store id of selected image -->
            <div id="selected-id" style="display: none;"></div>
        </form>
    </div>
</div>
HTML);
?>
