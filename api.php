<?php

include_once("api_backend.php");
$api = new API($_POST);

$return = [];

$return["year"] = $api->getDefaultYear();
$return["season"] = $api->getDefaultSeason();

echo json_encode($return);

/*$season = $_POST["s"];
$year =   $_POST["y"];
$query =  $_POST["q"];
$all =    $_POST["a"];
$max =    $_POST["m"];

if (!$season || !$year)
{
    $season = $api.getDefaultSeason();
    $year   = $api.getDefaultYear();
}

// Return everything if it was requested.
if ($all || !$query) {
    echo $contents;
    exit();
}

$queries = [];
if (is_array($query))
    $queries = $query;
else
    array_push($queries, $query);

$lines = explode("\n", $contents);
$return = "";
$count = 0;

for ($i = 0; $i < count($lines) && (!$max || $max && $count < intval($max)); $i ++)
{
    $match = false;
    for ($j = 0; $j < count($queries) && $match === false; $j ++)
    {
        if (strpos($lines[$i], $queries[$j]) !== false) {
            $match = true;
            $count ++;
        }
    }
    $return .= $lines[$i]."\n";
}

echo $return;*/

?>