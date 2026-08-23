# Project Context: Rotaract South Asia Analytics Dashboard

## Core Tech Stack & Invariants
- **Framework:** Next.js 16 (App Router) with React 19 server-side and client-side components.
- **Charts:** Chart.js and `react-chartjs-2` for visual analytics.
- **Tables:** TanStack Table (`@tanstack/react-table`) with client-side sorting and pagination.
- **Styling:** Vanilla CSS (`app/globals.css`) with glassmorphism, responsive grids, and mobile-first styles. No TailwindCSS.
- **Animations:** `framer-motion` used in `MetricCard.js` for card entrance and hover lift animations.
- **Analytics:** Google Analytics (`gtag.js` ID: `G-M9RZK0CBT5`) with `strategy="afterInteractive"` and real-time App Router route tracking via `components/ui/Analytics.js`.
- **Typography:** Self-hosted `next/font/google` (`Inter`) with `font-display: swap`.
- **Filter Dropdowns:** `react-select` multi-select in `components/ui/HeaderFilters.js`.

---

## Route Structure
- `/` – Executive Dashboard (Multi-select filters, KPIs, charts, leaderboards, zones directory, and data drilldowns).
- `/zone/[zoneId]` – Zone Drilldown (KPI grid, district summary tables, demographic charts).
- `/district/[districtId]` – District Deep Dive (District summary, club leaderboards, compliance issues, and drilldowns).
- `/club/[clubId]` – Universal Club Report (2,820+ clubs with KPI grid, Club Information & Sponsorship card, TRF table, and Compliance Action Center).
- `/worldwide` – Worldwide Rotaract & Interact Statistics (Global leaderboards and growth statistics).
- `/api/filters` – Server endpoint providing dynamic filter options (cached 5 min, stale-while-revalidate 1 hr).

---

## Key Architectural Invariants
- **District as Primary Key:** Districts serve as the immutable primary key. Zones are dynamically mapped from the master district list (`districtToZone[dist]`).
- **Raw Sheet Prioritization:** Aggregate raw club-level sheets (`All Rotaract Clubs`, `Rotaract clubs in arrears`, `No Rotaract club officers`, `ClubsTRFContribution`, `New Rotaract Clubs`) rather than summary sheets.
- **Async Route Params:** Next.js 15+ `params` and `searchParams` are Promises (`const { zoneId } = await params;`).
- **O(1) Hash Map Lookups:** Use `getClubMap()` in `lib/api.js` for instant club lookups instead of array scanning.
- **File-based Cache:** `readJsonFile()` in `lib/api.js` caches parsed JSON by mtime in `global.apiCache` (survives across renders in Node).
- **Payload Trimming:** Trim server-to-client table props to keep initial HTML/Flight payloads under 600 KB.
- **Lazy Tab Rendering:** Tab `content` fields in `GlobalTables.js` are functions `() => <DataTable />` so only the active tab mounts.
- **Data Freshness Indicators:** Global Header displays `● Data as of: [Date]` and Footer displays `Data Source: Rotary International • Last Updated: [Date]`.
- **App-level Skeleton:** `app/loading.js` renders skeleton cards while server page loads (metrics grid + charts + table placeholders).

---

## Data Files & Sizes (as of Aug 2026)
| File | Size | Notes |
|---|---|---|
| `data/all_clubs.json` | 2.8 MB | Master club roster; O(1) clubMap via `getClubMap()` |
| `data/rotary_no_interact.json` | 740 KB | Rotary clubs without Interact |
| `data/arrears.json` | 715 KB | Clubs in arrears (current period) |
| `data/no_officers.json` | 649 KB | Clubs missing officer reporting |
| `data/rotary_no_sponsor.json` | 616 KB | Rotary clubs without sponsored Rotaract |
| `data/unified_issues.json` | 524 KB | Cross-join of arrears + no officers |
| `data/worldwide_summary.json` | 402 KB | Global stats for `/worldwide` |
| `data/dashboard_summary.json` | 119 KB | Pre-aggregated KPIs by zone/district (current + baseline) |
| `data/zone_summary.json` | 105 KB | Per-district row data for District Summary table |
| `data/new_clubs.json` | 29 KB | New chartered clubs |
| `data/trf_contributions.json` | 18 KB | TRF contribution details per club |
| `data/district_officers.json` | 6.9 KB | DG/DRR/DRC roster per district |

---

