<?php
	include(dirname(dirname(__FILE__)).'/includes/common.inc.php');
	
	define('FILE_CALPHOTOS_CSV', dirname(__FILE__).'/10_PhotosTestSuite.csv');
	
	define('DIR_TEST10_IMAGES', dirname(__FILE__).'/test10/');
	define('URL_TEST10_IMAGES', CALSCAPE_URL.'demo/data/test10/');
	
	echo FILE_CALPHOTOS_CSV.'<br>';
	
	$batch = 30;
	if (($handle = fopen(FILE_CALPHOTOS_CSV, "r")) !== FALSE) {
		$header = false;
		$counter = 0;
		$row = 0;
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
			$row++;
			if($header){
				$speciesCalphoto = $data[3];
				$imageId = trim($data[0]);
				$filename = str_replace(' ', '_', $speciesCalphoto).'-'.$imageId.'.jpeg';
				$image = DIR_TEST10_IMAGES. $filename;
				
				if(!file_exists($image)){
					$imageSrc = CALPHOTOS_IMAGES_DIR.$imageId.'.jpeg';
					if(file_exists($imageSrc)){
						if(copy($imageSrc, $image) !== false){
							$urlCalphoto = URL_TEST10_IMAGES.$filename;
			    			echo $row.': Image copied<br>';	
						}
					}
					else{
						$t = explode('_', $imageId);
			    		$urlCalphoto = strtr(URL_CALPHOTOS_IMAGE, array('{1}'=>$t[0], '{2}'=>$t[1], '{3}'=>$t[2], '{4}'=>$t[3]));
			    		file_put_contents($image, file_get_contents($urlCalphoto, false, stream_context_create(getUrlHeaders())));
			    		echo $row.': Image downloaded<br>';
			    		$urlCalphoto = URL_TEST10_IMAGES.$filename;
					}
					
					$counter++;
					if($counter>=$batch){
						break;	
					}
					
				}
			}
			else{
				$header = true;	
			}
	    }
	    fclose($handle);
	    if($counter<$batch){
			die('Completed');
		}
		echo '<br><br><br><br><br>';
	   // die('<img src="'.$urlCalphoto.'">');
	}
	
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
		<style type="text/css">
			body{
				font-family: Arial; padding: 10px; color: gray; background-color: silver;
			}
			div.container{
				border: 1px solid gray; padding: 10px; background-color: white; box-shadow: 0 0 8px gray; margin-bottom: 30px;
			}
		</style>
	</head>
	<body>
	<div class="container">
		<script type="text/javascript">
			window.onload = function(){
					setTimeout(function(){ window.location = "<?= $_SERVER['PHP_SELF'] ?>";}, 2000);
				}
		</script>	
	</div>
	</body>
</html>