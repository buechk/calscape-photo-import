<?php
include_once('common.php');

function createNewPhotoRecord($mysqli, $photo, $response)
{
    global $newline;

    // Create arrays to hold column names and values
    $columnNames = [];
    $columnValues = [];

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
            // Escape and add the key to the column names array
            $columnNames[] = "`" . $mysqli->real_escape_string($key) . "`";

            // Check if the value is an array
            if (is_array($value)) {
                // If it's an array, convert it to a comma-separated string
                $value = implode(', ', array_map([$mysqli, 'real_escape_string'], $value));
            }

            // Escape and add the value to the column values array
            $columnValues[] = "'" . $mysqli->real_escape_string($value) . "'";
        }
    }

    // Check if there are any non-empty columns
    if (!empty($columnNames)) {
        // Join the column names and values into comma-separated strings
        $columnNamesString = implode(', ', $columnNames);
        $columnValuesString = implode(', ', $columnValues);

        $insertPhotoQuery = "INSERT INTO photo 
            ($columnNamesString) 
            VALUES 
            ($columnValuesString)";

        if ($mysqli->query($insertPhotoQuery) !== TRUE) {
            $response["success"] = false;
            $response["messages"][] = "Error: $insertPhotoQuery failed with error $newline $mysqli->error";
        } else {
            // Retrieve the ID of the last inserted row
            // Use $lastInsertedId for plant_photo relationship)
            $lastInsertedId = $mysqli->insert_id;
            return $lastInsertedId;
        }
    } else {
        // Handle the case where all columns are empty
        $response["success"] = false;
        $response["messages"][] = "Error: All column values for are empty. Photo id: " . $photo['id'];
    }
}

function  movePhotoFile($sourceFilePath, $destinationDirectory, $filename)
{
    $status = true;

    // check if file already exists in the destination directory
    if (!file_exists(($destinationDirectory . $$filename))) {
        if (file_exists($sourceFilePath)) { // verify source file exists before trying to move it
            if (moveFile($sourceFilePath, $destinationDirectory, $filename)) {
                $response["messages"][] = "File $sourceFilePath moved to $destinationDirectory";
            } else {
                $status = false;
                throw new Exception("Exception: Unable to move $sourceFilePath to $destinationDirectory");
            }
        } else {
            $status = false;
            throw new Exception("Exception: Unable to move $sourceFilePath to $destinationDirectory. $sourceFilePath does not exist");
        }
    }

    return $status;
}

function copyPhotoFiles($photo, $response)
{
    try {
        // copy photo file from collection staging to Calscape photo directory
        $filename = $photo['FileName'];
        $sourceFilePath = COLLECTION_PHOTOS_DIR . $filename;
        $destinationDirectory = BIG_IMAGES_DIR;

        if (copyFile($sourceFilePath, $destinationDirectory, $filename)) {
            $response["messages"][] = "File $sourceFilePath copied to $destinationDirectory";
        } else {
            $response["success"] = false;
            $response["messages"][] = "Failed to copy file $sourceFilePath to $destinationDirectory";
            return false;
        }

        // copy thumbnail file from collection staging to Calscape photo directory
        $thumbnailFile = $photo['thumbnail'];
        $th_sourceFilePath = COLLECTION_THUMBNAILS_DIR . $thumbnailFile;
        $th_destinationDirectory = PHOTOS_DIR;

        if (copyFile($th_sourceFilePath, $th_destinationDirectory, $thumbnailFile)) {
            $response["messages"][] = "Thumbnail file $sourceFilePath moved to $destinationDirectory";
        } else {
            $response["success"] = false;
            $response["messages"][] = "Failed to copy file $sourceFilePath to $destinationDirectory";
            return false;
        }
    } catch (Exception $e) {
        $response["success"] = false;
        $response["messages"][] = "Failed to copy files: $e.getMessage()";
        return false;
    }

    return true;
}

