<?php
// photo-actions-container.php

define('PHOTO_ACTIONS_CONTAINER', <<<HTML

<div id="photo-actions-container" class="actions-container" style="display: none;">
    <div id="selected-photos-count" class="selected-count">0 photos selected</div>
    <div class="expand-wrapper">
        <button id="expand-button" class="expand-button">
            <i class="fa-solid fa-expand"></i>
            <span>Expand</span>
        </button>
        <span class="expand-text">Expand selected</span>
    </div>
</div>
HTML);
?>