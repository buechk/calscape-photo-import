<?php
include_once('common.php');

function getPlantSpecies($dbManager)
{
    // Query to get all species
    $speciesquery = "SELECT species FROM " . TABLE_PLANTS . " WHERE disabled = 0 and is_biozone = 0 and species <> '' ORDER BY species";

    try {
        $result = $dbManager->executeQuery($speciesquery, []);

        if ($result) {
            $species = [];
            while ($row = $result->fetch_assoc()) {
                $species[] = $row["species"];
            }

            $data = mb_convert_encoding($species, 'UTF-8', 'UTF-8');
            return [
                "success" => true,
                "data" => $data
            ];
        } else {
            throw new Exception("Error executing the query: " . $dbManager->getError());
        }
    } catch (Exception $e) {
        return [
            "success" => false,
            "error" => "Failed to get species names: " . $e->getMessage()
        ];
    }
}

// Instantiate DatabaseManager
$dbManager = new DatabaseManager($dbConfig);

// Get plant species
$response = getPlantSpecies($dbManager);

// Close the connection
$dbManager->closeConnection();

// Output the response as JSON
header('Content-Type: application/json');
echo json_encode($response);
