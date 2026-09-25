---
name: Worldwide Growth Benchmark
description: Benchmarks any South Asian Rotary district or zone against all 599 global districts, member growth percentages, and worldwide country standings.
---

# Worldwide Growth Benchmark Skill

Use this skill whenever a user asks how a South Asian district or zone compares against global benchmarks, asks for worldwide Rotaract growth rankings, or requests international standing analysis.

## Analytical Workflow

Follow this step-by-step protocol to construct the worldwide comparative benchmark:

### Step 1: Query Global Growth Rankings
Invoke `get_worldwide_rankings` with parameters:
- `category`: `"growth"`
- `limit`: `50` (or `sortOrder: "desc"`)

Identify the top-growing districts globally and pinpoint where South Asian districts (e.g. 3261, 3141, 3000) rank on the global leaderboard.

### Step 2: Query Global Country Standings
Invoke `get_worldwide_rankings` with parameters:
- `category`: `"countries"`
- `limit`: `25`

Retrieve global rankings by country for total Rotaract clubs and reported members, highlighting South Asian countries (India, Bangladesh, Sri Lanka, Nepal, Pakistan).

### Step 3: Fetch Target District or Zone Details
If auditing a specific district:
- Invoke `get_district_insights` to retrieve exact member count, baseline net change, and growth percentage.
- Cross-reference against the global district distribution.

If auditing a South Asian zone:
- Invoke `get_zone_summary` with `zone` (e.g. `"5"`).
- Aggregate zone growth against international averages.

### Step 4: Calculate Comparative Performance Indicators
- Determine the district's global percentile in membership growth.
- Compare the district's average club size with the global median (~15-20 members/club).
- Highlight key growth drivers (e.g. chartering surge, campus expansions, dual-membership retention).

---

## Output Report Structure

Present the benchmark with these sections:

### 1. Global Standing Summary
- **Target District / Zone:** Net member growth and percentage increase.
- **Worldwide Rank:** Exact ranking among all 599 Rotary districts worldwide.
- **Regional Context:** Position within South Asia (Zones 4, 5, 6, 7).

### 2. Worldwide Growth Leaderboard Comparison
Table format:
| Global Rank | District | Country / Region | Baseline Members | Current Members | Growth % |
|-------------|----------|------------------|------------------|-----------------|----------|
Highlight the target district in bold within the context of peer districts.

### 3. Country Performance Index
- South Asian country standings in global Rotaract membership.
- Share of global youth service represented by the region.

### 4. Strategic Growth Takeaways
Provide 3 data-driven observations:
1. Growth retention balance: Whether growth is driven by new charters or expansion of existing clubs.
2. Under-penetrated territories with highest catch-up potential.
3. Best practices learned from top-ranking global peer districts.
