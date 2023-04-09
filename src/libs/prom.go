package libs

import (
	"log"
	"time"

	"github.com/labstack/echo/v4"
	gocache "github.com/patrickmn/go-cache"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/viper"
)

func PrometheusSetup(e *echo.Echo, cache *gocache.Cache) {
	recordMetrics(cache)

	e.GET("/metrics", echo.WrapHandler(promhttp.Handler()))
}

func generateMetrics(rateMetric *prometheus.GaugeVec, cache *gocache.Cache) {
	ratesResponse := GetCurrencies(cache, "1")

	for _, rate := range ratesResponse[0].Rates {
		rateMetric.With(prometheus.Labels{
			"currency": rate.Currency,
			"code":     rate.Code,
		}).Set(float64(rate.Mid))

	}
}

func recordMetrics(cache *gocache.Cache) {
	var err error

	rateMetric := prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "currency_rate",
		Help: "Currency Rate",
	}, []string{"currency", "code"})

	err = prometheus.Register(rateMetric)
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		for {
			generateMetrics(rateMetric, cache)
			time.Sleep(time.Duration(viper.GetInt("metrics-refresh")) * time.Second)
		}
	}()
}
