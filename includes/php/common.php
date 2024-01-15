<?php
include_once('DatabaseManager.php');

// Database connection parameters
$hostname = "localhost:3306";
$username = "root";
$password = "Edw8rdpm!";
$database = "calsca6_calscape";

$dbManager = new DatabaseManager($hostname, $username, $password, $database);

// File upload
define('ALL_IMAGES_DIR', '../../public/ExtData/allimages/');
define('BIG_IMAGES_DIR', ALL_IMAGES_DIR.'900/');
define('PHOTOS_DIR', ALL_IMAGES_DIR.'Photos/');

// Collection directory
$collectionReviewDirectory = '../../public/ExtData/collections/review/';

// Query to get all species
$speciesquery = "SELECT species FROM plants WHERE disabled = 0 and is_biozone = 0 ORDER BY species";

// Query for Calscape photos for a given species;
$calscapePhotoQuery = "SELECT
plants.ID,
photo.ID AS photo_id,
photo.FileName,
photo.DateTimeOriginal,
photo.ImageDescription,
photo.Artist,
photo.CopyrightNotice,
photo.Keywords,
plant_photo.photo_order AS plant_photo_order,
NULL AS plant_photo_calphotos_order
FROM plants
INNER JOIN plant_photo ON plants.ID = plant_photo.Plant_ID
INNER JOIN photo ON plant_photo.Photo_ID = photo.ID
WHERE plants.ID = '5'
UNION ALL
SELECT
plants.ID,
plant_photo_calphotos.photo_id,
plant_photo_calphotos.image AS FileName,
plant_photo_calphotos.date AS DateTimeOriginal,
NULL AS ImageDescription,
plant_photo_calphotos.author AS Artist,
plant_photo_calphotos.copyright AS CopyrightNotice,
plant_photo_calphotos.species AS Keywords,
NULL AS plant_photo_order,
plant_photo_calphotos.photo_order AS plant_photo_calphotos_order
FROM plants
INNER JOIN plant_photo_calphotos ON plants.ID = plant_photo_calphotos.plant_id
WHERE plants.ID = '5'
ORDER BY COALESCE(plant_photo_order, plant_photo_calphotos_order);";

$newline = (php_sapi_name() === 'cli') ? PHP_EOL : '<br>';
