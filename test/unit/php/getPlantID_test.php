<?php

class getPlantID_test extends \PHPUnit\Framework\TestCase
{
    public function testGetPlantSpecies(): void
    {
        // Include the script to be tested
        include('../../../photomagic/includes/php/common.php');

        // Capture the output of the script
        ob_start();

        $output = ob_get_clean();

        // Call the method and assert the result
        $output = getPlantID('Ribes sanguineum');

        // Assert that the output is in JSON format and contains the expected species
        $this->assertJson($output);
        $decodedOutput = json_decode($output, true);
        $this->assertEquals("3238", $decodedOutput);
    }
}
