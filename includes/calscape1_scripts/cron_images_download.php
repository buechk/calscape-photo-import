<?php	
die('Unathourized access is not allowed');
	set_time_limit(0);
	include_once(dirname(dirname(__FILE__)).'/includes/common.inc.php');	
	
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

	/*$rows = $db->processQuery(sprintf('select * from (SELECT image, count(*) as images FROM `%s` where image not like "%s" group by image) t where t.images>1 order by t.images limit 1', TABLE_LEP_CALPHOTOS, 'Agraulis_vanillae%'));	
	if(!count($rows)){
		die('No duplicate images found');
	}
	$sql = sprintf('select *, "" as image, "" as thumbnail from `%s` where image="%s" limit 10', TABLE_LEP_CALPHOTOS, $rows[0]['image']);
	echo substr($rows[0]['image'], 0, strpos($rows[0]['image'], '_')).': '.$rows[0]['images'].'<br>';
	*/
	$sql = sprintf('select * from %s where id>%s order by id limit %s', TABLE_PLANT_PHOTO_CALPHOTOS, $startRow, $limit);	
//echo $sql.'<br>';	

	$rows = $db->processQuery($sql);
	
	$rowsFound = (count($rows));
	echo 'Starts from <span class="notice"><b>'.$startRow.'</b></span><br>';
	echo '<div id="status_container">';
	$imagesDownloaded = 0;
	$images500Created = 0;
	$thumbnailsCreated = 0;
