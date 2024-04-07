<?php
include_once('common.php');

function createPackageDir($name)
{

    $packageDir = COLLECTIONS_EXPORTS . $name . "/";
    if (!file_exists($packageDir)) {
        if (!mkdir($packageDir, 0777, true)) {
            $response["success"] = false;
            $response["messages"][] = "Error: Unable to create package directory." . $packageDir;
            return false;
        }
    }

    return $packageDir;
}

function getFileHandle($filePath)
{
    // Check if the CSV file exists
    if (!file_exists($filePath)) {
        // Attempt to create the file
        $fileHandle = fopen($filePath, 'w');
        if (!$fileHandle) {
            // Unable to create the file
            $response["success"] = false;
            $response["messages"][] = "Error: Unable to create CSV file.";
            return false;
        }
    } elseif (!is_writable($filePath)) {
        $response["success"] = false;
        $response["messages"][] = "Error: CSV file is not writable.";
        return false;
    } else {
        // Open the CSV file for appending
        $fileHandle = fopen($filePath, 'a');
    }

    // Check if the CSV file could be opened
    if (!$fileHandle) {
        $response["success"] = false;
        $response["messages"][] = "Error: Failed to open CSV file for writing.";
        return false;
    }

    return $fileHandle;
}

function addNewCSVRow($exportPath, $fileName, $photo, $order, $plantID, $userID, $response)
{
    global $version;

    $csvFile = $exportPath . $fileName . '_new.csv';

    $fileHandle = getFileHandle($csvFile);

    // Create arrays to hold column names and values
    $columnNames = [];
    $columnValues = [];

    if ($version === "1.0") {
        // Add plant_photo_order and plant_id column and value if version is 2.0
        $columnNames[] = "photo_order";
        $columnValues[] = $order;

        $columnNames[] = "Plant_ID";
        $columnValues[] = $plantID;

        $columnNames[] = "user_id";
        $columnValues[] = $userID;
    } elseif ($version === "2.0") {
        // Add plant_photo_order and plant_id column and value if version is 2.0
        $columnNames[] = "plant_photo_order";
        $columnValues[] = $order;

        $columnNames[] = "plant_id";
        $columnValues[] = $plantID;
    }

    // Loop through each key in the photo object
    foreach ($photo as $key => $value) {
        // Skip the keys that don't have corresponding database columns
        if (
            $key !== 'id' &&
            $key !== 'sourceImage' &&
            $key !== 'selected-species' &&
            $key !== 'thumbnail' &&
            $value !== ""
        ) {
            // Add the key to the column names array
            $columnNames[] = $key;

            // Check if the value is an array
            if (is_array($value)) {
                // If it's an array, convert it to a comma-separated string
                $value = implode(', ', $value);
            }

            // Add the value to the column values array
            $columnValues[] = $value;
        }
    }

    // Write the column names as the header row if the CSV file is empty
    if (filesize($csvFile) === 0) {
        if (!fputcsv($fileHandle, $columnNames)) {
            $response["success"] = false;
            $response["messages"][] = "Error: Failed to write column names to _new CSV file.";
            fclose($fileHandle);
            return false;
        }
    }

    // Write the column values as a new row in the CSV file
    if (!fputcsv($fileHandle, $columnValues)) {
        $response["success"] = false;
        $response["messages"][] = "Error: Failed to write column values to _new CSV file.";
        fclose($fileHandle);
        return false;
    }

    // Close the file handle
    fclose($fileHandle);

    // Add success message to the response
    $response["new_succeeded"] = $photo["sourceImage"];
    return true;
}

