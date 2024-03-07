<?php
include_once('common.php');

function getPlantPhotosParams($plantID)
{
    global $version;

    if ($version === '1.0') {
        return ['ii', $plantID, $plantID];

    } else if ($version === '2.0') {
        return ['i', $plantID];

    } else {
        throw new Exception("Unknown Calscape database version");
    }
}

function getPlantPhotosQuery()
{
    global $version;

    if ($version === '1.0') {
        return "SELECT
                    plants.ID,
                    photo.ID AS photo_id,
                    photo.FileName,
                    photo.ImageDescription AS Copyright,
                    photo.CopyrightNotice,
                    photo.Artist as Artist,
                    photo.CaptionTitle,
                    photo.CaptionDescription,
                    plant_photo.photo_order AS plant_photo_order,
                    NULL AS plant_photo_calphotos_order
                FROM plants
                INNER JOIN plant_photo ON plants.ID = plant_photo.Plant_ID
                INNER JOIN photo ON plant_photo.Photo_ID = photo.ID
                WHERE plants.ID = ? AND plant_photo.deleted = 0 AND photo.FileName IS NOT null AND photo.FileName != ''
                UNION ALL
                SELECT
                    plants.ID,
                    plant_photo_calphotos.photo_id,
                    plant_photo_calphotos.image AS FileName,
                    plant_photo_calphotos.copyright AS Copyright,
                    plant_photo_calphotos.copyright_full as ImageDescription,
                    plant_photo_calphotos.author as Artist,
                    null AS CaptionTitle,
                    null AS CaptionDescription,
                    NULL AS plant_photo_order,
                    plant_photo_calphotos.photo_order AS plant_photo_calphotos_order
                FROM plants
                INNER JOIN plant_photo_calphotos ON plants.ID = plant_photo_calphotos.plant_id
                WHERE plants.ID = ? AND plant_photo_calphotos.deleted = 0 AND plant_photo_calphotos.image IS NOT null AND plant_photo_calphotos.image != ''
                ORDER BY COALESCE(plant_photo_order, plant_photo_calphotos_order)";
    } else if ($version === '2.0') {
        return "SELECT
                    leg_plants.ID,
                    plant_images.id, 
                    plant_images.FileName,
                    plant_images.ImageDescription,
                    plant_images.CopyrightNotice as Copyright,
                    plant_images.Artist,
                    plant_images.plant_photo_order 
                FROM plant_images
                INNER JOIN leg_plants ON leg_plants.ID = plant_images.Plant_ID
                WHERE leg_plants.ID = ? AND plant_images.FileName IS NOT null AND plant_images.FileName != ''
                ORDER BY plant_images.plant_photo_order";
    } else {
        throw new Exception("Unknown Calscape database version");
    }
}

function getSpeciesPhotos($jsonData)
{
    global $dbManager;

    // Decode the JSON data to extract the speciesName
    $speciesName = $jsonData;

    try {
        // Validate input
        if ($speciesName === null) {
            throw new Exception("Invalid JSON payload. No species name given.");
        }

        // Perform the first query to get the ID from the plants table
        $query = "SELECT ID FROM " . TABLE_PLANTS . " WHERE species = ?";
        $params = ['s', $speciesName];
        $result = $dbManager->executeQuery($query, $params);

        // Fetch the first row from the result set
        $row = $result->fetch_assoc();

        // Check if plant ID is found
        if (!$row) {
            throw new Exception("Plant not found for species: $speciesName");
        }

        $plantID = $row['ID'];

        if ($plantID === null) {
            throw new Exception("Plant ID is null for species: $speciesName");
        }

        // Perform query to get photos for the obtained ID
        $results = getPhotos($plantID);


        // Cleanse the data (if needed) and convert it to UTF-8
        $data = mb_convert_encoding($results, 'UTF-8', 'UTF-8');

        // Output the results as JSON
        header('Content-Type: application/json');

        // Encode the data to JSON with JSON_UNESCAPED_UNICODE option
        echo json_encode([
            'status' => 'success',
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);

        // Check for JSON encoding errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Print out the error message
            echo json_last_error_msg();
        }
    } catch (Exception $e) {
        // Handle exceptions
        $errorResponse = ["error" => $e->getMessage()];
        header('Content-Type: application/json');
        echo json_encode($errorResponse);
    }
}


// Get Calscape photos for the given plant id
function getPhotos($plantID)
{
    global $dbManager;

    // Use a prepared statement to prevent SQL injection
    $query = getPlantPhotosQuery();
    $params = getPlantPhotosParams($plantID);

    // Execute the query and fetch results
    $result = $dbManager->executeQuery($query, $params);

    // Fetch results
    $data = $result->fetch_all(MYSQLI_ASSOC);

    // Check if data was fetched successfully
    if ($data === false) {
        // Log the error
        error_log("Failed to fetch data from query: $query");

        // Return an empty array or throw an exception as per your requirements
        return [];
    }

    return $data;
}

// Only execute the code if this script is not included but executed directly
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    // Extract the speciesName from the URL parameter
    $speciesName = $_GET['speciesName'] ?? null;

    try {
        // Validate input
        if ($speciesName === null) {
            throw new Exception("Invalid request. No species name given.");
        }

        // Call the function with the extracted speciesName
        getSpeciesPhotos($speciesName);
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(["error" => $e->getMessage()]);
    } finally {
        // Close the connection regardless of success or failure
        $dbManager->closeConnection();
    }
}
