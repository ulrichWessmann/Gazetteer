<?php

	$executionStartTime = microtime(true);

	$key = "06ba3a69-6342-426f-857b-dbf0dcf3bf80";
	
	$url = "https://holidayapi.com/v1/holidays?pretty&key=06ba3a69-6342-426f-857b-dbf0dcf3bf80&country=".$_POST["country"]."&year=2021";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);
	
	if(json_last_error() != ""){
		echo "JSON error";
		exit();
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output["holidays"] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>