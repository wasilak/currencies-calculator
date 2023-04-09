package libs

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/labstack/gommon/log"
	gocache "github.com/patrickmn/go-cache"
)

type Rate struct {
	Currency string  `json:"currency"`
	Code     string  `json:"code"`
	Mid      float32 `json:"mid"`
}

type RateResponse struct {
	Table         string `json:"table"`
	EffectiveDate string `json:"effectiveDate"`
	Rates         []Rate `json:"rates"`
}

type RatesResponse []RateResponse

var currenciesUrl = "https://api.nbp.pl/api/exchangerates/tables/A/?format=json"

func GetCurrencies(cache *gocache.Cache, force string) RatesResponse {

	var ratesResponse RatesResponse

	if x, found := cache.Get("ratesResponse"); found && force == "0" {

		log.Debug("Cache hit!")

		ratesResponse = x.(RatesResponse)
	} else {
		if force == "1" {
			log.Debug("Cache refresh forced!")
		} else {
			log.Debug("Cache miss!")
		}

		client := &http.Client{}
		req, err := http.NewRequest("GET", currenciesUrl, nil)
		req.Header.Set("user-agent", "curl/7.87.0")
		res, _ := client.Do(req)

		if err != nil {
			log.Fatal(err)
		}

		response, err := io.ReadAll(res.Body)
		if err != nil {
			log.Fatal(err)
		}
		log.Debug(string(response))

		ratesResponse = RatesResponse{}
		err = json.Unmarshal(response, &ratesResponse)
		if err != nil {
			log.Debug(err)
		}

		cache.Set("ratesResponse", ratesResponse, gocache.DefaultExpiration)
	}

	return ratesResponse
}
