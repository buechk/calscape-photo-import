<?php
// source-photos-container.php

define('SOURCE_PHOTOS_CONTAINER', <<<HTML

<div id="source-photos-container" class="source-photos-container">
    <h2>Source photos</h2>
    <div class="thumbnail-scroll-container">
        <div id="thumbnail-grid" class="thumbnail-grid">
            <!-- Thumbnails will be loaded here -->
            <div  id="select-photos-message" class="drag-and-drop-message">
                Choose Select files... or Select from Flickr... from the Select Photos menu
            </div>
        </div>
    </div>
</div>

<!-- <script type="module" src="../assets/js/thumbnails.js"></script> -->
HTML);
