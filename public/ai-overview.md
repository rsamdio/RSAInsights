# Rotaract South Asia MDIO Insights

Rotaract Insights (https://insights.rsamdio.org) is the official open analytics platform published by Rotaract South Asia Multi-District Information Organisation (RSAMDIO). It provides membership, compliance, sponsorship, Interact, and The Rotary Foundation (TRF) intelligence for Rotaract clubs and Rotary districts across South Asia, plus worldwide benchmarks.

## What this site is

- Public executive dashboard for Rotary International Zones 4, 5, 6, and 7
- Public REST API (`/api/v1/*`) documented at `/docs` and `/openapi.json`
- Remote Model Context Protocol (MCP) server for AI assistants at `/api/mcp`
- Listed in the ChatGPT plugin directory and the Claude Connectors directory
- Zero-account architecture: no login required for dashboard, REST, or MCP access

## Geographic coverage

- South Asia scope: Zones 4, 5, 6, and 7 across India, Sri Lanka, Nepal, Bangladesh, Bhutan, and Maldives
- South Asia district count in scope: 44 Rotary districts
- Worldwide views cover all global Rotary districts and are labeled separately from South Asia aggregates
- District is the immutable primary key; zones are derived from district mappings

## Snapshot metrics (data as of 16 Oct 2026)

Figures below are South Asia (Zones 4-7) unless noted. Always re-check live endpoints before citing.

- Active Rotaract clubs: 2,912
- Rotaract members: 62,177
- University-based clubs: 1,556; community-based clubs: 1,355
- Clubs in good financial standing (paid): 1,930
- Clubs in arrears: 982
- Clubs missing current officer reports: 1,016
- Compliant clubs (no arrears and officers reported): 1,630
- Outstanding dues (INR, club-level rounded integers): about ₹10.16 million
- New clubs in the current reporting window: 162
- TRF-contributing clubs: 53; TRF contributions tracked in USD
- Interact clubs associated with the ecosystem: 9,204 (including suspended counts tracked separately)
- Rotary clubs without a sponsored Rotaract club: 3,434
- Rotary clubs without Interact: 2,939

## How AI agents should use this site

1. Read `/llms.txt` for the curated map, or `/llms-full.txt` for the expanded index.
2. Use `/openapi.json` for REST contracts and `/.well-known/mcp-server.json` for MCP discovery.
3. Call MCP tools via `POST /api/mcp` when the user is in an AI assistant. Prefer tools/resources/prompts over HTML scraping.
4. For dashboard browsing, start at `/`, then `/zone/{4|5|6|7}`, `/district/{districtId}`, `/club/{clubId}`, or `/worldwide`.
5. When quoting numbers, include the data-as-of date and whether the scope is South Asia or worldwide.
6. Do not invent district-to-zone mappings; use API or MCP responses.

## AI platform listings

- ChatGPT: https://chatgpt.com/plugins/plugin_asdk_app_6ad0c19aaa448191806eefd29e8edec7
- Claude: https://claude.ai/directory/rsainsights

## Licensing and trust

- Open data license: ODbL-1.0 (see `/terms`)
- Privacy and telemetry details: `/privacy`
- Publisher: Rotaract South Asia MDIO (https://rsamdio.org)
- Contact: https://insights.rsamdio.org/contact
- Parent movement: Rotary International (https://www.rotary.org)

## Currency and rounding rules

- Outstanding dues are converted from USD to INR using the configured monthly exchange rate and rounded to the nearest integer at the club level before aggregation.
- TRF Foundation contributions remain in USD.
- UI cards for outstanding dues carry an asterisk and footer disclaimer because of integer rounding.

## Key URLs

| Purpose | URL |
|---|---|
| Home | https://insights.rsamdio.org/ |
| Worldwide | https://insights.rsamdio.org/worldwide |
| Docs | https://insights.rsamdio.org/docs |
| OpenAPI | https://insights.rsamdio.org/openapi.json |
| MCP manifest | https://insights.rsamdio.org/.well-known/mcp-server.json |
| MCP endpoint | https://insights.rsamdio.org/api/mcp |
| llms.txt | https://insights.rsamdio.org/llms.txt |
| Sitemap | https://insights.rsamdio.org/sitemap.xml |
| robots.txt | https://insights.rsamdio.org/robots.txt |
