<?php
include_once(dirname(dirname(__FILE__)) . '/php/common.php');

function saveFile($rootname, $uploaddirectory, $imageUrl) {
    $pathParts = pathinfo($imageUrl);
    $filename = str_replace(' ', '_', $rootname)  . '_' . $pathParts['filename'] . '.' .  $pathParts['extension'];

    // Construct the local file path, replace blanks with underscores
    $localFilePath = str_replace(' ', '_', $uploaddirectory . $filename);

    // Download the file from the URL
    $imageData = file_get_contents($imageUrl);

    // Ensure the target directory exists
    if (!file_exists($uploaddirectory)) {
        mkdir($uploaddirectory, 0777, true);
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

    return $response;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the URL of the JPEG file from the POST request
    $imageUrl = $_POST['url'];
    $imageThumbnail = $_POST['thumbnail'];
    $rootname = $_POST['rootname'];

    // Save the original image
    $responseOriginal = saveFile($rootname, COLLECTION_PHOTOS_DIR, $imageUrl);

    // Save the thumbnail image only if the original image was saved successfully
    if ($responseOriginal['success'] === true) {
        $responseThumbnail = saveFile($rootname, COLLECTION_THUMBNAILS_DIR, $imageThumbnail);

        // Combine responses and return
        $combinedResponse = [
            'success' => $responseOriginal['success'] && $responseThumbnail['success'],
            'messages' => [
                $responseOriginal['message'],
                $responseThumbnail['message']
            ],
            'filename' => $responseOriginal['filename'],
            'thumbnail' => $responseThumbnail['filename']
        ];

        header('Content-Type: application/json');
        echo json_encode($combinedResponse);
        exit(); // Stop further execution
        
    } else {
        // If the original image was not saved successfully, return its response
        header('Content-Type: application/json');
        echo json_encode($responseOriginal);
        exit(); // Stop further execution
    }
} else {
    echo "Invalid request method.";
}
?>