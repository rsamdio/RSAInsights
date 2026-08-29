# Project Architecture & Standards: Rotaract South Asia Analytics Dashboard

## Core Tech Stack & Invariants
- **Framework:** Next.js 16 (App Router) with React 19 server-side and client-side components.
- **Charts:** Chart.js and `react-chartjs-2` with `chartjs-plugin-datalabels` for visual analytics.
- **Tables:** TanStack Table (`@tanstack/react-table`) with client-side sorting, pagination, and multi-field search.
- **Styling:** Vanilla CSS (`app/globals.css`) with glassmorphism, responsive grids, and mobile-first styles (`@media (max-width: 768px)`). No Tailwind CSS.
- **Animations:** `framer-motion` used in `MetricCard.js` for card entrance and hover lift animations.
- **Analytics:** Google Analytics (`gtag.js` ID: `G-M9RZK0CBT5`) with `strategy="afterInteractive"` and real-time App Router route tracking via `components/ui/Analytics.js`.
- **Typography:** Self-hosted `next/font/google` (`Inter`) with `font-display: swap`.
- **Filter Dropdowns:** `react-select` multi-select in `components/ui/HeaderFilters.js`.
- **Primary Map:** Refer to [index.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/index.md) for module authority, data pipeline flow, and quick routing.

---

## Route Structure
- `/`: Executive Dashboard (Multi-select filters, KPIs, charts, leaderboards, zones directory, and data drilldowns).
- `/zone/[zoneId]`: Zone Drilldown (KPI grid, district summary tables, demographic charts).
- `/district/[districtId]`: District Deep Dive (District summary, club leaderboards, compliance issues, and drilldowns).
- `/club/[clubId]`: Universal Club Report (2,820+ clubs with KPI grid, Club Information & Sponsorship card, TRF table, and Compliance Action Center).
- `/worldwide`: Worldwide Rotaract & Interact Statistics (Global leaderboards and growth statistics).
- `/api/filters`: Server endpoint providing dynamic filter options (cached 1 day, stale-while-revalidate 7 days).

---

## Key Architectural Invariants
- **District as Primary Key:** Districts serve as the immutable primary key. Zones are dynamically mapped from the master district list (`districtToZone[dist]`).
- **Raw Sheet Prioritization:** Aggregate raw club-level sheets (`All Rotaract Clubs`, `Rotaract clubs in arrears`, `No Rotaract club officers`, `ClubsTRFContribution`, `New Rotaract Clubs`) rather than summary sheets.
- **Async Route Params:** Next.js App Router `params` and `searchParams` are Promises (`const { zoneId } = await params;`).
- **O(1) Hash Map Lookups:** Use `getClubMap()` in `lib/api.js` for instant club lookups instead of scanning `all_clubs.json`.
- **File-based Cache:** `readJsonFile()` in `lib/api.js` caches parsed JSON by mtime in `global.apiCache` (survives across renders in Node).
- **Payload Trimming:** Trim server-to-client table props to keep initial HTML/Flight payloads under 600 KB.
- **Lazy Tab Rendering:** Tab `content` fields in `GlobalTables.js` are functions `() => <DataTable />` so only the active tab mounts.
- **Data Freshness Indicators:** Global Header displays `● Data as of: [Date]` and Footer displays `Data Source: Rotary International • Last Updated: [Date]`.
- **App-level Skeleton:** `app/loading.js` renders skeleton cards while server page loads (metrics grid + charts + table placeholders).
- **No Long Em Dashes:** Never use long em dashes (Unicode \u2014) in documentation, code comments, commit messages, or UI copy.

---

## Data Files & Sizes
| File | Size | Notes |
|---|---|---|
| `data/all_clubs.json` | ~2.8 MB | Master club roster; O(1) clubMap via `getClubMap()` |
| `data/rotary_no_interact.json` | ~740 KB | Rotary clubs without Interact |
| `data/arrears.json` | ~715 KB | Clubs in arrears (current period) |
| `data/no_officers.json` | ~649 KB | Clubs missing officer reporting |
| `data/rotary_no_sponsor.json` | ~616 KB | Rotary clubs without sponsored Rotaract |
| `data/unified_issues.json` | ~524 KB | Cross-join of arrears + no officers |
| `data/worldwide_summary.json` | ~402 KB | Global stats for `/worldwide` |
| `data/dashboard_summary.json` | ~119 KB | Pre-aggregated KPIs by zone/district (current + baseline) |
| `data/zone_summary.json` | ~105 KB | Per-district row data for District Summary table |
| `data/new_clubs.json` | ~29 KB | New chartered clubs |
| `data/trf_contributions.json` | ~18 KB | TRF contribution details per club |
| `data/district_officers.json` | ~6.9 KB | DG/DRR/DRC roster per district |

