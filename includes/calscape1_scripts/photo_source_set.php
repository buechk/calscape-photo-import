<?php
	include_once(dirname(dirname(__FILE__)).'/includes/common.inc.php');

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
	$plantsPerBatch = 500;
	
	$timeStart = time();
	$db = new DB();
	//$sql = sprintf('SELECT id, species, photo_source FROM `%s` where photo_source="calscape" and disabled<1', TABLE_PLANTS);
	//die(print_r($db->processQuery($sql)));
	$sql = sprintf('SELECT plant_id, count(*) as total_images FROM `%s` where plant_id>%s and (image is not null and image<>\'\') group by plant_id order by plant_id limit %s', TABLE_PLANT_PHOTO_CALPHOTOS, $id, $plantsPerBatch);
	echo $sql.'<br>';
	
	$rows = $db->processQuery($sql);
	if(count($rows)){
		echo 'Processing from ' .$id.'('. $plantsPerBatch.').....<br>';
		
		$ids = array();
		$currId = $id;
		foreach($rows as $curr){
			print_r($curr); echo '<br>';
			if($curr['plant_id']>$id){
				$currId = $curr['plant_id'];
			}
			if($curr['total_images']>0)	{
				$ids[] = $curr['plant_id'];
			}
		}	
		
		$sql = sprintf('update `%s` set photo_source="calscape" where id in (%s) limit %s', TABLE_PLANTS, implode(',', $ids), count($ids));
		$result = $db->processQuery($sql);
		echo $sql.'....<br>....'; var_dump($result); echo '<br>';
		
		file_put_contents($fileCounter, $currId);
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