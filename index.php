<?php session_start(); ?>
<!DOCTYPE html>
<html ng-app="currenciesCalulator">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Currencies calculator</title>

    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/foundation/5.5.2/css/foundation.min.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
  </head>
  <body>

    <div ng-controller="MainController as mainCtrl" ng-cloak class="ng-cloak row">
      <div class="small-12 medium-8 large-6 small-centered columns">
        <div class="row">
          <div class="small-12 columns">
            <span class="right">{{mainCtrl.model.effectiveDate}}</span>
            <hr />
          </div>
        </div>
        <div class="row">
          <div class="small-12 columns">
            <h3>From:</h3>
            <select ng-model="mainCtrl.model.rate_from" ng-options="key as item.currency for (key , item) in mainCtrl.model.rates" ng-change="mainCtrl.saveSelection('waluty_rate_from', mainCtrl.model.rate_from)"></select>
            <p ng-show="mainCtrl.model.rate_from">
              Mid rate:
              <span class="label">{{mainCtrl.model.rates[mainCtrl.model.rate_from].mid}} PLN</span>
            </p>
            <h3>To:</h3>
            <select ng-model="mainCtrl.model.rate_to" ng-options="key as item.currency for (key , item) in mainCtrl.model.rates" ng-change="mainCtrl.saveSelection('waluty_rate_to', mainCtrl.model.rate_to)"></select>
            <p ng-show="mainCtrl.model.rate_to">
              Mid rate:
              <span class="label">{{mainCtrl.model.rates[mainCtrl.model.rate_to].mid}} PLN</span>
            </p>

            <h3>Amount:</h3>
            <input type="number" name="" value="" placeholder="Amount to calculate..." ng-model="mainCtrl.model.amount_from">

            <h5 class="subheader" ng-show="mainCtrl.model.amount_to">Wartość w wybranej walucie:</h5>
            <div class="panel callout" ng-show="mainCtrl.model.amount_to">
              <p>{{mainCtrl.model.amount_to}} {{mainCtrl.model.rate_to}} </p>
            </div>

          </div>
        </div>
        <div class="row">
          <div class="small-12 columns">
            <a href="#" ng-click="mainCtrl.getData()">
              <span class="right subheader">update rates</span>
            </a>
          </div>
        </div>
        <div class="row">
          <div class="small-12 columns">
            <div ng-show="mainCtrl.forceDownload && mainCtrl.updateProgress <= 100" class="progress">
              <span class="meter" style="width: {{mainCtrl.updateProgress}}%"></span>
            </div>
          </div>
        </div>
    </div>

    <script src="node_modules/angular/angular.min.js" type="text/javascript"></script>
    <script src="js/app/app.js" type="text/javascript"></script>
    <script src="js/app/controllers/MainController.js" type="text/javascript"></script>

    <?php $key = 'dsakcnasli332432%$#%@$dsASA&&'; ?>
    <?php $_SESSION['currenciesCalulator_csrf'] = md5($key . time() . $key); ?>

    <script>
      // jshint ignore:start
      var currenciesCalulator_csrf = '<?php echo $_SESSION['currenciesCalulator_csrf']; ?>';
      // jshint ignore:end
    </script>
  </body>
</html>
