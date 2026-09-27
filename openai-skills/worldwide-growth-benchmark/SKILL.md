---
name: worldwide-growth-benchmark
description: Benchmark any South Asian Rotary district or zone against all 599 global districts, member growth percentages, and worldwide country standings. Use when comparing districts or zones to global benchmarks or worldwide rankings.
---

# Worldwide Growth Benchmark Skill

Use this skill whenever a user asks how a South Asian district or zone compares against global benchmarks, asks for worldwide Rotaract growth rankings, or requests international standing analysis across all 599 Rotary districts globally.

## User Instruction Priority
Explicit user instructions always take precedence over these workflow guidelines. Adjust comparison parameters, district groupings, or ranking criteria to match the user's specific inquiry.

## Input Expectations & Boundary Rules
- **Expected Scope:** A South Asian district number, RI Zone (4, 5, 6, 7), or regional query.
- **Ambiguity Handling:** If no specific district is mentioned, benchmark the top South Asian districts against the worldwide top 25, or ask the user which district they wish to evaluate.
- **Factual Boundaries:** Use the dual-ranking system provided by the MCP tools (`rank` within scope, and `worldwideRank` across all 599 global districts). Never extrapolate or guess global positions.

## Analytical Workflow

Follow this step-by-step protocol to construct the worldwide comparative benchmark:

### Step 1: Query Global Growth Rankings
Call `get_worldwide_rankings` with:
- `type`: `"district"`
- `sortBy`: `"member_growth_pct"`
- `region`: `"south_asia"` (optional: to isolate South Asian districts) or omit for worldwide (599 districts)
- `limit`: `25`
- `sortOrder`: `"desc"`

Identify the top-growing districts globally and pinpoint where South Asian districts rank on the global leaderboard with dual ranks (`rank` within scope, and `worldwideRank` across all 599 districts).

### Step 2: Query Global Country Standings
Call `get_worldwide_rankings` with:
- `type`: `"country"`
- `limit`: `25`

Retrieve global rankings by country for total Rotaract clubs and reported members, highlighting South Asian countries (India, Bangladesh, Sri Lanka, Nepal, Pakistan).

### Step 3: Fetch Target District or Zone Details
If benchmarking a specific district:
- Call `get_district_insights` to retrieve exact member count, baseline net change, and growth percentage.
- Cross-reference against the global district distribution.

If benchmarking a South Asian zone:
- Call `get_zone_summary` with `zone` (e.g. `"5"`).
- Aggregate zone growth against international averages.

### Step 4: Calculate Comparative Performance Indicators
- Determine the district's global standing in membership growth.
- Compare the district's average club size with global benchmarks.
- Highlight key growth drivers (e.g. chartering surge, campus expansions, retention).

---

## Output Report Structure

Present the benchmark with these sections:

### 1. Global Standing Summary
- **Target District or Zone:** Net member growth and percentage increase.
- **Worldwide Rank:** Exact ranking among all 599 Rotary districts worldwide.
- **Regional Context:** Position within South Asia (Zones 4, 5, 6, 7).

### 2. Worldwide Growth Leaderboard Comparison
Format as a clean table:
| Global Rank | District | Country / Region | Baseline Members | Current Members | Growth % |
|-------------|----------|------------------|------------------|-----------------|----------|
| 1           | 3261     | India            | 1,200            | 1,850           | +54.2%   |
| 5           | 3141     | India            | 2,400            | 3,100           | +29.2%   |

Highlight the target district in bold within the context of peer districts.

### 3. Country Performance Index
- South Asian country standings in global Rotaract membership.
- Share of global youth service represented by the region.

### 4. Strategic Growth Takeaways
Provide 3 data-driven observations:
1. Growth retention balance: Whether growth is driven by new charters or expansion of existing clubs.
2. Under-penetrated territories with highest catch-up potential.
3. Best practices learned from top-ranking global peer districts.
