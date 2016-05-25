/// <reference path="../../lib/xml2json.d.ts" />

kalkulatorWalut.controller("MainController", ["$scope", "$http", "$interval", function($scope, $http, $interval) {
  let mainCtrl = this;

  let setModel = function(model :Model) {
    mainCtrl.model = model;
  };

  setModel({
    dane: {},
    kursy: {},
    kwota_from: '',
    kwota_to: '',
    dataPublikacji: ''
  });

  mainCtrl.forceDownload = false;

  mainCtrl.resetTabelaWalut = function() {
    setModel({
      dane: {},
      kursy: {},
      kwota_from: '',
      kwota_to: '',
      dataPublikacji: ''
    });
  };

  mainCtrl.przygotowanieTabelaWalut = function() :void {

    setWaluta(walutaPL);

    let iloscWalut :number = mainCtrl.model.dane.tabela_kursow.pozycja.length;
    let krokLoadera :number = 100 / iloscWalut;

    for (let element of mainCtrl.model.dane.tabela_kursow.pozycja) {
      setWaluta(element);
    }

    // just for loader progress bar ;)
    mainCtrl.updateProgress = 0;
    let n :number = 0;
    $interval(function() {
      mainCtrl.updateProgress += krokLoadera;
      n += 1;

      if (n == iloscWalut) {
        mainCtrl.forceDownload = false;
      }
    }, 0, iloscWalut);

  };

  let setWaluta = function(waluta :Kurs) :void {
    mainCtrl.model.kursy[waluta.kod_waluty] = {
      nazwa_waluty: waluta.kod_waluty +  " - " + waluta.nazwa_waluty,
      kurs_sredni: (parseFloat(waluta.kurs_sredni.replace(",", ".")) / parseFloat(waluta.przelicznik)).toFixed(2)
    };
  }

  mainCtrl.pobranieDanych = function() :void {

    mainCtrl.resetTabelaWalut();

    let requestParams :RequestParams = {
      kalkulatorWalut_csrf: window.kalkulatorWalut_csrf,
      forceDownload: 0
    };

    if (mainCtrl.forceDownload) {
      requestParams.forceDownload = 1;
    }
    
    $http.get('proxy.php', {
      params: requestParams,
    }).success(function(data :string) {

        let x2js :IX2JS = new X2JS();
        let json :Object = x2js.xml_str2json(data);
        mainCtrl.model.dane = json;
        mainCtrl.model.dataPublikacji = mainCtrl.model.dane.tabela_kursow.data_publikacji;

        mainCtrl.przygotowanieTabelaWalut();

        if (localStorage) {
          mainCtrl.model.kurs_from = localStorage.getItem('waluty_kurs_from');
          mainCtrl.model.kurs_to = localStorage.getItem('waluty_kurs_to');
        }
    }).error(function(data :Object) {
      console.log(data);
    });
  };

  mainCtrl.getData = function() :void {
    mainCtrl.forceDownload = true;
    mainCtrl.pobranieDanych();
  };

  mainCtrl.pobranieDanych();

  mainCtrl.calculate = function() :void {
    if (mainCtrl.model.kurs_from && mainCtrl.model.kurs_to && mainCtrl.model.kwota_from) {
      mainCtrl.model.kwota_to = (mainCtrl.model.kursy[mainCtrl.model.kurs_from].kurs_sredni * mainCtrl.model.kwota_from / mainCtrl.model.kursy[mainCtrl.model.kurs_to].kurs_sredni).toFixed(2);
    } else {
      mainCtrl.model.kwota_to = '';
    }
  };

  mainCtrl.saveSelection = function(name :string, value :string) :void {
    if (localStorage && !mainCtrl.forceDownload) {
      localStorage.setItem(name, value);
    }
  };

  $scope.$watch('mainCtrl.model', function() :void {
    mainCtrl.calculate();
  }, true);

}]);
