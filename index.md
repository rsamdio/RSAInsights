# Repository Index: Rotaract South Asia Analytics Dashboard

This index is the primary navigation layer for AI coding agents. It provides a direct, machine-optimized map of the repository's architecture, module authority, data pipelines, routes, invariants, and workflows.

---

## 1. System Overview & Tech Stack

| Component | Technology | Source of Truth / Configuration |
|---|---|---|
| Framework | Next.js 16.3.0 (App Router) | [package.json](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/package.json), [next.config.mjs](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/next.config.mjs) |
| UI Library | React 19.2.8 | [package.json](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/package.json) |
| Styling | 100% Vanilla CSS (No Tailwind) | [app/globals.css](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/app/globals.css) |
| Charts | Chart.js 4.5.1 + react-chartjs-2 5.3.1 | [components/charts/](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/components/charts) |
| Data Tables | TanStack Table 8.21.3 | [components/tables/](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/components/tables) |
| Animations | framer-motion 12.43.0 | [components/ui/MetricCard.js](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/components/ui/MetricCard.js) |
| Typography | Google Font: Inter (self-hosted) | [app/layout.js](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/app/layout.js) |
| Analytics | Google Analytics (gtag.js: G-M9RZK0CBT5) | [components/ui/Analytics.js](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/components/ui/Analytics.js) |
| ETL & Parser | SheetJS (xlsx 0.18.5) | [scripts/generate_dashboard_data.js](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/scripts/generate_dashboard_data.js) |

---

## 2. Directory & Module Authority Map

| Directory / File | Authority & Responsibility | Primary Read Before Modifying |
|---|---|---|
| `app/layout.js` | Root layout, metadata templates, JSON-LD schemas, GA scripts, header & footer | UI / SEO tasks |
| `app/page.js` | Executive Dashboard: multi-select filters, KPIs, demographic charts, leaderboards, global tables | Root UI / Filter tasks |
| `app/zone/[zoneId]/page.js` | Granular Zone Drilldown: zone KPIs, district comparisons, demographic charts | Zone-level tasks |
| `app/district/[districtId]/page.js` | District Deep Dive: district summary, club issues, officer roster, leaderboards | District-level tasks |
| `app/club/[clubId]/page.js` | Universal Club Report: 2,820+ club profiles, TRF details, compliance action center | Club-level tasks |
| `app/worldwide/page.js` | Worldwide Statistics: global club/member leaderboards, country rankings, baseline deltas | Global / Country stats |
| `app/api/filters/route.js` | Server route providing dynamic filter options (cached 1d, stale 7d) | Filter backend tasks |
| `app/globals.css` | Global styles, CSS variables, glassmorphism card classes, mobile breakpoints | Styling / Theme tasks |
| `lib/api.js` | Data Access Layer: file reader with mtime cache (`global.apiCache`), O(1) `getClubMap()` | Data querying / Helpers |
| `scripts/generate_dashboard_data.js` | Master ETL pipeline: parses Excel/CSV files, computes rollups & deltas, writes JSON/CSV to `data/` | ETL / Master data tasks |
| `scripts/validate_harness.js` | Agent harness validator: checks file references, data files, forbidden em dashes | Harness maintenance |
| `fulldata/` | Raw active master Excel workbooks (`MasterData.xlsx`) | Raw master data inputs |
| `basedata/` | Historical baseline CSVs (`1july.csv`, `1julyCountries.csv`, `Zone45678 - 9July2026.xlsx`) | Baseline references |
| `data/` | Pre-aggregated JSON and CSV files consumed by `lib/api.js` | Generated data artifacts |
| `components/tables/` | TanStack DataTables (`DataTable.js`, `GlobalTables.js`, `DistrictTable.js`) | Table UI & CSV export |
| `components/charts/` | Chart.js wrappers (`BarChart.js`, `DoughnutChart.js`) | Chart visualizations |
| `components/sections/` | Server leaderboard sections (`TopChartsSection.js`, `ClubLeaderboardsSection.js`) | Leaderboard logic |
| `components/ui/` | UI primitives (`HeaderFilters.js`, `MetricCard.js`, `Tabs.js`, `Footer.js`, `Analytics.js`) | Reusable UI controls |
| `components/seo/` | JSON-LD schema builder (`JsonLd.js`) | Structured data / SEO |

---

## 3. Data Pipeline & Flow

