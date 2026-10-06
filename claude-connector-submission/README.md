# Claude Connector Submission: Complete Step-by-Step Guide

This guide contains the exact inputs, metadata, and copy required for submitting the **Rotaract Insights** connector to the **Anthropic Claude Connectors Directory**.

The 10 steps below mirror the Claude submission wizard shown in the portal.

---

## Step 1: Connection

- **MCP Endpoint URL:** `https://insights.rsamdio.org/api/mcp`
- **Transport Type:** `streamable-http` (JSON-RPC 2.0 over HTTPS)
- **Fallback SSE Endpoint:** `https://insights.rsamdio.org/sse`
- **Protocol Versions Supported:** `2024-11-05`, `2026-07-28`
- **Connection Status:** Verified (Green checkmark)

> **Action:** If reconnecting after updating annotations, click **Re-connect** in the Claude portal.

---

## Step 2: Tools

The server registers **14 tools**. All 14 tools now feature explicit human-readable execution titles (`title`) and directory annotations (`annotations.title`, `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`).

| Tool Identifier | Execution Title (`title` & `annotations.title`) | Mode |
|---|---|---|
| `get_summary` | Executive Macro KPI Dashboard | Read-only, Idempotent |
| `get_leaderboards` | Ranked Performance Leaderboards | Read-only, Idempotent |
| `get_districts` | District Directory & Contacts | Read-only, Idempotent |
| `search_clubs` | Search & Filter Rotaract Clubs | Read-only, Idempotent |
| `get_new_clubs` | Newly Chartered Clubs Directory | Read-only, Idempotent |
| `get_club_profile` | Universal Club Profile Dossier | Read-only, Idempotent |
| `get_district_insights` | District Performance Insights | Read-only, Idempotent |
| `get_zone_summary` | Zone Performance Summary | Read-only, Idempotent |
| `find_compliance_risks` | Single-Risk Compliance Monitor | Read-only, Idempotent |
| `find_dual_risk_clubs` | Dual-Risk Compliance & Termination Risk | Read-only, Idempotent |
| `get_interact_analytics` | Interact Club Analytics & Demographics | Read-only, Idempotent |
| `find_rotary_opportunities` | Rotary Club Sponsorship Opportunities | Read-only, Idempotent |
| `get_foundation_giving` | The Rotary Foundation Giving | Read-only, Idempotent |
| `get_worldwide_rankings` | Worldwide Growth & Benchmarks | Read-only, Idempotent |

> **Warning Resolution:** Re-connecting now resolves the previous 14 yellow warnings: *"Missing title annotation. Add an execution-title, a human-readable name for the directory listing"*.

---

## Step 3: Listing

Copy and paste these exact fields into the directory listing form:

### Basic Information
- **Connector Name / Display Name:** `Rotaract Insights`
- **Short Description (under 100 characters):**
  `Executive analytics, district KPIs, and compliance tracking for Rotaract across South Asia.`
- **Long Description:**
  `Rotaract Insights provides institutional analytics, district performance metrics, membership demographics, and compliance tracking for Rotaract clubs and Rotary districts across South Asia (Rotary International Zones 4, 5, 6, and 7), covering India, Nepal, and Sri Lanka. Query macro KPIs, financial dues in arrears (INR and USD), missing officer reports, The Rotary Foundation (TRF) giving, Interact club sponsorships, and worldwide benchmarks directly within Claude conversations.`
- **Category:** `Data & Analytics` (or `Productivity & Business Tools`)
- **Tags / Keywords:** `rotary`, `rotaract`, `analytics`, `compliance`, `kpis`, `south-asia`, `districts`, `membership`, `interact`
- **Primary Website:** `https://rsamdio.org`
- **Dashboard Web App:** `https://insights.rsamdio.org`
- **Brand Color:** `#D91B5C` (Rotaract Cranberry)
- **Brand Color Dark:** `#E83A78`

### Visual Assets
Assets located in `openai-plugin-package/assets/` can be reused directly for Claude submission:
- **Square App Icon (PNG, 512x512):** `openai-plugin-package/assets/icon.png`
- **Dark Mode Icon:** `openai-plugin-package/assets/icon-dark.png`
- **Logo (PNG, horizontal):** `openai-plugin-package/assets/logo.png`
- **Screenshot / Preview Image:** `openai-plugin-package/assets/screenshot.png`

---

## Step 4: Use Cases

Provide the following 5 user stories and use case scenarios:

### Use Case 1: Executive District Leadership Briefing
- **Summary:** District Governors (DGs) and District Rotaract Representatives (DRRs) pull macro KPIs and district dossiers ahead of executive meetings.
- **Sample Prompt:**
  `"Give me an executive performance summary of Rotary District 3191, including leadership contacts, top clubs, TRF giving, and compliance issues."`
- **Tools Invoked:** `get_district_insights`, `get_summary`

### Use Case 2: Charter Cancellation Risk Identification
- **Summary:** Regional district teams identify clubs facing termination due to unpaid RI dues ($75 USD or more) and missing officer reports.
- **Sample Prompt:**
  `"Find all Rotaract clubs in Zone 5 that have unpaid dues over $75 USD and are missing officer reports, sorted by outstanding amount."`
- **Tools Invoked:** `find_dual_risk_clubs`, `find_compliance_risks`

### Use Case 3: Rotary Extension & Youth Service Pipeline
- **Summary:** District extension chairs locate Rotary clubs that have not yet chartered a Rotaract or Interact club to plan sponsorship drives.
- **Sample Prompt:**
  `"Which Rotary clubs in District 3000 do not sponsor a Rotaract club yet?"`
- **Tools Invoked:** `find_rotary_opportunities`

