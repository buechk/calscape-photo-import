<?php

// Assuming you have a MySQLi connection, modify the following with your actual database connection details
$mysqli = new mysqli("hostname", "username", "password", "database");

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Assuming $data contains the provided JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Extract values from the JSON data
$collectionName = $mysqli->real_escape_string($data['collection-name']);
$collectionType = $mysqli->real_escape_string($data['collection-type']);
$userID = $mysqli->real_escape_string($data['user_id']);
$photos = $data['photos'];

// Insert data into the MySQL photos table
foreach ($photos as $photo) {
    $id = $mysqli->real_escape_string($photo['id']);

    // Create an array to hold column and value pairs
    $columnValuePairs = [];

    // Loop through each key in the photo object
    foreach ($photo as $key => $value) {
        // Skip the 'id' key, as it's handled separately
        if ($key !== 'id') {
            // Escape and add the key-value pair to the array
            $columnValuePairs[] = "`" . $mysqli->real_escape_string($key) . "` = '" . $mysqli->real_escape_string($value) . "'";
        }
    }

    // Join the column-value pairs into a comma-separated string
    $columnValues = implode(', ', $columnValuePairs);

    $query = "INSERT INTO photos 
              (`collection_name`, `collection_type`, `user_id`, `photo_id`, $columnValues) 
              VALUES 
              ('$collectionName', '$collectionType', '$userID', '$id', '$columnValues')";

    if ($mysqli->query($query) !== TRUE) {
        echo "Error: " . $query . "<br>" . $mysqli->error;
    }
}

// Close the MySQL connection
$mysqli->close();
?>
