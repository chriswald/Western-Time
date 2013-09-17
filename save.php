<?php
$val = base64_decode($_POST["contents"]);
$tokens = explode("\n", $val);
$val = str_replace($tokens[0] . "\n", "", $val);
$filename = $tokens[0];
header('Content-type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo $val;
?>