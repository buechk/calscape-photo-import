<?php
include_once('DatabaseManager.php');

// Database connection parameters
$hostname = "localhost:3306";
$username = "root";
$password = "Edw8rdpm!";
$database = "calsca6_calscape";

$dbManager = new DatabaseManager($hostname, $username, $password, $database);

// File upload
define('ALL_IMAGES_DIR', '../../public/ExtData/allimages/');
define('BIG_IMAGES_DIR', ALL_IMAGES_DIR . '900/');
define('PHOTOS_DIR', ALL_IMAGES_DIR . 'Photos/');

// Thumbnail Dimension
//define('THUMBNAIL_WIDTH', 90);
//define('THUMBNAIL_HEIGHT', 70);
define('THUMBNAIL_WIDTH', 150);
define('THUMBNAIL_HEIGHT', 150);

// Collection directory
$collectionReviewDirectory = '../../public/ExtData/collections/review/';

// Query to get all species
$speciesquery = "SELECT species FROM plants WHERE disabled = 0 and is_biozone = 0 ORDER BY species";

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