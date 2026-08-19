# Project Context: Rotaract South Asia Analytics Dashboard

## Tech Stack & Architecture
- **Framework:** Next.js (App Router) with React 19 server-side and client-side components.
- **Charts:** Chart.js and `react-chartjs-2` for rich visual analytics. Doughnut and Bar charts for categorical breakdowns; Line/Bar charts for top-chart leaderboards.
- **Data Tables:** TanStack Table (`@tanstack/react-table`) with client-side sorting, pagination, and multi-field search.
- **Styling:** Modern Vanilla CSS (`app/globals.css`) with CSS custom properties, glassmorphism, responsive grid layouts, and mobile-first media queries.
- **Analytics:** Google Analytics (`gtag.js` ID: `G-M9RZK0CBT5`) configured in `app/layout.js`.

---

## Route Structure
- `/` – Executive Dashboard (Multi-select zone/district filters, KPI metrics grid, charts, top leaderboards, worldwide statistics banner, zones directory, and deep data drilldown).
- `/zone/[zoneId]` – Zone Drilldown (KPI grid, district summary tables, demographic charts, and zone-specific drilldown).
- `/district/[districtId]` – District Deep Dive (District summary, club leaderboards, clubs with issues, and district drilldown tables).
- `/club/[clubId]` – Universal Club Report (Covers all 2,820+ clubs across South Asia with 4-card KPI metric grid, Club Information & Sponsorship card, TRF contributions table, and Compliance Action Center).
- `/worldwide` – Worldwide Rotaract Statistics (Global leaderboards, top districts/zones, and growth statistics).
- `/api/filters` – Server endpoint providing dynamic filter options.

---

## Data Pipeline & Modeling Rules
- **Static Generation & Caching:** The data engine (`scripts/generate_dashboard_data.js`) parses raw Excel workbooks (`fulldata/MasterData.xlsx` and `basedata/`) and exports pre-aggregated JSON/CSV payloads into `data/`.
- **District-First Structural Fidelity:** Districts serve as the immutable primary key. Zones are dynamically mapped from the master district list (`districtToZone[dist]`). Never hardcode static zone arrays to ensure resilience against future Rotary zone restructuring.
- **Raw Club-Level Prioritization:** Never rely on flawed historical summary sheets for critical compliance metrics (arrears, dues, missing officers). The pipeline natively aggregates raw club-level sheets (`All Rotaract Clubs`, `Rotaract clubs in arrears`, `No Rotaract club officers`, `ClubsTRFContribution`, `New Rotaract Clubs`) to guarantee data purity.
- **API Cache Invalidation:** `lib/api.js` tracks file `mtimeMs` to automatically detect and hot-reload updated JSON data files on disk without requiring server restarts.
- **Strict Type Checking:** Ensure all numeric values (members, amounts, counts) are explicitly cast (`Number()`, `parseInt()`, `parseFloat()`) and string accessors apply fallback handling to prevent sorting crashes.

---

## Terminology & UI Standards
- **Club Base Types:**
  - Table column header: `"Club Base"` across all summary and drilldown tables.
  - Club profile page: `"Rotaract Club Base"` with labels `"🏛️ University Based"` and `"👥 Community Based"`.
- **District Summary Metrics:**
  - Column names: `"Clubs"`, `"Members"`, `"Avg. Members/Club"`, `"Rotary Clubs"`, `"Rotary w/o Rotaract"`, `"Interact Clubs"`, `"Rotary w/o Interact"`, `"Outstanding USD"`, `"Arrears Clubs"`, `"No Officers"`, `"Total TRF"`, `"Action"`.
  - `"Avg. Members/Club"` must be formatted to 2 decimal places (e.g. `15.65`, `50.82`).
- **Interact & Youth Service Standards:**
  - Dedicated drilldown tabs: `"Rotary w/o Rotaract"` (`data/rotary_no_sponsor.json` / `data/rotary_no_sponsor.csv`) and `"Rotary w/o Interact"` (`data/rotary_no_interact.json` / `data/rotary_no_interact.csv`).
  - Worldwide statistics: Include `"Total Interact Clubs"` KPI metric and global leaderboards for Interact clubs and growth.
  - Executive, Zone & District pages: Include `"Interact Ecosystem"` 4-card metric grid.
- **Sponsorship Terminology:**
  - Use `"Sponsor Clubs"` (or `"Sponsor Club(s)"`) to accurately reflect Rotaract, Rotary, and joint sponsorships.
- **Action Links & Navigation:**
  - Use `"Explore →"` for Zone, District, and Worldwide navigation links.
  - Use `"View Report →"` for individual club profile links (`/club/[clubId]`).
- **Compliance Text Standards:**
  - Good Standing: *"Club officer reporting is up to date and there are zero outstanding dues recorded for this club."*
  - Missing Officers: *"Current Club officers have not been reported on MyRotary. The Club President, with the help of the District Rotaract Representative (DRR) or the Sponsor Club(s), must update officer details on MyRotary immediately to maintain active communication with RI."*

---

## Design Aesthetics & Mobile Responsiveness
- **Color Palette:** Professional BI dashboard theme: Primary Blue (`#0f4c81`), Green (`#1e8e3e`), Red (`#d93025`), Warning Amber (`#b06000`).
- **Mobile First:** Mobile layouts must collapse multi-column grids to a single column (`1fr`) under `@media (max-width: 768px)`.
- **Glassmorphism & Micro-animations:** Use subtle shadows, rounded borders (`10px`–`12px`), frosted-glass pill buttons (`backdrop-filter: blur(8px)`), and smooth hover interactions.
