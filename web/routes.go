package web

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/prometheus/common/expfmt"
	"github.com/spf13/viper"
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

	// Add PLN as the base currency to the response
	response := ratesResponse[0]

	// Create PLN rate entry
	plnRate := libs.Rate{
		Currency: "złoty polski",
		Code:     "PLN",
		Mid:      1.0,
	}

	// Add PLN to the beginning of the rates array
	response.Rates = append([]libs.Rate{plnRate}, response.Rates...)

	return c.JSON(http.StatusOK, response)
}

// PrometheusMetricsResponse represents the structure of our Prometheus metrics response
type PrometheusMetricsResponse struct {
	Status string `json:"status"`
	Data   Data   `json:"data"`
}

type Data struct {
	ResultType string   `json:"resultType"`
	Result     []Result `json:"result"`
}

type Result struct {
	Metric Metric        `json:"metric"`
	Value  []interface{} `json:"value"`
}

type Metric struct {
	Code     string `json:"code"`
	Currency string `json:"currency"`
}

// ExternalPrometheusResponse represents the response from external Prometheus server
type ExternalPrometheusResponse struct {
	Status string `json:"status"`
	Data   struct {
		ResultType string `json:"resultType"`
		Result     []struct {
			Metric map[string]string `json:"metric"`
			Values [][]interface{}   `json:"values"` // For query_range endpoint
			Value  []interface{}     `json:"value"`  // For instant query endpoint
		} `json:"result"`
	} `json:"data"`
}

// apiPrometheusMetricsRoute handles requests for Prometheus metrics data
func (ws *WebServer) apiPrometheusMetricsRoute(c echo.Context) error {
	slog.Debug("apiPrometheusMetricsRoute called")

	// Check if the feature is enabled
	if !viper.GetBool("enable-prometheus-ui") {
		slog.Debug("Prometheus UI feature is not enabled")
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "Prometheus UI feature is not enabled. Start the application with --enable-prometheus-ui=true",
		})
	}

	// Get the "from" and "to" currency codes from query parameters
	fromCurrency := c.QueryParam("from")
	toCurrency := c.QueryParam("to")

	slog.Debug("Prometheus metrics request", "from", fromCurrency, "to", toCurrency)

	if fromCurrency == "" || toCurrency == "" {
		slog.Debug("Missing required query parameters")
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Both 'from' and 'to' currency codes are required as query parameters",
		})
	}

	// Check if external Prometheus URL is configured
	prometheusURL := viper.GetString("prometheus-url")
	if prometheusURL != "" {
		// Use external Prometheus server for historical data
		return ws.queryExternalPrometheus(c, fromCurrency, toCurrency, prometheusURL)
	}

	// Fallback to local metrics (current behavior)
	return ws.queryLocalMetrics(c, fromCurrency, toCurrency)
}

// queryExternalPrometheus queries an external Prometheus server for historical data
func (ws *WebServer) queryExternalPrometheus(c echo.Context, fromCurrency, toCurrency, prometheusURL string) error {
	// Create HTTP client with optional SSL verification skip
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Check if SSL verification should be skipped
	if viper.GetBool("prometheus-insecure") {
		slog.Info("Creating HTTP client with SSL verification disabled for external Prometheus")
		client.Transport = &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		}
	}

	// Build PromQL query for the last 24 hours of data
	// Query for both currencies with 5-minute intervals
	query := fmt.Sprintf(`currency_rate{code=~"(%s|%s)"}[24h:5m]`, fromCurrency, toCurrency)

	// Create the query URL
	queryURL := fmt.Sprintf("%s/api/v1/query_range", prometheusURL)
	params := url.Values{}
	params.Add("query", query)
	params.Add("start", fmt.Sprintf("%d", time.Now().Add(-24*time.Hour).Unix()))
	params.Add("end", fmt.Sprintf("%d", time.Now().Unix()))
	params.Add("step", "300") // 5-minute steps

	fullURL := fmt.Sprintf("%s?%s", queryURL, params.Encode())

	// Log the PromQL query and URL for debugging
	slog.Info("Querying external Prometheus",
		"prometheus_url", prometheusURL,
		"promql_query", query,
		"full_url", fullURL,
		"from_currency", fromCurrency,
		"to_currency", toCurrency,
		"insecure_skip_verify", viper.GetBool("prometheus-insecure"))

	// Make the request
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		slog.Error("Failed to create external Prometheus request", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to create external Prometheus request",
		})
	}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error("Failed to query external Prometheus, falling back to local metrics",
			"error", err,
			"prometheus_url", prometheusURL)

		// Fall back to local metrics instead of returning an error
		slog.Info("Falling back to local metrics due to external Prometheus connection failure")
		return ws.queryLocalMetrics(c, fromCurrency, toCurrency)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		slog.Error("External Prometheus returned error, falling back to local metrics",
			"status", resp.StatusCode,
			"prometheus_url", prometheusURL)

		// Fall back to local metrics instead of returning an error
		slog.Info("Falling back to local metrics due to external Prometheus error")
		return ws.queryLocalMetrics(c, fromCurrency, toCurrency)
	}

	// Parse the response
	var externalResp ExternalPrometheusResponse
	if err := json.NewDecoder(resp.Body).Decode(&externalResp); err != nil {
		slog.Error("Failed to decode external Prometheus response, falling back to local metrics", "error", err)

		// Fall back to local metrics instead of returning an error
		slog.Info("Falling back to local metrics due to external Prometheus response decode error")
		return ws.queryLocalMetrics(c, fromCurrency, toCurrency)
	}

	// Log the external response for debugging
	slog.Info("External Prometheus response",
		"status", externalResp.Status,
		"result_type", externalResp.Data.ResultType,
		"result_count", len(externalResp.Data.Result))

	// Transform the response to match our expected format
	var filteredResults []Result
	for _, result := range externalResp.Data.Result {
		code := result.Metric["code"]
		currency := result.Metric["currency"]

		// Only include the requested currencies
		if code == fromCurrency || code == toCurrency {
			// For query_range endpoint, use 'values' field which contains array of [timestamp, value] pairs
			if len(result.Values) > 0 {
				for _, valuePair := range result.Values {
					if len(valuePair) >= 2 {
						timestamp, _ := valuePair[0].(float64)
						valueStr, _ := valuePair[1].(string)

						filteredResults = append(filteredResults, Result{
							Metric: Metric{
								Code:     code,
								Currency: currency,
							},
							Value: []interface{}{
								timestamp,
								valueStr,
							},
						})
					}
				}
			} else if len(result.Value) >= 2 {
				// Fallback for instant query format
				timestamp, _ := result.Value[0].(float64)
				valueStr, _ := result.Value[1].(string)

				filteredResults = append(filteredResults, Result{
					Metric: Metric{
						Code:     code,
						Currency: currency,
					},
					Value: []interface{}{
						timestamp,
						valueStr,
					},
				})
			}
		}
	}

	slog.Info("Transformed external Prometheus results",
		"filtered_count", len(filteredResults),
		"from_currency", fromCurrency,
		"to_currency", toCurrency)

	// Create the response
	response := PrometheusMetricsResponse{
		Status: "success",
		Data: Data{
			ResultType: "matrix",
			Result:     filteredResults,
		},
	}

	return c.JSON(http.StatusOK, response)
}

