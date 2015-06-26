<?php
session_start();

if (!isset($_GET['kalkulatorWalut_csrf']) || $_GET['kalkulatorWalut_csrf'] != $_SESSION['kalkulatorWalut_csrf']) {
    echo 'CSRF token invalid!';
    exit;
}

header('Content-type: application/xml');

$adresKursy = 'http://www.nbp.pl/kursy/xml/LastA.xml';
$cacheData = __DIR__ . '/cache/data.xml';

$forceDownload = (isset($_GET['forceDownload']) && 1 == $_GET['forceDownload']) ? true : false;

$dataFromNBP = '';
$dataFromNBP = file_get_contents($cacheData);

try {
    $cachedXML = new SimpleXMLElement($dataFromNBP);
    $lastDate = $cachedXML->data_publikacji->__toString();
} catch (Exception $e) {
    $lastDate = false;
}

if (!$lastDate || $lastDate != date("Y-m-d") || $forceDownload) {
    $dataFromNBP = file_get_contents($adresKursy);
    $dataFromNBP = new SimpleXMLElement($dataFromNBP);
    file_put_contents($cacheData, $dataFromNBP->asXML());
} else {
    $dataFromNBP = $cachedXML;
}
echo $dataFromNBP->asXML(); exit;
