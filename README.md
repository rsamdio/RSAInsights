[![Netlify Status](https://api.netlify.com/api/v1/badges/b440f2f7-6858-41bc-a46c-c46ce98fb0b5/deploy-status)](https://app.netlify.com/projects/zone45678analysis/deploys)

# Rotaract South Asia Analytics Dashboard (Insights)

An executive analytics and intelligence dashboard for **Rotaract South Asia MDIO**, providing comprehensive membership, compliance, youth service (Interact), and TRF contribution metrics across **Zones 4, 5, 6 & 7** and worldwide.

---

## 🚀 Key Features

- **Executive Dashboard (`/`)**: Multi-select Zone & District filtering, interactive KPI cards, demographic distributions, top leaderboards, and deep data drilldown tables.
- **Zone Drilldown (`/zone/[zoneId]`)**: Granular zone-level analytics, district comparison directories, and demographic breakdowns.
- **District Deep Dive (`/district/[districtId]`)**: District officer directories, compliance alerts (arrears, missing officers), TRF impact, and club rosters.
- **Universal Club Report (`/club/[clubId]`)**: Dedicated profiles for Rotaract clubs across South Asia featuring membership standing, sponsorship details, TRF contributions, and compliance status.
- **Worldwide Statistics (`/worldwide`)**: Global Rotaract & Interact club and membership leaderboards with quarter-over-quarter and baseline growth analysis.
- **Youth Service & Interact Ecosystem**: Tracking Rotary clubs without Rotaract/Interact sponsorship, Interact club growth, and expansion opportunity metrics.
- **Public REST API (`/api/v1/`)**: 20 high-performance JSON endpoints covering summary, leaderboards, districts, clubs, compliance (including unified issues), opportunities, TRF, interact, and worldwide rankings.
- **Interactive API Documentation (`/docs`)**: Modern interactive API reference powered by Scalar and OpenAPI 3.1.0 (`/openapi.json`).
- **Model Context Protocol (MCP) Server**: 14 analytical AI tools, 8 resources, and 4 prompts supporting both local stdio (`npm run mcp`) and remote HTTP (`POST /api/mcp`, protocol version 2024-11-05).
- **Production Host Routing**: Canonical production routing at `https://insights.rsamdio.org/` with 301 edge redirects for Netlify subdomains and legacy addresses.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Visual Analytics:** Chart.js & `react-chartjs-2` with datalabels
- **Data Tables:** TanStack Table (`@tanstack/react-table`) with client-side sorting, pagination, and multi-field search
- **AI & Integrations:** Model Context Protocol (MCP) SDK (`@modelcontextprotocol/sdk`), OpenAPI 3.1.0
- **Styling:** Vanilla CSS (`app/globals.css`) with glassmorphism, responsive grid layouts, and mobile-first media queries
- **Typography:** Self-hosted `next/font/google` (`Inter`) with zero render-blocking requests
- **Analytics:** Google Analytics (`gtag.js`) with automatic client-side App Router route tracking

---

## 📁 Project Structure

```
├── app/                      # Next.js App Router routes
│   ├── layout.js             # Root layout with header badge & footer
│   ├── page.js               # Executive dashboard
│   ├── zone/[zoneId]/        # Zone drilldown pages
│   ├── district/[districtId]/# District deep dive pages
│   ├── club/[clubId]/        # Universal club report pages
│   ├── worldwide/            # Worldwide statistics page
│   ├── docs/                 # Interactive API documentation
│   ├── .well-known/          # Domain verification challenge
│   └── api/                  # API endpoints
│       ├── v1/               # 20 Public REST endpoints
│       ├── mcp/              # Remote MCP JSON-RPC 2.0 endpoint
│       └── filters/          # UI filter options endpoint
├── components/               # Reusable React components
│   ├── charts/               # Chart.js visualizations (Bar, Doughnut)
│   ├── sections/             # TopCharts, KPI leaderboards
│   ├── tables/               # TanStack DataTables & GlobalTables
│   └── ui/                   # MetricCards, HeaderFilters, Analytics, Tabs
├── data/                     # Pre-aggregated JSON & CSV data payloads
├── fulldata/                 # Raw master Excel workbooks
├── basedata/                 # Historical baseline CSV files
├── lib/                      # Core business logic & API services
│   ├── api.js                # Data access layer & cache
│   ├── services/             # Analytics & query services
│   └── mcp/                  # MCP tool definitions & schemas
├── openai-skills/            # Packaged OpenAI agent skills
├── public/                   # Static assets, redirects & openapi.json
│   ├── _redirects            # Netlify CDN edge redirects
│   └── openapi.json          # OpenAPI 3.1.0 specification
├── scripts/                  # Data processing & verification pipeline
│   ├── generate_dashboard_data.js
│   ├── mcp_server.js         # Stdio MCP server
│   ├── validate_harness.js   # Integrity validator
│   └── verify_production.mjs # Integration test suite
├── netlify.toml              # Netlify configuration & redirects
├── proxy.js                  # Next.js 16 host proxy middleware
└── .agents/                  # AI agent rules & architecture documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** 18.17+ or 20+
- **npm** or **yarn**

### 2. Installation
```bash
npm install
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Building for Production
```bash
npm run build
npm run start
```

### 5. AI Assistant & Model Context Protocol (MCP)
Run the local MCP stdio server for Cursor, Claude Desktop, or Antigravity:
```bash
npm run mcp
```
Or connect remotely via SSE at `https://insights.rsamdio.org/sse` or HTTP JSON-RPC 2.0 at `POST https://insights.rsamdio.org/api/mcp`.

### 6. Automated Testing & Verification
```bash
# Validate documentation links, data schemas, and typography invariants
npm run validate-harness

# Run automated integration smoke tests against production or localhost
node scripts/verify_production.mjs https://insights.rsamdio.org
```

---

## 📊 Data Pipeline & Updates

The dashboard relies on pre-aggregated data generated from master Excel files (`fulldata/MasterData.xlsx`) and baseline files (`basedata/`).

### Updating Master Data:
1. Place the new master workbook in `fulldata/MasterData.xlsx`.
2. Update the `DATA_AS_OF_DATE` constant at the top of `scripts/generate_dashboard_data.js` (e.g. `'13 Aug 2026'`).
3. Run the data generator:
   ```bash
   npm run generate-data
   ```
4. The script parses the raw club sheets, calculates deltas, and updates all JSON/CSV files in `data/`. The UI automatically detects updated files without requiring a server restart.

---

## 📈 Telemetry & Observability (Axiom)

The REST API endpoints and Model Context Protocol (MCP) server include structured, non-blocking telemetry powered by Axiom ($0/month on Axiom Cloud Free tier up to 500 GB/month).

### Environment Variables:
| Variable | Description | Default |
|---|---|---|
| `AXIOM_TOKEN` | Axiom API Token with Ingest permission | (Disabled if omitted) |
| `AXIOM_DATASET` | Target dataset name | `rotaract-analytics` |
| `AXIOM_ORG_ID` | Optional organization ID | None |
| `DEBUG_TELEMETRY` | Set to `1` or `true` to print telemetry payloads to console | `false` |

### Ingested Event Types:
- `api_request`: Path, normalized route, HTTP method, status code, latency (ms), query params, IP, user agent.
- `mcp_tool`: MCP tool name, arguments, latency (ms), outcome (success/failure), error message, caller source (`http` vs `stdio`), result count.
- `mcp_request`: Protocol methods (`initialize`, `server/discover`, `tools/list`, `tools/call`, `sse/connect`), status, latency.

When `AXIOM_TOKEN` is not configured, telemetry is safely disabled with zero overhead, network requests, or crashes.

---

## 🔒 License & Disclaimer

The information in this dashboard is sourced from Rotary International / RISAO for informational purposes by Rotaract South Asia MDIO. Official notices of dues and termination are issued exclusively by Rotary International.
