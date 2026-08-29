---
name: ui-standards
description: >-
  Use this skill when building or editing UI components, tables, charts, navigation links, badges, or compliance text in the Rotaract South Asia Analytics Dashboard.
---

# UI, Table & Terminology Standards

This skill defines the design, terminology, and component patterns for the Rotaract South Asia Analytics Dashboard.

## Terminology & Column Standards

- **Club Base Types:**
  - Table column header: `"Club Base"` across all summary and drilldown tables.
  - Club profile page: `"Rotaract Club Base"` with labels `"🏛️ University Based"` and `"👥 Community Based"`.
- **District Summary Table Columns:**
  - Column headers: `"Clubs"`, `"Members"`, `"Avg. Members/Club"`, `"Rotary Clubs"`, `"Rotary w/o Rotaract"`, `"Interact Clubs"`, `"Rotary w/o Interact"`, `"Outstanding (₹)*"`, `"Arrears Clubs"`, `"No Officers"`, `"Total TRF"`, `"Action"`.
  - `"Avg. Members/Club"` must be formatted to 2 decimal places (e.g. `15.65`, `50.82`).
  - `"Outstanding (₹)*"` and MetricCard `"Outstanding Dues*"` must carry an asterisk (`*`) to denote whole-number integer conversion and rounding at the club level, annotated with the footer disclaimer.
- **Club Drilldown & Roster Table Columns:**
  - Drilldown tables listing individual Rotaract clubs (`DistrictTable`, `Clubs in Arrears`, `Missing Officers`, `New Clubs`, `TRF Contributions`, `All Clubs Roster`) must include a `"Sponsor Clubs"` column displaying the sponsoring Rotary or Rotaract club names and exporting cleanly to CSV.
- **Sponsorship & Youth Service:**
  - Dedicated drilldown tabs: `"Rotary w/o Rotaract"` and `"Rotary w/o Interact"`.
  - Terminology: Always use `"Sponsor Clubs"` (or `"Sponsor Club(s)"`) to reflect Rotaract, Rotary, and joint sponsorships.
  - Worldwide statistics: `"Total Interact Clubs"` KPI metric and global leaderboards.
  - Executive, Zone & District pages: `"Interact Ecosystem"` 4-card metric grid.
- **Action Links & Navigation:**
  - Use `"Explore →"` for Zone, District, and Worldwide navigation links.
  - Use `"View Report →"` for individual club profile links (`/club/[clubId]`).

## Compliance Text Standards

- **Good Standing:**
  > *"Club officer reporting is up to date and there are zero outstanding dues recorded for this club."*
- **Missing Officers:**
  > *"Current Club officers have not been reported on MyRotary. The Club President, with the help of the District Rotaract Representative (DRR) or the Sponsor Club(s), must update officer details on MyRotary immediately to maintain active communication with RI."*

## Data Freshness Indicators

- **Global Header Badge:** `● Data as of: [Date]` frosted pill badge beside the logo/title in `app/layout.js`.
- **Global Footer Notice:** `Data Source: Rotary International • Last Updated: [Date]` in `components/ui/Footer.js`.

## Metadata & OpenGraph Title Standards

- **Title Template:** `%s | Insights | Rotaract South Asia MDIO` (defined in `app/layout.js`).
- **Home Page (`/`):** `Insights | Rotaract South Asia MDIO`
- **Zone Drilldown (`/zone/[zoneId]`):** `Zone {{Number}} | Insights | Rotaract South Asia MDIO` (e.g. `Zone 4 | Insights | Rotaract South Asia MDIO`)
- **District Drilldown (`/district/[districtId]`):** `District {{Number}} | Insights | Rotaract South Asia MDIO` (e.g. `District 3011 | Insights | Rotaract South Asia MDIO`)
- **Club Drilldown (`/club/[clubId]`):** `Rotaract Club of {{Club Name}} ({{Club ID}}) | Insights | Rotaract South Asia MDIO`
- **Worldwide Statistics (`/worldwide`):** `Worldwide Statistics | Insights | Rotaract South Asia MDIO`

## Styling & Theme

- **Palette:** Primary Blue (`#0f4c81`), Green (`#1e8e3e`), Red (`#d93025`), Warning Amber (`#b06000`), Background (`#f8fafc`).
- **Mobile First:** Multi-column grids must collapse to a single column (`1fr`) under `@media (max-width: 768px)`.
- **Glassmorphism:** Rounded borders (`10px` to `12px`), subtle box shadows, and frosted badges (`backdrop-filter: blur(8px)`).
- **Typography Rule:** Never use long em dashes (Unicode \u2014). Use colons, hyphens, commas, or parentheses.
