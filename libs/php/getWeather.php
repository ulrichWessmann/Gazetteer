<?php

	$executionStartTime = microtime(true);


	$url = "https://api.openweathermap.org/data/2.5/onecall?lat=".$_REQUEST["capitalLat"]."&lon=".$_REQUEST["capitalLng"]."&exclude=current,minutely,hourly,alerts&appid=85c372ea9b7206134b1634cb48bb3a89&units=metric";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output["weather"] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