//showErrors();
	if(count($rows)){
		foreach($rows as $index=>$curr){	
		//print_r($curr); echo '<br>';
			echo '<div class="notice"><u>'.$curr['species'].'</u></div>';
			
			$curr['image'] = str_ireplace(CALPHOTOS_IMAGES_DIR, '', createUniqueFilename(LEP_IMAGES_DIR.str_replace(' ', '_',$curr['species']).'.jpg'));
			$curr['thumbnail'] = $curr['image'];		
			
			
			$thumbnail = LEP_THUMBNAILS_DIR. $curr['thumbnail'];
			$image = LEP_IMAGES_DIR . $curr['image'];
			$image500 = LEP_IMAGES_500_DIR. $curr['image'];
			
			echo 'Image:'.$image.'=>'; var_dump(file_exists($image));
			echo '...'.number_format(filesize($image), 0).'<br>';
			echo 'Image500:'.$image500.'=>'; var_dump(file_exists($image500));
			echo '...'.number_format(filesize($image500), 0).'<br>';
			echo 'Thumbnail:'.$thumbnail.'=>'; var_dump(file_exists($thumbnail));
			echo '...'.number_format(filesize($thumbnail), 0).'<br>';
			
			//var_dump(getimagesize($image)); echo '<br>';
			if(!file_exists($image) || !filesize($image) || !getimagesize($image)){
				// Lep image not found or image size is invalid
				// Download it
				@unlink(LEP_THUMBNAILS_DIR. $curr['thumbnail']);
				@unlink(CACHE_DIR. $curr['thumbnail']);	
				echo '<div class="error">Image not found</div>';
				echo 'Downloading '.$curr['image_calphotos'].'.....';
				$filedata = file_get_contents($curr['image_calphotos'], false, stream_context_create($arrContextOptions));
				if($filedata){
					if(file_put_contents($image, $filedata) !== false){
						echo ' <span class="success">downloaded</span><br>';
						clearstatcache();
						
					}
					else{
						echo ' <span class="error">download failed</span><br>';
						//die('');
					}	
				}
				else{
					echo ' <span class="error">download failed</span><br>';			
				}
				if(!getimagesize($image)){
					@unlink($image);
				}
				else{
					$imagesDownloaded++;
				}
			}
			
			if(file_exists($image) && filesize($image) && getimagesize($image)){	
				// Valid Lep Image found
				$thumbnailName = str_ireplace('.jpg', '_th.jpg', $curr['image']);
				echo 'Image exists<br>';
				// Create image500
				if(!file_exists($image500) || filesize($image500)<1 || !getimagesize($image500)){
					//500x375
					echo '<div class="error">Image500 not found</div>';
					@unlink($image500);
					echo 'Creating image500 '.$curr['image'].'.....';
					createResizedImage($image, LEP_IMAGES_500_DIR, $curr['image'], 
										500, 375, 
										false, true, false, true);	
					echo ' <span class="success">created</span><br>';
					
					if(file_exists(LEP_IMAGES_500_DIR . $curr['image'])){
						$images500Created++;
						$sql = sprintf('update `%s` set image="%s", thumbnail="%s" where id="%s"', TABLE_LEP_CALPHOTOS, $curr['image'], $curr['thumbnail'], $curr['id']);
						$db->processQuery($sql);
					}
				}	
				else{
					echo 'Image500 exists<br>';
				}		
				//echo $name .'=='. $curr['thumbnail'].'<br>';
				if($thumbnailName != $curr['thumbnail'] || !file_exists($thumbnail) || filesize($thumbnail)<1 || !getimagesize($thumbnail)){
					// Lep thumbnail not found or image size is invalid
					// Create thumbnail in lep thumbname folder and cache folder
					echo '<div class="error">Thumbnail not found</div>';
					@unlink(LEP_THUMBNAILS_DIR. $curr['thumbnail']);
					@unlink(CACHE_DIR. $curr['thumbnail']);	
					$curr['thumbnail'] = $thumbnailName;
					
					echo 'Creating thumbnail '.$curr['thumbnail'].'.....';
					?>
					<!--img src="<?= LEP_THUMBNAILS_URL.$curr['thumbnail'] ?>"/>
					<!--img src="<?= LEP_IMAGES_URL.$curr['image'] ?>" height="140px"/>
					<img src="<?= CACHE_URL.$curr['thumbnail'] ?>"/>
					<br-->
					<?
					createResizedImage(LEP_IMAGES_DIR.$curr['image'], LEP_THUMBNAILS_DIR, $curr['thumbnail'], 
										260, 250, 
										false, true, false, true);	
					createResizedImage(LEP_IMAGES_DIR.$curr['image'], CACHE_DIR, $curr['thumbnail'], 
										THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, 
										false, true, true);	
					echo ' <span class="success">created</span><br>';
					
					if(file_exists(LEP_THUMBNAILS_DIR . $curr['thumbnail'])){
						$thumbnailsCreated++;
						$sql = sprintf('update `%s` set image="%s", thumbnail="%s" where id="%s"', TABLE_LEP_CALPHOTOS, $curr['image'], $curr['thumbnail'], $curr['id']);
					}
			$db->processQuery($sql);
					}
					?>
					<!--img src="<?= LEP_THUMBNAILS_URL.$curr['thumbnail'] ?>"/>
					<img src="<?= CACHE_URL.$curr['thumbnail'] ?>"/--><br>
					<?			
					if($thumbnailName != $curr['thumbnail']){
						$sql = sprintf('update %s set thumbnail="%s" where id=%s limit 1', 
									TABLE_LEP_CALPHOTOS, $curr['thumbnail'], $curr['id']);
						echo '<span class="notice">'.$sql.'</span>:';
						$response = $db->processQuery($sql);
						echo '<span class="'.($response ? 'success' : 'error').'">';
						var_dump($response);
						echo '</span><br>';								
					}	
					
				}
				else{
					echo 'Thumbnail exists<br>';
				}
			}
			else{
				echo '<div class="error">Image not found</div>';
				//die('');
			}
			echo '<hr><br>';
			file_put_contents($fileCounter, $curr['id']);
		}
		/*
		foreach($rows as $curr){
			//$curr['thumbnail'] = '';
			//$curr['image'] = '';
			
			$thumbnail = LEP_THUMBNAILS_DIR. $curr['thumbnail'];
			$image = LEP_IMAGES_DIR. $curr['image'];
			echo 'Thumbnail:'.$thumbnail.'=>'; var_dump(file_exists($thumbnail));
			echo '...'.filesize($thumbnail).'<br>';
			echo 'Image:'.$image.'=>'; var_dump(file_exists($image));
			echo '...'.filesize($image).'<br>';
			$update = array();
		
			/*
			if($curr['thumbnail_calphotos'] == '' && (!file_exists($thumbnail) || filesize($thumbnail)<=0)){
				// Thumbnail url is not found
				if(!preg_match('/\_[0-9]+/', $thumbnail, $match)){
					$info = pathinfo(LEP_THUMBNAILS_DIR. $curr['image']);
					if(trim($curr['photo_id'])==''){
						$thumbnail = $info['dirname'].'/'.$info['filename'].'_th.'.$info['extension'];
					}
					else{
						$thumbnail = LEP_THUMBNAILS_DIR. str_replace(' ', '_', $curr['photo_id']).'.jpeg';
					}
				}
				
				echo 'Downloading thumbnail ['.$curr['thumbnail_calphotos'].' >> '.$thumbnail.']......<br>';
				
				if(file_exists($image) && filesize($image)>0){
					@unlink($thumbnail);
					var_dump(copy($image, $thumbnail));
					echo ' copied<br>';
				}
				else if($curr['image_calphotos']!= ''){
					@unlink($thumbnail);
					if(file_put_contents($thumbnail, file_get_contents($curr['image_calphotos'], false, stream_context_create($arrContextOptions))) !== false){
						
					}
				}
				
				var_dump(@unlink(CACHE_DIR.str_ireplace('.jpg', '_th.jpg', $curr['thumbnail'])));
				if(file_exists($thumbnail) && filesize($thumbnail)>0){
					echo 'Resizing thumbnail....'	;
					createResizedImage($thumbnail, LEP_THUMBNAILS_DIR, str_ireplace(LEP_THUMBNAILS_DIR, '', $thumbnail), THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, false, true);
				}
				if(file_exists($thumbnail)){
					$update[] = 'thumbnail=\''.pathinfo($thumbnail)['basename'].'\'';
				}
			}* /
			
			if($curr['thumbnail_calphotos']!= '' && ($curr['thumbnail'] == '' || !file_exists($thumbnail) || filesize($thumbnail)<=0)){
				if(trim($curr['photo_id'])==''){
					$thumbnail = createUniqueFilename(LEP_THUMBNAILS_DIR. str_replace(' ', '_', $curr['species']).'_th.jpg');
				}
				else{
					$thumbnail = LEP_THUMBNAILS_DIR. str_replace(' ', '_', $curr['photo_id']).'.jpeg';
				}
				echo 'Downloading thumbnail ['.$curr['thumbnail_calphotos'].' >> '.$thumbnail.']......<br>';
				if(file_put_contents($thumbnail, file_get_contents($curr['thumbnail_calphotos'], false, stream_context_create($arrContextOptions))) !== false){
					echo '....downloaded<br>';
					$update[] = 'thumbnail=\''.pathinfo($thumbnail)['basename'].'\'';
				}
				else{
					echo '....failed<br>';
				}
			}
			if($curr['image_calphotos']!= '' && ($curr['image'] == '' || !file_exists($image) || filesize($image)<=0)){
				if(trim($curr['photo_id'])==''){
					$image = createUniqueFilename(LEP_IMAGES_DIR. str_replace(' ', '_', $curr['species']).'.jpg');
				}
				else{
					$image = LEP_IMAGES_DIR.str_replace(' ', '_', $curr['photo_id']).'.jpeg';
				}
				echo 'Downloading image ['.$curr['image_calphotos'].' >> '.$image.']......<br>';
				if(file_put_contents($image, file_get_contents($curr['image_calphotos'], false, stream_context_create($arrContextOptions))) !== false){
					echo '....downloaded<br>';
					$update[] = 'image=\''.pathinfo($image)['basename'].'\'';
				}
				else{
					echo '....failed<br>';
				}				
				
			}
			if(count($update)){
				$sql = sprintf('update %s set %s where id=%s', 
								TABLE_LEP_CALPHOTOS, implode(',', $update), $curr['id']);
				echo $sql.':';
				//var_dump($db->processQuery($sql));
				echo '<br>';
			}
			
			
			
			echo '<hr>';
			file_put_contents($fileCounter, $curr['id']);
		}			*/	
	}
	if(!$rowsFound){
		die('Completed');
	}
	echo '</div>';
	//file_put_contents($fileCounter, $currRow-1);
	echo 'Images downloaded: <span class="notice">'.$imagesDownloaded.'</span>,   Image500 created: <span class="notice">'.$images500Created.'</span>,  Thumbnails created: <span class="notice">'.$thumbnailsCreated.'</span><br>';
	echo 'Processed in <span class="notice">'.(time()- $timeStart).' sec(s)</span><br><br><br><br>';
		//<a href=/cgi/img_query?enlarge=8120+3181+4901+0057> <img border=0 src=/imgs/128x192/8120_3181/4901/0057.jpeg alt="Arctostaphylos glauca" title="Arctostaphylos glauca"></a>
?>
<script type="text/javascript">
	window.onload = function(){
						var dt = new Date();
						setTimeout(function(){ window.location = '<?= $_SERVER['PHP_SELF'] ?>?tm='+dt.getTime(); }, 2000);
					}
</script>
	</div>
</body>
</html>