function updateExistingCSVRow($exportPath, $fileName, $plantID, $photo_id, $order, $order_previous, $isCalphoto, $response)
{
    global $version;

    // Define the CSV file path
    $csvFile = $exportPath . $fileName . '_update.csv';

    $fileHandle = getFileHandle($csvFile);

    // Create arrays to hold column names and values
    $columnNames = [];
    $columnValues = [];

    if ($version === "1.0") {

        // Add plant_photo_order and plant_id column and value if version is 1.0
        $columnNames[] = "photo_order";
        $columnValues[] = $order;

        $columnNames[] = $isCalphoto ? "photo_id"  : "Photo_ID";
        $columnValues[] = $photo_id;

        $columnNames[] = $isCalphoto ? "plant_id"  : "Plant_ID";
        $columnValues[] = $plantID;

        $collectionName[] = "order_previous";
        $columnValues[] = $order_previous;

    } elseif ($version === "2.0") {
        // Add plant_photo_order and plant_id column and value if version is 2.0
        $columnNames[] = "plant_photo_order";
        $columnValues[] = $order;

        $columnNames[] = "ID";
        $columnValues[] = $photo_id;

        $columnNames[] = "plant_id";
        $columnValues[] = $plantID;
    }

    // Write the column names as the header row if the CSV file is empty
    if (filesize($csvFile) === 0) {
        if (!fputcsv($fileHandle, $columnNames)) {
            $response["success"] = false;
            $response["messages"][] = "Error: Failed to write column names to _new CSV file.";
            fclose($fileHandle);
            return false;
        }
    }

    // Write the column values as a new row in the CSV file
    if (!fputcsv($fileHandle, $columnValues)) {
        $response["success"] = false;
        $response["messages"][] = "Error: Failed to write column values to _new CSV file.";
        fclose($fileHandle);
        return false;
    }

    // Close the file handle
    fclose($fileHandle);

    // Add success photo_id
    $response["update_succeeded"][] = $photo_id;
    return true;
}

function addPhotoToPackage($packageDir, $photo, $response)
{
    global $version;

    try {
        $destinationDirectory = $packageDir . "photos/";

        // copy photo file from collection staging to photo directory
        $filename = $photo['FileName'];
        $sourceFilePath = COLLECTION_PHOTOS_DIR . $filename;

        if (copyFile($sourceFilePath, $destinationDirectory, $filename)) {
            $response["messages"][] = "File $sourceFilePath copied to $destinationDirectory";
        } else {
            $response["success"] = false;
            $response["messages"][] = "Failed to copy file $sourceFilePath to $destinationDirectory";
            return false;
        }

        if ($version === "1.0") {
            // copy thumbnail file from collection staging to thumbnail directory
            $th_destinationDirectory = $packageDir . "thumbnails/";

            $thumbnailFile = $photo['thumbnail'];
            $th_sourceFilePath = COLLECTION_THUMBNAILS_DIR . $thumbnailFile;

            if (copyFile($th_sourceFilePath, $th_destinationDirectory, $thumbnailFile)) {
                $response["messages"][] = "Thumbnail file $sourceFilePath moved to $destinationDirectory";
            } else {
                $response["success"] = false;
                $response["messages"][] = "Failed to copy file $sourceFilePath to $destinationDirectory";
                return false;
            }
        }
    } catch (Exception $e) {
        $response["success"] = false;
        $response["messages"][] = "Failed to copy files: $e.getMessage()";
        return false;
    }

    return true;
}

function createZipFromDirectory($sourceDir, $response)
{
    // Get parent directory of the source directory
    $parentDir = dirname($sourceDir);

    // Get the base name of the source directory
    $sourceDirName = basename($sourceDir);

    // Destination zip file
    $zipFile = $parentDir . '/' . $sourceDirName . '.zip';

    // Initialize ZipArchive object
    $zip = new ZipArchive();

    // Open zip file for writing
    if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
        // Create recursive directory iterator
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourceDir),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        // Iterate over each file in the directory
        foreach ($files as $name => $file) {
            // Skip directories (they will be added automatically)
            if (!$file->isDir()) {
                // Get real and relative path for current file
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($sourceDir));

                // Add current file to archive
                $zip->addFile($filePath, $relativePath);
            }
        }

        // Close and save the zip file
        $zip->close();

        $response["success"] = true;
        $response["messages"][] =  'Zip file created successfully.';

        return $zipFile;
    } else {
        $response["success"] = false;
        $response["messages"][] =  'Failed to create zip file.';
    }
}

