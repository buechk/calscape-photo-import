<?php

use function PHPUnit\Framework\assertSame;

class GetUserIDTest extends \PHPUnit\Framework\TestCase
{
    function getUserID()
    {
        // Include the PHP code you want to test
        include_once('../../../photomagic/includes/php/get_user_id.php');

        // Sample JSON data for testing
        $testJsonData = "Them@us.com";

        // Call the function with test data
        getUserID($testJsonData);
    }
}
