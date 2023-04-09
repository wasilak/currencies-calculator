package main

import (
	"embed"
	"flag"
	"html/template"
	"io"
	"io/fs"
	"net/http"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	gocache "github.com/patrickmn/go-cache"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"github.com/wasilak/currencies-calculator/libs"
)

//go:embed views
var views embed.FS

//go:embed static/*
var static embed.FS

var version string
var cache *gocache.Cache

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
	return c.Render(http.StatusOK, "index", tempalateData)
}

func apiGetRoute(c echo.Context) error {
	force := c.Param("force")

	ratesResponse := libs.GetCurrencies(cache, force)

	log.Debug(ratesResponse)

	return c.JSON(http.StatusOK, ratesResponse[0])
}

func main() {
	buildInfo, _ := debug.ReadBuildInfo()

	// using standard library "flag" package
	flag.Bool("version", false, "version")
	flag.Bool("verbose", false, "verbose")
	flag.Bool("show-settings", false, "show settings and exit")
	flag.Int("cache-expire", 10*3600, "cache expire interval in seconds")
	flag.Int("metrics-refresh", 3600, "metrics rfresh interval in seconds")
	flag.String("listen", "localhost:3000", "listen address")

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	viper.BindPFlags(pflag.CommandLine)

	viper.SetEnvPrefix("CC")
	viper.AutomaticEnv()

	if viper.GetBool("show-settings") {
		log.Info(viper.AllSettings())
		os.Exit(0)
	}

	if viper.GetBool("debug") {
		log.SetLevel(log.DEBUG)
	}

	if viper.GetBool("version") {
		log.Infof("currencies-calculator %s (%s)", version, buildInfo.GoVersion)
		os.Exit(0)
	}

	// Create a cache with a default expiration time of 5 minutes, and which
	// purges expired items every N seconds
	cache = gocache.New(5*time.Minute, time.Duration(viper.GetInt("cache-expire"))*time.Minute)

	e := echo.New()

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			return strings.Contains(c.Path(), "metrics") // Change "metrics" for your own path
		},
	}))

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

	assetHandler := http.FileServer(getEmbededAssets())
	e.GET("/public/static/*", echo.WrapHandler(http.StripPrefix("/public/static/", assetHandler)))

	e.GET("/", mainRoute)
	e.GET("/api/get/:force", apiGetRoute)

	// run in background
	libs.PrometheusSetup(e, cache)

	e.Logger.Fatal(e.Start(viper.GetString("listen")))
}
