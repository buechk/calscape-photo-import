<?php
include_once(dirname(dirname(__FILE__)) . '/php/common.php');

// Assuming $fileName is the image file name
$fileName = isset($_GET['fileName']) ? $_GET['fileName'] : null;
$fileType = isset($_GET['fileType']) ? $_GET['fileType'] : null;

switch ($fileType) {
    case FILETYPE_CALSCAPE_PHOTO:
        $rootPath = BIG_IMAGES_DIR;
        break;
    case FILETYPE_CALSCAPE_THUMBNAIL:
        $rootPath = PHOTOS_DIR;
        break;
    case FILETYPE_COLLECTION_PHOTO:
        $rootPath = COLLECTION_PHOTOS_DIR;
        break;
    case FILETYPE_COLLECTION_THUMBNAIL:
        $rootPath = COLLECTION_THUMBNAILS_DIR;
        break;
    default:
        $rootPath = '';
        break;
}
$rootPath = ($fileType === FILETYPE_CALSCAPE_PHOTO) ? BIG_IMAGES_DIR : COLLECTION_THUMBNAILS_DIR;

// Check if $fileName is set
if ($fileName) {
    $filePath = $rootPath . $fileName;

    // Load the image
    $image = imagecreatefromjpeg($filePath);

    // Output the thumbnail
    header('Content-Type: image/jpeg');
    imagejpeg($image);

    // Clean up resources
    imagedestroy($image);
} else {
    // Handle the case where $fileName is not set
    header('HTTP/1.1 400 Bad Request');
    echo 'File name not provided';
}
