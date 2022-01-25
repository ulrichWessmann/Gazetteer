<?php

	// remove for production

	$key = "6f1183266d26427bb604af7c2266bc31";

	$executionStartTime = microtime(true);
	
	$url='https://api.opencagedata.com/geocode/v1/geojson?q='.$_REQUEST["lat"].'%2C'.$_REQUEST["lng"].'&key='.$key.'&pretty=1';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode["features"];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
