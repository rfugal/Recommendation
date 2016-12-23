<?php
$filename = "./newBooks/fugal2016Test.txt";
$myfile = fopen($filename, "a") or die("Unable to open file!");
$txt = $_POST["email"]."\n\t".'"'.$_POST["bookName"].'":'."\n".$_POST["bookJson"].",\n";
fwrite ($myfile, $txt);
fclose($myfile);
chmod($myfile,0000);
?>
