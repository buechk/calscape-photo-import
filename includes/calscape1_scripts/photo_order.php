<?php
/*die('Not Authorized');
	include_once(dirname(dirname(__FILE__)).'/includes/common.inc.php'); */

?>
<html>
<head>
	<title>Set plant photos source</title>	
</head>
<body>
<?php	
	set_time_limit(0);
	echo 'Using database: <b>' .MYSQL_DATABASE.'</b><hr>';
	
	$info = pathinfo(str_replace(dirname(__FILE__).'/', '', __FILE__));
	$fileCounter = dirname(__FILE__).'/'. $info['filename'].'_counter.txt';

	$id = intval(file_get_contents($fileCounter));
	$plantsPerBatch = 250;
	
	$timeStart = time();
	$db = new DB();
	$sql = sprintf('SELECT id FROM `%s` where id>%s order by id limit %s', TABLE_PLANTS, $id, $plantsPerBatch);
	echo $sql.'<br>';
	
	$rows = $db->processQuery($sql);
	
	if(count($rows)){
		echo 'Processing from ' .$id.'('. $plantsPerBatch.').....<br>';
		
		$ids = array();
		$currId = $id;
		foreach($rows as $curr){
			print_r($curr); echo '....';
			$photos = getPlantImages(array($curr['id']), true, true, 
											   array('id'),
											   true, false, false, false, false, true, true);
			$photos = (isset($photos['_'.$curr['id']]) ? $photos['_'.$curr['id']] :  array());
			if(count($photos)){
				$ord = array();
				foreach($photos as $p){
					//print_r($p); echo '<br>';
					$ord[] = $p['id'].($p['calphoto'] ? '_1' : '');
				}
				//print_r($ord);
				var_dump(saveSlideshowOrder($curr['id'], $ord));
				
			}
			file_put_contents($fileCounter, $curr['id']);
			echo '<br>';
		}	
		
		echo '<hr>Completed in '.(time()- $timeStart).'secs<br><br><br><br>';	
		?>
		<script type="text/javascript">
			window.onload = function(){
									setTimeout(function(){ window.location = "<?= $_SERVER['PHP_SELF'] ?>"; }, 2000);
							}
		</script>
		<?php
	}
	else{
		echo '<b>No plants found';
	}
?>
		
</body>
</html>
<?php
	
	
	function saveSlideshowOrder($id, $sequence, $source=''){
		global $db;
		
		$action = 'plant.photos.order';
		//id = (isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0);
		$sequence = ($sequence ? (is_array($sequence) ? $sequence : (explode('|', urldecode($sequence)))) : false);
		
		if(!$sequence || !$id)
			die(json_encode(array('success'=>0, 'message'=>'Photos order is not provided')));

		$when = array();
		$whenCalphotos = array();
		$idPhotos = array();
		$idCalphotos = array();
		$order = 1;
		foreach($sequence as $curr){			
			$temp = explode('_', $curr);
			if(count($temp)>1 && intval($temp)>0){
				$idCalphotos[] = $temp[0];
				$whenCalphotos[] = 'WHEN '.$temp[0]. ' THEN '. $order;				
			}
			else{
				$idPhotos[] = $curr;
				$when[] = 'WHEN '.$curr. ' THEN '. $order;				
			}
			$order++;
		}
		if(count($when)){
			$when[] = 'ELSE photo_order';			
		}
		else{
			return true;
		}
		if(count($whenCalphotos)){
			$whenCalphotos[] = 'ELSE photo_order';
		}
		if(!count($idPhotos) && !count($idCalphotos)){
			die(json_encode(array('success'=>0, 'message'=>'Photos order is not provided')));
		}
		
		if($action =='plant.photos.order' && $source=='calphotos'){			
			if(count($when)){
				$sql = sprintf('UPDATE %s SET order_previous=photo_order, photo_order=CASE id %s END WHERE plant_id=%s and id in (%s) and deleted<1 limit %s', ($source=='calphotos' ? TABLE_PLANT_PHOTO_CALPHOTOS : TABLE_PLANT_PHOTO), implode(' ', $when), $id, implode(',', $idPhotos), count($idPhotos));	
			}
		}
		else{
			if(count($when)){
				$sql = sprintf('UPDATE %s SET order_previous=photo_order, photo_order=CASE photo_id %s END WHERE %s=%s and photo_id in (%s) and deleted<1 limit %s', 
						($action =='plant.photos.order' && $source=='calphotos' ? TABLE_PLANT_PHOTO_CALPHOTOS : ($action == 'plant.photos.order' ? TABLE_PLANT_PHOTO : TABLE_PLANT_LIST_PHOTO)),
						implode(' ', $when),
						($action == 'plant.photos.order' ? 'plant_id' : 'list_id'), 
						$id, implode(',', $idPhotos), count($idPhotos));
			}
		}
		
		if($sql == '')
			die(json_encode(array('success'=>0, 'message'=>'Problem while updating photos. Try after few seconds')));
			
		if(count($whenCalphotos)){
			$sqlCalphotos = sprintf('UPDATE %s SET order_previous=photo_order, photo_order=CASE id %s END WHERE plant_id=%s and id in (%s) and deleted<1 limit %s', TABLE_PLANT_PHOTO_CALPHOTOS, implode(' ', $whenCalphotos), $id, implode(',', $idCalphotos), count($idCalphotos));
		}
		//echo $sql.'<br>'.$sqlCalphotos.'<br>';
	
		$success = $db->processQuery($sql);
		if($success){
			if($sqlCalphotos!= ''){		
				$db->processQuery($sqlCalphotos);
			}				
			if($action == 'plant.photos.order'){
				// Save in `history`
				/*$notes = str_replace('"', '&quot;', json_encode(array('action'=>'order', 'source'=>$source, 'photos'=>$sequence)));
				$db->processQuery(sprintf('insert into %s(plant_id, user_id, date_edited, category, notes) values("%s", "%s", "%s", "photo", "%s")', TABLE_PLANT_EDITS_HISTORY, $id, $__CALSCAPE_USER->getUserId(), time(), $notes));	
				$db->processQuery(sprintf('update %s set photo_source="%s" where id="%s" limit 1', TABLE_PLANTS, $source, $id));*/
			}
			return true;
			die(json_encode(array('success'=>1, 'message'=>'Photos are ordered Successfully')));
		}
		else{
			die(json_encode(array('success'=>0, 'message'=>"Problem while updating photos.\nTry after few seconds.")));
		}
		
			
	}
?>