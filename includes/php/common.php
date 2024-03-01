<?php
include_once('config.php');
include_once('DatabaseManager.php');

try {
    $dbManager = new DatabaseManager($dbConfig);
}
catch (Exception $e) {
    die("Unable to access the database: " . $e->getMessage());
}

// Function to get the Calscape version dynamically
function getCalscapeVersion()
{
    global $dbManager;

    // Check if the table plant_images exists
    $query = "SHOW TABLES LIKE 'plant_images'";
    $result = $dbManager->executeQuery($query, []);

    // If the table exists, it's Calscape version 2.0, otherwise 1.0
    $calscapeVersion = ($result->num_rows > 0) ? '2.0' : '1.0';

    return $calscapeVersion;
}

// Collection directories
define('COLLECTIONS_ROOT', '../../public/ExtData/collections/');
define('COLLECTIONS_REVIEW_DIR', COLLECTIONS_ROOT . 'review/');
define('COLLECTION_PHOTOS_DIR', COLLECTIONS_ROOT . 'photos/');
define('COLLECTION_THUMBNAILS_DIR', COLLECTIONS_ROOT . 'thumbnails/');

// Thumbnail Dimension
//define('THUMBNAIL_WIDTH', 90);
//define('THUMBNAIL_HEIGHT', 70);
define('THUMBNAIL_WIDTH', 150);
define('THUMBNAIL_HEIGHT', 150);

define('FILETYPE_CALSCAPE_PHOTO', 'calscape-photo');
define('FILETYPE_CALSCAPE_THUMBNAIL', 'calscape-thumbnail');
define('FILETYPE_COLLECTION_PHOTO', 'collection-photo');
define('FILETYPE_COLLECTION_THUMBNAIL', 'collection-thumbail');

$version = getCalscapeVersion();

if ($version === '1.0') {
    define('TABLE_PLANTS', 'plants');
}
else if ($version === '2.0') {
    define('TABLE_PLANTS', 'leg_plants');
}

$newline = (php_sapi_name() === 'cli') ? PHP_EOL : '<br>';

function resizedCoor($imgWidth, $imgHeight, $targetWidth = THUMBNAIL_WIDTH, $targetHeight = THUMBNAIL_HEIGHT, $crop = false)
{
    $newWidth = $targetWidth;
    $newHeight = $targetHeight;

    if ($imgWidth > 0 && $imgHeight > 0) {
        $newWidth = $imgWidth;
        $newHeight = $imgHeight;
    }

    $w_percent = $imgWidth / $targetWidth;
    $h_percent = $imgHeight / $targetHeight;
    $offsetLeft = $offsetTop = 0;

    if ($crop) {
        if ($w_percent <= $h_percent) {

            $newWidth = $targetWidth;
            $newHeight = ceil($imgHeight * $newWidth / $imgWidth);

            if ($newHeight > $targetHeight) {
                $offsetTop = ($newHeight - $targetHeight) / 2;
                $offsetTop = ceil($offsetTop * $imgWidth / $newWidth);
                $newHeight = $targetHeight;
            }
        } else {
            $newHeight = $targetHeight;
            $newWidth = ceil($imgWidth * $newHeight / $imgHeight);

            if ($newWidth > $targetWidth) {
                $offsetLeft =  ($newWidth - $targetWidth) / 2;
                $offsetLeft = ceil($offsetLeft * $imgHeight / $newHeight);
                $newWidth = $targetWidth;
            }
        }
    } else {
        if ($w_percent >= $h_percent) {
            $newHeight = ceil($newHeight  * $targetWidth  / $newWidth);
            $newWidth = $targetWidth;
        } else {
            $newWidth = ceil($newWidth * $targetHeight / $newHeight);
            $newHeight = $targetHeight;
        }
    }

    return array('width' => intval($newWidth), 'height' => intval($newHeight), 'left' => $offsetLeft, 'top' => $offsetTop);
}

