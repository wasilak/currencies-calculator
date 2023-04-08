package main

import (
	"embed"
	"encoding/json"
	"flag"
	"html/template"
	"io"
	"io/fs"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/labstack/echo-contrib/prometheus"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	gocache "github.com/patrickmn/go-cache"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

//go:embed views
var views embed.FS

//go:embed static/*
var static embed.FS

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

func getEmbededViews() fs.FS {
	fsys, err := fs.Sub(views, "views")
	if err != nil {
		panic(err)
	}

	return fsys
}

func getEmbededAssets() http.FileSystem {
	fsys, err := fs.Sub(static, "static")
	if err != nil {
		panic(err)
	}

	return http.FS(fsys)
}

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func mainRoute(c echo.Context) error {
	var tempalateData interface{}
	// return c.Render("views/index", tempalateData)
	return c.Render(http.StatusOK, "index", tempalateData)
}

func apiGetRoute(c echo.Context) error {
	force := c.Param("force")

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
		req, err := http.NewRequest("GET", "https://api.nbp.pl/api/exchangerates/tables/A/?format=json", nil)
		req.Header.Set("user-agent", "curl/7.87.0")
		res, _ := client.Do(req)

		if err != nil {
			log.Fatal(err)
		}

		response, err := ioutil.ReadAll(res.Body)
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

	log.Debug(force)
	log.Debug(ratesResponse)

	return c.JSON(http.StatusOK, ratesResponse[0])
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

	if verbose {
		log.Debug(viper.AllSettings())
		log.SetLevel(log.DEBUG)
	}

	// Create a cache with a default expiration time of 5 minutes, and which
	// purges expired items every 10 minutes
	cache = gocache.New(5*time.Minute, 10*time.Minute)

	e := echo.New()

	e.Use(middleware.Gzip())

	e.HideBanner = true

	if viper.GetBool("verbose") {
		e.Logger.SetLevel(log.DEBUG)
	}

	e.Debug = viper.GetBool("debug")

	t := &Template{
		templates: template.Must(template.ParseFS(getEmbededViews(), "*.html")),
	}

	e.Renderer = t

	e.Use(middleware.Logger())

	// Enable metrics middleware
	p := prometheus.NewPrometheus("echo", nil)
	p.Use(e)

	assetHandler := http.FileServer(getEmbededAssets())
	e.GET("/public/static/*", echo.WrapHandler(http.StripPrefix("/public/static/", assetHandler)))

	e.GET("/", mainRoute)
	e.GET("/api/get/:force", apiGetRoute)

	e.Logger.Fatal(e.Start(viper.GetString("listen")))
}
