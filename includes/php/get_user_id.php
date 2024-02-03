<?php
include_once(dirname(dirname(__FILE__)) . '/php/common.php');

function getUserID($jsonData)
{
    global $dbManager; // Assuming $dbManager is an instance of DatabaseManager that includes a mysqli connection

    // Decode the JSON data to extract the speciesName
    $userEmail = $jsonData;

    if ($userEmail === null) {
        // Handle the case where JSON decoding fails or speciesName is not set
        $response = [
            'success' => false,
            'message' => 'Error: Invalid JSON payload. No email given.',
            'userID' => ''
        ];
        echo json_encode($response);
        return;
    }

    // Get the user's ID from their email
    $query = "SELECT ID FROM user WHERE email = ?";
    $params = ['s', $userEmail];

    $result = $dbManager->executeQuery($query, $params);

    // Fetch the first row from the result set
    $row = $result->fetch_assoc();

    if (!$row) {
        // Handle the case where no row is returned (user ID not found)
        $response = [
            'success' => false,
            'message' => "Error: User account not found for email: $userEmail",
            'userID' => ''
        ];
        echo json_encode($response);
        return;
    }

    $userID = $row['ID'];

    if ($userID === null) {
        // Handle the case where the user ID is null
        $response = [
            'success' => false,
            'message' => "Error: User ID is null for email: $userEmail",
            'userID' => ''
        ];
        echo json_encode($response);
        return;
    }

    // Output the results as JSON
    $response = [
        'success' => true,
        'message' => "Success: User ID for email $userEmail is $userID",
        'userID' => $userID
    ];
    echo json_encode($response);
}

// Only execute the code if this script is not included but executed directly
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $jsonData = file_get_contents('php://input');

    try {
        getUserID($jsonData);
    } catch (Exception $e) {
        $response = [
            'success' => false,
            'message' => "Failed to get user account ID for email $jsonData: " . $e->getMessage(),
            'userID' => ''
        ];
        echo json_encode($response);
    } finally {
        // Close the connection regardless of success or failure
        $dbManager->closeConnection();
    }
}
?>