// queryLocalMetrics queries the local metrics endpoint (current behavior)
func (ws *WebServer) queryLocalMetrics(c echo.Context, fromCurrency, toCurrency string) error {
	// Create an HTTP request to fetch metrics from the local Prometheus endpoint
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Get the current server address
	serverAddr := viper.GetString("listen")
	if !strings.Contains(serverAddr, ":") {
		serverAddr = "localhost:" + serverAddr
	}

	metricsURL := fmt.Sprintf("http://%s/metrics", serverAddr)

	slog.Debug("Fetching metrics from", "url", metricsURL)

	// Make a request to the metrics endpoint
	req, err := http.NewRequest("GET", metricsURL, nil)
	if err != nil {
		slog.Error("Failed to create metrics request", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to create metrics request",
		})
	}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error("Failed to fetch metrics from Prometheus endpoint", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch metrics from Prometheus endpoint",
		})
	}
	defer resp.Body.Close()

	// Check if the response is successful
	if resp.StatusCode != http.StatusOK {
		slog.Error("Failed to fetch metrics", "status", resp.StatusCode)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": fmt.Sprintf("Failed to fetch metrics, status code: %d", resp.StatusCode),
		})
	}

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error("Failed to read metrics response", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to read metrics response",
		})
	}

	slog.Debug("Metrics response", "body", string(body))

	// Parse the Prometheus metrics text format
	parser := &expfmt.TextParser{}
	metricFamilies, err := parser.TextToMetricFamilies(strings.NewReader(string(body)))
	if err != nil {
		slog.Error("Failed to parse Prometheus metrics", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to parse Prometheus metrics",
		})
	}

	slog.Debug("Parsed metric families", "count", len(metricFamilies))

	// Filter metrics for the requested currencies
	var filteredResults []Result

	for name, mf := range metricFamilies {
		slog.Debug("Processing metric family", "name", name, "type", mf.GetType())
		if name == "currency_rate" {
			for _, m := range mf.GetMetric() {
				// Extract labels
				var code, currency string
				for _, label := range m.GetLabel() {
					if label.GetName() == "code" {
						code = label.GetValue()
					}
					if label.GetName() == "currency" {
						currency = label.GetValue()
					}
				}

				slog.Debug("Processing metric", "code", code, "currency", currency)

				// Check if this metric matches our requested currencies
				if code == fromCurrency || code == toCurrency {
					result := Result{
						Metric: Metric{
							Code:     code,
							Currency: currency,
						},
						Value: []interface{}{
							float64(m.GetTimestampMs()) / 1000, // Convert to seconds
							m.GetGauge().GetValue(),
						},
					}
					filteredResults = append(filteredResults, result)
					slog.Debug("Added result", "code", code, "value", m.GetGauge().GetValue())
				}
			}
		}
	}

	slog.Debug("Filtered results", "count", len(filteredResults))

	// Create the response
	response := PrometheusMetricsResponse{
		Status: "success",
		Data: Data{
			ResultType: "vector",
			Result:     filteredResults,
		},
	}

	return c.JSON(http.StatusOK, response)
}
