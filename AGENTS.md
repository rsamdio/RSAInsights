<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rotaract South Asia Analytics Dashboard (Agent Instructions)

Welcome to the **Rotaract South Asia Analytics Dashboard** codebase.

## 1. Primary Navigation Layer
Before making changes or searching the repository, consult **[index.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/index.md)**.
`index.md` is the authoritative index mapping:
- Component authority & directory structure
- Data pipeline architecture & models
- Route index & server endpoints
- Development, ETL, and validation commands
- Project invariants and guardrails

## 2. Authority & Precedence Hierarchy
When sources of information conflict, adhere strictly to this precedence:
1. **Current Source Code & Configuration** (Executable reality)
2. **Executable Behavior & Automated Verification** (`npm run validate-harness`, `npm run build`)
3. **Explicit Repository Invariants & Rules** (Documented in `AGENTS.md` and `index.md`)
4. **Generated Data Payloads** (`data/*.json`, `data/*.csv`)
5. **Domain Skills & Architecture Guides** (`.agents/skills/`)
6. **General Documentation** (`README.md`, comments)
7. **Agent Assumptions** (Lowest precedence; always verify against code)

## 3. Strict Typography Invariant: No Long Em Dashes
**Long em dashes (Unicode \u2014) are strictly forbidden** in all agent-generated content, documentation, comments, commit messages, and UI copy.
- Always use hyphens (`-`), colons (`:`), commas (`,`), or parentheses instead.
- Run `npm run validate-harness` to verify typography and harness integrity before finishing work.

## 4. Specialized Domain Skills
Load domain skills on demand only when relevant:
- **`data-pipeline`** ([.agents/skills/data-pipeline/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/data-pipeline/SKILL.md)): Master Excel parsing, baselines, currency conversion, integer rounding.
- **`ui-standards`** ([.agents/skills/ui-standards/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/ui-standards/SKILL.md)): Vanilla CSS design tokens, column headers, badge copy, compliance notices.
- **`performance-optimization`** ([.agents/skills/performance-optimization/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/performance-optimization/SKILL.md)): Table payload trimming, lazy tab rendering, GA tracking.
- **`agent-maintenance`** ([.agents/skills/agent-maintenance/SKILL.md](file:///Users/zeospec/Dev/Code/rotaractsouthasiadata/.agents/skills/agent-maintenance/SKILL.md)): Harness validation, drift detection, repository indexing.
