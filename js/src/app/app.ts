/// <reference path="../lib/angular/angular.d.ts" />

let currenciesCalulator = angular.module("currenciesCalulator", []);

currenciesCalulator.controller("MainController", ["$scope", "$http", "$interval", ($scope, $http, $interval) => new Application.Controllers.MainController($scope, $http, $interval) ]);

interface Window {
    currenciesCalulator_csrf :string
};

interface Rate {
  code :string,
  currency :string,
  mid :string,
}

interface RatesTable {
  effectiveDate :string
  rates :Array<Rate>
}

interface Model {
  data :RatesTable,
  rates :Object,
  rate_from :string,
  rate_to :string,
  amount_from :string,
  amount_to :string,
  effectiveDate :string
}

interface RequestParams {
  currenciesCalulator_csrf :string,
  forceDownload :number
}

let walutaPL :Rate = {
  code: 'PLN',
  currency: "złoty polski",
  mid: '1.00',
};
