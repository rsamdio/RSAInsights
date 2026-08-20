# Project Context: Rotaract South Asia Analytics Dashboard

## Core Tech Stack & Invariants
- **Framework:** Next.js (App Router) with React 19 server-side and client-side components.
- **Charts:** Chart.js and `react-chartjs-2` for visual analytics.
- **Tables:** TanStack Table (`@tanstack/react-table`) with client-side sorting and pagination.
- **Styling:** Vanilla CSS (`app/globals.css`) with glassmorphism, responsive grids, and mobile-first styles.
- **Analytics:** Google Analytics (`gtag.js` ID: `G-M9RZK0CBT5`) with `strategy="afterInteractive"` and real-time App Router route tracking via `components/ui/Analytics.js`.
- **Typography:** Self-hosted `next/font/google` (`Inter`) with `font-display: swap`.

---

## Route Structure
- `/` – Executive Dashboard (Multi-select filters, KPIs, charts, leaderboards, zones directory, and data drilldowns).
- `/zone/[zoneId]` – Zone Drilldown (KPI grid, district summary tables, demographic charts).
- `/district/[districtId]` – District Deep Dive (District summary, club leaderboards, compliance issues, and drilldowns).
- `/club/[clubId]` – Universal Club Report (2,820+ clubs with KPI grid, Club Information & Sponsorship card, TRF table, and Compliance Action Center).
- `/worldwide` – Worldwide Rotaract & Interact Statistics (Global leaderboards and growth statistics).
- `/api/filters` – Server endpoint providing dynamic filter options.

---

## Key Architectural Invariants
- **District as Primary Key:** Districts serve as the immutable primary key. Zones are dynamically mapped from the master district list (`districtToZone[dist]`).
- **Raw Sheet Prioritization:** Aggregate raw club-level sheets (`All Rotaract Clubs`, `Rotaract clubs in arrears`, `No Rotaract club officers`, `ClubsTRFContribution`, `New Rotaract Clubs`) rather than summary sheets.
- **Async Route Params:** Next.js 15+ `params` and `searchParams` are Promises (`const { zoneId } = await params;`).
- **$O(1)$ Hash Map Lookups:** Use `getClubMap()` in `lib/api.js` for instant club lookups.
- **Payload Trimming:** Trim server-to-client table props to keep initial HTML/Flight payloads under 600 KB.
- **Data Freshness Indicators:** Global Header displays `● Data as of: [Date]` and Footer displays `Data Source: Rotary International • Last Updated: [Date]`.

---

## Specialized On-Demand Skills
For detailed workflows, runbooks, and deep specifications, activate the following skills on demand:
- **`data-pipeline`** (`.agents/skills/data-pipeline/SKILL.md`): Master Excel sheet mapping, baseline deltas (`1july.csv`, `1julyCountries.csv`), currency parsing, and data update commands.
- **`ui-standards`** (`.agents/skills/ui-standards/SKILL.md`): Exact column names, `"🏛️ University Based"` / `"👥 Community Based"` badges, link copy (`Explore →`, `View Report →`), and official compliance text.
- **`performance-optimization`** (`.agents/skills/performance-optimization/SKILL.md`): Lazy tab rendering (`() => <DataTable />`), payload pruning patterns, and GA route tracking.
