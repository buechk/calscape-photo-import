<?php
// Include the PHP code you want to test
include_once('../../../photomagic/includes/php/common.php');
include_once('../../../photomagic/includes/php/download_csv.php');

// Sample JSON data for testing (enclosed in quotes and properly escaped)
$testJsonData = '{
    "collection-name": "Coffeeberry Eve Case",
    "collection-type": "species",
    "species": "Frangula californica \'Eve Case\'",
    "user_id": "4277",
    "filename": "kristyabueche@gmail.com_Coffeeberry_Eve_Case_species_Frangula_californica_\'Eve_Case\'_65ca3d6f51b33.json",
    "photos": [
      {
        "id": "13920637214",
        "sourceImage": "https://farm3.staticflickr.com/2901/13920637214_a9786d9492_b.jpg",
        "thumbnail": "Frangula_californica_\'Eve_Case\'_13920637214_a9786d9492_q.jpg",
        "Title": "Frangula californica \'Eve Case\' - Eve Case Coffeeberry as a foundation hedge.",
        "CaptionDescription": "<p><em>Frangula </em>californica<em> </em>\'Eve Case\' - Eve Case Coffeeberry as a foundation hedge.</p>",
        "DateTimeOriginal": "2014-04-18 02:29:52",
        "Artist": "pete veilleux",
        "License": "All Rights Reserved (ARR)",
        "CopyrightNotice": "",
        "QualityRanking": "0",
        "LandscaperName": "",
        "LandscapeDesigner": "",
        "Keywords": [
          "hedge",
          "california native",
          "coffeeberry"
        ],
        "selected-species": "",
        "ImageDescription": "© Copyright Pete Veilleux 2024",
        "FileName": "Frangula_californica_\'Eve_Case\'_13920637214_a9786d9492_b.jpg",
        "deleted": false
      },
      {
        "id": "7284744932",
        "sourceImage": "https://farm8.staticflickr.com/7243/7284744932_92c359e2b6_b.jpg",
        "thumbnail": "Frangula_californica_\'Eve_Case\'_7284744932_92c359e2b6_q.jpg",
        "Title": "Rhamnus californica \'Eve Case\' - Eve Case Coffeeberry",
        "CaptionDescription": "<p><em>Rhamnus</em> californica \'Eve Case\' - Eve Case Coffeeberrygrown as a small, evergreen shade tree. possibilities are endless....</p>",
        "DateTimeOriginal": "2012-05-27 15:47:51",
        "Artist": "pete veilleux",
        "ImageDescription": "© Copyright Pete Veilleux 2024",
        "License": "All Rights Reserved (ARR)",
        "CopyrightNotice": "",
        "QualityRanking": "0",
        "LandscaperName": "",
        "LandscapeDesigner": "",
        "Keywords": [
          "hedgerow"
        ],
        "selected-species": "",
        "FileName": "Frangula_californica_\'Eve_Case\'_7284744932_92c359e2b6_b.jpg",
        "deleted": true
      }
    ],
    "status": "reviewed",
    "reviewDate": "3/5/2024, 7:33:21 AM"
}'; 

// Call the function with test data
createPhotoZipPackage(json_decode($testJsonData, true), $dbConfig);
?>