package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	// rice "github.com/GeertJohan/go.rice"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/gofiber/template/html"
	"github.com/markbates/pkger"
	gocache "github.com/patrickmn/go-cache"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

var verbose bool
var cache *gocache.Cache

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

func mainRoute(c *fiber.Ctx) error {
	return c.Render("index", fiber.Map{})
}

func apiGetRoute(c *fiber.Ctx) error {
	force := c.Params("force")

	var ratesResponse RatesResponse
	if x, found := cache.Get("ratesResponse"); found && force == "0" {
		if verbose {
			log.Println("Cache hit!")
		}
		ratesResponse = x.(RatesResponse)
	} else {
		if verbose {
			if force == "1" {
				log.Println("Cache refresh forced!")
			} else {
				log.Println("Cache miss!")
			}
		}
		res, err := http.Get("https://api.nbp.pl/api/exchangerates/tables/A/?format=json")
		if err != nil {
			log.Fatal(err)
		}

		response, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Fatal(err)
		}

		ratesResponse = RatesResponse{}
		err = json.Unmarshal(response, &ratesResponse)
		if err != nil {
			log.Println(err)
		}

		cache.Set("ratesResponse", ratesResponse, gocache.DefaultExpiration)
	}

	c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)

	if verbose {
		log.Println(force)
		log.Println(ratesResponse)
	}

	return json.NewEncoder(c.Response().BodyWriter()).Encode(ratesResponse[0])
}

func main() {
	// using standard library "flag" package
	flag.Bool("verbose", false, "verbose")
	flag.String("listen", "localhost:3000", "listen address")

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	viper.BindPFlags(pflag.CommandLine)

	viper.SetEnvPrefix("CC")
	viper.AutomaticEnv()

	verbose = viper.GetBool("verbose")

	if verbose == true {
		log.Println(viper.AllSettings())
	}

	// Create a cache with a default expiration time of 5 minutes, and which
	// purges expired items every 10 minutes
	cache = gocache.New(5*time.Minute, 10*time.Minute)

	engine := html.NewFileSystem(pkger.Dir("/views"), ".html")

	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Use("/static", filesystem.New(filesystem.Config{
		Root: pkger.Dir("/static"),
	}))

	app.Static("/static", "./static")

	// Reload the templates on each render, good for development
	if verbose == true {
		engine.Reload(true) // Optional. Default: false
		// Debug will print each template that is parsed, good for debugging
		engine.Debug(true) // Optional. Default: false
	}

	app.Get("/", mainRoute)
	app.Get("/api/get/:force", apiGetRoute)

	app.Listen(viper.GetString("listen"))
}