```
[fulldata/MasterData.xlsx] + [basedata/1july.csv, 1julyCountries.csv]
                         │
                         ▼
        [scripts/generate_dashboard_data.js]
        - Filters to Zones 4, 5, 6, 7
        - Converts dues to INR rounded to nearest integer
        - Aggregates raw club records (arrears, officers, TRF)
        - Computes baseline deltas & rollups
                         │
                         ▼
                     [data/]
        - dashboard_summary.json  - all_clubs.json (2,820+ clubs)
        - zone_summary.json       - arrears.json & no_officers.json
        - worldwide_summary.json  - trf_contributions.json
        - unified_issues.json     - rotary_no_sponsor.json & rotary_no_interact.json
        - district_officers.json  - new_clubs.json (+ CSV equivalents)
                         │
                         ▼
                    [lib/api.js]
        - Reads files into mtime-cached `global.apiCache`
        - O(1) hash map lookups via `getClubMap()`
                         │
                         ▼
      [Next.js App Router Server Components & API]
```

---

## 4. Key Development & Verification Commands

```bash
# Run local development server (http://localhost:3000)
npm run dev

# Run master data generation / ETL pipeline
npm run generate-data

# Run full harness verification (file links, data integrity, no-em-dash check)
npm run validate-harness

# Build for production
npm run build

# Start production server
npm run start
```

---

## 5. Authority & Precedence Hierarchy

When information sources conflict, agents must follow this strict precedence:

1. **Current Source Code & Configuration** (Executable implementation)
2. **Executable Behavior & Automated Verification** (`npm run validate-harness`, `npm run build`)
3. **Explicit Repository Invariants & Rules** (Documented in `AGENTS.md` and `index.md`)
4. **Generated Data Payloads** (`data/*.json`, `data/*.csv`)
5. **Domain Skills & Architecture Guides** (`.agents/skills/`)
6. **General Documentation** (`README.md`, comments)
7. **Agent Assumptions** (Lowest priority: must verify against code)

---

## 6. Critical Project Invariants & Guardrails

1. **District as Primary Key:** Districts serve as the immutable primary key. Zones are dynamically mapped from district mappings (`districtToZone[dist]`). Never hardcode static zone-district associations.
2. **Raw Sheet Prioritization:** Critical compliance metrics (arrears, dues, missing officers) are aggregated from raw club-level sheets (`All Rotaract Clubs`, `Rotaract clubs in arrears`, `No Rotaract club officers`), never from summary sheets.
3. **South Asia Geographic Scope:** Only RI Zones 4, 5, 6, and 7 are included. Non-South Asian districts (e.g. 9510, 9560, 9620, 9675) are strictly excluded in `generate_dashboard_data.js`.
4. **Currency Calculation & Rounding:**
   - Dues converted from USD to INR at `CURRENT_EXCHANGE_RATE` (default: 96 INR/USD) and rounded to the nearest integer at the club level (`Math.round(amtUSD * RATE)`).
   - TRF Foundation contributions are tracked globally in USD ($).
   - Dues metric cards must carry an asterisk (`Outstanding Dues*`) with the footnote disclaimer in `Footer.js`.
5. **Styling & CSS Invariants:** Pure Vanilla CSS in `app/globals.css`. Never introduce Tailwind CSS. Glassmorphism cards, CSS variables, mobile-first responsive styles (`@media (max-width: 768px)`).
6. **Async Route Params:** In Next.js App Router, `params` and `searchParams` are Promises (`const { zoneId } = await params;`).
7. **O(1) Hash Map Lookups:** Use `getClubMap()` in `lib/api.js` for instant club lookups on `/club/[clubId]`. Never scan `all_clubs.json` linearly for single club queries.
8. **Lazy Tab Mounting:** `GlobalTables.js` uses render functions `() => <DataTable />` so only the active tab mounts TanStack table state in the DOM.
9. **Strict No-Em-Dash Rule:** Never use long em dashes (Unicode \u2014) anywhere in agent-generated content, documentation, comments, commit messages, or UI copy. Use hyphens (`-`), colons (`:`), commas (`,`), or parentheses.

---

## 7. Domain Skills & Workflows Directory

Load domain-specific skills only when working on related tasks:

| Skill | Path | When to Load |
|---|---|---|
| `data-pipeline` | [.agents/skills/data-pipeline/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/data-pipeline/SKILL.md) | Updating master data, adjusting exchange rates, parsing Excel sheets, debugging aggregation |
| `ui-standards` | [.agents/skills/ui-standards/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/ui-standards/SKILL.md) | Editing UI components, tables, charts, badges, compliance copy, metadata templates |
| `performance-optimization` | [.agents/skills/performance-optimization/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/performance-optimization/SKILL.md) | Table payload trimming, lazy tab rendering, font optimization, GA route tracking |
| `agent-maintenance` | [.agents/skills/agent-maintenance/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/agent-maintenance/SKILL.md) | Validating harness integrity, checking documentation freshness, detecting drift, updating index |

---

## 8. Agent Task Checklist

Before completing any task in this repository, verify:
- [ ] Code follows all project invariants listed above.
- [ ] No long em dashes (Unicode \u2014) exist in any modified or created files.
- [ ] `npm run validate-harness` passes with 0 errors.
- [ ] `npm run build` compiles cleanly without Next.js warnings or type errors.
