---
name: agent-maintenance
description: >-
  Use this skill when validating agent harness integrity, checking documentation freshness, detecting drift, adding new skills, or updating index.md.
---

# Agent Harness Maintenance & Drift Prevention

This skill provides step-by-step procedures for keeping the agent harness, documentation, and repository index fully synchronized with code reality.

## 1. Core Maintenance Philosophy

- **Code is the Source of Truth:** Never adjust code to match stale documentation; always update documentation to reflect actual, tested code behavior.
- **Progressive Disclosure:** Keep `AGENTS.md` and `index.md` concise. Move domain-specific details into `.agents/skills/`.
- **Zero Forbidden Characters:** Never introduce long em dashes (Unicode \u2014). Use hyphens (`-`), colons (`:`), commas (`,`), or parentheses.
- **Machine Verification:** All file paths, data files, and typography rules must pass automated verification.

## 2. When to Update the Agent Harness

Update the agent harness whenever:
1. A new route, API endpoint, or major component is added, removed, or renamed.
2. The data pipeline schema or file output changes in `scripts/generate_dashboard_data.js` or `data/`.
3. New dependencies, tools, or configurations are introduced in `package.json` or `next.config.mjs`.
4. A new development workflow or domain skill is created.
5. Caching, performance, or styling invariants are modified.

## 3. Maintenance Procedures

### Step A: Detect Structural & Architectural Changes
Run git status and inspect modified directories:
```bash
git status -s
```
Identify any new files in `app/`, `components/`, `lib/`, `scripts/`, or `data/`.

### Step B: Update `index.md`
If new files or architectural boundaries were introduced:
1. Update Section 2 ("Directory & Module Authority Map") with the new path and authority scope.
2. If routes changed, update the route table.
3. If new skills were added, register them in Section 7 ("Domain Skills & Workflows Directory").

### Step C: Run Automated Harness Validation
Execute the standalone validator:
```bash
npm run validate-harness
```
This script checks:
- All file paths referenced in markdown documentation exist on disk.
- All JSON and CSV data files exist and are valid.
- No forbidden long em dashes (Unicode \u2014) exist in any documentation, components, or scripts.
- Package scripts and dependencies are intact.

### Step D: Check for Documentation Drift
Compare implementation constants with documentation:
- Check `CURRENT_EXCHANGE_RATE` and `DATA_AS_OF_DATE` in `scripts/generate_dashboard_data.js`.
- Check cache headers in `app/api/filters/route.js`.
- Check active zones and excluded districts in `scripts/generate_dashboard_data.js`.

### Step E: Verify Build Integrity
Run Next.js build to confirm static generation and TypeScript/ESLint validity:
```bash
npm run build
```
