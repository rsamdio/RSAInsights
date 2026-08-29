---
name: performance-optimization
description: >-
  Use this skill when performing performance audits, payload trimming, lazy tab rendering, bundle optimizations, or Google Analytics tracking configurations.
---

# Performance & Analytics Architecture

This skill outlines optimization patterns and analytics standards for the dashboard.

## Payload Trimming & Data Transfer

- **Server-to-Client Pruning:** When Server Components pass array data into Client Component tables (`GlobalTables`, `DistrictTable`), map and trim rows to only the fields needed by the UI.
  - Keeps initial HTML/Flight payloads under 600 KB.
- **O(1) Hash Map Lookups:** Use `getClubMap()` in `lib/api.js` for instant hash map lookups on `/club/[clubId]` instead of scanning `all_clubs.json`.

## Lazy Tab & Table Mounting

- **Lazy Tab Rendering:** Tabs in `components/ui/Tabs.js` and `components/tables/GlobalTables.js` support render functions:
  ```javascript
  { label: 'District Summary', content: () => <DataTable data={...} columns={...} /> }
  ```
  Mounts only the active tab in the DOM, preventing simultaneous instantiation of 8 TanStack table models.

## Font Delivery & Compiler Optimizations

- **Self-Hosted Typography:** Use `next/font/google` (`Inter`) in `app/layout.js` with `font-display: swap` to eliminate external render-blocking network requests.
- **Package Tree-Shaking:** `next.config.mjs` configures `optimizePackageImports` for `chart.js`, `react-chartjs-2`, `react-select`, `@tanstack/react-table`, and `framer-motion`.

## Google Analytics Tracking Standards

- **Initialization:** Use `strategy="afterInteractive"` on Google Tag Manager in `app/layout.js` to ensure 100% visit and bounce capture.
- **App Router Client-Side Navigation Tracking:** Real-time route tracking is handled by `components/ui/Analytics.js` (`usePathname`, `useSearchParams`), automatically firing `gtag('config', ...)` on every client-side page transition and filter query change.
