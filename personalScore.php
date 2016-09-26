<?php

$firstQuartileFactor = 23;
$secondQuartileFactor = 47;
$otherQuartileFactor = 101;
$unrecognizedFactor = 344;
$recognizedFactor = -22;

$Frequency = array(
    "the" => 1,
    "be" => 1,
    "and" => 1,
    "of" => 1,
    "a" => 1,
    "in" => 1,
    "to" => 1,
    "have" => 1,
    //...
    "to" => 2,
    "it" => 2,
    "i" => 2,
    "that" => 2,
    "for" => 2,
    "you" => 2,
    "he" => 2,
    "with" => 2,
    "on" => 2,
    "do" => 2,
    "say" => 2,
    "this" => 2,
    "they" => 2,
    "at" => 2,
    "but" => 2,
    "we" => 2,
    "his" => 2,
    "from" => 2,
    "that" => 2,
    "not" => 2,
    "by" => 2,
    "she" => 2,
    "or" => 2,
    "as" => 2,
    "what" => 2,
    "go" => 2,
    "their" => 2,
    "can" => 2,
    "who" => 2,
    "get" => 2,
    "if" => 2,
    "would" => 2,
    "her" => 2,
    "all" => 2,
    "my" => 2,
    "make" => 2,
    "about" => 2,
    "know" => 2,
    "will" => 2,
    "as" => 2,
    "up" => 2,
    "one" => 2,
    "time" => 2,
    "there" => 2,
    "year" => 2,
    "so" => 2,
    "think" => 2,
    "when" => 2,
    "which" => 2,
    "them" => 2,
    "some" => 2,
    "me" => 2
);
$FrequencyScore = 0;

$Words = json_decode($_POST["UNKWords"]);
$clientScore = $_POST["bookPercent"];
$wordCount = $_POST["wordCount"];
$recognizedCount = $wordCount * $clientScore;
$unrecognizedCount = $wordCount - $recognizedCount;

foreach ($Words as $word) {
    if ($Frequency[$word] = 1) {
        $FrequencyScore += $firstQuartileFactor;
    } else if ($Frequency[$word] = 2) {
        $FrequencyScore += $secondQuartileFactor;
    } else {
        $FrequencyScore += $otherQuartileFactor;
    };
};

$returnScore = (
    $FrequencyScore +
    $unrecognizedCount * $unrecognizedFactor +
    $recognizedCount * $recognizedFactor
) / $wordCount;

echo (round($returnScore));

?>
