<?php

$executionStartTime = microtime(true);

$country = $_POST["country"];

$result = file_get_contents("../data/countryBorders.geo.json");

$decode = json_decode($result,true);

if(json_last_error() != ""){
    echo "error";
    exit();
}

$output;


foreach ($decode["features"] as $object) {
    if($object["properties"]["iso_a2"] == $country){
        $output = $object;
        break;
    }
}
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 


?>
