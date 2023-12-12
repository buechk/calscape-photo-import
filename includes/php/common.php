<?php
// Database connection parameters
$hostname = "localhost:3306";
$username = "root";
$password = "Edw8rdpm!";
$database = "calsca6_calscape";

// File upload
$uploadDirectory = '../../public/ExtData/allimages/';

// Collection directory
$collectionReviewDirectory = '../../public/ExtData/collections/review/';

// Query to get all species
$speciesquery = "SELECT species FROM plants WHERE disabled = 0 and is_biozone = 0 ORDER BY species";
