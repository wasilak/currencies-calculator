/// <reference path="../angular.d.ts" />

let kalkulatorWalut = angular.module("kalkulatorWalut", [], function() {

});

interface Window {
    kalkulatorWalut_csrf :string
};

interface Kurs {
  kod_waluty :string,
  nazwa_waluty :string,
  kurs_sredni :string,
  przelicznik :string
}

interface Model {
  dane :Object,
  kursy :Object,
  kwota_from :string,
  kwota_to :string,
  dataPublikacji :string
}

interface RequestParams {
  kalkulatorWalut_csrf :string,
  forceDownload :number
}
