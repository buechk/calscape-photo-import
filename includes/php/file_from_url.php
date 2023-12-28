<?php
include_once(dirname(dirname(__FILE__)) . '/php/common.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the URL of the JPEG file from the POST request
    $imageUrl = $_POST['url'];
    $rootname = $_POST['rootname'];
    $pathParts = pathinfo($imageUrl);
    $filename = str_replace(' ', '_', $rootname)  . '_' . $pathParts['filename'] . '.' .  $pathParts['extension']; 

    // Construct the local file path, replace blanks with underscores
    $localFilePath = str_replace(' ', '_', $uploadDirectory . $filename);

    // Download the file from the URL
    $imageData = file_get_contents($imageUrl);

    // Ensure the target directory exists
    if (!file_exists($uploadDirectory)) {
        mkdir($uploadDirectory, 0777, true);
    }

    if ($imageData !== false) {
        // Save the downloaded data to a local file
        if (file_put_contents($localFilePath, $imageData) !== false) {
            $response = [
                'success' => true,
                'message' => 'File retrieved successfully',
                'filename' => $filename,
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to retrieve the file',
            ];
        }
    } else {
        // No file uploaded or an error occurred
        $response = [
            'success' => false,
            'message' => 'No file uploaded or an error occurred',
        ];
    }
} else {
    echo "Invalid request method.";
}

header('Content-Type: application/json');
echo json_encode($response);
