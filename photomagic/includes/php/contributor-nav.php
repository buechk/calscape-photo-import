<?php
// contributor-nav.php

define('CONTRIBUTOR_NAV', <<<HTML

<ul>
    <li id="welcome-link"><a data-page="home">Welcome</a></li>
    <li><a href="#" id="select-photos" data-page="select-photos">Select photos</a>
        <ul class="submenu">
            <li><a href="#" data-page="select-photos" id="selectFilesLink">Select files...</a></li>
            <li><a href="#" data-page="select-photos" id="selectFromFlickrLink">Select from Flickr...</a></li>
        </ul>
    </li>
    <li><a href="#" data-page="create-collection">Create collection</a></li>
    <li><a href="#" data-page="set-properties">Set properties</a></li>
    <li><a href="#" id="submit" data-page="submit-for-review">Submit</a></li>
</ul>
HTML);