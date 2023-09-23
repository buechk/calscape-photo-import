<?php

			
			foreach($photos as $key=>$allPhotos){
				if(count($allPhotos)>2){
					$first = array_splice($allPhotos, 0, 1);
					
					foreach($allPhotos as $k=>$curr){
						$curr['time'] = preg_replace('/([0-9]+)[a-z]+([0-9]+)/i', '$1 $2', $curr['time']);
						$curr['time'] = trim(preg_replace('/-[0-9.]+$/i', '', $curr['time']));
						
						if(strpos($curr['time'], ':') !== false || strpos($curr['time'], '-') !== false || strpos($curr['time'], '/') !== false){
							$allPhotos[$k]['timestamp'] = strtotime($curr['time']);
						}
						else{
							$allPhotos[$k]['timestamp'] = $curr['time'];
						}						
					}	
					print_r($allPhotos); echo '<hr>';
					uasort($allPhotos, 'sortArrayTimestamp');
					print_r($allPhotos);
					
				}
				echo '<hr>';
			}

?>