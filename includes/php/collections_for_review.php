<?php
include_once('common.php');

// Check if the directory exists
if (is_dir(COLLECTIONS_REVIEW_DIR)) {
    $collections = [];

    // Scan the directory for JSON files
    $jsonFiles = glob(COLLECTIONS_REVIEW_DIR . '/*.json');

    // Extract collection name, file path, and count photos from JSON files
    foreach ($jsonFiles as $jsonFile) {
        $jsonData = json_decode(file_get_contents($jsonFile), true);
        if (isset($jsonData['collection-name'])) {
            $photoCount = isset($jsonData['photos']) ? count($jsonData['photos']) : 0;

            $collections[] = [
                'name' => $jsonData['collection-name'],
                'type' => $jsonData['collection-type'],
                'species' => $jsonData['collection-species'],
                'contributor' => $jsonData['user_id'],
                'photoCount' => $photoCount,
                'fileName' => basename($jsonFile)
            ];
        }
    }

    // Return the list of collections as JSON
    echo json_encode($collections);
} else {
    // Handle directory not found
    http_response_code(500);
    echo json_encode(['error' => 'Directory not found']);
}
?>

