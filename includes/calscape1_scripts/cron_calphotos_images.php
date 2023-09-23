<html>
<head></head>
<body>
<?php
	die('Not authorized');
	set_time_limit(0);
	include_once(dirname(dirname(__FILE__)).'/includes/common.inc.php');	

	$fileCounter = dirname(__FILE__).'/calphotos_images_counter.txt';
	$fileFailure = dirname(__FILE__).'/calphotos_images_failure.txt';
	$startRow = intval(file_get_contents($fileCounter));
	$plantsPerBatch = 50;
	
	//if($startRow>0) $startRow++;
	
	$h = fopen($fileFailure, 'a');
	
	$timeStart = time();
	$db = new DB();
	//$sql = sprintf('select id, obsolete_names as species from %s order by id limit %s, %s', TABLE_PLANTS, $startRow, $plantsPerBatch);
	$sql = sprintf('SELECT id, species, obsolete_names FROM `plants` where id>%s and id not in (select distinct plant_id from plant_photo_calphotos) order by id limit %s', $startRow, $plantsPerBatch);
	echo $sql.'<br>';
	//$sql = sprintf('SELECT id, obsolete_names as species FROM `plants` where id not in (select distinct plant_id from plant_photo_calphotos) and obsolete_names<>"" order by id limit %s, %s', $startRow, $plantsPerBatch);
	$rows = $db->processQuery($sql);
	if(intval($rows[count($rows)-1]['id']) > $startRow)
		file_put_contents($fileCounter, $rows[count($rows)-1]['id']);
	
	
	/*$h = fopen(dirname(__FILE__).'/calphotos_plants.csv', 'r');
	$rows = array();
	if($h){
		while(($data = fgetcsv($h, 1000)) !== false){
			$rows[] = array('id'=>$data[0], 'species'=>$data[1]); 
		}
	}
	fclose($h);*/
	//die(print_r($rows));
	echo  $startRow.' to '. $plantsPerBatch.'<br>';
	
	foreach($rows as $currPlant){
		$temp = array();
		if(trim($currPlant['species']) != ''){
			$temp[] = $currPlant['species'];
			if(stripos($currPlant['species'], ' subsp. ')){
				$temp[] = str_ireplace(' subsp. ', ' ssp. ', $currPlant['species']);
			}
		}
		if(trim($currPlant['obsolete_names']) != ''){
			$temp[] = $currPlant['obsolete_names'];
			if(stripos($currPlant['obsolete_names'], ' subsp. ')){
				$temp = str_ireplace(' subsp. ', ' ssp. ', $currPlant['obsolete_names']);
			}
		}
		if(count($temp)){
			foreach($temp as $curr){
				$species = explode('|', strtolower(trim($curr)));
				$species = $species[0];
				$species = preg_replace('/\s+(f|var|ssp|sp|subsp)\s+/i', ' $1. ', strtolower(trim($species)));
				$totalPhotos = 0;
				
				if($species!=''){
					echo $species.'::<br>';
					
					$url = "http://calphotos.berkeley.edu/cgi/img_query?where-lifeform=any&rel-taxon=contains&where-taxon=".urlencode($species)."&rel-namesoup=matchphrase&where-namesoup=&rel-location=matchphrase&where-location=&rel-county=eq&where-county=any&rel-state=eq&where-state=any&rel-country=eq&where-country=any&where-collectn=any&rel-photographer=contains&where-photographer=&rel-kwid=equals&where-kwid=&max_rows=24";
					$content = file_get_contents($url);
					if(preg_match('/Number of matches[^0-9]*([0-9]*)/i', $content, $match)){
						$totalPhotos = intval($match[1]);
					}
					if($totalPhotos>0) break;
				}
			}
		}	
		/*$species = explode('|', strtolower(trim($currPlant['species'])));
		$species = $species[0];
		$species = preg_replace('/\s+(f|var|ssp|sp|subsp)\s+/i', ' $1. ', strtolower(trim($species)));
		*/
		
		if($totalPhotos>0){
				
			/*$url = "http://calphotos.berkeley.edu/cgi/img_query?where-lifeform=any&rel-taxon=contains&where-taxon=".urlencode($species)."&rel-namesoup=matchphrase&where-namesoup=&rel-location=matchphrase&where-location=&rel-county=eq&where-county=any&rel-state=eq&where-state=any&rel-country=eq&where-country=any&where-collectn=any&rel-photographer=contains&where-photographer=&rel-kwid=equals&where-kwid=&max_rows=24";
			
			$content = file_get_contents($url);
			$totalPhotos = 0;
			if(preg_match('/Number of matches[^0-9]*([0-9]*)/i', $content, $match)){
				$totalPhotos = intval($match[1]);
			}
			if($totalPhotos<1){
				
				
			}*/
			if($totalPhotos){
				$db->processQuery(sprintf('delete from %s where plant_id=%s', TABLE_PLANT_PHOTO_CALPHOTOS, $currPlant['id']));
				/*<small><a href=/cgi/img_query?enlarge=8120+3181+4901+0057>
		<img border=0 src=/imgs/128x192/8120_3181/4901/0057.jpeg alt="Arctostaphylos glauca" title="Arctostaphylos glauca"></a>
		<br><i>Arctostaphylos glauca</i><br>Big-berried Manzanita<br><small><font color=999999>ID: 8120 3181 4901 0057</font></small> <a href=/cgi/img_query?seq_num=21230&one=T>[detail]</a><br>Charles Webber<br>&copy; 1999 California Academy of Sciences<br><br><p></small>*/
				if(!preg_match_all('/<td[^>]*>.*?<small[^>]*>.*?(<a\s.*?)<\/*td>/is', $content, $matches, PREG_SET_ORDER)){
					die(json_encode(array()));
				}
				
				echo 'Photos:'.$totalPhotos.'<br>';
				$insert = array();
				$photos = array();
				
				foreach($matches as $curr){
					if(strpos($curr[1], '/cgi/img_query?enlarge=')!==false){
						$temp = explode('<br>', $curr[1]);

						//if(preg_match_all('/<a([^>]*)>[^<]*<img([^>]*)>/is', $temp[0], $match, PREG_SET_ORDER)){
						if(preg_match('/enlarge=\s*[\"|\']*([0-9+]+)/is', $temp[0], $match)){
							// Image found
							$photoId = urldecode($match[1]);
							
							$authorIndex = count($temp)-3;
							$author = $temp[$authorIndex];
							$copyright = preg_replace('/<[^>]*>/', '', trim(str_replace('&copy;', '', $temp[$authorIndex+1])));
							if(stripos($author, '&copy;')!==false){
								$author = str_replace('&copy;', '', $author);
								$copyright = $author;
								
								$author = preg_split('/([0-9]+)/', $author);
								$author = explode('/', trim($author[1]), 2);
								$author = $author[0];
							}
							
							$keyAuthor = strtolower(trim($author));
							
							if(!isset($photos[$keyAuthor])){
								$photos[strtolower(trim($keyAuthor))] = array();
							}
							$photos[strtolower(trim($keyAuthor))][] = array('id'=>$photoId, 'copy'=>$copyright, 'author'=>$author);
							//echo 'Plant ID:'.$plantId.'<br>'. 'Author:'.$author.'<br>Copyright:'.$copyright.'<br>';
							/*$insert[] = sprintf("('%s', '%s', '%s', '%s')", 
												$currPlant['id'], $photoId, 
												str_replace("'", "\'", $author),
												str_replace("'", "\'", $copyright));
							/*if(count($insert)>50){
								$db->processQuery(sprintf('INSERT INTO %s(plant_id, photo_id, author, copyright) values%s', 
																	TABLE_PLANT_PHOTO_CALPHOTOS, 
																	implode(',', $insert)));			
								$insert = array();
							}*/
						}
					}
				}
				
				//print_r($photos);echo '<br>';
				ksort($photos, SORT_STRING);
				//print_r($photos);echo '<br>';
				$temp = array();
				$priorityAuthors = array('Steve Matson', 'Lynn Watson', 'Keir Morse', 'Dieter Wilken', 'Barry Breckling', 'David Graber', 'Gary Monroe');
				foreach($priorityAuthors as $curr){
					$curr = strtolower($curr);
					if(isset($photos[$curr])){
						$temp = array_merge($temp, $photos[$curr]);
						unset($photos[$curr]);
					}
				}
				
				foreach($photos as $author=>$info){
					$temp = array_merge($temp, $info);
				}
				
				$photos = $temp;
				$insert = array();
				$order = 1;
				foreach($photos as $curr){
					$insert[] = sprintf("(%s, '%s', '%s', '%s', %s)", 
												$currPlant['id'], trim($curr['id']), 
												trim(str_replace("'", "\'", $curr['author'])),
												trim(str_replace("'", "\'", $curr['copy'])),
												$order++);
				}
				$sql = sprintf('INSERT INTO %s(plant_id, photo_id, author, copyright, photo_order) values%s', 
														TABLE_PLANT_PHOTO_CALPHOTOS, 
														implode(',', $insert));
				$db->processQuery($sql);
				$insert = array();
			}
			else{
				
				fwrite($h, $currPlant['species']."\n");
			}
		}
		echo '<hr>';
	}	
	
	fclose($h);
	echo 'Completed :'.(time()- $timeStart).'<br><br><br><br>';
		//<a href=/cgi/img_query?enlarge=8120+3181+4901+0057> <img border=0 src=/imgs/128x192/8120_3181/4901/0057.jpeg alt="Arctostaphylos glauca" title="Arctostaphylos glauca"></a>
?>
<script type="text/javascript">
	window.onload = function(){
							setTimeout(function(){ window.location = "<?= $_SERVER['PHP_SELF'] ?>"; }, 2000);
					}
</script>
</body>
</html>