<?php
session_start();

if ($_GET['kalkulatorWalut_csrf'] != $_SESSION['kalkulatorWalut_csrf']) {
    echo 'CSRF token invalid!';
    exit;
}

header('Content-type: application/xml');

$adresKursy = 'http://www.nbp.pl/kursy/xml/LastA.xml';
$cacheLast = __DIR__ . '/cache/last.txt';
$cacheData = __DIR__ . '/cache/data.xml';

$dataFromNBP = '';

$lastDate = file_get_contents($cacheLast);

if ($lastDate != date("Y-m-d")) {
    file_put_contents($cacheLast, date("Y-m-d"));
    $dataFromNBP = file_get_contents($adresKursy);
    file_put_contents($cacheData, $dataFromNBP);
} else {
    $dataFromNBP = file_get_contents($cacheData);
}
echo $dataFromNBP; exit;