function updateDatabase($jsonData, $dbConfig)
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

    // Create a database connection
    $mysqli = new mysqli($dbConfig['hostname'], $dbConfig['username'], $dbConfig['password'], $dbConfig['database']);


    // Check the connection
    if ($mysqli->connect_error) {
        die(json_encode(["success" => false, "messages" => ["Connection failed: " . $mysqli->connect_error]]));
    }

    try {
        // Start a transaction
        $mysqli->begin_transaction();
        $response["messages"][] = "Transaction started";

        // Assuming $data contains the provided JSON data
        $data = json_decode($jsonData, true);

        // Extract values from the JSON data
        $collectionType = $data['collection-type'];
        $userID = $data['user_id'];
        $photos = $data['photos'];
        $collectionSpecies = $data['species'];
        $species = ($collectionType === 'species') ? $collectionSpecies : '';
        $plantID = null;
        if ($collectionType === 'species') {
            $plantID = getPlantID($species);
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

            // Get the existing photo order if it's an existing photo
            if ($isNew) {
                $newPhotoID = createNewPhotoRecord($mysqli, $photo, $response);
                if (!$newPhotoID) {
                    $response["messages"][] = "Failed to create a new photo record for photo with id $photoID";
                    $response["new_failed"][] = $photoID;
                    break;
                }

                // Create new plant_photo record to relate new photo with plant
                $plantPhotoValuesArray = array($plantID, $newPhotoID, $order, $order, 1, $userID);
                $plantPhotoValuesString = implode(', ', $plantPhotoValuesArray);

                // Create plant_photo record to relate plants record to photo record
                $insertPlantPhotoQuery = "INSERT INTO plant_photo 
                    (Plant_ID, Photo_ID, photo_order, order_previous, approved, user_id) 
                    VALUES ($plantPhotoValuesString)";

                $result = $mysqli->query($insertPlantPhotoQuery);
                // Check if the query was successful
                if ($result) {
                    $response["messages"][] = "Plant_photo record inserted linking plant $plantID with photo $newPhotoID";
                    copyPhotoFiles($photo, $response);
                    $response["new_succeeded"][] = $photoID;
                } else {
                    $response["success"] = false;
                    $response["messages"][] = "Error creating new plant_photo record for plant_ID $plantID, photo_ID $newPhotoID " . $mysqli->error;
                    $response["new_failed"][] = $photoID;
                    break;
                }
            } else { // existing photo
                // check if photo is from calphotos
                $isCalphoto = $photo['plant_photo_calphotos_order'] !== null;
                $existingPhotoOrder = $isCalphoto ? $photo['plant_photo_calphotos_order'] : $photo['plant_photo_order'];

                if ($order !== $existingPhotoOrder) {
                    if ($isCalphoto) {
                        // Update the plant_photo record
                        $updateQuery = "UPDATE plant_photo_calphotos 
                                            SET photo_order = ?, 
                                                order_previous = ? 
                                            WHERE plant_id = ? AND photo_id = ?";

                        $types = "iiis";
                    } else {
                        $updateQuery = "UPDATE plant_photo 
                            SET photo_order = ?, 
                                order_previous = ? 
                            WHERE Plant_ID = ? AND Photo_ID = ?";

                        $types = "iiii";
                    }

                    $stmt = $mysqli->prepare($updateQuery);

                    if ($stmt) {
                        // Bind parameters
                        $stmt->bind_param($types, $order, $existingPhotoOrder, $plantID, $photoID);

                        // Execute the query
                        if ($stmt->execute()) {
                            $response["messages"][] = $isCalphoto
                                ? "plant_photo_calphotos record updated. plant_id: $plantID, photo_id: $photoID"
                                : "plant_photo record updated. Plant_ID: $plantID, Photo_ID: $photoID";
                                $response["update_succeeded"][] = $photoID;
                        } else {
                            $response["success"] = false;
                            $response["messages"][] = "Error: Prepare statement failed: " . $stmt->error;
                            $response["update_failed"][] = $photoID;
                            break;
                        }

                        // Close the statement
                        $stmt->close();
                    } else {
                        $response["success"] = false;
                        $response["messages"][] = "Error in preparing query: " . $mysqli->error;
                        $response["update_failed"][] = $photoID;
                        break;
                    }
                }
            }
        }

        $mysqli->commit();
        $response["messages"][] = "Transaction committed!";
    } catch (Exception $e) {
        // An error occurred, rollback the transaction
        $mysqli->rollback();

        $response["success"] = false;
        $response["messages"][] = "Transaction failed: " . $e->getMessage();
    } finally {
        // Close the MySQL connection
        $mysqli->close();
        return $response;
    }
}

// Only execute the code if this script is not included but executed directly
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $response = updateDatabase(file_get_contents('php://input'), $dbConfig);

    // Send the JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
}
