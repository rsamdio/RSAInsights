---
name: South Asia Overview
description: Provides macro executive analytics, regional KPI summaries, and inter-zone performance comparisons across RI Zones 4, 5, 6, and 7 in South Asia.
---

# South Asia Overview Skill

Use this skill whenever a user asks for high-level macro statistics, cross-zone comparisons, executive summaries, or comprehensive health indicators across Rotary International Zones 4, 5, 6, and 7 in South Asia.

## Analytical Workflow

Follow this step-by-step protocol to generate a South Asia Executive Briefing:

### Step 1: Regional Executive Baseline
Invoke `get_summary` without parameters (or with `zone` if narrowed to a specific zone).
Extract:
- Total active clubs and net growth since baseline (1 July).
- Total reported members and member growth percentage.
- Total dues in financial arrears (USD and estimated INR).
- Regional compliance rate and overall reporting percentage.
- Foundation giving overview across contributing clubs.

### Step 2: 4-Zone Comparative Matrix
Invoke `get_zone_summary` for Zone 4, Zone 5, Zone 6, and Zone 7.
Compare:
- Total clubs and active reported members per zone.
- Year-over-year member growth percentage and net member deltas.
- Arrears ratio (percentage of clubs with overdue dues).
- Foundation contributions (TRF) per zone.
- Sponsoring Rotary club coverage.

### Step 3: Top Regional Leaders & Anchors
Invoke `get_leaderboards` with:
- `category: "largest_clubs"` (limit 5) for regional membership anchors.
- `category: "trf_giving"` (limit 5) for top foundation contributors.
- `category: "districts_by_member_growth"` (limit 5) for highest-performing districts.
- `category: "new_clubs"` (limit 5) for recent charter expansions.

### Step 4: Extension & Youth Service Footprint
Invoke `get_interact_analytics` to extract:
- Total Interact clubs in South Asia (8,921 clubs).
- Clubs directly sponsored or co-sponsored by Rotaract clubs (137 clubs across 65 Rotaract clubs).

---

## Output Report Structure

Present the briefing using this structured layout:

### 1. Executive Macro Scorecard
- **Total Active Rotaract Clubs:** Count and net change.
- **Total Reported Members:** Count and YoY growth percentage.
- **Financial Compliance Rate:** Percentage of clubs in good standing.
- **Total TRF Contributions:** Giving summary in USD.

### 2. 4-Zone Comparative Performance Matrix
Table format:
| RI Zone | Districts | Total Clubs | Active Members | Member Growth % | Total TRF USD | Compliance % |
|---------|-----------|-------------|----------------|-----------------|---------------|--------------|
| Zone 4  | ...       | ...         | ...            | ...             | ...           | ...          |
| Zone 5  | ...       | ...         | ...            | ...             | ...           | ...          |
| Zone 6  | ...       | ...         | ...            | ...             | ...           | ...          |
| Zone 7  | ...       | ...         | ...            | ...             | ...           | ...          |

### 3. Regional Highlights & Growth Drivers
- Top 3 growth districts and their expansion models.
- Foundation giving recognition for leading benefactor clubs.
- Youth service extension highlights (Interact footprint).

### 4. Strategic Priorities for Regional Leadership
Provide 3 data-driven recommendations for the South Asia MDIO executive board:
1. Retention and intervention strategies for clusters with arrears concentration.
2. Cross-zone best-practice sharing between fast-growing and mature districts.
3. Extension targets focusing on Rotary clubs without youth program sponsorship.
