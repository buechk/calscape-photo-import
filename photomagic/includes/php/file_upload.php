<?php
include_once('common.php');

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

/*
function makeThumbnail($in, $out) {
    $width = THUMBNAIL_WIDTH;
    $height = THUMBNAIL_HEIGHT;
    list($w,$h) = getimagesize($in);

    $thumbRatio = $width/$height;
    $inRatio = $w/$h;
    $isLandscape = $inRatio > $thumbRatio;

    $size = ($isLandscape ? '1000x'.$height : $width.'x1000');
    $xoff = ($isLandscape ? floor((($inRatio*$height)-$width)/2) : 0);
    $command = MAGICK_PATH."convert $in -resize $size -crop {$width}x{$height}+{$xoff}+0 ".
        "-colorspace RGB -strip -quality 90 $out";

    exec($command);
}
*/

// Check if a file was uploaded
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    // Generate a unique filename to prevent overwriting
    $rootname = $_POST['rootname'];
    $path_parts = pathinfo($_FILES['file']['name']);
    $fileExtension = $path_parts['extension'];
    $filename = str_replace(array(' ', "'"), array('_', ''), $rootname) . '_' . uniqid() . '.' . $fileExtension;
    $targetPath = COLLECTION_PHOTOS_DIR . $filename;
    $thumbnailFile = 'thumbnail_' . $filename;
    $thumbnailPath = COLLECTION_THUMBNAILS_DIR . $thumbnailFile; // Adjust thumbnail prefix as needed

    // Ensure the target directories exists
    if (!file_exists(COLLECTION_PHOTOS_DIR)) {
        mkdir(COLLECTION_PHOTOS_DIR, 0777, true);
    }

    // Ensure the target directories exists
    if (!file_exists(COLLECTION_THUMBNAILS_DIR)) {
        mkdir(COLLECTION_THUMBNAILS_DIR, 0777, true);
    }

    // Move the uploaded file to the server
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        // Generate and save thumbnail
        generateThumbnail($targetPath, $thumbnailPath, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT); // Adjust thumbnail size as needed

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
