/// <reference path="../../lib/xml2json.d.ts" />

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
              dane: {
                tabela_kursow: {
                  data_publikacji: '',
                  pozycja: []
                }
              },
              kursy: {},
              kurs_from: '',
              kurs_to: '',
              kwota_from: '',
              kwota_to: '',
              dataPublikacji: ''
            };

            this.setModel(this.emptyModel);
            
            this.forceDownload = false;
            this.pobranieDanych();

            $scope.$watch('mainCtrl.model', () :void => {
              this.calculate();
            }, true);
        }
        
        private getData = () :void => {
          this.forceDownload = true;
          this.pobranieDanych();
        };
        
        private calculate = () :void => {
          if (this.model.kurs_from && this.model.kurs_to && this.model.kwota_from) {
            this.model.kwota_to = (this.model.kursy[this.model.kurs_from].kurs_sredni * parseFloat(this.model.kwota_from) / this.model.kursy[this.model.kurs_to].kurs_sredni).toFixed(2);
          } else {
            this.model.kwota_to = '';
          }
        };
        
        private setWaluta = (waluta :Kurs) :void => {
          this.model.kursy[waluta.kod_waluty] = {
            nazwa_waluty: waluta.kod_waluty +  " - " + waluta.nazwa_waluty,
            kurs_sredni: (parseFloat(waluta.kurs_sredni.replace(",", ".")) / parseFloat(waluta.przelicznik)).toFixed(2)
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
        
        private przygotowanieTabelaWalut = () :void => {
          this.setWaluta(walutaPL);

          let iloscWalut :number = this.model.dane.tabela_kursow.pozycja.length;
          let krokLoadera :number = 100 / iloscWalut;

          for (let element of this.model.dane.tabela_kursow.pozycja) {
            this.setWaluta(element);
          }

          // just for loader progress bar ;)
          this.updateProgress = 0;
          let n :number = 0;
          this.$interval(() :void => {
            this.updateProgress += krokLoadera;
            n += 1;

            if (n == iloscWalut) {
              this.forceDownload = false;
            }
          }, 0, iloscWalut);
        };
        
        private setModel = (model :Model) :void => {
          this.model = model;
        };
        
        private pobranieDanych = () => {          
          this.resetTabelaWalut();

          let requestParams :RequestParams = {
            kalkulatorWalut_csrf: window.kalkulatorWalut_csrf,
            forceDownload: 0
          };

          if (this.forceDownload) {
            requestParams.forceDownload = 1;
          }
          
          this.$http.get('proxy.php', {
            params: requestParams,
          }).success((data :string) => {

              let x2js :IX2JS = new X2JS();
              let json :ModelDane = <ModelDane>x2js.xml_str2json(data);
              this.model.dane = json;
              this.model.dataPublikacji = this.model.dane.tabela_kursow.data_publikacji;

              this.przygotowanieTabelaWalut();

              if (localStorage) {
                this.model.kurs_from = localStorage.getItem('waluty_kurs_from');
                this.model.kurs_to = localStorage.getItem('waluty_kurs_to');
              }
          }).error((data :Object) => {
            console.log(data);
          });
        }
    }
}
