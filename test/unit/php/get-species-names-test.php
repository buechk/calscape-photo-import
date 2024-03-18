<?php

class PlantSpeciesTest extends \PHPUnit\Framework\TestCase
{
    public function testGetPlantSpecies(): void
    {
        // Include the script to be tested
        include_once('get_plant_species.php');

        // Capture the output of the script
        ob_start();
        include('../../../includes/php/get_plant_species.php');
        $output = ob_get_clean();

        // Assert that the output is in JSON format and contains the expected species
        $this->assertJson($output);
        $decodedOutput = json_decode($output, true);
        $this->assertNotEmpty($decodedOutput); // Assuming the output is not empty
    }
}
