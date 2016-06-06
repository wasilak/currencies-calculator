/// <reference path="../lib/angular/angular.d.ts" />

let kalkulatorWalut = angular.module("kalkulatorWalut", []);

kalkulatorWalut.controller("MainController", ["$scope", "$http", "$interval", ($scope, $http, $interval) => new Application.Controllers.MainController($scope, $http, $interval) ]);

interface Window {
    kalkulatorWalut_csrf :string
};

interface Kurs {
  kod_waluty :string,
  nazwa_waluty :string,
  kurs_sredni :string,
  przelicznik :string
}

interface ModelDane {
  tabela_kursow :TabelaKursow
}

interface TabelaKursow {
  data_publikacji :string
  pozycja :Array<Kurs>
}

interface Model {
  dane :ModelDane,
  kursy :Object,
  kurs_from :string,
  kurs_to :string,
  kwota_from :string,
  kwota_to :string,
  dataPublikacji :string
}

interface RequestParams {
  kalkulatorWalut_csrf :string,
  forceDownload :number
}

let walutaPL :Kurs = {
  kod_waluty: 'PLN',
  nazwa_waluty: "PLN - złoty polski",
  kurs_sredni: '1.00',
  przelicznik: '1.00'
};
