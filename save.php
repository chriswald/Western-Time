<?php
$val = $_POST["contents"];
$NL = "ABCNEWLINE";
// "ABCNEWLINE" is used in place of \n so that the data can be submitted using
// a text input field instead of a textarea, which makes it more cross-browser
// compatible. Make sure this is mirrored in "file.js".
$tokens = explode($NL, $val);
$val = str_replace($tokens[0] . $NL, "", $val);
$val = str_replace($NL, "\n", $val);
$filename = $tokens[0];
header('Content-type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo $val;
?>