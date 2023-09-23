<?
	@session_start();
	include_once(dirname(dirname(__FILE__)).'/includes/common.inc.php');
	
	set_time_limit(0);
	ini_set('memory_limit', '1200M');
	
	if(!defined('URL_PHOTO_SEARCH')){
		define('URL_PHOTO_SEARCH', 'http://195.166.150.233:8087/classify_image');
	}
	
	if(!defined('DIR_TEST_PHOTOS')){
		define('DIR_TEST_PHOTOS', dirname(__FILE__).'/photo_search/');
	}
	if(!defined('URL_TEST_PHOTOS')){
		define('URL_TEST_PHOTOS', CALSCAPE_URL.'demo/data/photo_search/');
	}
	
	define('CALPHOTOS_TEST_IMAGES_FILE', dirname(__FILE__).'/00_calphotos_test_images.csv');
	
	define('DIR_TEST10_IMAGES', dirname(__FILE__).'/test10/');
	define('URL_TEST10_IMAGES', CALSCAPE_URL.'demo/data/test10/');
	
	define('DIR_CLEANED_IMAGES', dirname(__FILE__).'/cleaned/');
	define('URL_CLEANED_IMAGES', CALSCAPE_URL.'demo/data/cleaned/');
	
	define('DIR_GOOGLE_IMAGES', dirname(__FILE__).'/google_images/');
	define('URL_GOOGLE_IMAGES', CALSCAPE_URL.'demo/data/google_images/');
	
	define('DIR_CROPPED_IMAGES',  CALSCAPE_ROOT_DIR.'/cnps_id_cropped/');
	define('DIR_CROPPED_IMAGES_CALPHOTOS',  DIR_CROPPED_IMAGES.'calphotos/');
	define('DIR_CROPPED_IMAGES_PHOTOS',  DIR_CROPPED_IMAGES.'photos/');
	define('URL_CROPPED_IMAGES', CALSCAPE_URL.'cnps_id_cropped/');
	
	define('SOURCE_CALPHOTOS_IMAGES', 'calphotos');
	define('SOURCE_CLEANED_IMAGES', 'cleaned');
	define('SOURCE_CROPPED_IMAGES', 'cropped_images');
	define('SOURCE_GOOGLE_IMAGES', 'cropped');
	define('SOURCE_TEST10_IMAGES', 'test10');
	define('SOURCE_WILD_IMAGES', 'test_images');
//die(DIR_CROPPED_IMAGES.'<br>'.URL_CROPPED_IMAGES);

	define('ROW_HEIGHT', THUMBNAIL_HEIGHT+10);

	function setLink($sheet, $cell, $plantId, $species='', $source='', $imageUrl=''){
		$link2Image = ($source == SOURCE_WILD_IMAGES);
		$link = '';
		if($link2Image){
			if($imageUrl != '') 
				$link = $imageUrl;
		}
		if($link ==''){
			if($plantId){
				if($link2Image){
					if($imageUrl != '') return $imageUrl;
					
					foreach(array('jpg', 'jpeg', 'JPG') as $ext){
						if(file_exists(DIR_TEST_PHOTOS.$species.'.'.$ext)){
							$link = 'https:'.URL_TEST_PHOTOS.$species.'.'.$ext;	
							break;
						}
					}
				}
				else{
					$link = 'https:'.CALSCAPE_URL.createPlantUrl('', '', $plantId);	
				}
				
			}
			elseif($species !=''){
				if($link2Image){
					//echo $species.'<br>';
					$species = str_replace('_', ' ', $species);
					$species = str_replace('_', '-', $species);
					$link = 'https:'.CALSCAPE_URL.$species.'()';	
				}
				else{
					$species = str_replace('_', ' ', $species);
					$species = str_replace('_', '-', $species);
					$link = 'https:'.CALSCAPE_URL.$species.'()';	
				}
			}
			else{
				return false;
			}
		}
		if($link != ''){
			$sheet->getCell($cell)->setDataType(PHPExcel_Cell_DataType::TYPE_STRING2);
			$sheet->getCell($cell)->getHyperlink()->setUrl($link);
		}
	}
	
	function setImage($sheet, $cell, $text, $description, $image, $link){
		list($width, $height) = getimagesize($image);
		
		$obj = new PHPExcel_Worksheet_Drawing();    
		$obj->setName($text);        
		$obj->setDescription($description);
		$obj->setPath($image);
		//$obj->setOffsetX(5); 
		$obj->setOffsetY(20);
		$obj->setCoordinates($cell); 
		//$obj->setWidth(ROW_HEIGHT);   
		$obj->setHeight(THUMBNAIL_HEIGHT);  
		$obj->setWorksheet($sheet); 
		
		if($link != ''){
			$sheet->setCellValue($cell, 'Link');
			$sheet->getCell($cell)->setDataType(PHPExcel_Cell_DataType::TYPE_STRING2);
			$sheet->getCell($cell)->getHyperlink()->setUrl($link);
		}
	}
	
	function getBatchFiles($dim, $source){
		
		if($dim==0 || $dim==16){
			
		}
		
		$fileSearchResults = 'photo_search'.($source==''? '' : '_'.$source).($dim=='' || $dim==16? '' : '_'.$dim).'_batch_';
		$batchFiles = array();
		
		if ($h = opendir(dirname(__FILE__))){
	    	while (($file = readdir($h)) !== false){
	    		if($file != '.' && $file != '..'){
	    			if(stripos($file, $fileSearchResults) !== false){
						$batchFiles[] = $file;
					}
				}
	    	}
	    	closedir($h);
		}
		
		return $batchFiles;
	}
		

	if(!(isset($_REQUEST['export']) || isset($_REQUEST['id']))){
		die('Invalid action');
	}
	$export = true;
	$plantId = (isset($_REQUEST['id']) ? intval($_REQUEST['id']) : getSession('photo_search_counter', 101));
	$source = (isset($_REQUEST['source']) ? strtolower(trim($_REQUEST['source'])) : '');
	$batch = (isset($_REQUEST['batch']) ? intval($_REQUEST['batch']) : 0);
	$export = (isset($_REQUEST['export']) ? intval($_REQUEST['export'])>0 : false);
	
	if($batch>0) $batch = 100;
	$dimension = (isset($_REQUEST['dim']) ? intval($_REQUEST['dim']) : 16);
	if(!in_array($dimension, array(16, 32, 64, 128))){
		$dimension = 16;
	}
	$urlClassify = URL_PHOTO_SEARCH;
	if($dimension!=16){
		$urlClassify .= '_'.$dimension;
	}
	$fileSearchPlants = dirname(__FILE__).'/photo_search_species.txt';
	$fileSearchResults = dirname(__FILE__).'/photo_search'.($source==''? '' : '_'.$source).($dimension=='' || $dimension==16? '' : '_'.$dimension).'_batch_'.$batch.'_results.txt';
	$fileSearchResultsCSV = str_ireplace('.txt', '.csv', $fileSearchResults);
