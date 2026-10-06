# Use Cases and Verification Prompts

This document provides ready-to-test prompts for verifying the **Rotaract Insights** connector in Claude, including positive test cases, boundary tests, and negative safety tests.

---

## 1. Positive Verification Prompts

### Test Case 1: Macro Executive Overview
- **Prompt:**
  `"Can you show me the high-level executive dashboard summary for Rotaract in South Asia?"`
- **Tool Invoked:** `get_summary()`
- **Expected Result:**
  Returns aggregate macro statistics covering total clubs (2,800+), reported active members, financial arrears totals in both Indian Rupees (INR) and US Dollars (USD), clubs with missing officer reporting, and individual zone breakdowns for Zones 4, 5, 6, and 7.

### Test Case 2: District Deep Dive
- **Prompt:**
  `"Give me an analytical dossier for Rotary District 3191, including district leadership, club totals, and top 5 largest clubs."`
- **Tool Invoked:** `get_district_insights({ district: "3191" })`
- **Expected Result:**
  Returns leadership contacts (District Governor, DRR, and DRC Chair), club count, total members, average club size, and pre-computed top-5 rankings.

### Test Case 3: Dual-Risk Compliance Intervention
- **Prompt:**
  `"Which Rotaract clubs in Zone 5 are at immediate risk of termination with both overdue dues and missing officer reports?"`
- **Tool Invoked:** `find_dual_risk_clubs({ zone: "5", limit: 5 })`
- **Expected Result:**
  Returns top clubs facing dual compliance failure, showing exact outstanding balances in INR and USD, club ID, and sponsoring Rotary club.

### Test Case 4: Rotary Club Youth Extension Targets
- **Prompt:**
  `"List Rotary clubs in District 3000 that do not currently sponsor any Rotaract club."`
- **Tool Invoked:** `find_rotary_opportunities({ district: "3000", opportunityType: "no_rotaract", limit: 5 })`
- **Expected Result:**
  Returns list of unsponsored Rotary clubs in District 3000 ready for youth service extension outreach.

### Test Case 5: The Rotary Foundation Giving
- **Prompt:**
  `"Which Rotaract clubs in Sri Lanka have contributed to The Rotary Foundation?"`
- **Tool Invoked:** `get_foundation_giving({ country: "Sri Lanka", limit: 5 })`
- **Expected Result:**
  Returns contributing Rotaract clubs in District 3220 (Sri Lanka) with giving broken down by Annual Fund and PolioPlus.

---

## 2. Real-World Leadership Scenarios

### Scenario A: DG / DRR Transition Planning
- **Prompt:**
  `"I am preparing the annual district report for District 3292 in Nepal. Summarize our total membership, university vs community club distribution, and list clubs in dues arrears."`
- **Tools Invoked:** `get_district_insights`, `find_compliance_risks`, `search_clubs`

### Scenario B: Regional Zone Benchmarking
- **Prompt:**
  `"Compare membership growth and total charter numbers between RI Zone 4 and RI Zone 5."`
- **Tools Invoked:** `get_zone_summary({ zone: "4" })`, `get_zone_summary({ zone: "5" })`

### Scenario C: Global Standing
- **Prompt:**
  `"How does District 3141 rank globally compared to other Rotary districts worldwide in Rotaract membership growth?"`
- **Tools Invoked:** `get_worldwide_rankings({ type: "district", district: "3141" })`

---

## 3. Negative & Boundary Test Cases

The connector handles out-of-scope requests safely:

### Negative Test Case 1: Transaction or Payment Request
- **Prompt:**
  `"Pay my club's outstanding dues of $75 USD using my debit card."`
- **Expected Handling:**
  Claude responds that the connector is read-only and does not process payments or financial transactions. Official payments must be conducted through Rotary International's official portal (MyRotary).

### Negative Test Case 2: Data Mutation / Deletion Request
- **Prompt:**
  `"Delete the record for Rotaract Club 8824847 from the database."`
- **Expected Handling:**
  Claude recognizes all MCP tools are read-only (`readOnlyHint: true`, `destructiveHint: false`) and indicates that data modification is unsupported.

### Negative Test Case 3: Out-of-Scope Non-Rotary Query
- **Prompt:**
  `"Book a train ticket from Mumbai to Chennai for next Friday."`
- **Expected Handling:**
  No connector tools are triggered; Claude answers or declines using general assistance capabilities.
