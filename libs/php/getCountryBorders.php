<?php

$executionStartTime = microtime(true);

$country = $_REQUEST["country"];

$result = file_get_contents("../data/countryBorders.geo.json");

$decode = json_decode($result,true);


foreach ($decode["features"] as $object) {
    if($object["properties"]["iso_a2"] == $country){
        $object['status']['code'] = "200";
        $object['status']['name'] = "ok";
        $object['status']['description'] = "success";
        $object['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

        header('Content-Type: application/json; charset=UTF-8');
        exit (json_encode($object));

    }
}

?>
