var kalkulatorWalut = angular.module("kalkulatorWalut", [], function() {

});

kalkulatorWalut.controller("MainController", ["$scope", "$http", "$interval", function($scope, $http, $interval) {
  var mainCtrl = this;

  mainCtrl.model = {};
  mainCtrl.forceDownload = false;

  mainCtrl.resetTabelaWalut = function() {
    mainCtrl.model.dane = {};
    mainCtrl.model.kursy = {};
    mainCtrl.model.kwota_from = '';
    mainCtrl.model.kwota_to = '';
    mainCtrl.model.dataPublikacji = '';
  };

  mainCtrl.przygotowanieTabelaWalut = function() {
    mainCtrl.model.kursy.PLN = {
      nazwa_waluty: "PLN - złoty polski",
      kurs_sredni: 1.00,
      przelicznik: 1.00
    };

    var iloscWalut = mainCtrl.model.dane.tabela_kursow.pozycja.length;
    var krokLoadera = 100 / iloscWalut;

    for (var key in mainCtrl.model.dane.tabela_kursow.pozycja) {

      mainCtrl.model.kursy[mainCtrl.model.dane.tabela_kursow.pozycja[key].kod_waluty] = {
        nazwa_waluty: mainCtrl.model.dane.tabela_kursow.pozycja[key].kod_waluty +  " - " + mainCtrl.model.dane.tabela_kursow.pozycja[key].nazwa_waluty,
        kurs_sredni: parseFloat(mainCtrl.model.dane.tabela_kursow.pozycja[key].kurs_sredni.replace(",", ".") / mainCtrl.model.dane.tabela_kursow.pozycja[key].przelicznik)
      };
    }

    // just for loader progress bar ;)
    mainCtrl.updateProgress = 0;
    var n = 0;
    $interval(function() {
      mainCtrl.updateProgress += krokLoadera;
      n += 1;

      if (n == iloscWalut) {
        mainCtrl.forceDownload = false;
      }
    }, 0, iloscWalut);

  };

  mainCtrl.pobranieDanych = function() {

    mainCtrl.resetTabelaWalut();

    var requestParams = {
      kalkulatorWalut_csrf: kalkulatorWalut_csrf
    };

    if (mainCtrl.forceDownload) {
      requestParams.forceDownload = 1;
    }

    $http.get('proxy.php', {
      params: requestParams,
      }).success(function(data) {

        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        mainCtrl.model.dane = json;
        mainCtrl.model.dataPublikacji = json.tabela_kursow.data_publikacji;

        mainCtrl.przygotowanieTabelaWalut();

        if (localStorage) {
          mainCtrl.model.kurs_from = localStorage.getItem('waluty_kurs_from');
          mainCtrl.model.kurs_to = localStorage.getItem('waluty_kurs_to');
        }
    }).error(function(data) {
      console.log(data);
    });
  };

  mainCtrl.getData = function() {
    mainCtrl.forceDownload = true;
    mainCtrl.pobranieDanych();
  };

  mainCtrl.pobranieDanych();

  mainCtrl.calculate = function() {
    if (mainCtrl.model.kurs_from && mainCtrl.model.kurs_to && mainCtrl.model.kwota_from) {
      mainCtrl.model.kwota_to = (mainCtrl.model.kursy[mainCtrl.model.kurs_from].kurs_sredni * mainCtrl.model.kwota_from / mainCtrl.model.kursy[mainCtrl.model.kurs_to].kurs_sredni).toFixed(2);
    } else {
      mainCtrl.model.kwota_to = '';
    }
  };

  mainCtrl.saveSelection = function(name, value) {
    if (localStorage && !mainCtrl.forceDownload) {
      localStorage.setItem(name, value);
    }
  };

  $scope.$watch('mainCtrl.model', function() {
    mainCtrl.calculate();
  }, true);

}]);