//die(var_dump($plantId));

	//$response = "Overall prediction:\n['Lupinus_microcarpus']\n{'Abies_concolor': 0.0, 'Abronia_villosa': 0.0, 'Acmispon_argophyllus': 0.0, 'Acmispon_glaber': 0.0, 'Adenostoma_fasciculatum': 0.0, 'Aliciella_latifolia': 0.0, 'Arbutus_menziesii': 0.2, 'Arctostaphylos_glandulosa': 0.0, 'Arctostaphylos_viscida': 0.0, 'Astragalus_lentiginosus': 0.0, 'Astragalus_nuttallii': 0.0, 'Astragalus_purshii': 0.0, 'Astragalus_whitneyi': 0.0, 'Baccharis_pilularis': 0.0, 'Brodiaea_elegans': 0.0, 'Calochortus_venustus': 0.0, 'Castilleja_applegatei': 0.0, 'Castilleja_exserta': 0.0, 'Ceanothus_cuneatus': 0.0, 'Chylismia_brevipes': 0.0, 'Chylismia_claviformis': 0.0, 'Cirsium_occidentale': 0.0, 'Clarkia_purpurea': 0.0, 'Claytonia_parviflora': 0.0, 'Darlingtonia_californica': 0.0, 'Delphinium_parishii': 0.0, 'Dichelostemma_capitatum': 0.0, 'Dieteria_canescens': 0.0, 'Dudleya_abramsii': 0.0, 'Dudleya_cymosa': 0.0, 'Epilobium_canum': 0.0, 'Epilobium_ciliatum': 0.0, 'Eremalche_parryi': 0.0, 'Eremothera_boothii': 0.0, 'Ericameria_nauseosa': 0.0, 'Eriogonum_fasciculatum': 0.0, 'Eriogonum_heermannii': 0.0, 'Eriogonum_kennedyi': 0.0, 'Eriogonum_microthecum': 0.0, 'Eriogonum_nudum': 0.0, 'Eriogonum_ovalifolium': 0.0, 'Eriogonum_strictum': 0.0, 'Eriogonum_umbellatum': 0.0, 'Eriogonum_wrightii': 0.0, 'Eriophyllum_lanatum': 0.0, 'Eschscholzia_californica': 0.0, 'Frangula_californica': 0.0, 'Fritillaria_affinis': 0.0, 'Galium_angustifolium': 0.0, 'Hemizonia_congesta': 0.0, 'Hulsea_vestita': 0.0, 'Hymenopappus_filifolius': 0.0, 'Keckiella_breviflora': 0.0, 'Langloisia_setosissima': 0.0, 'Lasthenia_californica': 0.0, 'Lathyrus_vestitus': 0.0, 'Lewisia_rediviva': 0.0, 'Lilium_pardalinum': 0.0, 'Lomatium_dasycarpum': 0.0, 'Lupinus_albifrons': 0.0, 'Lupinus_argenteus': 0.0, 'Lupinus_excubitus': 0.0, 'Lupinus_lepidus': 0.0, 'Lupinus_microcarpus': 0.4, 'Malacothamnus_fasciculatus': 0.0, 'Malacothamnus_palmeri': 0.0, 'Mimulus_aurantiacus': 0.0, 'Mimulus_bigelovii': 0.0, 'Mimulus_nanus': 0.0, 'Mimulus_primuloides': 0.0, 'Mirabilis_laevis': 0.0, 'Monardella_odoratissima': 0.0, 'Navarretia_hamata': 0.0, 'Nemophila_menziesii': 0.0, 'Oenothera_californica': 0.0, 'Oenothera_deltoides': 0.0, 'Opuntia_basilaris': 0.0, 'Orobanche_californica': 0.0, 'Palafoxia_arida': 0.0, 'Penstemon_grinnellii': 0.0, 'Pentagramma_triangularis': 0.0, 'Peritoma_arborea': 0.0, 'Petalonyx_thurberi': 0.0, 'Phacelia_cicutaria': 0.0, 'Phacelia_crenulata': 0.0, 'Phacelia_hastata': 0.0, 'Pholistoma_auritum': 0.0, 'Pinus_contorta': 0.4, 'Pinus_ponderosa': 0.0, 'Platanthera_dilatata': 0.0, 'Populus_tremuloides': 0.0, 'Primula_clevelandii': 0.0, 'Sambucus_nigra': 0.0, 'Sedum_obtusatum': 0.0, 'Sidalcea_malviflora': 0.0, 'Silene_laciniata': 0.0, 'Sphaeralcea_ambigua': 0.0, 'Streptanthus_glandulosus': 0.0, 'Triteleia_ixioides': 0.0, 'Viola_purpurea': 0.0, 'Xylorhiza_tortifolia': 0.0}\n";
	
	//$plantsList = explode(',', 'Arctostaphylos_glandulosa, Petalonyx_thurberi, Eriogonum_ovalifolium, Dichelostemma_capitatum, Lomatium_dasycarpum, Triteleia_ixioides, Xylorhiza_tortifolia, Arbutus_menziesii, Castilleja_applegatei, Mimulus_bigelovii, Eschscholzia_californica, Lupinus_lepidus, Pinus_ponderosa, Eriogonum_umbellatum, Dudleya_cymosa, Fritillaria_affinis, Nemophila_menziesii, Lathyrus_vestitus, Oenothera_deltoides, Silene_laciniata, Acmispon_glaber, Eriogonum_kennedyi, Eriogonum_heermannii, Chylismia_claviformis, Pholistoma_auritum, Malacothamnus_palmeri, Hymenopappus_filifolius, Oenothera_californica, Sedum_obtusatum, Ceanothus_cuneatus, Eremothera_boothii, Monardella_odoratissima, Pentagramma_triangularis, Eriogonum_nudum, Peritoma_arborea, Keckiella_breviflora, Navarretia_hamata, Acmispon_argophyllus, Phacelia_cicutaria, Primula_clevelandii, Lupinus_argenteus, Lupinus_microcarpus, Epilobium_ciliatum, Sidalcea_malviflora, Astragalus_purshii, Adenostoma_fasciculatum, Populus_tremuloides, Eriogonum_microthecum, Opuntia_basilaris, Mimulus_nanus, Dudleya_abramsii, Palafoxia_arida, Mirabilis_laevis, Eriogonum_strictum, Darlingtonia_californica, Frangula_californica, Hulsea_vestita, Viola_purpurea, Mimulus_aurantiacus, Astragalus_lentiginosus, Lupinus_excubitus, Lilium_pardalinum, Clarkia_purpurea, Langloisia_setosissima, Pinus_contorta, Epilobium_canum, Arctostaphylos_viscida, Eriophyllum_lanatum, Eremalche_parryi, Dieteria_canescens, Sphaeralcea_ambigua, Lasthenia_californica, Astragalus_whitneyi, Platanthera_dilatata, Hemizonia_congesta, Lupinus_albifrons, Streptanthus_glandulosus, Delphinium_parishii, Penstemon_grinnellii, Ericameria_nauseosa, Brodiaea_elegans, Galium_angustifolium, Castilleja_exserta, Sambucus_nigra, Malacothamnus_fasciculatus, Eriogonum_wrightii, Abronia_villosa, Eriogonum_fasciculatum, Phacelia_crenulata, Claytonia_parviflora, Astragalus_nuttallii, Mimulus_primuloides, Calochortus_venustus, Orobanche_californica, Aliciella_latifolia, Lewisia_rediviva, Abies_concolor, Chylismia_brevipes, Phacelia_hastata, Cirsium_occidentale, Baccharis_pilularis');
	
	$plantsList = explode("\n", file_get_contents($fileSearchPlants));
	
	foreach($plantsList as $key=>$curr){
		$plantsList[$key] = trim($curr);
	}
