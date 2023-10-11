<?php

// Check if the request method is POST (you can also use GET)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Read the data sent in the AJAX request
    $input_url = $_POST['data']; 

    $photo_data = file_get_contents($input_url);

    // Send a response back to the client
    echo $photo_data;
} else {
    // Handle other types of requests or errors
    echo "Invalid request.";
}

?>