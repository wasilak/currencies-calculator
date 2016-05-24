kalkulatorWalut.controller("MainController", ["$scope", "$http", "$interval", function ($scope, $http, $interval) {
        var mainCtrl = this;
        var setModel = function (model) {
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
        mainCtrl.resetTabelaWalut = function () {
            setModel({
                dane: {},
                kursy: {},
                kwota_from: '',
                kwota_to: '',
                dataPublikacji: ''
            });
        };
        mainCtrl.przygotowanieTabelaWalut = function () {
            setWaluta({
                kod_waluty: 'PLN',
                nazwa_waluty: "PLN - złoty polski",
                kurs_sredni: '1.00',
                przelicznik: '1.00'
            });
            var iloscWalut = mainCtrl.model.dane.tabela_kursow.pozycja.length;
            var krokLoadera = 100 / iloscWalut;
            for (var _i = 0, _a = mainCtrl.model.dane.tabela_kursow.pozycja; _i < _a.length; _i++) {
                var element = _a[_i];
                setWaluta(element);
            }
            mainCtrl.updateProgress = 0;
            var n = 0;
            $interval(function () {
                mainCtrl.updateProgress += krokLoadera;
                n += 1;
                if (n == iloscWalut) {
                    mainCtrl.forceDownload = false;
                }
            }, 0, iloscWalut);
        };
        var setWaluta = function (waluta) {
            mainCtrl.model.kursy[waluta.kod_waluty] = {
                nazwa_waluty: waluta.kod_waluty + " - " + waluta.nazwa_waluty,
                kurs_sredni: (parseFloat(waluta.kurs_sredni.replace(",", ".")) / parseFloat(waluta.przelicznik)).toFixed(2)
            };
        };
        mainCtrl.pobranieDanych = function () {
            mainCtrl.resetTabelaWalut();
            var requestParams = {
                kalkulatorWalut_csrf: window.kalkulatorWalut_csrf,
                forceDownload: 0
            };
            if (mainCtrl.forceDownload) {
                requestParams.forceDownload = 1;
            }
            $http.get('proxy.php', {
                params: requestParams,
            }).success(function (data) {
                var x2js = new X2JS();
                var json = x2js.xml_str2json(data);
                mainCtrl.model.dane = json;
                mainCtrl.model.dataPublikacji = mainCtrl.model.dane.tabela_kursow.data_publikacji;
                mainCtrl.przygotowanieTabelaWalut();
                if (localStorage) {
                    mainCtrl.model.kurs_from = localStorage.getItem('waluty_kurs_from');
                    mainCtrl.model.kurs_to = localStorage.getItem('waluty_kurs_to');
                }
            }).error(function (data) {
                console.log(data);
            });
        };
        mainCtrl.getData = function () {
            mainCtrl.forceDownload = true;
            mainCtrl.pobranieDanych();
        };
        mainCtrl.pobranieDanych();
        mainCtrl.calculate = function () {
            if (mainCtrl.model.kurs_from && mainCtrl.model.kurs_to && mainCtrl.model.kwota_from) {
                mainCtrl.model.kwota_to = (mainCtrl.model.kursy[mainCtrl.model.kurs_from].kurs_sredni * mainCtrl.model.kwota_from / mainCtrl.model.kursy[mainCtrl.model.kurs_to].kurs_sredni).toFixed(2);
            }
            else {
                mainCtrl.model.kwota_to = '';
            }
        };
        mainCtrl.saveSelection = function (name, value) {
            if (localStorage && !mainCtrl.forceDownload) {
                localStorage.setItem(name, value);
            }
        };
        $scope.$watch('mainCtrl.model', function () {
            mainCtrl.calculate();
        }, true);
    }]);
