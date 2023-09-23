<?php

	set_time_limit(0);
	include_once(dirname(dirname(__FILE__)).'/includes/common.inc.php');	
		
	function downloadFile($url){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

		$content = curl_exec($ch);

		curl_close($ch);
		
		return $content;
	}
	$arrContextOptions=array('http' =>array( 'header' => 'User-Agent: Mozilla/5.0 (Windows; U; Windows NT 6.1; es-CL; rv:1.9.2.3) Gecko/20100401 Firefox/3.6.3' . PHP_EOL,
											'follow_location' => true ),
						      "ssl"=>array(
						            "verify_peer"=>false,
						            "verify_peer_name"=>false,
						        ),
						    );
					      					
?>
<html>
<head>
	<title>Lep Images Migration</title>
	<style type="text/css">
		body{
			font-family: Arial; padding: 10px; color: gray; background-color: silver; font-size: 11px;
		}
		div.container{
			border: 1px solid gray; padding: 10px; background-color: #ebebeb; box-shadow: 0 0 8px gray; margin-bottom: 30px;
		}
		div#status_container{
			height: 500px; overflow: auto; border: 1px solid silver;padding: 5px; margin: 5px 0 5px 0; background-color: #ffffff;
		}
		.success{
			color: #00FF00;
		}
		.error{
			color: #FF0000;
		}
		.notice{
			color: #000000;
		}
	</style>
</head>
<body>
	<div class="container">
<?php
	
	$fileCounter =  str_replace('.php', '.txt', __FILE__);
	$startRow = intval(file_get_contents($fileCounter));
	$limit = 20;
	$timeStart = time();	

	$calphotos = true; // Calphotos or calscape images
	
	echo 'Using database <b>'.MYSQL_DATABASE.'</b><br>';
	$sql = sprintf('select * from %s where id>%s order by id limit %s', ($calphotos ? TABLE_LEP_CALPHOTOS : TABLE_LEP_PHOTOS), $startRow, $limit);	
echo $sql.'<br>';	

	$rows = $db->processQuery($sql);
	
	$rowsFound = (count($rows));
	echo 'Starts from <span class="notice"><b>'.$startRow.'</b></span><br>';
	?>
	<div id="status_container">
	<?php
	$imagesCopied = 0;
	$images500Copied = 0;
	$thumbnailsCopied = 0;
//showErrors();
	if(count($rows)){
		foreach($rows as $index=>$curr){	
		if(!$calphotos){
				$curr['species'] = $curr['image'] = $curr['image'] = $curr['thumbnail'] = $curr['FileName'];
				$curr['id'] = $curr['ID'];
			}	
	    	echo '<div class="notice"><u>'.$curr['species'].'</u></div>';

			$image = LEP_IMAGES_DIR . $curr['image'];
			$image500 = LEP_IMAGES_500_DIR. $curr['image'];
	    	$thumbnail = LEP_THUMBNAILS_DIR. $curr['thumbnail'];
			
			$imageSource = str_ireplace(CALSCAPE_URL, 'https://calscape.com/', LEP_IMAGES_URL) . $curr['image'];
	    	$image500Source = str_ireplace(CALSCAPE_URL, 'https://calscape.com/', LEP_IMAGES_500_URL). $curr['image'];
	    	$thumbnailSource = str_ireplace(CALSCAPE_URL, 'https://calscape.com/', LEP_THUMBNAILS_URL). $curr['thumbnail'];

	    	if(!file_exists($image)){
	    		echo 'Copying image ('.$image.')...';
	    		/*if(copy($imageSource, $image)){
	    			echo ' <span class="success">copied</span><br>';
	    		}
	    		else{*/
	    			$filedata = downloadFile($imageSource);// file_get_contents($imageSource, false, stream_context_create($arrContextOptions));
					if($filedata){
						if(file_put_contents($image, $filedata) !== false){
							echo ' <span class="success">copied</span><br>';
							$imagesCopied++;
							clearstatcache();
						
						}
						else{
							echo ' <span class="error">failed</span><br>';
							//die('');
						}	
					}
					else{
						echo ' <span class="error">failed(image not found)</span><br>';			
					}
	    		//}
	    		
				if(!getimagesize($image)){
					@unlink($image);
				}
	    	}
	    	else{
	    		echo 'Image found<br>';
	    	}
	    	
	    	if(!file_exists($image500)){
	    		echo 'Copying image500 ('.$image500.')...';
	    		$filedata = downloadFile($image500Source);// file_get_contents($image500Source, false, stream_context_create($arrContextOptions));
				if($filedata){
					if(file_put_contents($image500, $filedata) !== false){
						echo ' <span class="success">copied</span><br>';
						$images500Copied++;
						clearstatcache();
						
					}
					else{
						echo ' <span class="error">failed</span><br>';
						//die('');
					}	
				}
				else{
					echo ' <span class="error">failed(image500 not found)</span><br>';			
				}
				if(!getimagesize($image500)){
					@unlink($image500);
				}
	    	}
	    	else{
	    		echo 'Image500 found<br>';
	    	}
	    	
	    	if(!file_exists($thumbnail)){
	    		echo 'Copying thumbnail ('.$thumbnail.')...';
	    		$filedata = downloadFile($thumbnailSource);// file_get_contents($thumbnail, false, stream_context_create($arrContextOptions));
				if($filedata){
					if(file_put_contents($thumbnail, $filedata) !== false){
						echo ' <span class="success">copied</span><br>';
						$thumbnailsCopied++;
						clearstatcache();
						
					}
					else{
						echo ' <span class="error">failed</span><br>';
						//die('');
					}	
				}
				else{
					echo ' <span class="error">failed(thumbnail not found)</span><br>';			
				}
				if(!getimagesize($image500)){
					@unlink($image500);
				}
	    	}
	    	else{
	    		echo 'Thumbnail found<br>';
	    	}
	    	file_put_contents($fileCounter, $curr['id']);
	    } 
		?>
		</div>
		<?php
		echo 'Images downloaded: <span class="notice">'.$imagesCopied.'</span>,   Image500 created: <span class="notice">'.$images500Copied.'</span>,  Thumbnails created: <span class="notice">'.$thumbnailsCopied.'</span><br>';
	echo 'Processed in <span class="notice">'.(time()- $timeStart).' sec(s)</span><br><br><br><br>';
		?>
		<script type="text/javascript">
			window.onload = function(){
						var dt = new Date();
						setTimeout(function(){ window.location = '<?= $_SERVER['PHP_SELF'] ?>?tm='+dt.getTime(); }, 2000);
					}
		</script>
	<?php
	}
	else{?>
		All images are copied.
		<?php
	}
?>
	</div>
</body>
</html>
	   