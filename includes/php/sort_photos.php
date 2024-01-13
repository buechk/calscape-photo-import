<?php
// calscape_photos.php
define('CALSCAPE_PHOTOS', <<<HTML
<div id="calscape-photos-container" class="calscape-photos-container">
    <h2>Calscape photos</h2>
    <h3>Drag and drop collection photo thumbnails here to insert 
        them into the desired position among the Calscape photos</h3>
    <div class="thumbnail-scroll-container">
        <div id="thumbnail-calscape-grid" class="thumbnail-grid">
            <div  id="calscape-drag-and-drop-message" class="drag-and-drop-message">
                Calscape photos. 
            </div>
            <!-- Thumbnails will be loaded here -->
        </div>
    </div>
</div>

HTML);
