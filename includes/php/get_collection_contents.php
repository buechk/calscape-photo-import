<?php
include_once('common.php');

// Ensure the filename is provided
if (isset($_GET['filename'])) {
    $filename = $_GET['filename'];
    $filepath = COLLECTIONS_REVIEW_DIR . '/' . $filename;

    // Check if the file exists
    if (file_exists($filepath)) {
        // Read the JSON file content
        $jsonContent = file_get_contents($filepath);

        // Set the appropriate content type for JSON
        header('Content-Type: application/json');

        // Output the JSON content
        echo $jsonContent;
    } else {
        // Handle file not found
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
    }
} else {
    // Handle missing filename parameter
    http_response_code(400);
    echo json_encode(['error' => 'Missing filename parameter']);
}
?>
