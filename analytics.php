<?php
$metrics = explode(",", $_POST["m"]);
$lines = explode("\n", file_get_contents("analytics.dat"));
for ($i = 0; $i < count($metrics); $i ++) {
    $metric = $metrics[$i];
    $found_metric = false;
    for ($j = 0; $j < count($lines); $j ++) {
        $line = $lines[$j];
        $tokens = explode("=", $line);
        $m = $tokens[0];
        $n = $tokens[1];
        
        if ($m == $metric) {
            $found_metric = true;
            $n = ((int) $n) + 1;
            $lines[$j] = $m."=".$n;
        }
    }
    
    if (!$found_metric) {
        array_push($lines, $metric."=1");
    }
}

$content = trim(implode("\n", $lines));
file_put_contents("analytics.dat", $content);
?>