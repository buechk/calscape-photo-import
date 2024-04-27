<?php
include_once('common.php');

define('VERSION', '1.0.0.0006');

$response = array(
    'photo_Companion_version' => VERSION,
    'calscape_version' => getCalscapeVersion()
);

// Send the JSON response
header('Content-Type: application/json');
echo json_encode($response);
