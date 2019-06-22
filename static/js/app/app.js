var currenciesCalulator = angular.module("currenciesCalulator", []);
currenciesCalulator.controller("MainController", ["$scope", "$http", "$interval", function ($scope, $http, $interval) { return new Application.Controllers.MainController($scope, $http, $interval); }]);
;
var walutaPL = {
    code: 'PLN',
    currency: "złoty polski",
    mid: '1.00',
};
