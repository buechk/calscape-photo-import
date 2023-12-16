<?php
// Simulate JSON data for testing
$testJsonData = '{
    "collection-name": "redtwig",
    "collection-species": "Cornus sericea",
    "collection-type": "species",
    "user_id": "1",
    "photos": {
      "0": {
        "id": "8353249526",
        "sourceImage": "https://farm9.staticflickr.com/8213/8353249526_29cec442d3_b.jpg",
        "CaptionTitle": "Cornus sericea - Redtwig Dogwood in front of Populus tremuloides - Aspen",
        "CaptionDescription": "",
        "DateTimeOriginal": "2013-01-06 01:23:27",
        "ImageDescription": "Tilden Botanical Garden on 1-5-12",
        "LandscaperName": "",
        "LandscapeDesigner": "",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [],
        "selected-species": "",
        "FileName": "Cornus_sericea_8353249526_29cec442d3_b.jpg"
      },
      "1": {
        "id": "263622339",
        "sourceImage": "https://farm1.staticflickr.com/79/263622339_70fb0695ee_b.jpg",
        "CaptionTitle": "Cornus sericea - Redtwig or Creek Dogwood",
        "CaptionDescription": "",
        "DateTimeOriginal": "2006-09-30 21:57:48",
        "ImageDescription": "",
        "LandscaperName": "",
        "LandscapeDesigner": "",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [
          "autumn",
          "colors",
          "fall",
          "leaf",
          "colorful",
          "foliage",
          "turning",
          "changing",
          "forest",
          "trees",
          "leaves",
          "woods",
          "plumas",
          "county"
        ],
        "selected-species": "",
        "FileName": "Cornus_sericea_263622339_70fb0695ee_b.jpg"
      },
      "2": {
        "id": "264780915",
        "sourceImage": "https://farm1.staticflickr.com/97/264780915_9cd3287e6e_b.jpg",
        "CaptionTitle": "Cornus sericea - Redtwig or Creek Dogwood and Populus tremuloides - Quaking Aspen",
        "CaptionDescription": "",
        "DateTimeOriginal": "2006-10-01 00:01:31",
        "ImageDescription": "",
        "LandscaperName": "",
        "LandscapeDesigner": "",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [
          "fall/winter color",
          "Plumas County",
          "lakes basin",
          "yearroundbeauty"
        ],
        "selected-species": "",
        "FileName": "Cornus_sericea_264780915_9cd3287e6e_b.jpg"
      },
      "3": {
        "id": "264781491",
        "sourceImage": "https://farm1.staticflickr.com/83/264781491_12abaf97e4_b.jpg",
        "CaptionTitle": "Cornus sericea - Redtwig or Creek Dogwood",
        "CaptionDescription": "",
        "DateTimeOriginal": "2006-10-01 00:26:01",
        "ImageDescription": "",
        "LandscaperName": "",
        "LandscapeDesigner": "",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [
          "sierra",
          "nevada",
          "california",
          "native",
          "plants",
          "fantastic",
          "color",
          "nature"
        ],
        "selected-species": "",
        "FileName": "Cornus_sericea_264781491_12abaf97e4_b.jpg"
      }
    }
  }';

// Include your original PHP code and pass the JSON data as an argument
include_once('../../../includes/php/save-to-db.php');
updateDatabase($testJsonData);
?>
