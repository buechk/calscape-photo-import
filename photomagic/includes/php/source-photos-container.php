<?php
// source-photos-container.php

define('SOURCE_PHOTOS_CONTAINER', <<<HTML
<div id="source-photos-container" class="source-photos-container">
    <h2>Source photos</h2>
    <div class="thumbnail-scroll-container">
        <div id="thumbnail-grid" class="thumbnail-grid">
            <!-- Thumbnails will be loaded here -->
            <div id="select-photos-message" class="drag-and-drop-message"> 
            <span>Choose <strong>Select files...</strong> or <strong>Select from Flickr...</strong> 
            to get started.</span>
            <br>
                <nav id="select-photo-source">
                        <li><a href="#" data-page="select-photos" id="selectFilesLink">Select files...</a></li>
                        <li><a href="#" data-page="select-photos" id="selectFromFlickrLink">Select from Flickr...</a>
                        </li>
                </nav>
            </div>
        </div>
    </div>
    <a href="#" data-page="create-collection" class="next-button">Next</a>
</div>
HTML);
