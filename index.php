<?php session_start(); ?>
<!DOCTYPE html>
<html ng-app="kalkulatorWalut">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kalkulator walut</title>

    <link rel="stylesheet" type="text/css" href="bower_components/foundation/css/foundation.min.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
  </head>
  <body>

    <div ng-controller="MainController as mainCtrl" ng-cloak class="ng-cloak" class="row">
      <div class="small-12 medium-8 large-6 small-centered columns">
        <p>{{mainCtrl.date}}</p>
        <h3>Kwota:</h3>
        <input type="number" name="" value="" placeholder="Podaj kwotę do przeliczenia..." ng-model="mainCtrl.kwota_from">
        <h3>Przeliczanie z:</h3>
        <select ng-model="mainCtrl.kurs_from" ng-options="key as item.nazwa_waluty for (key , item) in mainCtrl.kursy"></select>
        <p ng-show="mainCtrl.kurs_from">
          Kurs średni:
          <span class="label">{{mainCtrl.kursy[mainCtrl.kurs_from].kurs_sredni}} PLN</span>
        </p>
        <h3>Przeliczanie na:</h3>
        <select ng-model="mainCtrl.kurs_to" ng-options="key as item.nazwa_waluty for (key , item) in mainCtrl.kursy"></select>
        <p ng-show="mainCtrl.kurs_to">
          Kurs średni:
          <span class="label">{{mainCtrl.kursy[mainCtrl.kurs_to].kurs_sredni}} PLN</span>
        </p>


        <h5 class="subheader" ng-show="mainCtrl.kwota_to">Wartość w wybranej walucie:</h5>
        <div class="panel callout" ng-show="mainCtrl.kwota_to">
          <p>{{mainCtrl.kwota_to}} {{mainCtrl.kurs_to}} </p>
        </div>
      </div>
    </div>

    <script src="bower_components/x2js/xml2json.min.js" type="text/javascript"></script>
    <script src="bower_components/angularjs/angular.min.js" type="text/javascript"></script>
    <script src="js/app.js" type="text/javascript"></script>

    <?php $key = 'dsakcnasli332432%$#%@$dsASA&&'; ?>
    <?php $_SESSION['kalkulatorWalut_csrf'] = md5($key . time() . $key); ?>

    <script>
      var kalkulatorWalut_csrf = '<?php echo $_SESSION['kalkulatorWalut_csrf']; ?>';
    </script>
  </body>
</html>