### Use Case 4: Global Benchmark & Dual Ranking
- **Summary:** Regional teams benchmark South Asian districts and clubs against global metrics.
- **Sample Prompt:**
  `"Show the top 10 worldwide Rotaract clubs by membership and their global rankings."`
- **Tools Invoked:** `get_worldwide_rankings`

### Use Case 5: Philanthropic Giving Audit (TRF)
- **Summary:** Foundation committee chairs track voluntary Rotaract donations to The Rotary Foundation Annual Fund and PolioPlus.
- **Sample Prompt:**
  `"Which Rotaract clubs in India have contributed the most to The Rotary Foundation this year?"`
- **Tools Invoked:** `get_foundation_giving`, `get_leaderboards`

---

## Step 5: Company & Developer Profile

- **Developer / Publisher Name:** `Rotaract South Asia MDIO`
- **Organization Full Name:** `Rotaract South Asia Multi-District Information Organisation (RSAMDIO)`
- **Official Website:** `https://rsamdio.org`
- **Support & Contact Email:** `info@rsamdio.org` (or `insights@rsamdio.org`)
- **Support Desk URL:** `https://insights.rsamdio.org/contact`
- **Country / Headquarters:** India (operating across RI Zones 4, 5, 6, and 7: India, Nepal, Sri Lanka)
- **Organization Type:** Non-profit youth service organization / Multi-District Information Organisation (recognized by Rotary International)

---

## Step 6: Authentication & Security

- **Authentication Type:** `None / Public Read-Only`
- **Auth Explanation:**
  `The Rotaract Insights MCP server provides public institutional data. It does not access private user accounts, proprietary enterprise databases, or personal data. All endpoints are read-only and require zero authentication tokens or OAuth handshakes.`
- **Transport Security:** Strict TLS 1.3 encryption across all HTTPS/SSE streams.
- **Rate Limiting:** Managed at the Cloudflare edge to ensure uninterrupted public availability.

---

## Step 7: Data Handling & Storage

Copy and paste these exact declarations into the Data Handling questionnaire:

- **Does this connector store user data?** `No.`
- **Data Retention Period:** `0 days (Stateless).`
  *Query arguments are processed in-memory and discarded immediately upon response generation. Chat text, prompts, and query parameters are never written to any database or long-term disk.*
- **Does this connector handle Personal Identifiable Information (PII)?** `No.`
  *The dataset contains only public institutional club names, charter IDs, district numbers, and official directory leadership designations (DG, DRR, DRC). Individual club member personal data (personal phone numbers, personal emails, residential addresses) is strictly prohibited and never collected or displayed.*
- **Is user data used to train AI models?** `No.`
- **Operational Logs:**
  *Ephemeral server HTTP access logs (containing anonymized IP addresses, HTTP status codes, and timestamps) are kept solely for cybersecurity defense and DDoS prevention, automatically purged after 14 to 30 days.*

---

## Step 8: Test & Launch

### Quick Smoke Test Instructions for Claude Reviewers
Reviewers can verify functionality in Claude with these three standard verification prompts:

1. **Test Prompt 1 (Macro):**
   `"Show me the top-level South Asia Rotaract executive summary KPIs."`
   *Expected result:* Returns total clubs (2,800+), reported members, outstanding dues in INR/USD, and zone summaries.

2. **Test Prompt 2 (District Search):**
   `"List the Rotary districts in Zone 5 sorted by reported membership count."`
   *Expected result:* Returns districts in Zone 5 with leadership contacts (DG, DRR, DRC) and club counts.

3. **Test Prompt 3 (Single-Club Profile):**
   `"Get the club profile for Rotary Club ID 8824847."`
   *Expected result:* Returns exact club metrics, outstanding dues, TRF breakdown, and sponsor Rotary club.

- **Demo Video Walkthrough:** `https://kommodo.ai/recordings/9MjZFB2CtgkObgU2u7WW`
- **Interactive Documentation URL:** `https://insights.rsamdio.org/docs`
- **OpenAPI 3.1.0 JSON:** `https://insights.rsamdio.org/openapi.json`

---

## Step 9: Compliance & Legal

- **Privacy Policy URL:** `https://insights.rsamdio.org/privacy`
  *(Updated October 2026 to explicitly cover both OpenAI ChatGPT and Anthropic Claude connectors).*
- **Terms of Service URL:** `https://insights.rsamdio.org/terms`
  *(Updated October 2026 to govern AI assistants, MCP connectors, and read-only open data usage under ODbL).*
- **Safety Disclaimers Included:**
  - Read-only guarantees: `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`.
  - Non-official formal notice disclaimer: Data is informational for district planning; official charter termination and legal notices remain exclusively with Rotary International.
  - Currency conversion disclaimer: Dues are converted from USD to INR at prevailing monthly rates and rounded to whole integers at club level.

---

## Step 10: Review and Submit

### Pre-Submission Checklist
- [x] Step 1: Re-connected MCP server at `https://insights.rsamdio.org/api/mcp`
- [x] Step 2: Verified all 14 tools display green checkmarks and no warning banners
- [x] Step 3: Filled in listing metadata, descriptions, category, and uploaded icon/logo assets
- [x] Step 4: Provided 5 use cases with user story prompts
- [x] Step 5: Filled company and developer profile (Rotaract South Asia MDIO, `https://rsamdio.org`)
- [x] Step 6: Marked Authentication as `None (Public Read-Only)`
- [x] Step 7: Completed Data Handling (0 days retention, stateless, zero PII)
- [x] Step 8: Confirmed test prompts and demo video URL
- [x] Step 9: Confirmed live Privacy Policy and Terms of Service URLs
- [x] Step 10: Attached Reviewer Cover Note from `claude-connector-submission/reviewer-cover-letter.md`
