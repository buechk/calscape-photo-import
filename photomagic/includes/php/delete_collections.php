<?php
include_once('common.php');

function deleteFiles($fileNames, $directory, $response)
{
    foreach ($fileNames as $fileName) {
        $filePath = $directory . '/' . $fileName;

        // Check if the file exists before attempting to delete
        if (file_exists($filePath)) {
            // Attempt to delete the file
            if (unlink($filePath)) {
                $response["messages"][] = "File '$fileName' deleted successfully";
            } else {
                $response["success"] = false;
                $response["messages"][] = "Error deleting file '$fileName'";
            }
        } else {
            $response["success"] = false;
            $response["messages"][] = "File '$fileName' not found";
        }
    }

    return $response;
}

// Only execute the code if this script is not included but executed directly
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {

    // Retrieve the filenames from the query parameters
    $filesToDelete = isset($_GET['filenames']) ? $_GET['filenames'] : null;
    $directoryPath = COLLECTIONS_REVIEW_DIR;

    $response = [
        "success" =>  true,
        "messages" =>  []
    ];

    try {
        // Split the comma-separated string into an array of filenames
        $fileNamesArray = explode(',', $filesToDelete);
        
        // Call the deleteFiles function with the array of filenames
        $response = deleteFiles($fileNamesArray, $directoryPath, $response);
    } catch (Exception $e) {
        $response["success"] = false;
        $response["messages"][] = $e->getMessage();
    } 

    // Send the JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
}
?>

