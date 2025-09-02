# Currencies Calculator

A currency converter application built with Go backend and React frontend, featuring real-time exchange rates from the National Bank of Poland and optional Prometheus metrics integration.

## Features

- Real-time currency conversion using National Bank of Poland rates
- Dark/Light theme support
- Multi-language support (English/Polish)
- Optional Prometheus metrics integration for historical data visualization
- Modern React UI with shadcn/ui components

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- Yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd currencies-calculator
```

2. Install frontend dependencies:
```bash
yarn install
```

3. Build the frontend:
```bash
yarn build
```

4. Run the application:
```bash
go run main.go
```

The application will be available at `http://localhost:3000`

## Configuration

### Basic Configuration

- `--listen`: Server address (default: `localhost:3000`)
- `--log.level`: Log level (default: `info`)
- `--log.format`: Log format (default: `json`)

### Prometheus Integration

To enable Prometheus metrics UI:

```bash
go run main.go --enable-prometheus-ui=true
```

This will:
- Enable the `/metrics` endpoint for Prometheus scraping
- Show historical currency rate charts in the UI
- Generate currency rate metrics every hour

### External Prometheus Server Integration

To connect to an external Prometheus server for historical data:

```bash
go run main.go --enable-prometheus-ui=true --prometheus-url=http://prometheus:9090
```

For HTTPS Prometheus servers with self-signed certificates:

```bash
go run main.go --enable-prometheus-ui=true --prometheus-url=https://prometheus.company.com --prometheus-insecure=true
```

**Benefits of External Prometheus:**
- Access to historical data beyond the current session
- Better data retention and aggregation
- Integration with existing monitoring infrastructure
- More sophisticated querying capabilities

**Configuration Options:**
- `--prometheus-url`: URL of external Prometheus server (e.g., `http://prometheus:9090`, `https://prometheus.company.com`)
- `--prometheus-insecure`: Skip SSL certificate verification for HTTPS connections (default: `false`)

**How it works:**
1. When `--prometheus-url` is set, the application queries the external Prometheus server
2. Uses PromQL queries to fetch 24 hours of historical data with 5-minute intervals
3. Transforms the response to match the frontend's expected format
4. Falls back to local metrics if external Prometheus is unavailable
5. When `--prometheus-insecure=true`, SSL certificate verification is skipped for HTTPS connections

### Docker Compose Example

For a complete setup with Prometheus and Grafana:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - CC_ENABLE_PROMETHEUS_UI=true
      - CC_PROMETHEUS_URL=http://prometheus:9090
    depends_on:
      - prometheus

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

Example `prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'currencies-calculator'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'
```

## Development

### Frontend Development

Start the development server:
```bash
cd web
yarn dev
```

### Backend Development

Run with debug logging:
```bash
go run main.go --log.level=debug
```

### Building for Production

1. Build the frontend:
```bash
yarn build
```

2. Build the Go binary:
```bash
go build -o currencies-calculator main.go
```

## API Endpoints

- `GET /`: Main application page
- `GET /api/get/`: Get current currency rates
- `GET /metrics`: Prometheus metrics (when enabled)
- `GET /api/prometheus-metrics?from=USD&to=EUR`: Get historical metrics data

## Architecture

- **Backend**: Go with Echo framework
- **Frontend**: React with Vite, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI
- **Metrics**: Prometheus integration with optional external server
- **Caching**: In-memory cache for currency rates
- **Internationalization**: i18next for multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]
