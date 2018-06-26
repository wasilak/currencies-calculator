<?php
session_start();

if (!isset($_GET['currenciesCalulator_csrf']) || $_GET['currenciesCalulator_csrf'] != $_SESSION['currenciesCalulator_csrf']) {
    echo 'CSRF token invalid!';
    exit;
}

header('Content-type: application/json');

$url = 'http://api.nbp.pl/api/exchangerates/tables/A/' . date("Y-m-d") . '/?format=json';
$cacheData = __DIR__ . '/cache/data.json';

$forceDownload = (isset($_GET['forceDownload']) && 1 == $_GET['forceDownload']) ? true : false;

$dataFromNBP = '';
$dataFromNBP = file_get_contents($cacheData);

try {
    $cachedData = json_decode($dataFromNBP);
    $lastDate = $cachedData->effectiveDate;
} catch (Exception $e) {
    $lastDate = false;
}

if (!$lastDate || $lastDate != date("Y-m-d") || $forceDownload) {
    $dataFromNBP = file_get_contents($url);
    $dataFromNBP = json_decode($dataFromNBP)[0];
    file_put_contents($cacheData, json_encode($dataFromNBP));
} else {
    $dataFromNBP = $cachedData;
}

echo json_encode($dataFromNBP); exit;
