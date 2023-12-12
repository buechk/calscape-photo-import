<?php
include_once(dirname(dirname(__FILE__)).'/php/common.php');

// Create a database connection
$conn = new mysqli($hostname, $username, $password, $database);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query
// Execute the query
$result = $conn->query($speciesquery);

// Check if the query was successful
if ($result) {
    $species = array();
    while ($row = $result->fetch_assoc()) {
        $species[] = $row["species"];
    }
    echo json_encode($species);
} else {
    echo json_encode(["error" => "Error executing the query: " . $conn->error]);
}

// Close the database connection
$conn->close();
