<?php

//die('No Unauthorized access is allowed');
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
	$limit = 25;
	$timeStart = time();
	$isLepSpecies = (intval($_REQUEST['islep'])>0);
	
	echo 'Using database <b>'.MYSQL_DATABASE.'</b><br>';
	$sql = sprintf('select id, species  from %s where id>%s order by id limit %s', ($isLepSpecies ? TABLE_LEP : TABLE_PLANTS), $startRow, $limit);	
echo $sql.'<br>';	

	$rows = $db->processQuery($sql);
	//print_r($rows);
	$rowsFound = (count($rows));
	
	echo 'Starts from <span class="notice"><b>'.$startRow.'</b></span><br>';
	?>
		<div id="status_container">
			<?php
				if(count($rows)){
					foreach($rows as $processing){
						echo 'Processing '.$processing['species'].'('.$processing['id'].')......';
						$_REQUEST = array();
						$_REQUEST['pl'] = $processing['id'];
						if($isLepSpecies){
							$_REQUEST['islep'] = 1;
						}				
						ob_start();
						include(dirname(__DIR__).'/slideshow.php');
						$response = ob_get_clean();
						echo ' completed(';
					//	print_r($_REQUEST);
						echo ')<br>';
						file_put_contents($fileCounter, $processing['id']);
					}
				}
				else{
					?>
					<h2>All species are processed</h2>
					<?
				}
			?>
			<br><br>Completed in <b><?php echo (time()-$timeStart) ?> sec(s)<br>
	</div>
	<?php
	if(count($rows)){?>
	<script type="text/javascript">
		window.onload = function(){
						var dt = new Date();
						setTimeout(function(){ window.location = '<?= $_SERVER['PHP_SELF'] ?>?tm='+dt.getTime()+'<?php echo ($isLepSpecies ? '&islep=1' : '');?>'; }, 2000);
					}
	</script>
	<?php
	}
	?>
</body>
</html>
	   