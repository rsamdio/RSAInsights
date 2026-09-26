---
name: rotary-sponsorship-pipeline
description: Generate strategic sponsorship expansion plans for District Governors and District Rotaract Chairs. Identifies Rotary clubs lacking Rotaract or Interact sponsorship and formulates charter opportunities. Use when planning youth sponsorship expansion or chartering new clubs.
---

# Rotary Sponsorship Pipeline Skill

Use this skill whenever a user asks how to expand Rotaract or Interact coverage, charter new clubs, or identify Rotary clubs in a district or zone that do not currently sponsor youth programs.

## Analytical Workflow

Follow this step-by-step protocol to build a targeted sponsorship pipeline:

### Step 1: Identify Rotary Clubs Without Rotaract
Invoke `find_rotary_opportunities` with parameters:
- `district`: Target district number (e.g. `3000`, `3141`).
- `opportunityType`: `"no_rotaract"`

Extract the full list of active Rotary clubs in the district that currently sponsor zero Rotaract clubs.

### Step 2: Identify Rotary Clubs Without Interact
Invoke `find_rotary_opportunities` with parameters:
- `district`: Target district number.
- `opportunityType`: `"no_interact"`

Extract the list of active Rotary clubs that currently sponsor zero Interact clubs.

### Step 3: Cross-Check Interact Analytics
Invoke `get_interact_analytics` with the target `district`.
Extract:
- Total active Interact clubs in the district.
- Number of Rotaract clubs actively co-sponsoring Interact clubs.
- Youth service penetration rate across the district.

### Step 4: Synthesize Opportunity Segmentation
Segment Rotary clubs into three actionable tiers:
1. **Tier 1 (High Priority - Dual Opportunity):** Rotary clubs that sponsor neither Rotaract nor Interact.
2. **Tier 2 (Rotaract Expansion):** Rotary clubs that already sponsor an Interact club (demonstrating youth focus) but do not yet sponsor a Rotaract club.
3. **Tier 3 (Interact Expansion):** Rotary clubs that sponsor Rotaract but lack an Interact club in local secondary schools.

---

## Output Report Structure

Present the findings using this structured layout:

### 1. Executive Opportunity Snapshot
- **District Number & Zone**
- **Total Rotary Clubs in District**
- **Rotary Clubs Sponsoring Rotaract:** Count and percentage.
- **Untapped Rotary Clubs:** Total clubs available for sponsorship.

### 2. Priority Target Table: Ready for Rotaract Chartering
Table format:
| Rotary Club Name | Rotary Club ID | Current Youth Sponsorship | Recommended Target | Priority |
|------------------|----------------|---------------------------|-------------------|----------|

### 3. Campus vs Community Strategy
- Identify university clusters and higher education institutions in the club territory suitable for campus-based Rotaract clubs.
- Propose community-based club charters for clubs in commercial or residential hubs.

### 4. Implementation Plan for DG and DRC
Provide 3 concrete execution steps:
1. Joint presentation at the upcoming District Assembly or Presidents-Elect Training Seminar (PETS).
2. Pairing each untapped Rotary club with an experienced Rotaract mentor from a thriving club.
3. Engaging university administrators for institutional charter approval.
