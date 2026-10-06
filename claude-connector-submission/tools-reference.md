# Rotaract Insights: Claude Connector Tools Reference

The **Rotaract Insights** MCP server exposes 14 read-only analytical tools. All tools include human-readable execution titles (`title`), risk annotations (`readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`), and explicit JSON schemas.

---

## Complete Tools Catalog

### 1. `get_summary`
- **Execution Title:** Executive Macro KPI Dashboard
- **Description:** Get the top-level executive KPI dashboard for South Asia (RI Zones 4, 5, 6, 7 combined) or scoped to a single zone. Returns: total clubs, reported members, financial arrears in both INR and USD, clubs missing officer reports, TRF giving totals, new charters this period, and university vs community club breakdown.
- **Parameters:**
  - `zone` (string, optional): e.g. `"Zone 5"` or `"5"`.
- **Annotations:** `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`.

---

### 2. `get_leaderboards`
- **Execution Title:** Ranked Performance Leaderboards
- **Description:** Get ranked top-N lists for clubs and districts in South Asia. Answers: Who are the largest clubs? Which clubs have the highest unpaid dues? Which clubs face termination risk (dues >= $75 USD)? Which districts grew the fastest? Set scope="south_asia" (default) or "worldwide".
- **Parameters:**
  - `category` (string, optional): `"all"`, `"largest_clubs"`, `"top_trf_clubs"`, `"arrears_clubs"`, `"at_risk_clubs"`, `"districts_by_clubs"`, `"districts_by_members"`, `"districts_by_arrears"`, `"districts_by_growth"`, `"districts_by_member_growth"`, `"new_clubs"`.
  - `scope` (string, optional): `"south_asia"` (default) or `"worldwide"`.
  - `limit` (integer, optional): default `10`.

---

### 3. `get_districts`
- **Execution Title:** District Directory & Contacts
- **Description:** List Rotary districts in South Asia with KPIs, leadership contacts (DG, DRR, DRC), financial health, TRF contributions, and growth metrics. Filter by zone (4, 5, 6, or 7) or country (India, Nepal, Sri Lanka). Sort by members, totalClubs, arrearsClubs, outstanding, trf, newClubs, interactGrowth, or noOfficers.
- **Parameters:**
  - `zone` (string, optional): e.g. `"Zone 5"`.
  - `country` (string, optional): `"India"`, `"Nepal"`, or `"Sri Lanka"`.
  - `sortBy` (string, optional): e.g. `"members"`, `"totalClubs"`, `"arrearsClubs"`.
  - `sortOrder` (string, optional): `"asc"` or `"desc"`.

---

### 4. `search_clubs`
- **Execution Title:** Search & Filter Rotaract Clubs
- **Description:** Search, filter, and paginate the full South Asia Rotaract club roster (2,800+ clubs). Supports full-text search across club name, ID, and sponsor Rotary club name. Filter by district, zone, country, base, arrears, risk status, missing officers, and member thresholds.
- **Parameters:**
  - `query` (string, optional): Search keyword.
  - `district` (string, optional): e.g. `"3000"`.
  - `zone` (string, optional): e.g. `"5"`.
  - `country` (string, optional): `"India"`, `"Nepal"`, `"Sri Lanka"`.
  - `base` (string, optional): `"Community"` or `"University"`.
  - `isArrears` (boolean, optional).
  - `isAtRisk` (boolean, optional).
  - `isNoOfficers` (boolean, optional).
  - `sponsorsInteract` (boolean, optional).
  - `limit` (integer, optional): `1-100`, default `25`.
  - `offset` (integer, optional): default `0`.

---

### 5. `get_new_clubs`
- **Execution Title:** Newly Chartered Clubs Directory
- **Description:** Get newly chartered Rotaract clubs in South Asia during the current period. Shows charter date, member count at chartering, and sponsor Rotary club for each.
- **Parameters:**
  - `district` (string, optional).
  - `zone` (string, optional).
  - `country` (string, optional).
  - `base` (string, optional).
  - `sortBy` (string, optional): `"charterDate"`, `"members"`, `"name"`.
  - `sortOrder` (string, optional): `"asc"` or `"desc"`.
  - `limit` (integer, optional): default `25`.

---

### 6. `get_club_profile`
- **Execution Title:** Universal Club Profile Dossier
- **Description:** Get the full dossier for one specific Rotaract club. Accepts a Rotary Club ID (numeric string like "8824847") OR a partial club name for lookup. Returns membership count, compliance status, dues in INR and USD, TRF giving breakdown, sponsored Interact clubs list, charter date, and sponsor Rotary club.
- **Parameters:**
  - `clubId` (string, required): e.g. `"8824847"` or club name.

