<?php

	$currencyKey = "9e74fa47571f44eb85fb2a5a070c048f";
	$currencyUrl = "https://openexchangerates.org/api/latest.json?app_id=".$currencyKey;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$currencyUrl);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output["currency"] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
