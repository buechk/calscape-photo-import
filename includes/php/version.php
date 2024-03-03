<?php
include_once('common.php');

define('VERSION', '1.0.0.0002');

// $response is an array containing the data  to send back
$response = array(
    'photo_magician_version' => VERSION,
    'calscape_version' => getCalscapeVersion()
);

// Send the JSON response
header('Content-Type: application/json');
echo json_encode($response);
