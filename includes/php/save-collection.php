<?php
include_once(dirname(dirname(__FILE__)).'/php/common.php');

// Get the JSON data from the request
$data = file_get_contents('php://input');

// Decode the JSON data
$decodedData = json_decode($data, true);

// Ensure the JSON decoding is successful
if ($decodedData === null) {
    // Respond with an error if decoding fails
    $response = array('success' => false, 'message' => 'Invalid JSON data');
    echo json_encode($response);
    exit();
}

// Define the path to save the collection
$collectionPath = COLLECTIONS_REVIEW_DIR;

// Ensure the directory exists
if (!file_exists($collectionPath)) {
    mkdir($collectionPath, 0777, true);
}

// Generate a unique filename based on property values
$filename = str_replace(' ', '_', sprintf(
    '%s_%s_%s_%s_%s.json',
    $decodedData['user_id'],
    $decodedData['collection-name'],
    $decodedData['collection-type'],
    $decodedData['collection-species'],
    uniqid())
);

// Concatenate the filename with the collectionPath
$filename = $collectionPath . $filename;

// Save the JSON data to the file
file_put_contents($filename, $data);

// Respond with success or any additional data if needed
$response = [
    'success' => true,
    'message' => 'Collection saved successfully',
    'filename' => $filename,
];
header('Content-Type: application/json');
echo json_encode($response);
?>
