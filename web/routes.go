package web

import (
	"log/slog"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/wasilak/currencies-calculator/libs"
)

func (ws *WebServer) mainRoute(c echo.Context) error {

	// Collect all JS, CSS, and asset paths
	var jsPaths []string
	var cssPaths []string
	var assetPaths []string

	for _, entry := range ws.Manifest {
		if entry.IsEntry {
			// Add JS file path
			jsPaths = append(jsPaths, "/assets/dist/"+entry.File)

			// Add all CSS file paths associated with this entry
			for _, cssFile := range entry.Css {
				cssPaths = append(cssPaths, "/assets/dist/"+cssFile)
			}

			// Add all asset paths associated with this entry
			for _, asset := range entry.Assets {
				assetPaths = append(assetPaths, "/assets/dist/"+asset)
			}
		}
	}

	templateData := map[string]interface{}{
		"Title":      "Currencies Calculator",
		"JSPaths":    jsPaths,
		"CSSPaths":   cssPaths,
		"AssetPaths": assetPaths,
	}

	return c.Render(http.StatusOK, "index", templateData)
}

func (ws *WebServer) apiGetRoute(c echo.Context) error {
	force := c.Param("force")

	ratesResponse := libs.GetCurrencies(ws.Cache, force)

	slog.Debug("ratesResponse", "value", ratesResponse)

	return c.JSON(http.StatusOK, ratesResponse[0])
}
