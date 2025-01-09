package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"strings"
	"time"

	gocache "github.com/patrickmn/go-cache"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"github.com/wasilak/currencies-calculator/libs"
	"github.com/wasilak/currencies-calculator/web"
	"github.com/wasilak/loggergo"
	loggergoLib "github.com/wasilak/loggergo/lib"
	loggergoTypes "github.com/wasilak/loggergo/lib/types"
	otelgotracer "github.com/wasilak/otelgo/tracing"
)

func main() {

	ctx := context.Background()

	flag.String("listen", "localhost:3000", "listen address")
	flag.Bool("otel.enabled", true, "OTEL enabled")
	flag.String("log.format", "json", "log format")
	flag.String("log.level", "info", "log level")

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

	loggerConfig := loggergoTypes.Config{
		Level:   loggergoLib.LogLevelFromString(viper.GetString("log.level")),
		Format:  loggergoLib.LogFormatFromString(viper.GetString("log.format")),
		DevMode: loggergoLib.LogLevelFromString(viper.GetString("log.level")) == slog.LevelDebug && viper.GetString("log.format") == "plain",
		Output:  loggergoTypes.OutputConsole,
	}

	if viper.GetBool("otel.enabled") {
		loggerConfig.OtelLoggerName = "github.com/wasilak/currenccies-calculator"
		loggerConfig.OtelServiceName = libs.GetAppName()
		loggerConfig.OtelTracingEnabled = true
	}

	ctx, _, err := loggergo.Init(ctx, loggerConfig)
	if err != nil {
		slog.ErrorContext(ctx, "error", "value", err.Error())
		os.Exit(1)
	}

	// Create a cache with a default expiration time of 5 minutes, and which
	// purges expired items every N seconds
	cache := gocache.New(5*time.Minute, time.Duration(viper.GetInt("cache-expire"))*time.Minute)

	webServer := web.WebServer{
		Cache: cache,
		CTX:   ctx,
	}

	webServer.Init()
}
