<?php
$filename = "./newBooks/".$_POST["bookName"].".json";
$myfile = fopen($filename, "w") or die("Unable to open file!");
$txt = $_POST["email"];
fwrite($myfile, $txt);
$txt = $_POST["bookJson"];
fwrite($myfile, $txt);
fclose($myfile);
?>