function createPhotoZipPackage($jsonData)
{
    $response =
        [
            "success" => true,
            "messages" => [],
            "new_succeeded" => [],
            "new_failed" => [],
            "update_succeeded" => [],
            "update_failed" => []
        ];

    try {
        // Check if $jsonData is an array (coming from PHP unit test) and convert it to JSON string if needed
        if (is_array($jsonData)) {
            $jsonData = json_encode($jsonData);
        }

        // Decode JSON data
        $data = json_decode($jsonData, true);

        // Extract values from the JSON data
        $collectionName = $data['collection-name'];
        $collectionType = $data['collection-type'];
        $userID = $data['user_id'];
        $photos = $data['photos'];
        $collectionSpecies = $data['species'];
        $species = ($collectionType === 'species') ? $collectionSpecies : '';
        $plantID = null;
        if ($collectionType === 'species') {
            $plantID = getPlantID($species);
        }

        $uniqueID = uniqid();

        // Generate a unique filename based on property values
        $filenameRoot = str_replace(
            ' ',
            '_',
            sprintf(
                '%s_%s_%sn',
                $userID,
                $collectionName,
                $uniqueID
            )
        );

        // Create the package directory
        $packageDir = createPackageDir($filenameRoot);
        if (!$packageDir) {
            $response["success"] = false;
            $response["messages"][] = "Creation of package directory failed";
            throw new Exception();
        }

        $order = 0;

        foreach ($photos as $photo) {
            $order++;
            $photoID = $photo['id'];
            if ($collectionType === 'garden') {
                $species = $photo['selected-species'];
                $plantID = getPlantID($species);
            }

            // check if it's an existing or new photo
            $isNew = isset($photo['sourceImage']);

            if ($isNew) {
                if (!addNewCSVRow($packageDir, $filenameRoot, $photo, $order, $plantID, $userID, $response)) {
                    $response["messages"][] = "Failed to write a csv row for photo with id $photoID";
                    $response["new_failed"][] = $photoID;
                    throw new Exception();
                } else {
                    addPhotoToPackage($packageDir, $photo, $response);
                    $response["new_succeeded"][] = $photoID;
                }
            } else { // existing photo
                // check if photo is from calphotos
                $isCalphoto = isset($photo['plant_photo_calphotos_order']) && $photo['plant_photo_calphotos_order'] !== null;

                // Get the existing photo order, considering if it's from CalPhotos or not
                $existingPhotoOrder = $isCalphoto ? $photo['plant_photo_calphotos_order'] : $photo['plant_photo_order'];

                if ($order !== $existingPhotoOrder) {
                    if (updateExistingCSVRow($packageDir, $filenameRoot, $plantID, $photoID, $order, $existingPhotoOrder, $isCalphoto, $response)) {
                    } else {
                        $response["success"] = false;
                        $response["update_failed"][] = $photoID;
                        throw new Exception();
                    }
                }
            }
        }
        // Generate and save the zip file
        $zipFilePath = createZipFromDirectory($packageDir, $response);

        // Send JSON response with file download relative URL or success status
        if ($zipFilePath) {
            $zipFileName = basename($zipFilePath);
            $response["download_url"] = COLLECTIONS_EXPORTS . $zipFileName; 
            $response["success"] = true;
            $response["messages"][] = "Download package created!";
        } else {
            $response["success"] = false;
            $response["messages"][] = "Failed to create download package!";
        }

        return $response;

    } catch (Exception $e) {
        $response["success"] = false;
        $response["messages"][] = "Download package creation failed: " . $e->getMessage();
    }
}

// Only execute the code if this script is not included but executed directly
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $response = createPhotoZipPackage(file_get_contents('php://input'), $dbConfig);

    // Send the JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
}