//error_reporting(E_ALL)		;
//ini_set('display_errors', 'On');
	
	sort($plantsList);	

	if($export){
		$filename = dirname(__FILE__).'/photo_search'.($source==''? '' : '_'.$source);
		$fileResults = array();
		foreach(array(16, 32, 64, 128) as $currDim){
			/*$currFile = $filename . ($currDim=='' || $currDim==16? '' : '_'.$currDim).'_results.txt';
			if(file_exists($currFile)){
				$fileResults[] = array('dim'=>$currDim, 'file'=>$currFile);
			}*/
			$currFile = $filename . ($currDim=='' || $currDim==16? '' : '_'.$currDim).'_batch_0_results.txt';
			if(file_exists($currFile)){
				$fileResults[] = array('dim'=>$currDim, 'file'=>$currFile, 'batch'=>0);
			}
			$currFile = $filename . ($currDim=='' || $currDim==16? '' : '_'.$currDim).'_batch_100_results.txt';
			if(file_exists($currFile)){
				$fileResults[] = array('dim'=>$currDim, 'file'=>$currFile, 'batch'=>100);
			}
		}

		require_once INCLUDES_DIR.'PHPExcel_1.7.9/PHPExcel.php';	
		
		$xls = new PHPExcel();
		$xls->getProperties()->setCreator("Calscape.com")
						 ->setLastModifiedBy("Calscape.com")
						 ->setTitle("Plants Search")
						 ->setSubject("Search Demo")
						 ->setDescription("Searching for the plants based on a image");
		$xls->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
		$xls->getDefaultStyle()->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_TOP);
										 
		$speciesWidth = 30;

		if(count($fileResults)){
			foreach($fileResults as $index=>$fileResultsCurrent){

				$data = explode("\n", file_get_contents($fileResultsCurrent['file']));
				if($index>0){
					$xls->createSheet($index);           
       			}
				$xls->setActiveSheetIndex($index);
				
				$sheet = $xls->getActiveSheet();				
				
				$sheetTitle = /*date('Y-m-d ').*/ ($source == SOURCE_WILD_IMAGES ? 'Wild Photo' : ($source == SOURCE_CALPHOTOS_IMAGES ? 'Calphotos' : 'Image')).' ('.$fileResultsCurrent['dim'].') '.count($data).' '.(intval($fileResultsCurrent['batch']) > 1 ? $fileResultsCurrent['batch'] : '');
								
				$sheet->setTitle($sheetTitle);		
				$sheet->getDefaultRowDimension()->setRowHeight(-1);
				
				$sheet->mergeCells('A1:I1');
				
				$sheet->getColumnDimension('A')->setAutoSize(true);
				$sheet->getRowDimension(1)->setRowHeight(30);
				$sheet->getStyle()->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
				
				$style = array('font' => array('size' => 15,'bold' => true,' color' => array('rgb' => '2D80DB')));
				$sheet->getStyle('A1:I1')->applyFromArray($style);
				
				$sheet->setCellValue('A1', 'Calscape ID Test '.date('F d, h:i A').' - '.($source == SOURCE_WILD_IMAGES ? 'Wild Photos' : 'Slideshow Images'));
				
				$summary = array('Percent Correct'=>'unknown%',
								'Percent Top 5'=>'unknown%',
								'Percent Top 10'=>'unknown%',
								'Percent Top 20'=>'unknown%');
				$xlRow = 3;
				if(count($summary)){
					foreach($summary as $key=>$value){
						$sheet->setCellValue('A'.$xlRow, $key);
						$sheet->setCellValue('B'.$xlRow, $value);
						$sheet->getStyle('B'.$xlRow)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);
						$xlRow++;
					}
				}
				$xlRow++;

				$style = array('font' => array('size' => 11,'bold' => true, 
								'alignment' => array('horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER)),
								'fill'=>array('type' => PHPExcel_Style_Fill::FILL_SOLID,
										        'startcolor' => array(
										             'rgb' => 'C3C3C3'
										        )));
				$sheet->getStyle('B'.$xlRow.':C'.$xlRow)->applyFromArray($style);		
				$sheet->mergeCells('B'.$xlRow.':C'.$xlRow);
				$sheet->setCellValue('B'.$xlRow, 'Correct Pick');		
				
				$sheet->getColumnDimension('D')->setWidth(8);
				
				$style['alignment']['horizontal'] = PHPExcel_Style_Alignment::HORIZONTAL_RIGHT;
				$sheet->getStyle('E'.$xlRow.':I'.$xlRow)->applyFromArray($style);
				$sheet->mergeCells('E'.$xlRow.':I'.$xlRow);
				$sheet->setCellValue('E'.$xlRow, 'Top 5 Guesses');
				$xlRow++;
				
				$style = array('font' => array('size' => 11,'bold' => true, 'alignment' => array('horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_LEFT)));	
				$sheet->getStyle('A'.$xlRow.':C'.$xlRow)->applyFromArray($style);
				$sheet->setCellValue('A'.$xlRow, 'Plant');
				$sheet->setCellValue('B'.$xlRow, 'Photo');
				$sheet->setCellValue('C'.$xlRow, 'Rank');
				$sheet->setCellValue('D'.$xlRow, 'Score');
				
				$style['alignment']['horizontal'] = PHPExcel_Style_Alignment::HORIZONTAL_CENTER;
				$sheet->getStyle('F'.$xlRow.':J'.$xlRow)->applyFromArray($style);
				$sheet->setCellValue('F'.$xlRow, '1');
				$sheet->setCellValue('G'.$xlRow, '2');
				$sheet->setCellValue('H'.$xlRow, '3');
				$sheet->setCellValue('I'.$xlRow, '4');
				$sheet->setCellValue('J'.$xlRow, '5');		
				
				$sheet->getColumnDimension('A')->setAutoSize(true);
				$sheet->getColumnDimension('B')->setWidth(16);
				$sheet->getColumnDimension('C')->setAutoSize(true);
				$sheet->getColumnDimension('D')->setAutoSize(true);
				$sheet->getColumnDimension('F')->setAutoSize(true);
				$sheet->getColumnDimension('G')->setAutoSize(true);
				$sheet->getColumnDimension('H')->setAutoSize(true);
				$sheet->getColumnDimension('I')->setAutoSize(true);
				$sheet->getColumnDimension('J')->setAutoSize(true);
				$xlRow++;
				
				
				
				$total = 0;
				$match = $top5 = $top10 = $top20 = 0;
				
				if(count($data)){
					//echo $fileResultsCurrent['dim'].':'.count($data).'<br>';
					foreach($data as $curr){
						$curr = json_decode($curr, true);
						$row = array_values($curr);
						$id = array_keys($curr)[0];
					//print_r($curr);echo '<br>';
						if(count($row)) $row = $row[0];
						if($row && (trim($row['species']) != '' || $source == SOURCE_GOOGLE_IMAGES)){
							$keySpecies = str_replace(' ', '_', $row['species']);
							
							arsort($row['prob']);
							if($row['prob'][$keySpecies]<=0){
								$rank = false;//count($data);
							}
							else{
								$rank = array_search($keySpecies, array_keys($row['prob']));	
							}
							
							if($rank === false){
								$rank = 'N/A';//count($data);
							}
							else{
								$rank++;
								if($rank == 1){
									$match++;
								}
								if($rank<=5){
									$top5++;
								}
								if($rank <= 10){
									$top10++;
								}
								if($rank <= 20){
									$top20++;
								}

							}

							
							$total++;
							$score = round($row['prob'][$keySpecies]*100);
						
							$sheet->getRowDimension($xlRow)->setRowHeight(ROW_HEIGHT);
							$sheet->setCellValue('A'.$xlRow, $row['species']);
							setLink($sheet, 'A'.$xlRow, $id, $row['species'], $source, $row['image']);
							$thumb = createThumbnail(str_ireplace('http:'.CALSCAPE_URL, CALSCAPE_ROOT_DIR.'/', $row['image']), CACHE_DIR, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, true);
							$thumb = str_ireplace(CACHE_PREFIX,  CACHE_DIR, $thumb);
							//echo 'Thumb:'.$thumb.'<br>';
							setImage($sheet, 'B'.$xlRow, $row['species'], $row['species'], $thumb, $row['image']);
							
							$sheet->setCellValue('C'.$xlRow, $rank);
							$sheet->setCellValue('D'.$xlRow, $score);
							
							$temp =  array_keys($row['prob']);
							
							$sheet->setCellValue('F'.$xlRow, $temp[0]. '('.round($row['prob'][$temp[0]]*100).')');
							setLink($sheet, 'F'.$xlRow, 0, $temp[0]);
							$sheet->setCellValue('G'.$xlRow, $temp[1]. '('.round($row['prob'][$temp[1]]*100).')');
							setLink($sheet, 'G'.$xlRow,  0, $temp[1]);
							$sheet->setCellValue('H'.$xlRow, $temp[2]. '('.round($row['prob'][$temp[2]]*100).')');
							setLink($sheet, 'H'.$xlRow, 0, $temp[2]);
							$sheet->setCellValue('I'.$xlRow, $temp[3]. '('.round($row['prob'][$temp[3]]*100).')');
							setLink($sheet, 'I'.$xlRow, 0, $temp[3]);
							$sheet->setCellValue('J'.$xlRow, $temp[4]. '('.round($row['prob'][$temp[4]]*100).')');
							setLink($sheet, 'J'.$xlRow, 0, $temp[4]);
							
							$xlRow++;
						}	
					}
				}
				
				$summary = array('Percent Correct'=>round($match*100/$total).'%',
								'Percent Top 5'=>round($top5*100/$total).'%',
								'Percent Top 10'=>round($top10*100/$total).'%',
								'Percent Top 20'=>round($top20*100/$total).'%');
				$rowTemp = 3;
				if(count($summary)){
					foreach($summary as $key=>$value){
						$sheet->setCellValue('A'.$rowTemp, $key);
						$sheet->setCellValue('B'.$rowTemp, $value);
						$rowTemp++;
					}
				}
			}
		}
		
		header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		header('Content-Disposition: attachment;filename="plants_search'.($source == '' ? '_slideshow_image' : '_'.$source).'_'. date('Y_m_d_h_i_s_a').'.xlsx"');
		header('Cache-Control: max-age=0');
		$objWriter = PHPExcel_IOFactory::createWriter($xls, 'Excel2007');
		$objWriter->save('php://output'); 
		
		exit(0);
	}
	
	$testImages = array();
	if($source == SOURCE_CALPHOTOS_IMAGES){
		if (($handle = fopen(CALPHOTOS_TEST_IMAGES_FILE, "r")) !== FALSE) {
			$row = 0;
			$urlCalphoto = $speciesCalphoto = '';
			
		    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		    	if($row == $plantId){
		    		$speciesCalphoto = $data[2];
					$t = explode(' ', trim($data[1]));
		    		$urlCalphoto = strtr(URL_CALPHOTOS_IMAGE, array('{1}'=>$t[0], '{2}'=>$t[1], '{3}'=>$t[2], '{4}'=>$t[3]));
		    		
		    		$row++;
		    		break;
				}
				$row++;		    
		    }
		    fclose($handle);

		    if($plantId>=$row){
				die('Completed');
			}

		}
		else{
			die('Calphotos image not found');
		}
			
	}
	else if($source == SOURCE_GOOGLE_IMAGES){
		if(is_dir(DIR_GOOGLE_IMAGES)){
			if ($h = opendir(DIR_GOOGLE_IMAGES)){
		    	while (($file = readdir($h)) !== false){
		    		if(!is_dir(DIR_GOOGLE_IMAGES.$file)){
		    			$testImages[] = DIR_GOOGLE_IMAGES.$file;
					}
		    	}
		    	closedir($h);
		  	}
		}
	}
	else if($source == SOURCE_TEST10_IMAGES){
	
		$test10Species = explode("\n", strtolower(file_get_contents(dirname(__FILE__).'/10test_species.txt')));
		if(count($test10Species)){
			foreach($test10Species as $k=>$v){
				$test10Species[$k] = trim($v);
			}
		}
		
		if (is_dir(DIR_TEST10_IMAGES)){
			if ($h = opendir(DIR_TEST10_IMAGES)){
		    	while (($file = readdir($h)) !== false){
		    		if($file != '.' && $file != '..'){
		    			$temp = explode('-', strtolower($file), 2);
		    			$temp = str_replace("_", ' ', trim($temp[0]));
		    			if(in_array($temp, $test10Species)!==false){
							$testImages[] = DIR_TEST10_IMAGES.$file;
						}						
					}
		    	}
		    	closedir($h);
		  	}
		}
		sort($testImages);
	}
	else if($source == SOURCE_CROPPED_IMAGES){	
		if(is_dir(DIR_CROPPED_IMAGES_CALPHOTOS)){
			if ($h = opendir(DIR_CROPPED_IMAGES_CALPHOTOS)){
		    	while (($file = readdir($h)) !== false){
		    		if(!is_dir(DIR_CROPPED_IMAGES_CALPHOTOS.$file)){
		    			$testImages[] = array('is_calphoto'=>1, 'src'=>DIR_CROPPED_IMAGES_CALPHOTOS.$file);
					}
		    	}
		    	closedir($h);
		  	}
		}
		
		if(is_dir(DIR_CROPPED_IMAGES_PHOTOS)){
			if ($h = opendir(DIR_CROPPED_IMAGES_PHOTOS)){
		    	while (($file = readdir($h)) !== false){
		    		if(!is_dir(DIR_CROPPED_IMAGES_PHOTOS.$file)){
		    			$testImages[] = array('is_calphoto'=>0, 'src'=>DIR_CROPPED_IMAGES_PHOTOS.$file);
					}
		    	}
		    	closedir($h);
		  	}
		}
		sort($testImages);
	}
	else if($source == SOURCE_WILD_IMAGES){		
		if (is_dir(DIR_TEST_PHOTOS)){
			if ($h = opendir(DIR_TEST_PHOTOS)){
		    	while (($file = readdir($h)) !== false){
		    		if($file != '.' && $file != '..'){
						$testImages[] = DIR_TEST_PHOTOS.$file;
					}
		    	}
		    	closedir($h);
		  	}
		}
		sort($testImages);	
	}
	else if($source == SOURCE_CLEANED_IMAGES){		
		if (is_dir(DIR_CLEANED_IMAGES)){
			if ($h = opendir(DIR_CLEANED_IMAGES)){
		    	while (($file = readdir($h)) !== false){
		    		if($file != '.' && $file != '..' && stripos($file, '.zip') == false){
		    			$testImages[] = DIR_TEST_PHOTOS.$file;
					}
		    	}
		    	closedir($h);
		  	}
		}
		sort($testImages);	
	}

	$completed = false;
	$totalPlants = count($plantsList);
	if($source == SOURCE_WILD_IMAGES || $source == SOURCE_TEST10_IMAGES || $source==SOURCE_CROPPED_IMAGES || $source == SOURCE_GOOGLE_IMAGES){
		$totalPlants = count($testImages);
	}
	else if($source == SOURCE_CALPHOTOS_IMAGES){
		$totalPlants = 1104;
	}
	
	$completed = ($plantId>=$totalPlants);
	if($completed){
	//	$data = explode("\n", file_get_contents($fileSearchResults));
		die('Completed');
	}
	else{
	//	die('Unauthorized access not allowed');
		
	}
	
	$species = $speciesCSV = array();
	
	if(!$db){
		$db = new DB();
	}
	
	if($plantId<=0 && !$export){
		// Start from firstplant
		// Delete previous search results
		unlink($fileSearchResults);
		unlink($fileSearchResultsCSV);
		file_put_contents($fileSearchResultsCSV, '"Plant Name","Image URL","Score","Rank","1stPick (Score)","2ndPick (Score)","3rdpick (Score)","4thPick (Score)","5thPick (Score)"'."\n");
	}
	
	if($source == SOURCE_WILD_IMAGES){
		$imageInfo = pathinfo($testImages[$plantId]);
		$key = array_search(str_replace(' ', '_', ucfirst($imageInfo['filename'])), $plantsList);
		if($key === false) $key = 0;
		//$plantsGroup = array_slice($plantsList, max(0, $key-7), 15);	
		$curr = trim(strtolower(str_replace('_', ' ', $imageInfo['filename'])));
		//$plantId = $key;
		$currPlantKey = $key;
	}
	else if($source == SOURCE_TEST10_IMAGES){
		$imageInfo = pathinfo($testImages[$plantId]);
		$key = array_search(str_replace(' ', '_', ucfirst($imageInfo['filename'])), $plantsList);
		if($key === false) $key = 0;
		//$plantsGroup = array_slice($plantsList, max(0, $key-7), 15);	
		$curr = explode('-', trim(strtolower(str_replace('_', ' ', $imageInfo['filename']))));
		$curr = $curr[0];
		//$plantId = $key;
		$currPlantKey = $key;
	}
	else if($source == SOURCE_GOOGLE_IMAGES){
		$imageInfo = pathinfo($testImages[$plantId]);		
		$curr = '';
		$currPlantKey = false;
	}
	else if($source == SOURCE_CALPHOTOS_IMAGES){
		$currPlant = $speciesCalphoto;
		$key = array_search(str_replace(' ', '_', $speciesCalphoto), $plantsList);
		if($key === false) $key = 0;
		//$plantsGroup = array_slice($plantsList, max(0, $key-7), 15);	
		$curr = $speciesCalphoto;
		//echo $plantsList[$key].'<br>';
		//$plantId = $key;
		$currPlantKey = $key;
	}
	else if($source == SOURCE_CROPPED_IMAGES){
		$temp = $testImages[$plantId];
		$imageInfo = pathinfo($temp['src']);
		$file = ucfirst($imageInfo['filename']);
		
		if(!$temp['is_calphoto']){
			$curr = trim(preg_replace('/(_[0-9]+|_image[_0-9]+)/', '', $file));
			$key = array_search(str_replace(' ', '_', $curr), $plantsList);
			//echo $curr;
			if($key === false) $key = 0;
		}
		else{
			$sql = sprintf('select %s.species, plant_id from %s join %s on %s.id=%s.plant_id where thumbnail like \'%s\' limit 1', 
							TABLE_PLANTS, TABLE_PLANT_PHOTO_CALPHOTOS, TABLE_PLANTS, TABLE_PLANTS, TABLE_PLANT_PHOTO_CALPHOTOS, 
							$imageInfo['basename']);
			$row = $db->processQuery($sql);
			$row = (count($row) ? $row[0] : false);
			if($row){
				$curr = trim($row['species']);
			}
			else{
				$curr = '';
			}
			$key = array_search(str_replace(' ', '_', $curr), $plantsList);
			if($key === false) $key = 0;
			
		}
		$currPlantKey = $key;
	}
	else{
		$currPlant = $plantsList[$plantId];
		$curr = trim(strtolower(str_replace('_', ' ', $currPlant)));
		$currPlantKey = $plantId;
		//$plantsGroup = array_slice($plantsList, max(0, $plantId-7), 15);
	}
	echo 'Processing <b>'.ucfirst($curr).'</b>.....<br>';
	if($source != SOURCE_GOOGLE_IMAGES){
		$sql = sprintf('select id, species from %s where species like "%s" and disabled<1', TABLE_PLANTS, '%'.$curr.'');		
		//echo $sql.'<br>';
		$row = $db->processQuery($sql);
		if(count($row)){
			$row = $row[0];
		}
		else{
			$row = false;
		}
	}
		if($row || $source == SOURCE_GOOGLE_IMAGES){
			if($source == SOURCE_WILD_IMAGES){
				$img = str_ireplace(DIR_TEST_PHOTOS, URL_TEST_PHOTOS, $testImages[$plantId]);
			}
			else if($source == SOURCE_TEST10_IMAGES){
				$img = str_ireplace(DIR_TEST10_IMAGES, URL_TEST10_IMAGES, $testImages[$plantId]);
			}
			else if($source == SOURCE_CALPHOTOS_IMAGES){
				$img = $urlCalphoto;
			}
			else if($source == SOURCE_CROPPED_IMAGES){
				$img = str_ireplace(DIR_CROPPED_IMAGES, URL_CROPPED_IMAGES, $testImages[$plantId]['src']);
			}
			else if($source == SOURCE_GOOGLE_IMAGES){
				$img = str_ireplace(DIR_GOOGLE_IMAGES, URL_GOOGLE_IMAGES, $testImages[$plantId]);
			}
			else{
				$plant_photos = getPlantImages(array($row['id']), true, true, 
											   array('id', 'artist', 'filename', 'ImageDescription'=>'info', 'approved'),
												   true, false, false, false, false, true, true);
				$image = (count($plant_photos['_'.$row['id']]) ? $plant_photos['_'.$row['id']][0] : false);
				if($image){
					if(isset($image['photo_id'])){
						$img ='http://calphotos.berkeley.edu/cgi/img_query?enlarge='.str_replace(' ', '+', $image['photo_id']);
					}
					else{
						if($image['calphoto']){
							$thumb = strtr($image['filename'], array(CACHE_URL=>'', '_th.'=>'.'));
							$img = '';
							if(file_exists(CALPHOTOS_IMAGES500_DIR.$thumb)){
								$img = CALPHOTOS_IMAGES500_URL.$thumb;
							}
							else{
								if(file_exists(CALPHOTOS_IMAGES_DIR.$thumb)){
									$img = CALPHOTOS_IMAGES_URL.$thumb;
								}
							}
						}
						else{
							$thumb = strtr($image['filename'], array(CACHE_URL=>'', '_th.'=>'.'));
						
							if(!file_exists(PHOTOS_DIR.$thumb)){
								if(preg_match('/(_image.*)/i', $thumb, $match)){
									$tempThumb = str_replace(' ', '_', $row['species']).$match[1];
									if(file_exists(PHOTOS_DIR.$tempThumb))
										$thumb = $tempThumb;
								}
							}
							$img = (file_exists(PHOTOS_DIR.$thumb) ? PHOTOS_URL.$thumb : $thumb);
						}							
								
					}
				}
			}

			if($img == ''){
				echo 'Image not found';
			}
			else{
				
				?>
				<img src="<?php echo $img; ?>"  width="50px"/><br>	
				<?
				if($batch>0 && $source != SOURCE_GOOGLE_IMAGES){
					$batchSpecies = array_slice($plantsList, max(0, intval($currPlantKey)-$batch/2), $batch);	
				}
				else{
					$batchSpecies = $plantsList;
				}
				if(stripos($img, 'http:')=== false && stripos($img, 'https:')=== false){
					$img = 'http:'.$img;
				}

				echo 'Image url:'.$img.'<br>';
				
				$response = searchPlant($urlClassify, $img, $batchSpecies);
echo 'Reponse from the server:<br>';
print_r($response); 
echo '<hr>'			;
				//echo 'Response:'; print_r($response); echo '<hr>';
				$response = $response['response'];
				//Overall prediction:\n['Lupinus_microcarpus'
				
				$matchSpecies = null;
				if(preg_match('/overall prediction[^\[]*(\[[^\]]*])/i', $response, $match)){
					$matchSpecies = json_decode(str_replace('\'', '"', $match[1]));
					$matchSpecies = ($matchSpecies && count($matchSpecies) ? $matchSpecies[0] : null);
				}
				//Echo 'Matched: '.$matchSpecies.'<br>';
				if(preg_match('/(\{[^\}]*})/i', $response, $match)){
					$prob = json_decode(str_replace('\'', '"', $match[1]), true);
					$species[$row['id']] = array('species'=>$row['species'],
														'match'=>$matchSpecies, 
														'dim'=>$dimension,
														'id'=>$row['id'],
														'image'=>$img,
														 'prob'=>$prob);
					
					
					$keySpecies = str_replace(' ', '_', $row['species']);
					arsort($prob);
					if($prob[$keySpecies]<=0){
						$rank = false;
					}
					else{
						$rank = array_search($keySpecies, array_keys($prob));	
					}
					
					if($rank === false){
						$rank = 'N/A';
					}
					else{
						$rank++;						
					}

					
					$score = round($prob[$keySpecies]*100);
					//print_r($prob);
					$temp =  array_keys($prob);
					
					//print_r($temp);
					//Plant Name,ImageURL,PlantName:Score,PlantName:Rank,1stPick:Score,2ndpickScore,3rdpick:Score,4thPick:Score,5thPick:Score
					$speciesCSV[] = sprintf('"%s","%s","%s","%s","%s","%s","%s","%s","%s"'."\n", 
											$row['species'], $img, $score, $rank,
											$temp[0]. '('.round($prob[$temp[0]]*100).')',
											$temp[1]. '('.round($prob[$temp[1]]*100).')',
											$temp[2]. '('.round($prob[$temp[2]]*100).')',
											$temp[3]. '('.round($prob[$temp[3]]*100).')',
											$temp[4]. '('.round($prob[$temp[4]]*100).')');
				}
				
			}	
		//}
		
		$searchResults = json_encode($species)."\n";
		/*if(file_exists($fileSearchResults)){
			$h = fopen($fileSearchResults, 'a');
			fwrite($h, $searchResults);
		}
		else{*/
			file_put_contents($fileSearchResults, $searchResults, FILE_APPEND);	
			file_put_contents($fileSearchResultsCSV, implode("", $speciesCSV), FILE_APPEND);	
		//}
		echo '<a href="'.SITE_URL. str_ireplace(dirname(__FILE__).'/', '', 'data/'. $fileSearchResultsCSV.'?t='.time()).'" target="_blank">Download Results (CSV)</a>';
		echo '<hr>';
		setSession('photo_search_counter', $plantId);
		$statusText = sprintf('%s/%s', $plantId+1, $totalPlants);
		echo 'Processed:' .$statusText.'<br>';
	}
	/*	*/
	
	function searchPlant($url, $imageURL, $classes){
		$plants = $classes;
		$uploadRequest = array(
            //'file_name' => basename($image),
            //'image_data' => file_get_contents($destFile),
            'image_url'=>$imageURL,
            'class_list'=> implode(',', array_unique(array_map(function($value) { return trim($value); }, $plants)))
        );

		$timeStart = time();
		
		$curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_TIMEOUT, 300);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $uploadRequest);
        $response = curl_exec($curl);
        curl_close($curl);
        
        return array('time'=>(time()-$timeStart),
        			'response'=>$response);
	}
	
?>	
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title><?php echo $__Page->title(). ' :: '.$statusText; ?></title>
		<script type="text/javascript">
			
		</script>
	</head>
	<body style="font-famly:Arial;">
	<script type="text/javascript">
	window.onload = function(){
				setTimeout(function(){ window.location = "<?= $_SERVER['PHP_SELF'].'?source='.$source.'&id='.($plantId+1).'&dim='.$dimension.'&batch='.$batch?>";}, 2000);
			}
	</script>	
	</body>
</html>