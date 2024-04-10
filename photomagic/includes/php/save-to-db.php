<?php
include_once('common.php');

function createNewPhotoRecord($mysqli, $photo, $response, $order, $plantID)
{
    global $newline;
    global $version;

    // Create arrays to hold column names and values
    $columnNames = [];
    $columnValues = [];

    // Check if the version is 2.0
    if ($version === "2.0") {
        // Add plant_photo_order and plant_id column and value if version is 2.0
        $columnNames[] = "`plant_photo_order`";
        $columnValues[] = "'" . $mysqli->real_escape_string($order) . "'";
        
        $columnNames[] = "`plant_id`";
        $columnValues[] = "'" . $mysqli->real_escape_string($plantID) . "'";
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

        $insertPhotoQuery = "INSERT INTO " . TABLE_PHOTO .
            "($columnNamesString) 
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
    global $version;

    try {
        // copy photo file from collection staging to Calscape photo directory
        $filename = $photo['FileName'];
        $sourceFilePath = COLLECTION_PHOTOS_DIR . $filename;

        // destination directory depends on which version of Calscape
        if ($version === "2.0") {
            $destinationDirectory = BIG_IMAGES_DIR;
        } elseif ($version === "1.0") {
            $destinationDirectory = CALSCAPE2_ALL_IMAGES_DIR;
        } else {
            // unknown calscape version
            $response["success"] = false;
            $response["messages"][] = "Failed to copy file $sourceFilePath due to unknown Calscape version";
            return false;
        }

        if (copyFile($sourceFilePath, $destinationDirectory, $filename)) {
            $response["messages"][] = "File $sourceFilePath copied to $destinationDirectory";
        } else {
            $response["success"] = false;
            $response["messages"][] = "Failed to copy file $sourceFilePath to $destinationDirectory";
            return false;
        }

        if ($version === "1.0") {
            // copy thumbnail file from collection staging to Calscape photo directory
            $thumbnailFile = $photo['thumbnail'];
            $th_sourceFilePath = COLLECTION_THUMBNAILS_DIR . $thumbnailFile;
            $th_destinationDirectory = THUMBNAILS_DIR;

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

function getStartingOrder($plantID) {
    global $dbManager;
    global $version;
    $startingPhotoOrder = 1;
    if ($plantID === '' || $plantID === null) {
        return $startingPhotoOrder;
    }

    try {
        if ($version === "1.0") {
            $query = "SELECT
            COALESCE(
                (SELECT MIN(plant_photo.photo_order)
                FROM plant_photo
                WHERE plant_photo.Plant_ID = ?),
                (SELECT MIN(plant_photo_calphotos.photo_order)
                FROM plant_photo_calphotos
                WHERE plant_photo_calphotos.plant_id = ?)
                ) AS min_photo_order";

            $params = ['ii', $plantID, $plantID];
        }
        else if ($version === "2.0") {
            $query = "SELECT MIN(plant_images.plant_photo_order) AS min_photo_order from plant_images 
            where plant_id = ?";

            $params = ['i', $plantID];
        }
        else {
            // assume 1
            return $startingPhotoOrder;
        }

        $result = $dbManager->executeQuery($query, $params);

        // Check if the query was successful
        if ($result) {
            $row = $result->fetch_assoc();

            // Check if a row was found
            if ($row) {
                $startingPhotoOrder = $row["min_photo_order"];
            } else {
                // Handle the case where no photos are found for the plant
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

    return $startingPhotoOrder;
}

function updateDatabase($jsonData, $dbConfig)
{
    global $version;

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
                $newPhotoID = createNewPhotoRecord($mysqli, $photo, $response, $order, $plantID);
                if (!$newPhotoID) {
                    $response["messages"][] = "Failed to create a new photo record for photo with id $photoID";
                    $response["new_failed"][] = $photoID;
                    break;
                }
                else {
                    $response["messages"][] = "Plant_images record $newPhotoID created for $plantID";
                    copyPhotoFiles($photo, $response);
                    $response["new_succeeded"][] = $photoID;
                }

                if ($version === "1.0") {
                    // Create new plant_photo record to relate new photo with plant
                    $insertPlantPhotoQuery = "INSERT INTO plant_photo 
                        (Plant_ID, Photo_ID, photo_order, order_previous, user_id) 
                        VALUES (?, ?, ?, ?, ?)";

                    // Prepare the statement
                    $stmt = $mysqli->prepare($insertPlantPhotoQuery);

                    // Check if the preparation succeeded
                    if ($stmt) {
                        // Bind parameters
                        $stmt->bind_param("iiiii", $plantID, $newPhotoID, $order, $order, $userID);

                        // Execute the query
                        $result = $stmt->execute();

                        // Check if the query was successful
                        if ($result) {
                            $response["messages"][] = "Plant_photo record inserted linking plant $plantID with photo $newPhotoID";
                        } else {
                            $response["success"] = false;
                            $response["messages"][] = "Error creating new plant_photo record for plant_ID $plantID, photo_ID $newPhotoID " . $mysqli->error;
                            $response["new_failed"][] = $photoID;
                            break;
                        }

                        // Close the statement
                        $stmt->close();
                    } else {
                        // Handle the case where the statement preparation failed
                        $response["success"] = false;
                        $response["messages"][] = "Error preparing statement: " . $mysqli->error;
                    }
                }
            } else { // existing photo
                // check if photo is from calphotos
                $isCalphoto = isset($photo['plant_photo_calphotos_order']) && $photo['plant_photo_calphotos_order'] !== null;

                // Get the existing photo order, considering if it's from CalPhotos or not
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
                        if ($version === "1.0") {
                            $updateQuery = "UPDATE plant_photo 
                            SET photo_order = ?, 
                                order_previous = ? 
                            WHERE Plant_ID = ? AND Photo_ID = ?";

                            $types = "iiii";

                        } elseif ($version === "2.0") {
                            $updateQuery = "UPDATE plant_images 
                            SET plant_photo_order = ?
                            WHERE id = ?";

                            $types = "ii";
                        }
                        else {
                            // unknown calscape version
                            $response["success"] = false;
                            $response["messages"][] = "Failed to update photo order due to unknown Calscape version";
                            break;
                        }
                    }

                    $stmt = $mysqli->prepare($updateQuery);

                    if ($stmt) {
                        // Bind parameters
                        if ($version === "1.0") {
                            $stmt->bind_param($types, $order, $existingPhotoOrder, $plantID, $photoID);
                        }
                        elseif ($version === "2.0") {
                            $stmt->bind_param($types, $order, $photoID);                            
                        }
                        else {
                            // unknown calscape version
                            $response["success"] = false;
                            $response["messages"][] = "Failed to update photo order due to unknown Calscape version";
                            break;
                        }

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