---

### 7. `get_district_insights`
- **Execution Title:** District Performance Insights
- **Description:** Get full analytics for ONE specific Rotary district. Returns total clubs, members, arrears count and outstanding INR/USD, missing officers count, TRF contributions, new clubs, and average club size. Includes leadership contacts (DG, DRR, DRC) and pre-computed top-5 club leaderboards.
- **Parameters:**
  - `district` (string, required): e.g. `"3000"`, `"3191"`.

---

### 8. `get_zone_summary`
- **Execution Title:** Zone Performance Summary
- **Description:** Get comprehensive analytics for one entire RI Zone (Zone 4, 5, 6, or 7). Returns zone KPIs, growth vs baseline, intra-zone district leaderboards, and top 10 largest clubs within the zone.
- **Parameters:**
  - `zone` (string, required): `"4"`, `"5"`, `"6"`, or `"7"`.

---

### 9. `find_compliance_risks`
- **Execution Title:** Single-Risk Compliance Monitor
- **Description:** Find clubs with a SINGLE type of compliance issue: financial arrears, missing officer reports, or termination-level risk. Filter by district, zone, country, base, and minimum outstanding amount.
- **Parameters:**
  - `riskType` (string, required): `"arrears"`, `"missing_officers"`, or `"at_risk_only"`.
  - `district` (string, optional).
  - `zone` (string, optional).
  - `country` (string, optional).
  - `minOutstanding` (number, optional).
  - `limit` (integer, optional): default `25`.

---

### 10. `find_dual_risk_clubs`
- **Execution Title:** Dual-Risk Compliance & Termination Risk
- **Description:** Find Rotaract clubs that simultaneously have BOTH unpaid financial dues AND missing officer reports. These clubs are at immediate risk of charter termination and require urgent district leadership intervention.
- **Parameters:**
  - `district` (string, optional).
  - `zone` (string, optional).
  - `country` (string, optional).
  - `minOutstanding` (number, optional).
  - `sortBy` (string, optional): `"outstanding"`, `"name"`, `"district"`.
  - `limit` (integer, optional): default `25`.

---

### 11. `get_interact_analytics`
- **Execution Title:** Interact Club Analytics & Demographics
- **Description:** Get Interact club statistics for South Asia: total Interact clubs, active vs suspended counts, and Interact clubs directly sponsored by Rotaract clubs. Returns zone and district breakdowns.
- **Parameters:**
  - `district` (string, optional).
  - `zone` (string, optional).
  - `country` (string, optional).
  - `base` (string, optional).

---

### 12. `find_rotary_opportunities`
- **Execution Title:** Rotary Club Sponsorship Opportunities
- **Description:** Identify Rotary clubs in South Asia that have NOT yet sponsored a Rotaract or Interact club - strategic extension targets for District Governors and Youth Service chairs.
- **Parameters:**
  - `opportunityType` (string, required): `"no_rotaract"` or `"no_interact"`.
  - `district` (string, optional).
  - `zone` (string, optional).
  - `sortBy` (string, optional): `"district"`, `"name"`, `"zone"`, `"members"`.
  - `limit` (integer, optional): default `25`.

---

### 13. `get_foundation_giving`
- **Execution Title:** The Rotary Foundation Giving
- **Description:** Get The Rotary Foundation (TRF) contribution records from Rotaract clubs in South Asia. Breaks down giving into Annual Fund, PolioPlus, and Other designations per club.
- **Parameters:**
  - `district` (string, optional).
  - `zone` (string, optional).
  - `country` (string, optional).
  - `base` (string, optional).
  - `sortBy` (string, optional): `"total"`, `"annual"`, `"polio"`.
  - `limit` (integer, optional): default `25`.

---

### 14. `get_worldwide_rankings`
- **Execution Title:** Worldwide Growth & Benchmarks
- **Description:** Get global Rotaract statistics across worldwide districts, countries, and clubs. Benchmarks South Asian districts against global peers with dual rankings (worldwideRank and southAsiaRank).
- **Parameters:**
  - `type` (string, required): `"all"`, `"summary"`, `"country"`, `"district"`, `"interact"`, `"new_clubs"`, `"clubs"`.
  - `base` (string, optional): `"all"`, `"community"`, `"university"`.
  - `country` (string, optional).
  - `district` (string, optional).
  - `region` (string, optional): `"all"` or `"south_asia"`.
  - `limit` (integer, optional): default `25`.
