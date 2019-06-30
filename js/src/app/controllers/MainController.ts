module Application.Controllers {

    export class MainController {

        $scope :any;
        $http :any;
        $interval :any;
        model :Model;
        forceDownload :boolean;
        updateProgress :number;
        
        emptyModel :Model;

        public constructor($scope: ng.IScope, $http, $interval) {
            let mainCtrl = this;
            
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

            $scope.$watch('mainCtrl.model', () :void => {
              this.calculate();
            }, true);
        }
        
        private getData = () :void => {
          this.forceDownload = true;
          this.dataDownload();
        };
        
        private calculate = () :void => {
          if (this.model.rate_from && this.model.rate_to && this.model.amount_from) {
            this.model.amount_to = (this.model.rates[this.model.rate_from].mid * parseFloat(this.model.amount_from) / this.model.rates[this.model.rate_to].mid).toFixed(2);
          } else {
            this.model.amount_to = '';
          }
        };
        
        private setCurrency = (currencyToSetup :Rate) :void => {
          this.model.rates[currencyToSetup.code] = {
            currency: currencyToSetup.code +  " - " + currencyToSetup.currency,
            mid: currencyToSetup.mid
          };
        }
        
        public saveSelection = (name :string, value :string) :void => {                    
          if (localStorage && !this.forceDownload) {
            localStorage.setItem(name, value);
          }
        };
        
        public resetTabelaWalut = () :void => {
          this.setModel(this.emptyModel);
        };
        
        private currencyTablePrepare = () :void => {
          this.setCurrency(walutaPL);

          let currencyNumber :number = this.model.data.rates.length;
          let loaderStep :number = 100 / currencyNumber;

          for (let element of this.model.data.rates) {
            this.setCurrency(element);
          }

          // just for loader progress bar ;)
          this.updateProgress = 0;
          let n :number = 0;
          this.$interval(() :void => {
            this.updateProgress += loaderStep;
            n += 1;

            if (n == currencyNumber) {
              this.forceDownload = false;
            }
          }, 0, currencyNumber);
        };
        
        private setModel = (model :Model) :void => {
          this.model = model;
        };
        
        private dataDownload = () => {          
          this.resetTabelaWalut();

          let requestParams :RequestParams = {
            currenciesCalulator_csrf: window.currenciesCalulator_csrf,
            forceDownload: 0
          };

          if (this.forceDownload) {
            requestParams.forceDownload = 1;
          }

          let self = this

          this.$http(
            {
              method: 'GET',
              url: '/api/get/' + requestParams.currenciesCalulator_csrf + '/' + requestParams.forceDownload,
            }).then(function successCallback(response) {
              let ratesTable: RatesTable = response.data;
              self.model.data = ratesTable;

              self.model.effectiveDate = ratesTable.effectiveDate;

              self.currencyTablePrepare();

              if (localStorage) {
                self.model.rate_from = localStorage.getItem('waluty_rate_from');
                self.model.rate_to = localStorage.getItem('waluty_rate_to');
              }
            }, function errorCallback(data: Object) {
                console.log(data);
          });
          
          // this.$http.get('/api/get/' + requestParams.currenciesCalulator_csrf + '/' + requestParams.forceDownload)
          // .success((data :RatesTable) => {
            
          //   let ratesTable :RatesTable = <RatesTable>data;
          //   this.model.data = ratesTable;

          //   this.model.effectiveDate = ratesTable.effectiveDate;
          //   console.log(this.model);
            
          //   this.currencyTablePrepare();
            
          //   if (localStorage) {
          //     this.model.rate_from = localStorage.getItem('waluty_rate_from');
          //     this.model.rate_to = localStorage.getItem('waluty_rate_to');
          //   }
          // }).error((data :Object) => {
          //   console.log(data);
          // });
        }
    }
}