## Component Inventory
### `app/` (Server Components)
- `layout.js` — Root layout: sticky header w/ glassmorphism, `HeaderFilters` in `<Suspense>`, GA Scripts, `JsonLd`, Footer.
- `loading.js` — App Router skeleton screen (metrics, charts, table placeholders).
- `page.js` — Executive Dashboard: reads 8 JSON files, computes filtered KPIs, renders charts and `GlobalTables`.
- `zone/[zoneId]/page.js` — Zone Drilldown: same data stack as `page.js`, locked to one zone.
- `district/[districtId]/page.js` — District Deep Dive: `DistrictTable` (clubs w/ issues), `ClubLeaderboardsSection`, `GlobalTables`, 3 bar charts.
- `club/[clubId]/page.js` — Club Report: single O(1) lookup, compliance action center, TRF breakdown, Interact sponsored clubs table.
- `worldwide/page.js` — Worldwide stats page.

### `components/ui/`
- `HeaderFilters.js` — Client component: `react-select` multi-select for zone/district; on change pushes URL params, causing full server re-render.
- `Tabs.js` — Client component: tab switcher with lazy render via `content()` function pattern.
- `MetricCard.js` — Client component: `framer-motion` entrance + hover lift animation.
- `Footer.js` — Static footer with data source, last updated, and asterisk disclaimer.
- `Leaderboard.js` — Static leaderboard list renderer.
- `Analytics.js` — Client GA tracker via `usePathname`/`useSearchParams`.

### `components/tables/`
- `DataTable.js` — Client: TanStack Table, 250ms debounced search, sort, paginate (15/page), CSV export via Blob URL.
- `GlobalTables.js` — Client: 8-tab deep drilldown (District Summary, Arrears, Missing Officers, Rotary w/o Rotaract, Rotary w/o Interact, New Clubs, TRF Contributions, All Clubs Roster). Each tab is a lazy `content()` function.
- `DistrictTable.js` — Client: Simplified club issues table at district level.

### `components/sections/`
- `TopChartsSection.js` — Server: computes top-10 leaderboards (TRF, Members, Arrears, Districts).
- `ClubLeaderboardsSection.js` — Server: club-level leaderboards for district pages.

### `components/charts/`
- `DoughnutChart.js` — Chart.js doughnut wrapper.
- `BarChart.js` — Chart.js bar wrapper.

---

## Implemented Features (Completed)
- **INR Currency Conversion:** `CURRENT_EXCHANGE_RATE = 96`, `BASELINE_EXCHANGE_RATE = 95`. All dues rounded to whole integer at club level. Configurable from top of `scripts/generate_dashboard_data.js`.
- **Asterisk Disclaimer:** `"Outstanding Dues*"` MetricCard labels and `"Outstanding (₹)*"` table headers site-wide. Footnote in `Footer.js`.
- **District-level Arrears Rollup:** All outstanding dues aggregated at district → zone → global level from raw club rows.
- **South Asia Scope Filtering:** Only zones 4, 5, 6, 7 districts included. Non-South Asian districts (9510, 9560, 9620, 9675) are strictly excluded in `generate_dashboard_data.js`.
- **Sponsor Clubs Column:** Added to all individual club drilldown tables (Arrears, Missing Officers, New Clubs, TRF, All Clubs Roster, DistrictTable) and CSV exports.
- **Meta/OG Titles:** Standardized across all pages: `{Page} | Insights | Rotaract South Asia MDIO`.
- **SEO:** JSON-LD schemas (Organization, Website, Dataset, WebPage, NGO, BreadcrumbList) on all pages.
- **App Loading Skeleton:** `app/loading.js` with `skeleton-pulse` CSS animation.
- **GA Route Tracking:** `Analytics.js` fires on every client-side navigation including filter changes.

---

## Specialized On-Demand Skills
For detailed workflows, runbooks, and deep specifications, activate the following skills on demand:
- **`data-pipeline`** (`.agents/skills/data-pipeline/SKILL.md`): Master Excel sheet mapping, baseline deltas (`1july.csv`, `1julyCountries.csv`), currency parsing, and data update commands.
- **`ui-standards`** (`.agents/skills/ui-standards/SKILL.md`): Exact column names, `"🏛️ University Based"` / `"👥 Community Based"` badges, link copy (`Explore →`, `View Report →`), official compliance text, and Sponsor Clubs column standards.
- **`performance-optimization`** (`.agents/skills/performance-optimization/SKILL.md`): Lazy tab rendering (`() => <DataTable />`), payload pruning patterns, and GA route tracking.
