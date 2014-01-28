<?php

$season = $_POST["s"];
$year =   $_POST["y"];
$query =  $_POST["q"];
$all =    $_POST["a"];
$max =    $_POST["m"];


if (!$season || !$year)
{
    $year = intval(date("Y"));
    $mo = intval(date("n"));
    $da = intval(date("j"));
    
    if (2 <= $mo && $mo <= 9)
        $season = "Fall";
    else if (10 == $mo && $da <= 10)
        $season = "Fall";
    else {
        $season = "Spring";
        if ($mo > 9)
            $year ++;
    }
}

function getFile($url, $filename) {
    if (file_exists($filename)) {
        $local = strtotime(date("F d Y H:i:s.", filemtime($filename)));
        $headers = get_headers($url, 1);
        $remote = strtotime($headers["Last-Modified"]);
        
        if ($local < $remote) {
            file_put_contents($filename, file_get_contents($url));
        }
    }
    else {
        $file_contents = file_get_contents($url);
        if ($file_contents)
            file_put_contents($filename, $file_contents);
    }    
}

$filename = $season . $year . ".dat";
$url = "http://www.uwplatt.edu/csse/uwpclasses/" . $year . "/" . $filename;
getFile($url, "res/".$filename);
$contents = file_get_contents("res/".$filename);

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

echo $return;

?>