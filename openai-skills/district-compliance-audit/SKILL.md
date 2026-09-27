---
name: district-compliance-audit
description: Conduct an end-to-end compliance and health audit for any Rotary district in South Asia. Identifies dues arrears, missing officer reporting, and dual-risk clubs with an actionable remediation roadmap. Use when auditing, evaluating, or reviewing district compliance or club health.
---

# District Compliance Audit Skill

Use this skill whenever a user asks to audit, evaluate, review, or inspect the health and compliance of a Rotary district in South Asia (RI Zones 4, 5, 6, and 7).

## User Instruction Priority
Explicit user instructions always take precedence over these workflow guidelines. Adapt the scope, level of detail, or formatting to meet the user's specific request.

## Input Expectations & Boundary Rules
- **Expected Input:** A 4-digit Rotary district identifier (e.g., "3000", "3191", "3220").
- **Ambiguity Handling:** If the user mentions a region or city without a district number, ask for clarification or use `get_districts` to confirm the district number before proceeding.
- **Factual Boundaries:** Never estimate, hallucinate, or extrapolate dues amounts, member counts, or compliance status. Rely strictly on verified data returned by the MCP tools. If no records are found, report that clearly.

## Analytical Workflow

Follow this step-by-step protocol to construct a comprehensive District Audit Dossier:

### Step 1: Baseline Metrics and Leadership Roster
Call `get_district_insights` with the requested `district` number (e.g. `3000`, `3191`, `3220`).
Extract:
- District Governor (DG), District Rotaract Representative (DRR), and District Rotaract Committee Chair (DRC).
- Total active clubs, reported members, and average club size.
- Total financial arrears in USD and estimated local currency.
- Arrears ratio (percentage of clubs with overdue dues).
- Missing officers count and non-reporting percentage.

### Step 2: Critical Dual-Risk Identification
Call `find_dual_risk_clubs` with the target `district`.
Clubs appearing on this list experience both overdue financial dues and missing officer reporting, representing priority administrative concern.
Extract:
- Club name and club ID.
- Outstanding balance.
- Consecutive billing periods in arrears.

### Step 3: Granular Issue Breakdown
Call `find_compliance_risks` with `district` and `riskType: "arrears"` to identify clubs with dues obligations only.
Separately call `find_compliance_risks` with `district` and `riskType: "missing_officers"` to identify administrative reporting delays on Rotary Club Central.

### Step 4: Top Anchor Club Strength
Call `get_leaderboards` with `district` and `category: "largest_clubs"` to identify thriving anchor clubs whose leadership practices can support struggling clubs.

---

## Output Report Structure

Present the audit using the following clear sections:

### 1. Executive Summary and Leadership
- **District Number and RI Zone**
- **District Leadership Team:** DG, DRR, and DRC names.
- **Overall Health Indicators:** Total Clubs, Total Members, and Compliance Ratio (% of clubs in good standing).

### 2. Priority Attention Watchlist (Dual-Risk Clubs)
Format as a clean table:
| Club Name | Club ID | Outstanding Balance | Status | Priority Level |
|-----------|---------|---------------------|--------|----------------|
| Sample Club | 12345 | $150.00 | 2 Periods Overdue | High |

If no dual-risk clubs exist, note that the district has zero clubs with simultaneous financial and reporting defaults.

### 3. Financial Exposure Summary
- Total outstanding dues in USD.
- Number of affected clubs and percentage of district total.
- Comparison against regional zone average.

### 4. Administrative Compliance (Missing Officers)
- Clubs that have not reported club officers on Rotary Club Central.
- Guidance on logging into My Rotary to submit executive officer records.

### 5. Action Checklist for District Leaders
Provide 3 to 4 specific, actionable recommendations tailored for the DRR and DRC:
1. Direct outreach to club presidents and sponsoring Rotary clubs.
2. Financial reconciliation drive before the next Rotary International billing deadline.
3. Club Central reporting workshop for incoming and outgoing club secretaries.
