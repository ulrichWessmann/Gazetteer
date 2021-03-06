<?php

	$executionStartTime = microtime(true);

	$url = "http://api.geonames.org/earthquakesJSON?formatted=true&north=".$_POST["north"]."&south=".$_POST["south"]."&east=".$_POST["east"]."&west=".$_POST["west"]."&username=sa3kes&style=full";
	

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);
	
	if(json_last_error() != ""){
		echo "invalid JSON";
		exit();
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['earthquakes'] = $decode["earthquakes"];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
