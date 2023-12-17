<?php

function updateDatabase($jsonData)
{
    include_once(dirname(dirname(__FILE__)) . '/php/common.php');

    // Create a database connection
    $mysqli = new mysqli($hostname, $username, $password, $database);

    // Check the connection
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    try {
        // Start a transaction
        $mysqli->begin_transaction();
        echo "Transaction started{$newline}";

        // Assuming $data contains the provided JSON data
        $data = json_decode($jsonData, true);

        $species = '';

        // Extract values from the JSON data
        $collectionName = $mysqli->real_escape_string($data['collection-name']);
        $collectionType = $mysqli->real_escape_string($data['collection-type']);
        $collectionSpecies = $mysqli->real_escape_string($data['collection-species']);
        if ($collectionType === 'species') {
            $species = $collectionSpecies;
        }
        $userID = $mysqli->real_escape_string($data['user_id']);

        $photos = $data['photos'];
        $order = 0;

        // Insert photo data into the photo table
        foreach ($photos as $photo) {
            $id = $mysqli->real_escape_string($photo['id']);
            $order++;
            // Create arrays to hold column names and values
            $columnNames = [];
            $columnValues = [];

            // Loop through each key in the photo object
            foreach ($photo as $key => $value) {
                if ($key === 'selected-species' && $species === '') {
                    $species = $mysqli->real_escape_string($value);
                }
                // Skip the keys that don't have corresponsing database columns
                if ($key !== 'id' && $key !== 'sourceImage' && $key !== 'selected-species') {
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

            // Join the column names and values into comma-separated strings
            $columnNamesString = implode(', ', $columnNames);
            $columnValuesString = implode(', ', $columnValues);

            $insertPhotoQuery = "INSERT INTO photo 
                ($columnNamesString) 
                VALUES 
                ($columnValuesString)";

            if ($mysqli->query($insertPhotoQuery) !== TRUE) {
                echo "Error: " . $insertPhotoQuery . "{$newline}" . $mysqli->error . "{$newline}";
            } else {
                // Retrieve the ID of the last inserted row
                // Use $lastInsertedId for plant_photo relationship)
                $lastInsertedId = $mysqli->insert_id;
                echo "New photo record inserted. ID: " . $lastInsertedId . "{$newline}";

                // Get the plant ID for the given species
                $plantQuery = "select ID from plants where species = " . "'" . $species . "'";
                $result = $mysqli->query($plantQuery);

                // Check if the query was successful
                if ($result) {
                    $row = $result->fetch_assoc();

                    // Check if a row was found
                    if ($row) {
                        $plantID = $row["ID"];
                    } else {
                        // Handle the case when no row is found
                        echo json_encode(["error" => "No plants row found for the given species."]);
                    }
                } else {
                    // Handle the case when the query is not successful
                    echo json_encode(["error" => "Error executing query: " . $conn->error]);
                }

                // 
                /* plant_photo table columns
            Plant_ID
            Photo_ID
            photo_order
            order_previous
            approved
            user_id
            date (auto generated)
            deleted (defaults to 0)     
            */
                $plantPhotoValuesArray = array($plantID, $lastInsertedId, $order, $order, 1, $userID);
                $plantPhotoValuesString = implode(', ', $plantPhotoValuesArray);

                // Create plant_photo record to relate plants record to photo record
                $insertPlantPhotoQuery = "INSERT INTO plant_photo 
            (Plant_ID, Photo_ID, photo_order, order_previous, approved, user_id) 
            VALUES ($plantPhotoValuesString)";

                $result = $mysqli->query($insertPlantPhotoQuery);
                // Check if the query was successful
                if ($result) {
                    // The insertion was successful
                    echo "Plant_photo record inserted linking plant ". $plantID . " with photo " . $lastInsertedId  . "{$newline}";
                } else {
                    // The insertion failed
                    echo "Error: " . $mysqli->error  . "{$newline}";
                }
            }
        }
        // Commit the transaction
        $mysqli->commit();

        echo "Transaction committed!"  . "{$newline}";

    } catch (Exception $e) {
        // An error occurred, rollback the transaction
        $mysqli->rollback();

        echo "Transaction failed: " . $e->getMessage() . "{$newline}";
    } finally {
        // Close the MySQL connection
        $mysqli->close();
    }
}

// Only execute the code if this script is not included but executed directly
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    updateDatabase(file_get_contents('php://input'));
}
