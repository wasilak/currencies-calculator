var Application;
(function (Application) {
    var Controllers;
    (function (Controllers) {
        var MainController = (function () {
            function MainController($scope, $http, $interval) {
                var _this = this;
                this.getData = function () {
                    _this.forceDownload = true;
                    _this.dataDownload();
                };
                this.calculate = function () {
                    if (_this.model.rate_from && _this.model.rate_to && _this.model.amount_from) {
                        _this.model.amount_to = (_this.model.rates[_this.model.rate_from].mid * parseFloat(_this.model.amount_from) / _this.model.rates[_this.model.rate_to].mid).toFixed(2);
                    }
                    else {
                        _this.model.amount_to = '';
                    }
                };
                this.setCurrency = function (currencyToSetup) {
                    _this.model.rates[currencyToSetup.code] = {
                        currency: currencyToSetup.code + " - " + currencyToSetup.currency,
                        mid: currencyToSetup.mid
                    };
                };
                this.saveSelection = function (name, value) {
                    if (localStorage && !_this.forceDownload) {
                        localStorage.setItem(name, value);
                    }
                };
                this.resetTabelaWalut = function () {
                    _this.setModel(_this.emptyModel);
                };
                this.currencyTablePrepare = function () {
                    _this.setCurrency(walutaPL);
                    var currencyNumber = _this.model.data.rates.length;
                    var loaderStep = 100 / currencyNumber;
                    for (var _i = 0, _a = _this.model.data.rates; _i < _a.length; _i++) {
                        var element = _a[_i];
                        _this.setCurrency(element);
                    }
                    _this.updateProgress = 0;
                    var n = 0;
                    _this.$interval(function () {
                        _this.updateProgress += loaderStep;
                        n += 1;
                        if (n == currencyNumber) {
                            _this.forceDownload = false;
                        }
                    }, 0, currencyNumber);
                };
                this.setModel = function (model) {
                    _this.model = model;
                };
                this.dataDownload = function () {
                    _this.resetTabelaWalut();
                    var requestParams = {
                        currenciesCalulator_csrf: window.currenciesCalulator_csrf,
                        forceDownload: 0
                    };
                    if (_this.forceDownload) {
                        requestParams.forceDownload = 1;
                    }
                    var self = _this;
                    _this.$http({
                        method: 'GET',
                        url: '/api/get/' + requestParams.currenciesCalulator_csrf + '/' + requestParams.forceDownload,
                    }).then(function successCallback(response) {
                        var ratesTable = response.data;
                        self.model.data = ratesTable;
                        self.model.effectiveDate = ratesTable.effectiveDate;
                        self.currencyTablePrepare();
                        if (localStorage) {
                            self.model.rate_from = localStorage.getItem('waluty_rate_from');
                            self.model.rate_to = localStorage.getItem('waluty_rate_to');
                        }
                    }, function errorCallback(data) {
                        console.log(data);
                    });
                };
                var mainCtrl = this;
                this.$http = $http;
                this.$interval = $interval;
                this.emptyModel = {
                    data: {
                        effectiveDate: '',
                        rates: []
                    },
                    rates: {},
                    rate_from: '',
                    rate_to: '',
                    amount_from: '',
                    amount_to: '',
                    effectiveDate: ''
                };
                this.setModel(this.emptyModel);
                this.forceDownload = false;
                this.dataDownload();
                $scope.$watch('mainCtrl.model', function () {
                    _this.calculate();
                }, true);
            }
            return MainController;
        }());
        Controllers.MainController = MainController;
    })(Controllers = Application.Controllers || (Application.Controllers = {}));
})(Application || (Application = {}));
