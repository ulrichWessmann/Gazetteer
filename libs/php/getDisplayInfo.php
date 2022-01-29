<?php

	// get country from rest countries

	$executionStartTime = microtime(true);

	$code = $_REQUEST["country"];

	$url="https://restcountries.com/v3.1/alpha/".$code;

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
	$output['data'] = $decode; //data[0]

	// get cities from geonames

	// $secondUrl = "api.geonames.org/searchJSON?country=".$code."&fcode=PPLA2&username=sa3kes&cities=cities15000";

	// $chTwo = curl_init();
	// curl_setopt($chTwo, CURLOPT_SSL_VERIFYPEER, false);
	// curl_setopt($chTwo, CURLOPT_RETURNTRANSFER, true);
	// curl_setopt($chTwo, CURLOPT_URL,$secondUrl);

	// $resultTwo = curl_exec($chTwo);

	// curl_close($chTwo);

	// $decodeTwo = json_decode($resultTwo,true);	

	// $output["data"][1] = $decodeTwo["geonames"];

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>
