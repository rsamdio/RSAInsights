# Project Context: Rotaract South Asia Analytics Dashboard

## Tech Stack Rules
- **Frontend Stack:** HTML, Vanilla Javascript, and Vanilla CSS. No modern component frameworks (e.g., React, Vue, Svelte) unless explicitly migrating.
- **Charts:** Chart.js for all visualizations. Prioritize Doughnut and Bar charts based on categorical data sizes. Keep tooltips and legends enabled.
- **Data Tables:** Grid.js. Ensure `white-space: normal` is applied to `.gridjs-th` so column headers do not truncate.
- **UI Libraries:** TomSelect for multi-select dropdowns.

## Design Aesthetics
- **Colors:** Maintain a vibrant, professional BI dashboard color palette. Primary chart colors: Blue (`#1a73e8`), Green (`#1e8e3e`), Red (`#d93025`). When a chart segment is unselected during cross-filtering, aggressively dim the unselected segments (e.g., 0.1 opacity) so the selected segment visually pops.
- **Layout:** Mobile-first layout using CSS Grid (`.charts-grid`, `.metrics-grid`). Desktop layouts typically have 2 or 3 columns, which strictly collapse to a 1-column `1fr` stack on mobile devices. Always test `@media (max-width: 768px)` rules by placing them at the absolute bottom of `styles.css`.

## Data Pipeline Rules
- The dashboard is statically generated. The underlying Javascript engine (`app.js`) fetches pre-aggregated JSON payloads (`dashboard_summary.json`, `unified_issues.json`, etc.).
- When adding new metrics or drill-down capabilities, update `scripts/generate_dashboard_data.js` first to extract the data from the raw Excel sheets, map it appropriately, and export it into a unified JSON file.
- The Javascript engine (`app.js`) must apply strict type checking (`Number()`, `String()`) to incoming raw data mapped to tables to prevent Grid.js internal sorting from crashing with `TypeError: Cannot read properties of undefined (reading 'length')`.
