<?php
include_once(dirname(dirname(__FILE__)) . '/php/common.php');

// Assuming $fileName is the image file name
$fileName = isset($_GET['fileName']) ? $_GET['fileName'] : null;

// Check if $fileName is set
if ($fileName) {
    $filePath = PHOTOS_DIR . $fileName;

    // Load the image
    $image = imagecreatefromjpeg($filePath);

    // Output the thumbnail
    header('Content-Type: image/jpeg');
    imagejpeg($image);

    // Clean up resources
    imagedestroy($image);
    imagedestroy($thumbnail);
} else {
    // Handle the case where $fileName is not set
    header('HTTP/1.1 400 Bad Request');
    echo 'File name not provided';
}
