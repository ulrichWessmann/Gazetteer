<?php

	$executionStartTime = microtime(true);

	$url = "https://api.windy.com/api/webcams/v2/list/country=".$_POST["country"]."/orderby=popularity/limit=20?show=webcams:title,location,player&key=6awvXeIoOKR17rMLCaMhm9MAbgbv1IDL";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result = curl_exec($ch);

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
	$output["cameras"] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>