<?php

define('VERSION', '1.0.0');

// Assuming $response is an array containing the data you want to send back
$response = array(
    'photo_magician_version' => VERSION,
    'calscape_version' => getCalscapeVersion()
);

// Function to get the Calscape version dynamically
function getCalscapeVersion() {
    include_once(dirname(dirname(__FILE__)) . '/php/common.php');
    
    // Initialize DatabaseManager with your database credentials
    $dbManager = new DatabaseManager($hostname, $username, $password, $database);

    // Check if the table plant_images exists
    $query = "SHOW TABLES LIKE 'plant_images'";
    $result = $dbManager->executeQuery($query, []);

    // If the table exists, it's Calscape version 2.0, otherwise 1.0
    $calscapeVersion = ($result->num_rows > 0) ? '2.0' : '1.0';

    // Close the database connection
    $dbManager->closeConnection();

    return $calscapeVersion;
}

// Send the JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>