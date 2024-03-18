<?php
include_once('../../../includes/php/common.php');

// Simulate JSON data for testing
$testJsonDataPrunus = '{
    "collection-name": "Holly leaved cherry",
    "collection-species": "Prunus ilicifolia",
    "user_id": "1",
    "collection-type": "species",
    "photos": {
      "0": {
        "id": "21247472315",
        "sourceImage": "https://farm1.staticflickr.com/744/21247472315_115c40ea9f_b.jpg",
        "CaptionTitle": "Prunus illicifolia - Hollyleaf Cherry",
        "CaptionDescription": "",
        "DateTimeOriginal": "2015-09-06 01:26:42",
        "ImageDescription": "",
        "LandscaperName": "Amanda",
        "LandscapeDesigner": "Stefanie",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [
          "fruit"
        ],
        "selected-species": "",
        "FileName": "Prunus_ilicifolia_21247472315_115c40ea9f_b.jpg"
      },
      "1": {
        "id": "6107677197",
        "sourceImage": "https://farm7.staticflickr.com/6186/6107677197_536693dbbe_b.jpg",
        "CaptionTitle": "Prunus ilicifolia - Holly-leaved Cherry",
        "CaptionDescription": "",
        "DateTimeOriginal": "2011-09-01 23:45:59",
        "ImageDescription": "",
        "LandscaperName": "Benny",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [
          "berries"
        ],
        "selected-species": "",
        "LandscapeDesigner": "",
        "FileName": "Prunus_ilicifolia_6107677197_536693dbbe_b.jpg"
      },
      "2": {
        "id": "6108224958",
        "sourceImage": "https://farm7.staticflickr.com/6204/6108224958_0c2901d7b5_b.jpg",
        "CaptionTitle": "Prunus ilicifolia - Holly-leaved Cherry",
        "CaptionDescription": "",
        "DateTimeOriginal": "2011-09-01 23:39:42",
        "ImageDescription": "",
        "LandscaperName": "Kristy",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [],
        "selected-species": "",
        "LandscapeDesigner": "Ed",
        "FileName": "Prunus_ilicifolia_6108224958_0c2901d7b5_b.jpg"
      },
      "3": {
        "id": "3525378580",
        "sourceImage": "https://farm4.staticflickr.com/3387/3525378580_1bcf1c5f98_b.jpg",
        "CaptionTitle": "Prunus illicifolia - Holly-leaved Cherry",
        "CaptionDescription": "Prunus in bloom",
        "DateTimeOriginal": "2009-05-10 22:21:20",
        "ImageDescription": "",
        "LandscaperName": "",
        "LandscapeDesigner": "",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [
          "flowers"
        ],
        "selected-species": "",
        "FileName": "Prunus_ilicifolia_3525378580_1bcf1c5f98_b.jpg"
      },
      "4": {
        "id": "18006811174",
        "sourceImage": "https://farm9.staticflickr.com/8854/18006811174_182672ed18_b.jpg",
        "CaptionTitle": "Prunus illicifolia - Hollyleaf Cherry",
        "DateTimeOriginal": "2015-06-07 05:16:09",
        "ImageDescription": "Dense foliage of prunus",
        "LandscaperName": "Frankie",
        "LandscapeDesigner": "Prince",
        "Artist": "pete veilleux",
        "CopyrightNotice": "",
        "CopyrightCategory": "All Rights Reserved (ARR)",
        "QualityRanking": "0",
        "Keywords": [
          "SCRR",
          "winter"
        ],
        "selected-species": "",
        "CaptionDescription": "",
        "FileName": "Prunus_ilicifolia_18006811174_182672ed18_b.jpg"
      }
    }
  }';

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

// Include test subject PHP code and pass the JSON data as an argument
include_once('../../../includes/php/save-to-db.php');
updateDatabase($testJsonDataPrunus, $dbConfig);
?>
