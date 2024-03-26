<?php
// Calscape 1.0 photo directories
define('ALL_IMAGES_DIR', '../../public/ExtData/allimages/');
define('BIG_IMAGES_DIR', ALL_IMAGES_DIR . '900/');
define('THUMBNAILS_DIR', ALL_IMAGES_DIR . 'Photos/');

// Calscape 2.0 photo directories
define('CALSCAPE2_ALL_IMAGES_DIR', ALL_IMAGES_DIR . 'species_image/');
define('CALSCAPE2_CALPHOTOS_DIR', CALSCAPE2_ALL_IMAGES_DIR . 'calphotos/image');

// Kristy's calsca6_calscape_demo
$dbConfig = array(
    'hostname' => "localhost:3306",
    'username' => "root",
    'password' => "Edw8rdpm!",
    'database' => "calsca6_demo"
);

/*
// Kristy's calsca6_calscape
$dbConfig = array(
    'hostname' => "localhost:3306",
    'username' => "root",
    'password' => "Edw8rdpm!",
    'database' => "calsca6_calscape"
);
*/

/*
// AWS Server Database connection parameters
$dbConfig = array(
    'hostname' => "calscape-photo-test-db-instance.cjoscaq8s13i.us-west-1.rds.amazonaws.com:3306",
    'username' => "photo_admin",
    'password' => "calscapephoto",
    'database' => "calsca6_demo"
);
*/

/*
// Calscape 2 UAT
$dbConfig = array(
    'hostname' => "calscapeproduction.cdwkpn2rrvdl.us-west-1.rds.amazonaws.com",
    'username' => "dbase_view",
    'password' => "ST|v7=g1-PD?3A9!ssp)6Zgt",
    'database' => "calscape"
);
*/

/*
// Photo Test Calscape 2
$dbConfig = array(
    'hostname' => "calscape2-database-1.cjoscaq8s13i.us-west-1.rds.amazonaws.com",
    'username' => "photo_admin",
    'password' => "calscapephoto",
    'database' => "calscape"
);
*/

/*
// Photo Test Calscape 2 SSH Tunnel through EC2
$dbConfig = array(
    'hostname' => "127.0.0.1:3336",
    'username' => "photo_admin",
    'password' => "calscapephoto",
    'database' => "calscape"
);
*/
