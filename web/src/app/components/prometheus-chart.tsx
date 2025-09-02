"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { useTheme } from "./theme-provider"
import { useTranslation } from "react-i18next"

interface PrometheusMetric {
  metric: {
    code: string
    currency: string
  }
  value: [number, number] // [timestamp, value]
}

interface PrometheusData {
  status: string
  data: {
    resultType: string
    result: PrometheusMetric[]
  }
}

interface ChartDataPoint {
  timestamp: string
  [key: string]: string | number
}

const PrometheusChart = ({ fromCurrency, toCurrency, hideTitle = false }: { fromCurrency: string; toCurrency: string; hideTitle?: boolean }) => {
  const { t } = useTranslation()
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!fromCurrency || !toCurrency) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Query for 7 days of data
        const response = await fetch(`/api/prometheus-metrics?from=${fromCurrency}&to=${toCurrency}&days=7`)

        if (response.status === 403) {
          setEnabled(false)
          setLoading(false)
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch metrics")
        }

        const metricsData: PrometheusData = await response.json()
        setEnabled(true)

        // Transform data for the chart
        const chartData: ChartDataPoint[] = []

        if (metricsData.data?.result && metricsData.data.result.length > 0) {
          metricsData.data.result.forEach(metric => {
            // Use date format instead of time format
            const timestamp = new Date(metric.value[0] * 1000).toLocaleDateString()
            const value = parseFloat(metric.value[1] as any)
            const currencyCode = metric.metric.code

            // Find existing entry for this timestamp or create new one
            let existingEntry = chartData.find(entry => entry.timestamp === timestamp)
            if (!existingEntry) {
              existingEntry = { timestamp }
              chartData.push(existingEntry)
            }

            // Add the currency value
            existingEntry[currencyCode] = value
          })
        }

        // Add PLN as constant value of 1 if it's selected
        if (fromCurrency === "PLN" || toCurrency === "PLN") {
          // Add PLN value to all existing timestamps
          chartData.forEach(entry => {
            entry["PLN"] = 1
          })
        }

        // Sort data by timestamp
        chartData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        setData(chartData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setEnabled(false)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [fromCurrency, toCurrency])

  // Don't render anything if feature is not enabled
  if (!enabled && !loading) {
    return null
  }

  if (loading) {
    return (
      <Card>
        {!hideTitle && (
          <CardHeader>
            <CardTitle>{t("currency_rate_history")}</CardTitle>
            <CardDescription>{t("loading_metrics")}</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        {!hideTitle && (
          <CardHeader>
            <CardTitle>{t("currency_rate_history")}</CardTitle>
            <CardDescription>{t("error_loading_metrics")}</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="h-80 flex items-center justify-center text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        {!hideTitle && (
          <CardHeader>
            <CardTitle>{t("currency_rate_history")}</CardTitle>
            <CardDescription>{t("no_data_available")}</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            {t("no_metrics_data_found")}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartColors = {
    [fromCurrency]: theme === "dark" ? "#0ea5e9" : "#0ea5e9", // sky-500
    [toCurrency]: theme === "dark" ? "#8b5cf6" : "#8b5cf6", // violet-500
  }

  return (
    <Card>
      {!hideTitle && (
        <CardHeader>
          <CardTitle>{t("currency_rate_history")}</CardTitle>
          <CardDescription>
            {t("historical_rates_for")} {fromCurrency} {t("and")} {toCurrency}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
                  borderRadius: "6px",
                  color: theme === "dark" ? "#f9fafb" : "#111827"
                }}
              />
              <Area
                type="monotone"
                dataKey={fromCurrency}
                stackId="1"
                stroke={chartColors[fromCurrency]}
                fill={chartColors[fromCurrency]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey={toCurrency}
                stackId="2"
                stroke={chartColors[toCurrency]}
                fill={chartColors[toCurrency]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default PrometheusChart
