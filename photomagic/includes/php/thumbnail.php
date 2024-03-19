<?php
include_once('common.php');

// Assuming $fileName is the image file name
$fileName = isset($_GET['fileName']) ? $_GET['fileName'] : null;
$fileType = isset($_GET['fileType']) ? $_GET['fileType'] : null;

switch ($fileType) {
    case FILETYPE_CALSCAPE_PHOTO:
        $rootPath = CALSCAPE2_ALL_IMAGES_DIR;
        $rootPath2 = BIG_IMAGES_DIR;
        $rootPath3 = CALSCAPE2_CALPHOTOS_DIR;
        break;
    case FILETYPE_CALSCAPE_THUMBNAIL:
        $rootPath = THUMBNAILS_DIR;
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

// Check if $fileName is set
if ($fileName) {
    $filePath = $rootPath . $fileName;

    // Check if the file exists in $rootPath
    if (file_exists($filePath)) {
        // Load the image from $rootPath
        $image = imagecreatefromjpeg($filePath);

    } elseif (isset($rootPath2)) { // Check if $rootPath2 is defined
        $filePath2 = $rootPath2 . $fileName;
        if (file_exists($filePath2)) {
            // Load the image from $rootPath2
            $image = imagecreatefromjpeg($filePath2);
        }
    } elseif (isset($rootPath3)) { // Check if $rootPath3 is defined
        $filePath3 = $rootPath3 . $fileName;
        if (file_exists($filePath3)) {
            // Load the image from $rootPath3
            $image = imagecreatefromjpeg($filePath3);
        }
    }

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
