<?php
$filename = "./newBooks/".$_POST["bookName"].".json";
$myfile = fopen($filename, "a") or die("Unable to open file!");
$txt = $_POST["email"]."\n";
fwrite ($myfile, $txt);
$txt = $_POST["bookJson"]."\n";
fwrite($myfile, $txt);
fclose($myfile);
?>