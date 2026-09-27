---
name: south-asia-overview
description: Provide macro executive analytics, regional KPI summaries, and inter-zone performance comparisons across RI Zones 4, 5, 6, and 7 in South Asia. Use when requesting regional overviews, zone comparisons, or executive KPI summaries.
---

# South Asia Overview Skill

Use this skill whenever a user asks for macro statistics, cross-zone comparisons, executive summaries, or comprehensive health indicators across Rotary International Zones 4, 5, 6, and 7 in South Asia.

## User Instruction Priority
Explicit user instructions always take precedence over these workflow guidelines. Adapt the reporting depth, focus areas, and presentation format to the user's specific request.

## Input Expectations & Boundary Rules
- **Expected Scope:** Regional South Asia covering RI Zones 4, 5, 6, and 7 (44 districts total), or any subset of these zones.
- **Ambiguity Handling:** If the user asks for a specific zone (e.g., "Zone 5 overview"), focus the report on that specific zone while providing regional context.
- **Factual Boundaries:** Never extrapolate or estimate member counts, financial arrears, or foundation giving figures. Rely strictly on verified totals returned by the MCP tools.

## Analytical Workflow

Follow this step-by-step protocol to generate a South Asia Executive Briefing:

### Step 1: Regional Executive Baseline
Call `get_summary` without parameters (or with `zone` if scoped to a specific zone).
Extract:
- Total active clubs and net growth since baseline (1 July).
- Total reported members and member growth percentage.
- Total dues in financial arrears in USD.
- Regional compliance rate and reporting percentage.
- Rotary Foundation giving overview across contributing clubs.

### Step 2: 4-Zone Comparative Matrix
Call `get_zone_summary` for Zone 4, Zone 5, Zone 6, and Zone 7.
Compare:
- Total clubs and active reported members per zone.
- Year-over-year member growth percentage and net member deltas.
- Arrears ratio (percentage of clubs with overdue dues).
- Foundation contributions (TRF) per zone.
- Sponsoring Rotary club coverage.

### Step 3: Top Regional Leaders and Anchors
Call `get_leaderboards` with:
- `category: "largest_clubs"` (limit 5) for membership anchors.
- `category: "trf_giving"` (limit 5) for top foundation contributors.
- `category: "districts_by_member_growth"` (limit 5) for highest-performing districts.
- `category: "new_clubs"` (limit 5) for recent charter expansions.

### Step 4: Youth Service Extension Footprint
Call `get_interact_analytics` to extract:
- Total Interact clubs in South Asia.
- Clubs directly sponsored or co-sponsored by Rotaract clubs.

---

## Output Report Structure

Present the briefing using this structured layout:

### 1. Executive Macro Scorecard
- **Total Active Rotaract Clubs:** Count and net change since 1 July baseline.
- **Total Reported Members:** Count and percentage growth.
- **Financial Compliance Rate:** Percentage of clubs in good standing.
- **Total TRF Contributions:** Giving summary in USD.

### 2. 4-Zone Comparative Performance Matrix
Format as a clean table:
| RI Zone | Districts | Total Clubs | Active Members | Member Growth % | Total TRF USD | Compliance % |
|---------|-----------|-------------|----------------|-----------------|---------------|--------------|
| Zone 4  | 6         | 312         | 5,420          | +4.2%           | $12,450       | 88.5%        |
| Zone 5  | 14        | 980         | 18,300         | +7.1%           | $45,200       | 91.2%        |
| Zone 6  | 12        | 740         | 12,150         | +3.8%           | $22,100       | 85.0%        |
| Zone 7  | 12        | 838         | 15,280         | +6.4%           | $31,500       | 89.3%        |

### 3. Regional Highlights and Growth Drivers
- Top 3 growth districts and their expansion models.
- Foundation giving recognition for leading benefactor clubs.
- Youth service extension highlights (Interact footprint).

### 4. Strategic Priorities for Regional Leadership
Provide 3 data-driven recommendations for the South Asia MDIO executive board:
1. Targeted retention and outreach in districts with higher arrears concentration.
2. Cross-zone best-practice sharing between fast-growing and mature districts.
3. Extension targets focusing on Rotary clubs without youth program sponsorship.
