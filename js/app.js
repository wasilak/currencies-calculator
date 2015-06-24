var kalkulatorWalut = angular.module("kalkulatorWalut", [], function() {

});

kalkulatorWalut.controller("MainController", ["$scope", "$http", function($scope, $http) {
  var mainCtrl = this;

  mainCtrl.dane = {};
  mainCtrl.kursy = {};
  mainCtrl.dataPublikacji = '';

  var przygotowanieTabelWalut = function() {
    mainCtrl.kursy.PLN = {
      nazwa_waluty: "PLN - złoty polski",
      kurs_sredni: 1.00,
      przelicznik: 1.00
    };

    for (var key in mainCtrl.dane.tabela_kursow.pozycja) {
      mainCtrl.kursy[mainCtrl.dane.tabela_kursow.pozycja[key].kod_waluty] = {
        nazwa_waluty: mainCtrl.dane.tabela_kursow.pozycja[key].kod_waluty +  " - " + mainCtrl.dane.tabela_kursow.pozycja[key].nazwa_waluty,
        kurs_sredni: parseFloat(mainCtrl.dane.tabela_kursow.pozycja[key].kurs_sredni.replace(",", ".") / mainCtrl.dane.tabela_kursow.pozycja[key].przelicznik)
      };
    }
  };

  $http.get('proxy.php', {
    params: {
      kalkulatorWalut_csrf: kalkulatorWalut_csrf
    },
    }).success(function(data) {

      var x2js = new X2JS();
      var json = x2js.xml_str2json(data);
      mainCtrl.dane = json;
      mainCtrl.dataPublikacji = json.tabela_kursow.data_publikacji;

      przygotowanieTabelWalut();
  }).error(function(data) {
    console.log(data);
  });

  $scope.$watch('mainCtrl', function() {
    if (mainCtrl.kurs_from && mainCtrl.kurs_to && mainCtrl.kwota_from) {
      mainCtrl.kwota_to = (mainCtrl.kursy[mainCtrl.kurs_from].kurs_sredni * mainCtrl.kwota_from / mainCtrl.kursy[mainCtrl.kurs_to].kurs_sredni).toFixed(2);
    } else {
      mainCtrl.kwota_to = '';
    }
  }, true);

}]);
