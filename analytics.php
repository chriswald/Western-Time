<?php
$type = $_POST["t"];
$metrics = explode(",", $_POST["m"]);

$dat_file = "analytics.dat";
$i = 0;
if ($type) {
    $dat_file = "sec_stat/" . $metrics[0] . $metrics[1] . "_sec.dat";
    $i = 2;
}

if (!file_exists($dat_file)) {
    file_put_contents($dat_file, "");
}

$lines = explode("\n", file_get_contents($dat_file));
for ($i; $i < count($metrics); $i ++) {
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
file_put_contents($dat_file, $content);
?>