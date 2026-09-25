# OpenAI Platform Submission Readiness & Verification Package

This document certifies the submission readiness of the **Rotaract South Asia Analytics** Model Context Protocol (MCP) server and REST API for the OpenAI App Directory and AI platform integrations.

---

## 1. Application & Plugin Profile
- **Plugin Name:** Rotaract South Asia Analytics
- **Short Description:** Real-time analytics, compliance tracking, and rankings for 2,820+ Rotaract clubs and 44 districts across Rotary International Zones 4, 5, 6, and 7.
- **MCP Endpoint URL:** `https://insights.rsamdio.org/api/mcp` (JSON-RPC 2.0 over HTTPS)
- **REST API Base URL:** `https://insights.rsamdio.org/api/v1`
- **Interactive Documentation:** `https://insights.rsamdio.org/docs`
- **OpenAPI 3.1.0 Specification:** `https://insights.rsamdio.org/openapi.json`
- **Discovery Manifest:** `https://insights.rsamdio.org/.well-known/mcp-server.json`
- **Domain Verification Token:** `/.well-known/openai-apps-challenge` (Verified)
- **Protocol Version:** MCP Protocol `2026-07-28`
- **Privacy Policy:** `https://insights.rsamdio.org/privacy`

---

## 2. Capability Summary
- **Tools (14):**
  1. `get_summary`: Executive macro KPIs for South Asia or scoped to a zone.
  2. `get_leaderboards`: Multi-category rankings (largest clubs, TRF giving, arrears, new clubs, growth).
  3. `get_districts`: Complete roster of 44 districts with performance metrics and leadership contacts.
  4. `get_district_insights`: Detailed district dossier with club rosters, averages, and leadership.
  5. `get_zone_summary`: Zone-level summary and district breakdown across Zones 4, 5, 6, and 7.
  6. `search_clubs`: Full-text search and multi-facet filtering across 2,820+ clubs.
  7. `get_club_profile`: Complete dossier for an individual Rotaract club.
  8. `get_new_clubs`: 126 newly chartered clubs in the current period.
  9. `find_compliance_risks`: Single-risk compliance queries (arrears, at-risk, missing officers).
  10. `find_dual_risk_clubs`: Highest-priority clubs with both arrears and missing officers.
  11. `get_interact_analytics`: Interact statistics and Rotaract sponsorship connections.
  12. `find_rotary_opportunities`: Rotary clubs lacking Rotaract or Interact sponsorship.
  13. `get_foundation_giving`: The Rotary Foundation contributions from Rotaract clubs.
  14. `get_worldwide_rankings`: Global district and country benchmarks across 599 districts.
- **Resources (8):**
  `rotaract://summary`, `rotaract://leaderboards`, `rotaract://new-clubs`, `rotaract://interact`, `rotaract://worldwide`, `rotaract://zones`, `rotaract://districts`, `rotaract://dual-risk`.
- **Prompts (4):**
  `club_rankings_dossier`, `audit_district_compliance`, `sponsorship_opportunity_report`, `zone_performance_comparison`.

---

## 3. Data Source & Freshness Statement
All data is aggregated directly from official Rotary International (RI) raw club-level reports, including:
- RI Official Roster (`All Rotaract Clubs`)
- RI Semi-Annual Dues Arrears Reports
- Rotary Club Central Officer Reporting Data
- The Rotary Foundation (TRF) Contribution Ledgers
- Interact Club Sponsorship Ledgers

Data is synchronized and refreshed regularly with active timestamp indicators displayed in responses (`dataAsOf`).

---

## 4. Test Verification Suite

### A. Positive Test Cases (5)

#### Test Case 1: Executive Macro Summary
- **Invocation:** `get_summary()`
- **Expected Status:** Success (`isError: false`)
- **Key Validation Points:**
  - Contains `overall` object with `totalClubs` (2,820+), `totalReportedMembers` (82,000+).
  - Contains `zonesSummary` array with data for Zones 4, 5, 6, and 7.
  - Contains `dataAsOf` freshness timestamp string.

#### Test Case 2: Multi-Facet Club Search
- **Invocation:** `search_clubs({ country: "Nepal", limit: 5 })`
- **Expected Status:** Success (`isError: false`)
- **Key Validation Points:**
  - Returns `total` matching clubs in Nepal.
  - Returns array of 5 clubs, each with `id`, `name`, `district` (e.g. 3292), and `country: "Nepal"`.

#### Test Case 3: Dual-Risk Compliance Identification
- **Invocation:** `find_dual_risk_clubs({ zone: "5", limit: 3 })`
- **Expected Status:** Success (`isError: false`)
- **Key Validation Points:**
  - Returns clubs in Zone 5 having both overdue financial dues AND missing officer reports.
  - Each item includes `outstandingINR`, `outstandingUSD`, `missingOfficers: true`, and `isAtRisk: true`.

#### Test Case 4: Global Benchmark Dual Rankings
- **Invocation:** `get_worldwide_rankings({ type: "district", region: "south_asia", limit: 5 })`
- **Expected Status:** Success (`isError: false`)
- **Key Validation Points:**
  - Returns top South Asian districts with dual rankings:
    - `worldwideRank`: 1 to 599 global ranking.
    - `southAsiaRank`: 1 to 44 regional ranking.
    - `memberGrowthPct` and `netMemberChange`.

#### Test Case 5: Universal Club Profile Lookup
- **Invocation:** `get_club_profile({ clubId: "8824847" })`
- **Expected Status:** Success (`isError: false`)
- **Key Validation Points:**
  - Returns exact club details: `name`, `district`, `zone`, `members`, `isArrears`, `outstanding`, `trfTotal`.
  - Includes sponsored Interact clubs array and sponsor Rotary club name.

---

### B. Negative Test Cases (3)

#### Test Case 1: Non-Existent Club Lookup
- **Invocation:** `get_club_profile({ clubId: "9999999" })`
- **Expected Status:** Error response (`isError: true`)
- **Expected Response Body:**
  ```json
  {
    "error": "Club '9999999' not found."
  }
  ```

#### Test Case 2: Invalid Zone Range
- **Invocation:** `get_zone_summary({ zone: "8" })`
- **Expected Status:** Error response (`isError: true`)
- **Expected Response Body:**
  ```json
  {
    "error": "Zone '8' not found. Supported zones: Zone 4, Zone 5, Zone 6, Zone 7."
  }
  ```

#### Test Case 3: Deprecated Parameter Guard
- **Invocation:** `find_compliance_risks({ riskType: "dual_risk" })`
- **Expected Status:** Error response (`isError: true`)
- **Expected Response Body:**
  ```json
  {
    "error": "The 'dual_risk'/'both' riskType has been separated into its own specialized tool. Please use find_dual_risk_clubs instead to query clubs with both financial arrears and missing officer reports."
  }
  ```

---

## 5. Security, Consequentiality & Pre-Approval
All endpoints and tools are strictly read-only:
- `x-openai-isConsequential: false` is defined on all API endpoints.
- `x-ms-require-user-confirmation: false` is configured for platform auto-invocation.
- `readOnlyHint: true` is set on all MCP tool annotations.
- No write, delete, update, or payment operations are exposed.
