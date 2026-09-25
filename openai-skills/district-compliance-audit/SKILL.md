---
name: District Compliance Audit
description: Conducts an end-to-end compliance and health audit for any Rotary district in South Asia. Identifies dues arrears, missing officer reporting, and dual-risk clubs with an actionable remediation roadmap.
---

# District Compliance Audit Skill

Use this skill whenever a user asks to audit, evaluate, review, or inspect the health and compliance of a Rotary district in South Asia.

## Analytical Workflow

Follow this step-by-step protocol to construct a comprehensive District Audit Dossier:

### Step 1: Baseline Metrics & Leadership Roster
Invoke `get_district_insights` with the requested `district` number (e.g. `3000`, `3191`, `3220`).
Extract:
- District Governor (DG), District Rotaract Representative (DRR), and District Rotaract Committee Chair (DRC).
- Total clubs, active reported members, and average club size.
- Total financial arrears in USD and estimated INR.
- Arrears ratio (percentage of clubs with overdue dues).
- Missing officers count and non-reporting percentage.

### Step 2: Emergency Dual-Risk Identification
Invoke `find_dual_risk_clubs` with the target `district`.
Clubs appearing on this list suffer from BOTH overdue financial dues AND missing officer reports. They represent the highest charter cancellation risk.
Extract:
- Club name and club ID.
- Outstanding balance.
- Consecutive billing periods in arrears.

### Step 3: Granular Issue Breakdown
Invoke `find_compliance_risks` with `district` and `riskType: "arrears"`, and separately with `riskType: "missing_officers"`.
(Note: For clubs with both issues simultaneously, always use `find_dual_risk_clubs` as identified in Step 2).
Identify:
- Clubs in single-risk arrears (financial dues only).
- Clubs with missing officers only (administrative compliance on MyRotary).

### Step 4: Top Club Strength Benchmark
Invoke `get_leaderboards` with `district` and `category: "largest_clubs"` to identify the top anchor clubs whose healthy status can support struggling clubs.

---

## Output Report Structure

Present the audit using the following clear sections:

### 1. Executive Summary & Leadership
- **District Number & Zone**
- **Leadership Team:** DG, DRR, and DRC names.
- **Key Health Status:** Total Clubs, Total Members, Health Score (Arrears % vs Healthy %).

### 2. High-Risk Emergency Watchlist (Dual-Risk Clubs)
Table format:
| Club Name | Club ID | Outstanding Balance | Status | Risk Level |
|-----------|---------|---------------------|--------|------------|
Highlight immediate charter risk for clubs in arrears for 2 or more periods without officers.

### 3. Financial Exposure Summary
- Total outstanding dues (USD and INR equivalent).
- Number of clubs affected and percentage of district total.
- Comparison with regional zone average.

### 4. Administrative Compliance (Missing Officers)
- Clubs that have not reported club officers on Rotary Club Central.
- Guidance on logging into My Rotary to submit current executive rosters.

### 5. Action Checklist for District Leaders
Provide 3 to 4 specific, actionable recommendations tailored for the DRR and DRC:
1. Direct outreach to dual-risk club presidents or sponsoring Rotary clubs.
2. Financial reconciliation drive before the next RI billing deadline.
3. Club Central reporting workshop for incoming/outgoing club secretaries.
