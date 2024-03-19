<?php
include_once(dirname(dirname(__FILE__)) . '/php/welcome.php');
include_once(dirname(dirname(__FILE__)) . '/php/source-photos-container.php');
include_once(dirname(dirname(__FILE__)) . '/php/collection-container.php');
include_once(dirname(dirname(__FILE__)) . '/php/selected-properties.php');
include_once(dirname(dirname(__FILE__)) . '/php/divider.php');
include_once(dirname(dirname(__FILE__)) . '/php/submit-page.php');
include_once(dirname(dirname(__FILE__)) . '/php/contributor-nav.php');
include_once(dirname(dirname(__FILE__)) . '/php/reviewer-nav.php');
include_once(dirname(dirname(__FILE__)) . '/php/collection_for_review_list.php');
include_once(dirname(dirname(__FILE__)) . '/php/sort_and_save.php');

// side-bar-nav.php
$nav = isset($_GET['nav']) ? $_GET['nav'] : 'home';

//comment this code to show full navigation bar on the home page. line 86 of side-bar-nav.js will also need to be commented
function generateNavBar($nav)
{
    //hide submenu styles on home page
    // $navClass = ($nav === 'home') ? 'nav-home' : 'nav-other';
    // echo '<nav id="left-nav" class="' . $navClass . '">';

    //Only show the full navigation bar if not on the home page
    if ($nav !== 'home') {
        echo '<nav id="left-nav">';
        echo '<ul>';
        // Add other navigation items here
        echo '<li><a id="select-photos" href="?nav=select-photos">Select Photos</a></li>';
        echo '<li><a href="?nav=create-collection">Create Collection</a></li>';
        echo '<li><a href="?nav=set-properties">Set Properties</a></li>';
        echo '<li><a href="?nav=submit-for-review">Submit for Review</a></li>';
        echo '</ul>';
        echo '</nav>';
    }
}

// Call to generate the navigation bar
//generateNavBar($nav);
// //end uncomment

function getContentForPage($nav)
{
    switch ($nav) {
        case 'home':
            echo WELCOME;
            break;
        case 'select-photos':
            echo SOURCE_PHOTOS_CONTAINER;
            break;
        case 'create-collection':
            echo '<div class="left-container">' . SOURCE_PHOTOS_CONTAINER . '</div>' . DIVIDER . '<div class="right-container">' . COLLECTION_CONTAINER . '</div>';
            break;
        case 'set-properties':
            echo '<div class="left-container">' . COLLECTION_CONTAINER . '</div>' . DIVIDER . '<div class="right-container">' . SELECTED_PROPERTIES . '</div>';
            break;
        case 'submit-for-review':
            echo SUBMIT;
            break;
        case 'select-collection':
            echo COLLECTIONS_FOR_REVIEW;
            break;
        case 'sort-photos':
            echo '<div class="left-container">' . COLLECTION_CONTAINER . '</div>' . DIVIDER . '<div class="right-container">' . CALSCAPE_PHOTOS . '</div>';
            break;
        case 'role-contributor':
            echo CONTRIBUTOR_NAV;
            break;
        case 'role-reviewer':
            echo REVIEWER_NAV;
            break;
        default:
            header('HTTP/1.0 404 Not Found');
            echo '<div><h2>Page Not Found</h2><p>The requested page was not found.</p></div>';
            break;
    }
}

echo getContentForPage($nav);
