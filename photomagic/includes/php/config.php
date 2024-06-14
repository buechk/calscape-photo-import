<?php
// Application root
define('DOCUMENT_ROOT', '/Library/WebServer/Documents/');
define('APP_DIR', 'photomagic/');
define('APP_ROOT', DOCUMENT_ROOT . APP_DIR);

// Downloads directory
define('COLLECTIONS_DOWNLOAD_DIR', 'public/ExtData/collections/exports/');

// Calscape 1.0 photo directories
define('ALL_IMAGES_DIR', APP_ROOT . 'public/ExtData/allimages/');
define('BIG_IMAGES_DIR', ALL_IMAGES_DIR . '900/');
define('THUMBNAILS_DIR', ALL_IMAGES_DIR . 'Photos/');

// Calscape 2.0 photo directories
define('CALSCAPE2_ALL_IMAGES_DIR', APP_ROOT . 'storage/app/species_image/');
define('CALSCAPE2_CALPHOTOS_DIR', APP_ROOT . 'storage/app/calphotos/image');

// Collection directories
define('COLLECTIONS_ROOT', APP_ROOT . 'public/ExtData/collections/');
define('COLLECTIONS_REVIEW_DIR', COLLECTIONS_ROOT . 'review/');
define('COLLECTION_PHOTOS_DIR', COLLECTIONS_ROOT . 'photos/');
define('COLLECTION_THUMBNAILS_DIR', COLLECTIONS_ROOT . 'thumbnails/');
define('COLLECTIONS_EXPORT_DIR', COLLECTIONS_ROOT . 'exports/');


// Kristy's calsca6_calscape
$dbConfig = array(
    'hostname' => "localhost:3306",
    'username' => "root",
    'password' => "",
    'database' => "calsca6_calscape"
);



