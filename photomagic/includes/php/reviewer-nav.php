<?php
// reviewer-nav.php

define('REVIEWER_NAV', <<<HTML

<ul>
    <li id="welcome-link"><a data-page="home">Welcome</a></li>
    <li><a href="#" id="select-collection" data-page="select-collection">Select collection</a></li>
    <li id="review-collection"><a href="#" data-page="set-properties">Review collection</a></li>
    <li><a href="#" id="save" data-page="sort-photos">Sort and save</a></li>
</ul>
HTML);