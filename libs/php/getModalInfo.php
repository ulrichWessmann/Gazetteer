<?php

	// remove for production

	$executionStartTime = microtime(true);

	$url = "http://api.geonames.org/wikipediaSearchJSON?q=".$_REQUEST["capital"]."&maxRows=10&username=sa3kes";

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
	$output['wiki'] = $decode;
	

			// weather //

	$executionStartTime = microtime(true);

	$url = "api.openweathermap.org/data/2.5/weather?q=".$_REQUEST["capital"]."&appid=85c372ea9b7206134b1634cb48bb3a89&units=metric";

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output["weather"] = $decode;

			// exchange to USD  //
	$currencyKey = "9e74fa47571f44eb85fb2a5a070c048f";
	$currencyUrl = "https://openexchangerates.org/api/latest.json?app_id=".$currencyKey;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$currencyUrl);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output["currency"] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
