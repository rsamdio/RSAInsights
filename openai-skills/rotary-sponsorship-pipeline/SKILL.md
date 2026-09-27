---
name: rotary-sponsorship-pipeline
description: Generate strategic sponsorship expansion plans for District Governors and District Rotaract Chairs. Identifies Rotary clubs lacking Rotaract or Interact sponsorship and formulates charter opportunities. Use when planning youth sponsorship expansion or chartering new clubs.
---

# Rotary Sponsorship Pipeline Skill

Use this skill whenever a user asks how to expand Rotaract or Interact coverage, charter new clubs, or identify Rotary clubs in a district or zone that do not currently sponsor youth programs.

## User Instruction Priority
Explicit user instructions always take precedence over these workflow guidelines. Tailor the analytical depth, club selections, and recommendations to the user's specific context.

## Input Expectations & Boundary Rules
- **Expected Input:** A 4-digit Rotary district number (e.g., "3000", "3141", "3220") or RI Zone (4, 5, 6, or 7).
- **Ambiguity Handling:** If a district is not specified, ask the user to clarify which district or zone they wish to analyze.
- **Factual Boundaries:** Only recommend sponsorship opportunities based on verified Rotary club rosters returned by the MCP tools. Never invent club names, sponsor IDs, or member statistics.

## Analytical Workflow

Follow this step-by-step protocol to build a targeted sponsorship pipeline:

### Step 1: Identify Rotary Clubs Without Rotaract
Call `find_rotary_opportunities` with:
- `district`: Target district number.
- `opportunityType`: `"no_rotaract"`

Extract the verified list of active Rotary clubs that currently sponsor zero Rotaract clubs.

### Step 2: Identify Rotary Clubs Without Interact
Call `find_rotary_opportunities` with:
- `district`: Target district number.
- `opportunityType`: `"no_interact"`

Extract the list of active Rotary clubs that currently sponsor zero Interact clubs.

### Step 3: Analyze Youth Service Penetration
Call `get_interact_analytics` with the target `district`.
Extract:
- Total active Interact clubs in the district.
- Number of Rotaract clubs actively co-sponsoring Interact clubs.
- Overall youth service engagement metrics.

### Step 4: Strategic Opportunity Segmentation
Segment Rotary clubs into three actionable categories:
1. **Dual Opportunity Clubs:** Rotary clubs that sponsor neither Rotaract nor Interact.
2. **Rotaract Expansion Targets:** Rotary clubs that already sponsor Interact (showing youth commitment) but have not yet chartered a Rotaract club.
3. **Interact Extension Targets:** Rotary clubs that sponsor Rotaract but lack secondary school Interact partnerships.

---

## Output Report Structure

Present the findings using this structured layout:

### 1. Executive Opportunity Snapshot
- **District Number and RI Zone**
- **Total Rotary Clubs in District**
- **Rotary Clubs Sponsoring Rotaract:** Count and percentage.
- **Untapped Rotary Clubs:** Total clubs available for sponsorship expansion.

### 2. Priority Target Table: Ready for Rotaract Chartering
Format as a clean table:
| Rotary Club Name | Rotary Club ID | Current Youth Sponsorship | Recommended Target | Priority Level |
|------------------|----------------|---------------------------|-------------------|----------------|
| Sample Rotary Club | 12345 | None | Community-based Club | High |

### 3. Institution vs Community Strategy
- Identify university clusters and higher education institutions in the club territory suitable for campus-based Rotaract clubs.
- Propose community-based club charters for clubs centered in commercial or residential areas.

### 4. Implementation Plan for District Leadership
Provide 3 concrete execution steps:
1. Present opportunities at the upcoming District Assembly or Presidents-Elect Training Seminar (PETS).
2. Pair each untapped Rotary club with an experienced Rotaract mentor from a successful club.
3. Coordinate with educational institution administrators for student body charters.
