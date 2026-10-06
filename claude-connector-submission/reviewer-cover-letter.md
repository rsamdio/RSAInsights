# Anthropic Claude Directory Reviewer Notes

Dear Anthropic Review Team,

We are submitting the **Rotaract Insights** connector for inclusion in the **Claude Connectors Directory**. Below is an overview of the organization, security posture, and testing instructions to assist your evaluation.

---

## 1. Organization & Background
- **Publishing Organization:** Rotaract South Asia Multi-District Information Organisation (RSAMDIO)
- **Organization Website:** `https://rsamdio.org`
- **Application Portal:** `https://insights.rsamdio.org`
- **Developer Name:** Rotaract South Asia MDIO
- **Contact:** `info@rsamdio.org` / `insights@rsamdio.org`

RSAMDIO is a recognized regional Rotary Multi-District Information Organisation serving Rotary International Zones 4, 5, 6, and 7 (India, Nepal, and Sri Lanka), covering 44 Rotary districts, over 2,800 Rotaract clubs, and tens of thousands of youth leaders.

---

## 2. Server Technical Architecture
- **Protocol:** Model Context Protocol (MCP standard 2024-11-05 and 2026-07-28 auto-negotiation)
- **Transport:** Streamable HTTP (JSON-RPC 2.0 over HTTPS)
- **Production Endpoint:** `https://insights.rsamdio.org/api/mcp`
- **Fallback SSE Endpoint:** `https://insights.rsamdio.org/sse`
- **Infrastructure:** Next.js runtime hosted on Netlify Edge with Cloudflare CDN fronting TLS 1.3 termination and DDoS protection.
- **Server Health:** Verified 99.9% uptime with average tool response latencies under 60ms.

---

## 3. Security, Safety, and Privacy Guarantees
- **Strictly Read-Only:** All 14 tools are declared with `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, and `openWorldHint: false`. The connector cannot modify any records.
- **Zero Data Retention:** Query parameters are handled in-memory and discarded immediately upon JSON-RPC response delivery. No chat messages, prompt contents, or user parameters are ever persisted or stored.
- **Zero PII Exposure:** The dataset consists solely of public institutional records (club names, charter IDs, district alignments, and official leadership directory titles like DG, DRR, DRC). Personal contact details of individual members (such as personal mobile numbers, home addresses, or private emails) are never collected or displayed.
- **No Authentication Required:** The data is public under the Open Database License (ODbL). No OAuth credentials or API keys are required from Claude users.
- **Privacy Policy & Terms:** Full compliance documentation is published at:
  - Privacy Policy: `https://insights.rsamdio.org/privacy`
  - Terms of Service: `https://insights.rsamdio.org/terms`

---

## 4. Verification Suite & Test Prompts
To test this connector in Claude:
1. **Summary Test:** `"Show the executive summary KPIs for Rotaract in South Asia."`
   - *Verifies `get_summary`*
2. **District Test:** `"Give me an analytical breakdown of Rotary District 3191."`
   - *Verifies `get_district_insights`*
3. **Risk Identification Test:** `"Which Rotaract clubs in Zone 5 have unpaid dues over $75 USD and are missing officer reports?"`
   - *Verifies `find_dual_risk_clubs`*
4. **Worldwide Test:** `"What are the top 5 largest Rotaract clubs worldwide?"`
   - *Verifies `get_worldwide_rankings`*

- **Walkthrough Video:** `https://kommodo.ai/recordings/9MjZFB2CtgkObgU2u7WW`
- **Interactive Documentation:** `https://insights.rsamdio.org/docs`

We appreciate your review and look forward to offering Rotaract Insights to Claude users worldwide.

Sincerely,  
**Rotaract South Asia MDIO Technology Team**  
`https://rsamdio.org`
