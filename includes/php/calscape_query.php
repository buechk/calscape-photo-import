<?php
include_once('common.php');

try {
    // Query to get all species
    $speciesquery = "SELECT species FROM " . TABLE_PLANTS . " WHERE disabled = 0 and is_biozone = 0 ORDER BY species";

    $result = $dbManager->executeQuery($speciesquery, []);

    // Check if the query was successful and if so return $species array
    if ($result) {
        $species = array();
        while ($row = $result->fetch_assoc()) {
            $species[] = $row["species"];
        }
        echo json_encode($species);
    } else {
        echo json_encode(["error" => "Error executing the query: " . $conn->error]);
    }
} catch (Exception $e) {
    echo "Failed to get species names: " . $e->getMessage() . "{$newline}";
} finally {
    // Close the connection regardless of success or failure
    $dbManager->closeConnection();
}
