<?php

	$executionStartTime = microtime(true);

	$url = "https://api.unsplash.com/search/photos?page=1&query=".$_POST["capital"]."&client_id=uz70luD9H4Yg4ajj8vOCtLnUp83moNqxmRuL6jIis5o";

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
	$output["images"] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>