---

## Component Inventory

### Server Components (`app/`)
- `app/layout.js`: Root layout with sticky header, glassmorphism badge, `HeaderFilters` in `<Suspense>`, GA Scripts, `JsonLd`, `Footer`.
- `app/loading.js`: App Router skeleton screen (metrics, charts, table placeholders).
- `app/page.js`: Executive Dashboard: reads 8 JSON files, computes filtered KPIs, renders charts and `GlobalTables`.
- `app/zone/[zoneId]/page.js`: Zone Drilldown: same data stack as `page.js`, locked to one zone.
- `app/district/[districtId]/page.js`: District Deep Dive: `DistrictTable` (clubs w/ issues), `ClubLeaderboardsSection`, `GlobalTables`, 3 bar charts.
- `app/club/[clubId]/page.js`: Club Report: single O(1) lookup, compliance action center, TRF breakdown, Interact sponsored clubs table.
- `app/worldwide/page.js`: Worldwide stats page.

### Client UI Primitives (`components/ui/`)
- `HeaderFilters.js`: Multi-select for zone/district via `react-select`; on change pushes URL params, triggering server re-render.
- `Tabs.js`: Tab switcher supporting lazy render via `content()` function pattern.
- `MetricCard.js`: KPI card with `framer-motion` entrance and hover lift animation.
- `Footer.js`: Static footer with data source, last updated, and asterisk disclaimer.
- `Leaderboard.js`: Static leaderboard list renderer.
- `Analytics.js`: Client GA tracker via `usePathname` / `useSearchParams`.
- `NavigationProgress.js`: Top loading indicator bar for page navigations.
- `BackToTop.js`: Floating back-to-top button for long drilldowns.

### Tables (`components/tables/`)
- `DataTable.js`: TanStack Table with 250ms debounced search, sort, pagination (15/25/50/100), CSV export via Blob URL.
- `GlobalTables.js`: 8-tab deep drilldown (District Summary, Arrears, Missing Officers, Rotary w/o Rotaract, Rotary w/o Interact, New Clubs, TRF Contributions, All Clubs Roster). Each tab uses a lazy `content()` function.
- `DistrictTable.js`: Simplified club issues table at district level.

### Charts & Leaderboards
- `TopChartsSection.js`: Server component computing top-10 leaderboards (TRF, Members, Arrears, Districts).
- `ClubLeaderboardsSection.js`: Server component rendering club-level leaderboards for district pages.
- `DoughnutChart.js`: Chart.js doughnut wrapper.
- `BarChart.js`: Chart.js bar wrapper.
- `JsonLd.js`: SEO schema renderer for Organization, WebSite, Dataset, and Breadcrumb schemas.

---

## Specialized On-Demand Skills
For detailed workflows and domain specifications:
- **`data-pipeline`** ([.agents/skills/data-pipeline/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/data-pipeline/SKILL.md)): Master Excel sheet mapping, baseline deltas (`1july.csv`, `1julyCountries.csv`), currency parsing, and data update commands.
- **`ui-standards`** ([.agents/skills/ui-standards/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/ui-standards/SKILL.md)): Exact column names, `"🏛️ University Based"` / `"👥 Community Based"` badges, link copy (`Explore →`, `View Report →`), official compliance text, and Sponsor Clubs column standards.
- **`performance-optimization`** ([.agents/skills/performance-optimization/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/performance-optimization/SKILL.md)): Lazy tab rendering (`() => <DataTable />`), payload pruning patterns, and GA route tracking.
- **`agent-maintenance`** ([.agents/skills/agent-maintenance/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/agent-maintenance/SKILL.md)): Harness validation, drift detection, link verification, and no-em-dash enforcement.
