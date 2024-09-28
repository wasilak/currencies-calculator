package main

import (
	"context"
	"embed"
	"flag"
	"html/template"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	gocache "github.com/patrickmn/go-cache"
	slogecho "github.com/samber/slog-echo"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"github.com/wasilak/currencies-calculator/libs"
	"github.com/wasilak/loggergo"
	otelgotracer "github.com/wasilak/otelgo/tracing"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
)

//go:embed dist/*
var dist embed.FS

//go:embed views/*
var views embed.FS

var cache *gocache.Cache

func getEmbededViews() fs.FS {
	fsys, err := fs.Sub(views, "views")
	if err != nil {
		panic(err)
	}

	return fsys
}

func getEmbededAssets() http.FileSystem {
	fsys, err := fs.Sub(dist, "dist")
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

	slog.Debug("ratesResponse", "value", ratesResponse)

	return c.JSON(http.StatusOK, ratesResponse[0])
}

func main() {

	ctx := context.Background()

	flag.String("listen", "localhost:3000", "listen address")

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	viper.BindPFlags(pflag.CommandLine)

	viper.SetEnvPrefix("CC")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	viper.AutomaticEnv()

	viper.SetDefault("metrics-refresh", 3600)
	viper.SetDefault("log.level", "info")
	viper.SetDefault("log.format", "json")
	viper.SetDefault("otel.enabled", false)

	if strings.EqualFold(viper.GetString("log.level"), "debug") {
		slog.InfoContext(ctx, "settings", "value", viper.AllSettings())
	}

	if viper.GetBool("otel.enabled") {
		otelGoTracingConfig := otelgotracer.Config{
			HostMetricsEnabled:    true,
			RuntimeMetricsEnabled: true,
		}
		ctx, _, err := otelgotracer.Init(ctx, otelGoTracingConfig)
		if err != nil {
			slog.ErrorContext(ctx, "error", "value", err.Error())
			os.Exit(1)
		}
	}

	loggerConfig := loggergo.Config{
		Level:  loggergo.LogLevelFromString(viper.GetString("log.level")),
		Format: loggergo.LogFormatFromString(viper.GetString("log.format")),
	}

	if viper.GetBool("otel.enabled") {
		loggerConfig.OtelLoggerName = "github.com/wasilak/currenccies-calculator"
		loggerConfig.OtelServiceName = os.Getenv("OTEL_SERVICE_NAME")
		loggerConfig.OtelTracingEnabled = true
	}

	_, err := loggergo.LoggerInit(ctx, loggerConfig)
	if err != nil {
		slog.ErrorContext(ctx, "error", "value", err.Error())
		os.Exit(1)
	}

	// Create a cache with a default expiration time of 5 minutes, and which
	// purges expired items every N seconds
	cache = gocache.New(5*time.Minute, time.Duration(viper.GetInt("cache-expire"))*time.Minute)

	e := echo.New()

	if viper.GetBool("otel.enabled") {
		e.Use(otelecho.Middleware(os.Getenv("OTEL_SERVICE_NAME"), otelecho.WithSkipper(func(c echo.Context) bool {
			return strings.Contains(c.Path(), "public/dist") || strings.Contains(c.Path(), "health")
		})))
	}

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			return strings.Contains(c.Path(), "metrics") // Change "metrics" for your own path
		},
	}))

	e.HideBanner = true

	if strings.EqualFold(viper.GetString("log.level"), "debug") {
		e.Logger.SetLevel(log.DEBUG)
		e.Debug = true
	}

	t := &Template{
		templates: template.Must(template.ParseFS(getEmbededViews(), "*.html")),
	}

	e.Renderer = t

	e.Use(slogecho.New(slog.Default()))
	e.Use(middleware.Recover())

	assetHandler := http.FileServer(getEmbededAssets())
	e.GET("/public/dist/*", echo.WrapHandler(http.StripPrefix("/public/dist/", assetHandler)))

	e.GET("/", mainRoute)
	e.GET("/api/get/", apiGetRoute)
	e.GET("/api/get/:force", apiGetRoute)

	// run in background
	libs.PrometheusSetup(e, cache)

	e.Logger.Fatal(e.Start(viper.GetString("listen")))
}
