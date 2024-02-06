<?php
include_once(dirname(dirname(__FILE__)) . '/php/common.php');

function getSpeciesPhotos($jsonData)
{
    global $dbManager; // Assuming $dbManager is an instance of DatabaseManager that includes a mysqli connection

    // Decode the JSON data to extract the speciesName
    $speciesName = $jsonData;

    if ($speciesName === null) {
        // Handle the case where JSON decoding fails or speciesName is not set
        $errorResponse = ["error" => "Invalid JSON payload. No species name given."];
        echo json_encode($errorResponse);
        return;
    }

    // Perform the first query to get the ID from the plants table
    $query = "SELECT ID FROM plants WHERE species = ?";
    $params = ['s', $speciesName];

    $result = $dbManager->executeQuery($query, $params);

    // Fetch the first row from the result set
    $row = $result->fetch_assoc();

    if (!$row) {
        // Handle the case where no row is returned (plant not found)
        $errorResponse = ["error" => "Plant not found for species: $speciesName"];
        echo json_encode($errorResponse);
        return;
    }

    $plantID = $row['ID'];

    if ($plantID === null) {
        // Handle the case where the plant ID is null
        $errorResponse = ["error" => "Plant ID is null for species: $speciesName"];
        echo json_encode($errorResponse);
        return;
    }

    // Perform the second query using the obtained ID
    $results = getPhotos($plantID);

    // Output the results as JSON
    echo json_encode($results);
}

// Function to perform the second query
function getPhotos($plantID)
{
    global $dbManager;

    // Use a prepared statement to prevent SQL injection
    $query = "SELECT
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


    $params = ['ii', $plantID, $plantID];

    // Execute the query and fetch results
    $result = $dbManager->executeQuery($query, $params);

    return $result->fetch_all(MYSQLI_ASSOC);
}

// Only execute the code if this script is not included but executed directly
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $jsonData = file_get_contents('php://input');

    try {
        getSpeciesPhotos($jsonData);
    } catch (Exception $e) {
        echo "Failed to get existing Calscape photos: " . $e->getMessage() . "{$newline}";
    } finally {
        // Close the connection regardless of success or failure
        $dbManager->closeConnection();
    }
}
?>
