<?php
include_once(dirname(dirname(__FILE__)).'/php/common.php');

// Check if a file was uploaded
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {

    // Generate a unique filename to prevent overwriting
    $rootname = $_POST['rootname'];
    $path_parts = pathinfo($_FILES['file']['name']);
    $fileExtension = $path_parts['extension'];
    $filename = str_replace(' ', '_',$rootname) . '_' . uniqid() . '.' . $fileExtension;
    $targetPath = $uploadDirectory . $filename;

    // Ensure the target directory exists
    if (!file_exists($uploadDirectory)) {
        mkdir($uploadDirectory, 0777, true);
    }

    // Move the uploaded file to the server
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        // Upload successful
        $response = [
            'success' => true,
            'message' => 'File uploaded successfully',
            'filename' => $filename,
        ];
    } else {
        // Upload failed
        $response = [
            'success' => false,
            'message' => 'Failed to move the file to the server',
        ];
    }
} else {
    // No file uploaded or an error occurred
    $response = [
        'success' => false,
        'message' => 'No file uploaded or an error occurred',
    ];
}

header('Content-Type: application/json');
echo json_encode($response);
