// Comprehensive production and local verification script for REST API and MCP endpoints
import https from 'node:https';
import http from 'node:http';

const targetArg = process.env.TEST_URL || process.argv[2] || 'https://insights.rsmda.org';
const prodBase = targetArg.replace(/\/+$/, '');

const isHttps = prodBase.startsWith('https:');
const agent = isHttps
    ? new https.Agent({ keepAlive: true, maxSockets: 10 })
    : new http.Agent({ keepAlive: true, maxSockets: 10 });

console.log('====================================================');
console.log('VERIFICATION TARGET: ' + prodBase);
console.log('====================================================\n');

let passed = 0;
let failed = 0;
const results = [];

async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeout);
            return res;
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}

async function test(category, name, fn) {
    try {
        const detail = await fn();
        console.log(`✔ [${category}] ${name}${detail ? ' -> ' + detail : ''}`);
        passed++;
        results.push({ category, name, status: 'PASS', detail });
    } catch (err) {
        console.error(`❌ [${category}] ${name} -> ERROR: ${err.message}`);
        failed++;
        results.push({ category, name, status: 'FAIL', error: err.message });
    }
}

async function run() {
    // ----------------------------------------------------
    // Category 1: Documentation & Specifications
    // ----------------------------------------------------
    await test('DOCS', 'OpenAPI 3.1 Spec (/openapi.json)', async () => {
        const res = await fetchWithRetry(`${prodBase}/openapi.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.openapi?.startsWith('3.1')) throw new Error(`Unexpected version: ${data.openapi}`);
        const pathCount = Object.keys(data.paths || {}).length;
        const schemaCount = Object.keys(data.components?.schemas || {}).length;
        return `Version ${data.openapi}, Paths: ${pathCount}, Schemas: ${schemaCount}, Primary Server: ${data.servers?.[0]?.url}`;
    });

    await test('DOCS', 'Developer Documentation Portal (/docs)', async () => {
        const res = await fetchWithRetry(`${prodBase}/docs`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text.includes('Rotaract South Asia Analytics')) throw new Error('Missing dashboard title');
        return `Status 200, Content-Type: ${res.headers.get('content-type')}`;
    });

    await test('DOCS', 'Scalar Standalone Documentation UI (/docs.html)', async () => {
        const res = await fetchWithRetry(`${prodBase}/docs.html`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text.includes('@scalar/api-reference')) throw new Error('Missing Scalar bundle');
        return `Status 200, Scalar Reference OK`;
    });

    await test('DOCS', 'OpenAI Apps Challenge Token (/.well-known/openai-apps-challenge)', async () => {
        const res = await fetchWithRetry(`${prodBase}/.well-known/openai-apps-challenge`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = (await res.text()).trim();
        if (!text.includes('ph1AUVZW1yHGibAi2SQ9ICgqLrdDfm_fFaY65gQ9kLo')) throw new Error(`Unexpected token: ${text}`);
        return `Challenge Token Verified: ${text}`;
    });

    await test('DOCS', 'MCP Server Discovery Manifest (/.well-known/mcp-server.json)', async () => {
        const res = await fetchWithRetry(`${prodBase}/.well-known/mcp-server.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const pVer = data.protocolVersion || data.mcpVersion;
        if (pVer !== '2026-07-28') throw new Error(`Expected MCP version 2026-07-28, got ${pVer}`);
        return `MCP Manifest Verified: ${data.name} v${data.version}, protocol: ${pVer}`;
    });

    // ----------------------------------------------------
    // Category 2: REST API Core Endpoints
    // ----------------------------------------------------
    await test('REST', 'GET /api/v1/summary (Overall Dashboard Metrics)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/summary`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const cors = res.headers.get('access-control-allow-origin');
        if (data.overall?.totalClubs !== 2877) throw new Error(`Expected 2877 clubs, got ${data.overall?.totalClubs}`);
        if (data.overall?.totalMembers !== 61277) throw new Error(`Expected 61277 members, got ${data.overall?.totalMembers}`);
        return `Total Clubs: ${data.overall.totalClubs}, Total Members: ${data.overall.totalMembers}, Dues: ₹${data.overall.outstanding.toLocaleString()}, CORS: ${cors}`;
    });

    await test('REST', 'GET /api/v1/zones (All 4 South Asia Zones)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/zones`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.count !== 4) throw new Error(`Expected 4 zones, got ${data.count}`);
        const names = data.zones.map(z => z.zone).join(', ');
        return `Count: ${data.count} (${names})`;
    });

    await test('REST', 'GET /api/v1/zones/5 (Zone Details - Numeric)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/zones/5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.zone !== 'Zone 5') throw new Error(`Expected Zone 5, got ${data.zone}`);
        return `Zone: ${data.zone}, Districts: ${data.districts.length}, Clubs: ${data.stats.totalClubs}, Members: ${data.stats.totalMembers}`;
    });

    await test('REST', 'GET /api/v1/zones/zone-5 (Zone Details - Slug Normalization)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/zones/zone-5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.zone !== 'Zone 5') throw new Error(`Expected Zone 5, got ${data.zone}`);
        const sampleDist = data.districts[0];
        return `Normalized: ${data.zone}, First District: ${sampleDist.district} (DRR: ${sampleDist.leadership?.drr ? 'Active' : 'N/A'})`;
    });

    await test('REST', 'GET /api/v1/districts (All 44 Districts Listing)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/districts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.count !== 44) throw new Error(`Expected 44 districts, got ${data.count}`);
        return `Count: ${data.count} districts`;
    });

    await test('REST', 'GET /api/v1/districts?sortBy=members&sortOrder=desc (Districts Sorted)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/districts?sortBy=members&sortOrder=desc`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const topDist = data.districts[0];
        return `Top District by Members: Dist ${topDist.district} (${topDist.members} members, ${topDist.totalClubs} clubs)`;
    });

    await test('REST', 'GET /api/v1/districts/3000 (District Deep Dive)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/districts/3000`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.district !== '3000') throw new Error(`Expected district 3000, got ${data.district}`);
        return `District ${data.district} (${data.zone}): ${data.stats?.totalClubs} clubs, DRR: ${data.leadership?.drr}, DG: ${data.leadership?.dg}`;
    });

    await test('REST', 'GET /api/v1/districts/3000/clubs (District Clubs Sub-Resource)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/districts/3000/clubs?limit=3`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.district !== '3000') throw new Error(`Expected district 3000, got ${data.district}`);
        return `District 3000 Clubs: ${data.total} total, First: ${data.data[0]?.name}`;
    });

    await test('REST', 'GET /api/v1/clubs?q=Delhi&limit=2 (Club Search)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/clubs?q=Delhi&limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.data || data.data.length === 0) throw new Error('Expected search matches');
        return `Found ${data.total} clubs matching 'Delhi', First: ${data.data[0].name} (Dist ${data.data[0].district})`;
    });

    await test('REST', 'GET /api/v1/clubs?country=Nepal&limit=2 (Country Filter)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/clubs?country=Nepal&limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.data || data.data.length === 0) throw new Error('Expected Nepal clubs');
        return `Found ${data.total} clubs in Nepal, First: ${data.data[0].name} (Dist ${data.data[0].district})`;
    });

    await test('REST', 'GET /api/v1/clubs?sponsorsInteract=true&limit=2 (Interact Sponsors)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/clubs?sponsorsInteract=true&limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.total !== 65) throw new Error(`Expected 65 clubs sponsoring Interact, got ${data.total}`);
        return `Found ${data.total} clubs sponsoring Interact, Sample: ${data.data[0].name} (${data.data[0].sponsoredInteractCount} clubs)`;
    });

    await test('REST', 'GET /api/v1/clubs/8824847 (Universal Club Dossier)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/clubs/8824847`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.id !== 8824847 && data.id !== '8824847') throw new Error(`Expected club 8824847, got ${data.id}`);
        return `Name: ${data.name}, District: ${data.district}, Base: ${data.base}, In Arrears: ${data.isArrears} (₹${data.outstanding}), Missing Officers: ${data.isNoOfficers}`;
    });

    await test('REST', 'GET /api/v1/clubs/8824847/interact (Club Interact Sub-Resource)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/clubs/8824847/interact`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return `Club: ${data.clubName}, Sponsored Interact Count: ${data.sponsoredInteractCount}`;
    });

    await test('REST', 'GET /api/v1/compliance/arrears?limit=2 (Arrears Directory)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/compliance/arrears?limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.total !== 1021) throw new Error(`Expected 1021 arrears clubs, got ${data.total}`);
        return `Total: ${data.total} clubs in arrears, Sample: ${data.data[0].name} (₹${data.data[0].outstandingINR})`;
    });

    await test('REST', 'GET /api/v1/compliance/officers?limit=2 (Missing Officers)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/compliance/officers?limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.total !== 1070) throw new Error(`Expected 1070 missing officer clubs, got ${data.total}`);
        return `Total: ${data.total} clubs with unreported officers, Sample: ${data.data[0].name}`;
    });

    await test('REST', 'GET /api/v1/compliance/dual-risk?limit=2 (Dual Risk: Arrears + Missing Officers)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/compliance/dual-risk?limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.total !== 761) throw new Error(`Expected 761 dual-risk clubs, got ${data.total}`);
        return `Total: ${data.total} dual-risk clubs, Sample: ${data.data[0].name} (Dist ${data.data[0].district}, ₹${data.data[0].outstandingINR})`;
    });

    await test('REST', 'GET /api/v1/compliance/unified?limit=2 (Unified Compliance Issues)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/compliance/unified?limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.data) || !data.pagination) throw new Error('Expected successful unified compliance response');
        return `Total: ${data.pagination.total} compliance issues tracked, Sample: ${data.data[0].name} (${data.data[0].isArrears ? 'Arrears' : 'Missing Officers'})`;
    });

    await test('REST', 'GET /api/v1/interact (Interact Macro Analytics)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/interact`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.overview?.totalInteractClubs !== 8921) throw new Error(`Expected 8921 Interact clubs, got ${data.overview?.totalInteractClubs}`);
        return `Total Interact: ${data.overview.totalInteractClubs}, Rotaract Sponsors: ${data.overview.rotaractClubsSponsoringInteractCount} clubs sponsoring ${data.overview.totalInteractClubsSponsoredByRotaract} Interact clubs`;
    });

    await test('REST', 'GET /api/v1/opportunities/rotary?type=no_rotaract&limit=2 (Rotary Opportunities)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/opportunities/rotary?type=no_rotaract&limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.total !== 3571) throw new Error(`Expected 3571 opportunity clubs, got ${data.total}`);
        return `Total: ${data.total} Rotary clubs without Rotaract sponsorship, Sample: ${data.data[0].name}`;
    });

    await test('REST', 'GET /api/v1/trf?limit=2 (Foundation Giving)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/trf?limit=2`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.total !== 38) throw new Error(`Expected 38 TRF contributing clubs, got ${data.total}`);
        return `Total: ${data.total} clubs contributing, Top Giver: ${data.data[0].name} ($${data.data[0].totalContributionsUSD})`;
    });

    await test('REST', 'GET /api/v1/worldwide (Global Analytics)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/worldwide`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.totalClubs !== 9813) throw new Error(`Expected 9813 worldwide clubs, got ${data.totalClubs}`);
        return `Global Rotaract Clubs: ${data.totalClubs.toLocaleString()}, Global Members: ${data.totalMembers.toLocaleString()}, Interact: ${data.totalInteractClubs.toLocaleString()}`;
    });

    await test('REST', 'GET /api/v1/worldwide?type=district&sortBy=member_growth_pct&limit=3 (Worldwide District Growth)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/worldwide?type=district&sortBy=member_growth_pct&limit=3`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const topDist = data.districts?.[0];
        if (topDist?.district !== '3261') throw new Error(`Expected Rank 1 District 3261, got ${topDist?.district}`);
        return `Top District: Dist ${topDist.district} (Zone ${topDist.zone}) at +${topDist.membersGrowthPct.toFixed(1)}% growth (+${topDist.membersGrowthAbs} members)`;
    });

    await test('REST', 'GET /api/v1/leaderboards (Top Rankings Across Categories)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/leaderboards?limit=5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const topClub = data.largestClubs?.[0];
        if (!topClub) throw new Error('Missing largest clubs leaderboard');
        return `Largest Club: ${topClub.name} (${topClub.members} members), Top TRF: ${data.topTRFClubs?.[0]?.name}`;
    });

    await test('REST', 'GET /api/v1/leaderboards?category=largest_clubs&district=3000 (District Filtered)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/leaderboards?category=largest_clubs&district=3000&limit=3`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.category !== 'largest_clubs') throw new Error(`Expected largest_clubs category, got ${data.category}`);
        const topClub = data.data?.[0];
        return `Category: ${data.category}, Top in Dist 3000: ${topClub?.name} (${topClub?.members} members)`;
    });

    await test('REST', 'GET /api/v1/leaderboards?category=districts_by_growth (District Growth Rankings)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/leaderboards?category=districts_by_growth&limit=3`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return `Top Growing District: Dist ${data.data[0]?.district} (+${data.data[0]?.interactGrowthAbs} Interact clubs)`;
    });

    await test('REST', 'GET /api/v1/leaderboards?category=districts_by_member_growth (Rotaract Member Growth)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/leaderboards?category=districts_by_member_growth&limit=3`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const topDist = data.data?.[0];
        if (topDist?.district !== '3261') throw new Error(`Expected District 3261 as rank 1, got ${topDist?.district}`);
        return `Top Growing District in South Asia: Dist ${topDist.district} (${topDist.zone}) at +${topDist.membersGrowthPct.toFixed(1)}% (+${topDist.membersGrowthAbs} members)`;
    });

    await test('REST', 'GET /api/v1/clubs/new?limit=5 (Newly Chartered Clubs)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/v1/clubs/new?limit=5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.total !== 126) throw new Error(`Expected 126 new clubs, got ${data.total}`);
        return `Total New Clubs: ${data.total}, Sample: ${data.data[0].name} (Dist ${data.data[0].district})`;
    });

    // ----------------------------------------------------
    // Category 3: Model Context Protocol (MCP) Endpoints
    // ----------------------------------------------------
    await test('MCP', 'GET /api/mcp (Server Manifest)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return `Server: ${data.server} v${data.version}, Tools: ${data.tools.length}, Resources: ${data.resources.length}, Prompts: ${data.prompts.length}`;
    });

    await test('MCP', 'POST /api/mcp (JSON-RPC initialize)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'init-1',
                method: 'initialize',
                params: { protocolVersion: '2024-11-05', capabilities: {} }
            })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return `Protocol: ${data.result.protocolVersion}, Server: ${data.result.serverInfo.name} v${data.result.serverInfo.version}`;
    });

    await test('MCP', 'POST /api/mcp (JSON-RPC ping)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 'ping-1', method: 'ping' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return `Ping acknowledged, JSON-RPC id: ${data.id}`;
    });

    await test('MCP', 'POST /api/mcp (JSON-RPC notifications/initialized)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })
        });
        if (res.status !== 204 && res.status !== 200) throw new Error(`Expected HTTP 204 or 200, got ${res.status}`);
        return `Notification handled successfully (HTTP ${res.status})`;
    });

    await test('MCP', 'POST /api/mcp (Invalid JSON Parse Error)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ malformed json: true '
        });
        if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
        const data = await res.json();
        if (data.error?.code !== -32700) throw new Error(`Expected error code -32700, got ${data.error?.code}`);
        return `Correctly returned -32700 parse error on malformed payload`;
    });

    await test('MCP', 'POST /api/mcp (Param Guard: get_club_profile without clubId)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'guard-1',
                method: 'tools/call',
                params: { name: 'get_club_profile', arguments: {} }
            })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.result?.isError) throw new Error('Expected isError=true for missing required clubId');
        return `Guard triggered successfully: ${data.result.content[0].text}`;
    });

    await test('MCP', 'POST /api/mcp (tools/list)', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 'tools-1', method: 'tools/list', params: {} })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        if (data.result.tools.length !== 14) throw new Error(`Expected 14 tools, got ${data.result.tools.length}`);
        for (const tool of data.result.tools) {
            if (!tool.annotations || tool.annotations.readOnlyHint !== true || tool.annotations.destructiveHint !== false || tool.annotations.openWorldHint !== false) {
                throw new Error(`Tool ${tool.name} missing required OpenAI risk annotations (readOnlyHint, destructiveHint, openWorldHint)`);
            }
            if (!tool.outputSchema) {
                throw new Error(`Tool ${tool.name} missing outputSchema definition`);
            }
        }
        const toolNames = data.result.tools.map(t => t.name).join(', ');
        return `Registered ${data.result.tools.length} Tools with valid annotations & outputSchema: [${toolNames}]`;
    });

    // Test All 14 MCP Tools Individually
    const mcpToolTests = [
        { name: 'get_summary', args: { zone: 'Zone 5' }, verify: d => `Zone 5 Clubs: ${d.stats?.totalClubs}, Members: ${d.stats?.totalMembers}` },
        { name: 'get_leaderboards', args: { category: 'largest_clubs', limit: 3 }, verify: d => `Top Club: ${d.data?.[0]?.name} (${d.data?.[0]?.members} members)` },
        { name: 'get_districts', args: { sortBy: 'totalClubs', sortOrder: 'desc' }, verify: d => `Count: ${d.count} districts, Top: Dist ${d.districts[0]?.district} (${d.districts[0]?.totalClubs} clubs)` },
        { name: 'search_clubs', args: { query: 'Delhi', limit: 2 }, verify: d => `Matched: ${d.total} clubs, First: ${d.data[0]?.name}` },
        { name: 'get_club_profile', args: { clubId: '8824847' }, verify: d => `Club: ${d.name}, District: ${d.district}, Outstanding: ₹${d.outstanding}` },
        { name: 'get_district_insights', args: { district: '3000' }, verify: d => `District: ${d.district}, Zone: ${d.zone}, Clubs: ${d.stats?.totalClubs}, DRR: ${d.leadership?.drr}` },
        { name: 'get_zone_summary', args: { zone: 'Zone 5' }, verify: d => `Zone: ${d.zone}, Districts: ${d.districts.length}, Clubs: ${d.stats?.totalClubs}` },
        { name: 'get_new_clubs', args: { limit: 3 }, verify: d => `New Clubs Count: ${d.total}, Sample: ${d.data[0]?.name}` },
        { name: 'find_compliance_risks', args: { riskType: 'arrears', district: '3000', limit: 2 }, verify: d => `Arrears in Dist 3000: ${d.total} clubs, Sample: ${d.data[0]?.name}` },
        { name: 'find_dual_risk_clubs', args: { limit: 3 }, verify: d => `Dual Risk Clubs: ${d.total}, Sample: ${d.data[0]?.name}` },
        { name: 'get_interact_analytics', args: {}, verify: d => `Interact Clubs: ${d.overview?.totalInteractClubs}, Sponsored by Rotaract: ${d.overview?.totalInteractClubsSponsoredByRotaract}` },
        { name: 'find_rotary_opportunities', args: { opportunityType: 'no_rotaract', district: '3000', limit: 2 }, verify: d => `Opportunities in Dist 3000: ${d.total} clubs, Sample: ${d.data[0]?.name}` },
        { name: 'get_foundation_giving', args: { limit: 3 }, verify: d => `Total Donors: ${d.total}, Top Club: ${d.data[0]?.name} ($${d.data[0]?.totalContributionsUSD})` },
        { name: 'get_worldwide_rankings', args: { type: 'district', sortBy: 'member_growth_pct', limit: 3 }, verify: d => `Rank 1 District: Dist ${d.districts?.[0]?.district} (+${d.districts?.[0]?.membersGrowthPct.toFixed(1)}% growth)` }
    ];

    for (const tool of mcpToolTests) {
        await test('MCP-TOOL', `tools/call: ${tool.name}`, async () => {
            const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: `call-${tool.name}`,
                    method: 'tools/call',
                    params: { name: tool.name, arguments: tool.args }
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            if (!data.result.structuredContent) throw new Error('Missing structuredContent in tool result');
            const parsed = JSON.parse(data.result.content[0].text);
            return tool.verify(parsed);
        });
    }

    // Test All 8 MCP Resources
    await test('MCP-RESOURCE', 'resources/list', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 'res-list', method: 'resources/list', params: {} })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        if (data.result.resources.length !== 8) throw new Error(`Expected 8 resources, got ${data.result.resources.length}`);
        return `Registered ${data.result.resources.length} Resources: [${data.result.resources.map(r => r.uri).join(', ')}]`;
    });

    const mcpResources = [
        'rotaract://summary',
        'rotaract://leaderboards',
        'rotaract://new-clubs',
        'rotaract://interact',
        'rotaract://worldwide',
        'rotaract://zones',
        'rotaract://districts',
        'rotaract://dual-risk'
    ];

    for (const uri of mcpResources) {
        await test('MCP-RESOURCE', `resources/read: ${uri}`, async () => {
            const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: `read-${uri}`,
                    method: 'resources/read',
                    params: { uri }
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            const content = JSON.parse(data.result.contents[0].text);
            const summaryDetail = content.overall
                ? `Overall Clubs: ${content.overall.totalClubs}`
                : (content.totalClubs
                    ? `Total: ${content.totalClubs}`
                    : `Items: ${content.length || Object.keys(content).length}`);
            return `URI: ${uri}, Content: ${summaryDetail}`;
        });
    }

    // Test All 4 MCP Prompts
    await test('MCP-PROMPT', 'prompts/list', async () => {
        const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 'prompt-1', method: 'prompts/list', params: {} })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        if (data.result.prompts.length !== 4) throw new Error(`Expected 4 prompts, got ${data.result.prompts.length}`);
        return `Registered ${data.result.prompts.length} Prompts: [${data.result.prompts.map(p => p.name).join(', ')}]`;
    });

    for (const promptName of ['audit_district_compliance', 'sponsorship_opportunity_report', 'zone_performance_comparison', 'club_rankings_dossier']) {
        await test('MCP-PROMPT', `prompts/get: ${promptName}`, async () => {
            const args = promptName === 'zone_performance_comparison' ? { zone: 'Zone 5' } : { district: '3000' };
            const res = await fetchWithRetry(`${prodBase}/api/mcp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: `pget-${promptName}`,
                    method: 'prompts/get',
                    params: { name: promptName, arguments: args }
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            const desc = data.result.description;
            const msgCount = data.result.messages?.length;
            return `Prompt '${promptName}': ${desc} (${msgCount} message template generated)`;
        });
    }

    console.log('\n====================================================');
    console.log('VERIFICATION COMPLETED');
    console.log(`Passed: ${passed} / ${passed + failed}`);
    console.log(`Failed: ${failed}`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
}

run().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
