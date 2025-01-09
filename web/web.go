package web

import (
	"context"
	"embed"
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"net/http"
	"os"
	"strings"
	"text/template"

	"log/slog"

	"github.com/labstack/echo-contrib/prometheus"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	gocache "github.com/patrickmn/go-cache"
	slogecho "github.com/samber/slog-echo"
	"github.com/spf13/viper"
	"github.com/wasilak/currencies-calculator/libs"
	loggergoLib "github.com/wasilak/loggergo/lib"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
)

//go:embed views
var views embed.FS

//go:embed assets assets/dist/.vite/manifest.json
var assets embed.FS

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

type ManifestEntry struct {
	File    string   `json:"file"`
	Src     string   `json:"src"`
	IsEntry bool     `json:"isEntry"`
	Css     []string `json:"css,omitempty"`
	Assets  []string `json:"assets,omitempty"`
}

type Manifest map[string]ManifestEntry

type WebServer struct {
	Template *Template
	Cache    *gocache.Cache
	Manifest Manifest
	CTX      context.Context
}

func (ws *WebServer) getEmbededViews() fs.FS {
	fsys, err := fs.Sub(views, "views")
	if err != nil {
		panic(err)
	}

	return fsys
}

// loadManifest loads and parses the manifest.json file from the embedded assets
func (ws *WebServer) loadManifest() (map[string]ManifestEntry, error) {
	// Open the manifest.json file from the embedded assets
	file, err := assets.Open("assets/dist/.vite/manifest.json")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Initialize the manifest map
	manifest := make(map[string]ManifestEntry)

	// Decode the JSON data directly into the manifest map
	if err := json.NewDecoder(file).Decode(&manifest); err != nil {
		return nil, errors.New("failed to decode manifest JSON: " + err.Error())
	}

	return manifest, nil
}

func (ws *WebServer) getEmbededAssets() http.FileSystem {
	fsys, err := fs.Sub(assets, "assets")
	if err != nil {
		panic(err)
	}

	return http.FS(fsys)
}

func (ws *WebServer) Init() {
	e := echo.New()

	var err error

	ws.Manifest, err = ws.loadManifest()
	if err != nil {
		slog.ErrorContext(ws.CTX, "failed to load manifest", "error", err)
		os.Exit(1)
	}

	if viper.GetBool("otel.enabled") {
		e.Use(otelecho.Middleware(os.Getenv("OTEL_SERVICE_NAME"), otelecho.WithSkipper(func(c echo.Context) bool {
			return strings.Contains(c.Path(), "/assets") || strings.Contains(c.Path(), "health") || strings.Contains(c.Path(), "metrics")
		})))
	}

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			return strings.Contains(c.Path(), "metrics")
		},
	}))

	e.HideBanner = true

	if loggergoLib.LogLevelFromString(viper.GetString("log.level")) == slog.LevelDebug {
		e.Logger.SetLevel(log.DEBUG)
		e.Debug = true
	}

	ws.Template = &Template{
		templates: template.Must(template.ParseFS(ws.getEmbededViews(), "*.html")),
	}

	e.Renderer = ws.Template

	e.Use(slogecho.New(slog.Default()))
	e.Use(middleware.Recover())

	// Enable metrics middleware
	p := prometheus.NewPrometheus("echo", nil)
	p.Use(e)

	assetHandler := http.FileServer(ws.getEmbededAssets())
	e.GET("/assets/*", echo.WrapHandler(http.StripPrefix("/assets/", assetHandler)))

	e.GET("/", ws.mainRoute)
	e.GET("/api/get/", ws.apiGetRoute)
	e.GET("/api/get/:force", ws.apiGetRoute)

	// run in background
	libs.PrometheusSetup(e, ws.Cache)

	e.Logger.Fatal(e.Start(viper.GetString("listen")))
}