function createThumbnail(
    $sourcePath,
    $thumbnailFile,
    $width = THUMBNAIL_WIDTH,
    $height = THUMBNAIL_HEIGHT,
    $crop = false,
    $saveToFile = true,
    $maintainSize = false
) {

    if (file_exists($sourcePath)) {

        if (file_exists($thumbnailFile) && $saveToFile) {
            list($imgWidth, $imgHeight) = getimagesize($sourcePath);
            $createNewThumbfile = false;
            if ($crop) {
                $createNewThumbfile = ($imgWidth != $width || $imgHeight != $height);
            } else {
                $createNewThumbfile = ($imgWidth == $width && $imgHeight == $height);
            }

            if ($createNewThumbfile)
                unlink($sourcePath);
            else
                return $sourcePath;
        }

        $imgInfo = getimagesize($sourcePath);
        list($imgWidth, $imgHeight) =  $imgInfo;

        $source = @imagecreatefromjpeg($sourcePath);

        if (!$source) return ($saveToFile ? '' : false);

        if ($crop && $maintainSize) {
            $temp = array(
                'width' => $width,
                'height' => $height,
                'left' => intval(($imgWidth - $width) / 2),
                'top' => intval(($imgHeight - $height) / 2)
            );
        } else {
            $temp = resizedCoor($imgWidth, $imgHeight, $width, $height, $crop);
        }

        $width = $temp['width'];
        $height = $temp['height'];
        $left = intval($temp['left']);
        $top = intval($temp['top']);

        $thumb = imagecreatetruecolor($width, $height);
        if (!$thumb) return ($saveToFile ? '' : false);

        if ($crop && $maintainSize) {
        } else {
            $left += 20;
            $top += 20;
        }

        if (!imagecopyresampled(
            $thumb,
            $source,
            0,
            0,
            $left,
            $top,
            $width,
            $height,
            $imgWidth - ($crop ? 2 * $left : 0),
            $imgHeight - ($crop ? 2 * $top : 0)
        )) {
            if (!$source instanceof GdImage) {
                // Handle the case where image creation failed
                return ($saveToFile ? '' : false);
            }
        }

        if ($saveToFile) {
            $bln = imagejpeg($thumb, $thumbnailFile, 100);
        } else {
            $bln = imagejpeg($thumb, null, 100);
        }

        if ($source instanceof GdImage) {
            imagedestroy($source);

            if ($saveToFile)
                return $thumbnailFile;
            else
                return $bln;
        }
        return ($saveToFile ? '' : false);
    }
}

function getPlantID($species)
{
    include_once('config.php');

    $plantID = '';

    global $dbManager;

    try {
        // Get the ID for a species from the plants table
        $query = "SELECT ID FROM plants WHERE species = ?";
        $params = ['s', $species];

        $result = $dbManager->executeQuery($query, $params);

        // Check if the query was successful
        if ($result) {
            $row = $result->fetch_assoc();

            // Check if a row was found
            if ($row) {
                $plantID = $row["ID"];
            } else {
                // Handle the case where no row is returned (plant not found)
                throw new Exception("Plant not found for species: $species");
            }
        } else {
            // Handle the case where the query failed
            throw new Exception("Error in query: $query");
        }
    } catch (Exception $e) {
        throw $e;
    } finally {
        $dbManager->closeConnection();
    }

    return $plantID === '' ? false : $plantID;
}

function moveFile($sourceFilePath, $destinationDirectory, $destinationFileName)
{
    // Ensure the destination directory exists
    if (!file_exists($destinationDirectory)) {
        mkdir($destinationDirectory, 0777, true);
    }

    $destinationFilePath = $destinationDirectory . $destinationFileName;

    // Move the file
    if (rename($sourceFilePath, $destinationFilePath)) {
        return true;
    } else {
        return false;
    }
}

function copyFile($sourceFilePath, $destinationDirectory, $destinationFileName)
{
    // Ensure the destination directory exists
    if (!file_exists($destinationDirectory)) {
        mkdir($destinationDirectory, 0777, true);
    }

    $destinationFilePath = $destinationDirectory . $destinationFileName;

    // Copy the file
    if (copy($sourceFilePath, $destinationFilePath)) {
        return true;
    } else {
        return false;
    }
}
