---
name: performance-optimization
description: >-
  Use this skill when performing performance audits, payload trimming, lazy tab rendering, bundle optimizations, or Google Analytics tracking configurations.
---

# Performance & Analytics Architecture

This skill outlines optimization patterns and analytics standards for the dashboard.

## Payload Trimming & Data Transfer

- **Tab-on-Demand Data Loading:** Secondary tabs in `GlobalTables.js` (Arrears, Officers, Rotary w/o Rotaract, Rotary w/o Interact, New Clubs, TRF, All Clubs Roster) fetch on demand via `/api/table-data/[tab]` with client-side caching.
  - Keeps initial HTML payload under 600 KB (down from 5.8 MB), a 90% reduction.
  - Initial gzipped transfer drops to ~45 KB.
- **TopCharts Leaderboard Slicing:** Top charts UI limit selector supports up to 100 items. Server components pass pre-sorted top 100 slices rather than full rosters.
- **O(1) Hash Map Lookups:** Use `getClubMap()` in `lib/api.js` for instant hash map lookups on `/club/[clubId]` instead of scanning `all_clubs.json`.

## Cloudflare Proxy & Netlify Edge Caching

- **Edge Cache Headers:** API routes and table data endpoints serve `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` with `Netlify-Vary: query`.
- **Cloudflare Synergy:** Cloudflare proxy caches responses across 300+ global edge nodes, serving repeat requests in under 25ms and reducing serverless function invocations by over 90%.

## Lazy Tab & Table Mounting

- **Lazy Tab Rendering:** Tabs in `components/ui/Tabs.js` and `components/tables/GlobalTables.js` support render functions:
  ```javascript
  { label: 'District Summary', content: () => <DataTable data={...} columns={...} /> }
  ```
  Mounts only the active tab in the DOM, preventing simultaneous instantiation of 8 TanStack table models.

## Font Delivery & Compiler Optimizations

- **Self-Hosted Typography:** Use `next/font/google` (`Inter`) in `app/layout.js` with `font-display: swap` to eliminate external render-blocking network requests.
- **Package Tree-Shaking:** `next.config.mjs` configures `optimizePackageImports` for `chart.js`, `react-chartjs-2`, `react-select`, and `@tanstack/react-table`.

## Google Analytics Tracking Standards

- **Initialization:** Use `strategy="afterInteractive"` on Google Tag Manager in `app/layout.js` to ensure 100% visit and bounce capture.
- **App Router Client-Side Navigation Tracking:** Real-time route tracking is handled by `components/ui/Analytics.js` (`usePathname`, `useSearchParams`), automatically firing `gtag('config', ...)` on every client-side page transition and filter query change.
