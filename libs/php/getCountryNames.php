<?php

	$executionStartTime = microtime(true);

	$result = file_get_contents("../data/countryBorders.geo.json");

	$decode = json_decode($result,true);


	if(json_last_error() != ""){
		echo "JSON error";
		exit();
	}

	$countries = [];
	
	foreach ($decode["features"] as $object) {
		array_push($countries, $object["properties"]);
	}
	
	usort($countries, function($a, $b) {
		return $a['name'] <=> $b['name'];
	});

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output["data"] = $countries;
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>