<?php
include_once(dirname(dirname(__FILE__)) . '/php/common.php');

function generateThumbnail($sourcePath, $targetPath, $width, $height)
{
    list($originalWidth, $originalHeight) = getimagesize($sourcePath);

    $image = imagecreatefromstring(file_get_contents($sourcePath));
    $thumbnail = imagecreatetruecolor($width, $height);

    imagecopyresampled($thumbnail, $image, 0, 0, 0, 0, $width, $height, $originalWidth, $originalHeight);

    imagejpeg($thumbnail, $targetPath, 100); // Adjust quality as needed

    imagedestroy($image);
    imagedestroy($thumbnail);
}

// Check if a file was uploaded
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    // Generate a unique filename to prevent overwriting
    $rootname = $_POST['rootname'];
    $path_parts = pathinfo($_FILES['file']['name']);
    $fileExtension = $path_parts['extension'];
    $filename = str_replace(' ', '_', $rootname) . '_' . uniqid() . '.' . $fileExtension;
    $targetPath = BIG_IMAGES_DIR . $filename;
    $thumbnailFile = 'thumbnail_' . $filename;
    $thumbnailPath = PHOTOS_DIR . $thumbnailFile; // Adjust thumbnail prefix as needed

    // Ensure the target directories exists
    if (!file_exists(BIG_IMAGES_DIR)) {
        mkdir(BIG_IMAGES_DIR, 0777, true);
    }

    // Ensure the target directories exists
    if (!file_exists(PHOTOS_DIR)) {
        mkdir(PHOTOS_DIR, 0777, true);
    }

    // Move the uploaded file to the server
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        // Generate and save thumbnail
        generateThumbnail($targetPath, $thumbnailPath, 150, 150); // Adjust thumbnail size as needed

        // Upload successful
        $response = [
            'success' => true,
            'message' => 'File uploaded successfully',
            'filename' => $filename,
            'thumbnail' => $thumbnailFile,
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
