---
name: data-pipeline
description: >-
  Use this skill when importing raw master Excel files, updating master data, configuring baselines, setting DATA_AS_OF_DATE, running the data generator script, or debugging data aggregation.
---

# Data Pipeline & ETL Workflow

This skill guides the data ingestion, aggregation, and export pipeline for the Rotaract South Asia Analytics Dashboard.

## Data Sources & File Mapping

1. **Active Master Data:** `fulldata/MasterData.xlsx`
   - Sheets parsed: `Zone45678`, `All Rotaract Clubs`, `All Interact Clubs`, `Rotary Club Details`, `Rotaract by Country`, `Rotaract by District`, `Interact by District`, `Rotaract by Zone`, `No Rotaract club officers`, `Arrears`, `NewClubs`, `ClubsTRFContribution`, `District Officers_Simplified`, `District Officers`, `ZoneStructure`, `ZoneStructure_Future`.
2. **Historical Baseline Files:**
   - `basedata/1july.csv`: District-level Interact baseline for calculating growth.
   - `basedata/1julyCountries.csv`: Country-level Rotaract & Interact baseline (`Country,Clubs,Members,InteractClubs`).
   - `basedata/Zone45678 - 9July2026.xlsx`: Zone 4–7 baseline for deltas.
3. **Generated Data Payloads (`data/`):**
   - `data/dashboard_summary.json` & `data/worldwide_summary.json`: Top-level pre-aggregated metrics.
   - `data/all_clubs.json`: Master roster for all 2,820+ South Asian clubs.
   - `data/rotary_no_sponsor.json` & `data/rotary_no_interact.json`: Rotary clubs without Rotaract / Interact sponsorship.
   - `data/arrears.json` & `data/no_officers.json`: Compliance records.
   - `data/trf_contributions.json` & `data/new_clubs.json`: TRF and new club records.

## Data Pipeline Rules & Gotchas

- **District-First Structural Fidelity:** Districts serve as the immutable primary key. Zones are dynamically mapped from the master district list (`districtToZone[dist]`). Never hardcode static zone arrays.
- **Raw Club-Level Aggregation:** Never rely on summary sheets for critical compliance metrics (arrears, dues, missing officers). The pipeline aggregates raw club-level sheets (`All Rotaract Clubs`, `Rotaract clubs in arrears`, `No Rotaract club officers`, `ClubsTRFContribution`, `New Rotaract Clubs`) to guarantee data purity.
- **Currency Conversion & Integer Rounding:**
  - Exchange rates are configured in `scripts/generate_dashboard_data.js` via `CURRENT_EXCHANGE_RATE` (e.g. `96` INR/USD for current data) and `BASELINE_EXCHANGE_RATE` (`95` INR/USD for July 1st baseline).
  - All club dues and rollups (district, zone, overall) must be converted to whole-number INR using `Math.round(amtUSD * RATE)`. No decimals are stored for INR dues.
  - TRF Foundation contributions remain tracked globally in USD (`$`).
- **Currency & String Formatting:** Clean currency strings with regex `parseFloat(val.toString().replace(/[^0-9.-]+/g, "")) || 0` to handle whitespace/newlines (e.g. `' USD Outstanding '`, `'Annual Fund\nYTD'`).
- **Interact Sponsor Matching:** Master data does not contain numeric IDs for sponsor clubs in `All Interact Clubs`. Do not attempt name-based matching on individual club profile pages (`/club/[clubId]`).

## How to Update Master Data

1. Place the new master Excel file in `fulldata/MasterData.xlsx`.
2. Update the `DATA_AS_OF_DATE` and `CURRENT_EXCHANGE_RATE` constants at the top of `scripts/generate_dashboard_data.js` (e.g., `'13 Aug 2026'`, `96`).
3. Run the generator script:
   ```bash
   npm run generate-data
   ```
4. Verify generated JSON files in `data/` and run `npm run build` to confirm compilation.
