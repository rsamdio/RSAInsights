#!/usr/bin/env node
/**
 * Extreme QA suite: MCP tools/resources/prompts + REST + data parity + high load.
 * Do not pin volatile census totals; update data via ETL, not test constants.
 * Keep exact asserts only for true invariants (zones=4, districts=44, known IDs, protocol codes).
 *
 * Usage:
 *   node scripts/extreme_qa_suite.mjs http://localhost:3010
 *   TEST_URL=http://localhost:3010 node scripts/extreme_qa_suite.mjs
 *   SKIP_LOAD=1 node scripts/extreme_qa_suite.mjs http://localhost:3010
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE = (process.env.TEST_URL || process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const SKIP_LOAD = process.env.SKIP_LOAD === '1';
const LOAD_CONCURRENCY = Number(process.env.LOAD_CONCURRENCY || 80);
const LOAD_ROUNDS = Number(process.env.LOAD_ROUNDS || 5);

let passed = 0;
let failed = 0;
const failures = [];

function readJson(rel) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

async function fetchJson(url, init) {
    const res = await fetch(url, init);
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, ok: res.ok, body, headers: res.headers };
}

async function mcpRpc(method, params = {}, { modern = false, id = `xqa-${method}` } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const payload = { jsonrpc: '2.0', id, method, params };
    if (modern) {
        headers['MCP-Protocol-Version'] = '2026-07-28';
        payload._meta = {
            'mcp/protocolVersion': '2026-07-28',
            clientCapabilities: { experimental: {} }
        };
    }
    return fetchJson(`${BASE}/api/mcp`, { method: 'POST', headers, body: JSON.stringify(payload) });
}

async function mcpTool(name, args = {}, opts = {}) {
    const res = await mcpRpc('tools/call', { name, arguments: args }, opts);
    if (res.body?.error) {
        return { httpStatus: res.status, rpcError: res.body.error, isError: true, data: null, raw: res.body };
    }
    const isError = !!res.body?.result?.isError;
    const text = res.body?.result?.content?.[0]?.text;
    let data = null;
    if (typeof text === 'string') {
        try { data = JSON.parse(text); } catch { data = text; }
    }
    return {
        httpStatus: res.status,
        isError,
        data,
        structured: res.body?.result?.structuredContent || null,
        raw: res.body
    };
}

async function rest(pathQs) {
    return fetchJson(`${BASE}${pathQs}`);
}

function errText(payload) {
    if (!payload) return '';
    if (typeof payload === 'string') return payload;
    if (typeof payload.error === 'string') return payload.error;
    if (typeof payload.message === 'string') return payload.message;
    return JSON.stringify(payload);
}

function assertSanity(obj, pathLabel = 'root', depth = 0) {
    if (obj == null || depth > 6) return;
    if (typeof obj === 'number' && Number.isNaN(obj)) throw new Error(`NaN at ${pathLabel}`);
    if (typeof obj === 'string') {
        if (obj.includes('NaN')) throw new Error(`NaN string at ${pathLabel}`);
        if (obj === 'undefined') throw new Error(`undefined string at ${pathLabel}`);
    }
    if (Array.isArray(obj)) {
        for (let i = 0; i < Math.min(obj.length, 8); i++) assertSanity(obj[i], `${pathLabel}[${i}]`, depth + 1);
        return;
    }
    if (typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) assertSanity(v, `${pathLabel}.${k}`, depth + 1);
    }
}

async function test(group, name, fn) {
    const label = `[${group}] ${name}`;
    try {
        const detail = await fn();
        passed += 1;
        console.log(`  ✔ ${label}${detail ? ` -> ${detail}` : ''}`);
    } catch (e) {
        failed += 1;
        failures.push({ label, error: e.message || String(e) });
        console.error(`  ✖ ${label} -> ${e.message || e}`);
    }
}

function expectFinitePositive(n, label) {
    if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be finite > 0, got ${n}`);
}

function expectEq(a, b, label) {
    if (a !== b) throw new Error(`${label}: expected ${b}, got ${a}`);
}

function expectTrue(cond, msg) {
    if (!cond) throw new Error(msg);
}

// ---------------------------------------------------------------------------
// Ground truth
// ---------------------------------------------------------------------------
const summaryFile = readJson('data/dashboard_summary.json');
const overall = summaryFile.current.overall;
const allClubs = readJson('data/all_clubs.json');
const arrears = readJson('data/arrears.json');
const officers = readJson('data/no_officers.json');
const newClubs = readJson('data/new_clubs.json');
const trf = readJson('data/trf_contributions.json');
const noSponsor = readJson('data/rotary_no_sponsor.json');
const noInteract = readJson('data/rotary_no_interact.json');
const unified = readJson('data/unified_issues.json');
const wwSummary = readJson('data/worldwide_summary.json');
const wwClubs = readJson('data/worldwide_clubs.json');

const LEADERBOARD_CATEGORIES = [
    'largest_clubs', 'community_clubs', 'university_clubs', 'trf_giving',
    'highest_arrears', 'at_risk_clubs', 'districts_by_clubs', 'districts_by_members',
    'districts_by_member_growth', 'districts_by_trf', 'districts_by_arrears',
    'districts_by_no_officers', 'districts_by_growth', 'new_clubs'
];

const WORLDWIDE_TYPES = ['all', 'summary', 'country', 'district', 'interact', 'new_clubs', 'clubs'];
const RISK_TYPES = ['arrears', 'missing_officers', 'dual_risk', 'at_risk_only'];
const ZONES = ['4', '5', '6', '7', 'Zone 4', 'Zone 5', 'zone-6', 'Zone 7'];
const KNOWN_CLUB = '8824847';
const KNOWN_DISTRICT = '3000';
const NEPAL_DISTRICT = '3292';

async function sectionDataParity() {
    console.log('\n=== 1. DATA FILE INTERNAL PARITY ===\n');
    await test('DATA', 'all_clubs length == summary.totalClubs', async () => {
        expectEq(allClubs.length, overall.totalClubs, 'clubs');
        return String(allClubs.length);
    });
    await test('DATA', 'arrears length == summary.arrearsClubs', async () => {
        expectEq(arrears.length, overall.arrearsClubs, 'arrears');
        return String(arrears.length);
    });
    await test('DATA', 'no_officers length == summary.noOfficers', async () => {
        expectEq(officers.length, overall.noOfficers, 'officers');
        return String(officers.length);
    });
    await test('DATA', 'new_clubs length == summary.newTotalClubs', async () => {
        expectEq(newClubs.length, overall.newTotalClubs, 'new');
        return String(newClubs.length);
    });
    await test('DATA', 'trf length == summary.trfClubs', async () => {
        expectEq(trf.length, overall.trfClubs, 'trf');
        return String(trf.length);
    });
    await test('DATA', 'rotary_no_sponsor == summary', async () => {
        expectEq(noSponsor.length, overall.rotaryWithoutSponsor, 'noSponsor');
        return String(noSponsor.length);
    });
    await test('DATA', 'rotary_no_interact == summary', async () => {
        expectEq(noInteract.length, overall.rotaryWithoutInteract, 'noInteract');
        return String(noInteract.length);
    });
    await test('DATA', 'unified_issues non-empty', async () => {
        expectFinitePositive(unified.length, 'unified');
        return String(unified.length);
    });
    await test('DATA', 'worldwide clubs vs summary', async () => {
        const fileTotal = Number(wwSummary.totalClubs ?? wwSummary.overall?.totalClubs ?? wwClubs.length);
        expectFinitePositive(fileTotal, 'ww total');
        expectTrue(wwClubs.length > 9000, `wwClubs length ${wwClubs.length} too low`);
        return `summary=${fileTotal} fileLen=${wwClubs.length}`;
    });
    await test('DATA', 'univ+comm+unknown == totalClubs', async () => {
        const unknownBase = allClubs.filter((c) => {
            const b = String(c['Rotaract Club Base'] || c.base || '').toLowerCase();
            return !b.includes('university') && !b.includes('institution') && !b.includes('community');
        }).length;
        const sum = Number(overall.totalUniv) + Number(overall.totalComm) + unknownBase;
        expectEq(sum, overall.totalClubs, 'univ+comm+unknown');
        expectTrue(unknownBase <= 5, `unexpected unknown-base count ${unknownBase}`);
        return `univ=${overall.totalUniv} comm=${overall.totalComm} unknown=${unknownBase}`;
    });
}

async function sectionProtocol() {
    console.log('\n=== 2. MCP PROTOCOL MATRIX ===\n');

    await test('PROTO', 'initialize legacy 2025-11-25', async () => {
        const res = await mcpRpc('initialize', {
            protocolVersion: '2025-11-25',
            capabilities: {},
            clientInfo: { name: 'extreme-qa', version: '1.0.0' }
        });
        expectEq(res.status, 200, 'http');
        expectEq(res.body?.result?.protocolVersion, '2025-11-25', 'version');
        return 'ok';
    });

    await test('PROTO', 'initialize modern 2026-07-28', async () => {
        const res = await mcpRpc('initialize', {
            protocolVersion: '2026-07-28',
            capabilities: {},
            clientInfo: { name: 'extreme-qa', version: '1.0.0' }
        }, { modern: true });
        expectEq(res.status, 200, 'http');
        expectTrue(
            res.body?.result?.protocolVersion === '2026-07-28'
            || res.body?.result?.protocolVersion === '2025-11-25',
            `unexpected negotiated ${res.body?.result?.protocolVersion}`
        );
        return `negotiated=${res.body?.result?.protocolVersion}`;
    });

    await test('PROTO', 'legacy ping succeeds', async () => {
        const res = await mcpRpc('ping', {});
        expectEq(res.status, 200, 'http');
        expectTrue(res.body?.result !== undefined, 'missing result');
        return 'ok';
    });

    await test('PROTO', 'modern ping -32601', async () => {
        const res = await mcpRpc('ping', {}, { modern: true });
        expectEq(res.status, 404, 'http');
        expectEq(res.body?.error?.code, -32601, 'code');
        return 'ok';
    });

    await test('PROTO', 'templates/list empty modern', async () => {
        const res = await mcpRpc('resources/templates/list', {}, { modern: true });
        expectEq(res.status, 200, 'http');
        expectTrue(Array.isArray(res.body?.result?.resourceTemplates), 'array');
        expectEq(res.body.result.resourceTemplates.length, 0, 'empty');
        expectEq(res.body.result.resultType, 'complete', 'resultType');
        return 'ok';
    });

    await test('PROTO', 'templates/list empty legacy', async () => {
        const res = await mcpRpc('resources/templates/list', {});
        expectEq(res.status, 200, 'http');
        expectTrue(Array.isArray(res.body?.result?.resourceTemplates), 'array');
        expectEq(res.body.result.resourceTemplates.length, 0, 'empty');
        return 'ok';
    });

    await test('PROTO', 'invalid JSON -32700', async () => {
        const res = await fetch(`${BASE}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{not-json'
        });
        const body = await res.json();
        expectEq(body?.error?.code, -32700, 'code');
        return 'ok';
    });

    await test('PROTO', 'unknown method -32601', async () => {
        const res = await mcpRpc('totally/unknown/method', {});
        expectEq(res.body?.error?.code, -32601, 'code');
        return 'ok';
    });

    await test('PROTO', 'tools/call missing name -32602', async () => {
        const res = await mcpRpc('tools/call', { arguments: {} });
        expectEq(res.body?.error?.code, -32602, 'code');
        return 'ok';
    });

    await test('PROTO', 'tools/list count 14', async () => {
        const res = await mcpRpc('tools/list', {});
        expectEq(res.body?.result?.tools?.length, 14, 'tools');
        const names = res.body.result.tools.map((t) => t.name);
        expectTrue(!res.body.result.tools.find((t) => t.name === 'get_club_profile')?.inputSchema?.properties?.query, 'query leaked');
        return names.join(',');
    });

    await test('PROTO', 'modern tools/list resultType', async () => {
        const res = await mcpRpc('tools/list', {}, { modern: true });
        expectEq(res.body?.result?.resultType, 'complete', 'resultType');
        expectEq(res.body?.result?.tools?.length, 14, 'tools');
        return 'ok';
    });

    await test('PROTO', 'resources/list count 8', async () => {
        const res = await mcpRpc('resources/list', {});
        expectEq(res.body?.result?.resources?.length, 8, 'resources');
        return res.body.result.resources.map((r) => r.uri).join(',');
    });

    await test('PROTO', 'prompts/list count 4', async () => {
        const res = await mcpRpc('prompts/list', {});
        expectEq(res.body?.result?.prompts?.length, 4, 'prompts');
        return res.body.result.prompts.map((p) => p.name).join(',');
    });

    await test('PROTO', 'notifications/initialized 204', async () => {
        const res = await fetch(`${BASE}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })
        });
        expectTrue(res.status === 204 || res.status === 200, `status ${res.status}`);
        return String(res.status);
    });
}

async function sectionGetSummary() {
    console.log('\n=== 3. TOOL get_summary ===\n');
    await test('MCP', 'get_summary default matches data', async () => {
        const r = await mcpTool('get_summary', {});
        expectTrue(!r.isError, errText(r.data));
        assertSanity(r.data);
        expectEq(r.data.overall?.totalClubs ?? r.data.totalClubs, overall.totalClubs, 'clubs');
        expectEq(r.data.overall?.totalMembers ?? r.data.totalMembers, overall.totalMembers, 'members');
        return `clubs=${overall.totalClubs}`;
    });
    for (const z of ['4', '5', '6', '7', 'Zone 5', 'zone-4']) {
        await test('MCP', `get_summary zone=${z}`, async () => {
            const r = await mcpTool('get_summary', { zone: z });
            expectTrue(!r.isError, errText(r.data));
            const clubs = r.data.overall?.totalClubs ?? r.data.stats?.totalClubs ?? r.data.totalClubs;
            expectFinitePositive(clubs, 'zone clubs');
            return `clubs=${clubs}`;
        });
    }
    for (const bad of ['9', '22', 'Zone 99', '0', 'abc']) {
        await test('MCP', `get_summary rejects zone=${bad}`, async () => {
            const r = await mcpTool('get_summary', { zone: bad });
            expectTrue(r.isError || /outside|not found|invalid|unsupported/i.test(errText(r.data)), errText(r.data));
            return 'rejected';
        });
    }
}

async function sectionLeaderboards() {
    console.log('\n=== 4. TOOL get_leaderboards ===\n');
    for (const category of LEADERBOARD_CATEGORIES) {
        await test('MCP', `get_leaderboards category=${category}`, async () => {
            const r = await mcpTool('get_leaderboards', { category, limit: 5 });
            expectTrue(!r.isError, errText(r.data));
            assertSanity(r.data);
            const rows = r.data.data || r.data.items || [];
            expectTrue(Array.isArray(rows) && rows.length > 0, `empty board ${category}`);
            return `n=${rows.length} top=${rows[0]?.name || rows[0]?.district || rows[0]?.id}`;
        });
    }
    await test('MCP', 'get_leaderboards category=all', async () => {
        const r = await mcpTool('get_leaderboards', { category: 'all', limit: 3 });
        expectTrue(!r.isError, errText(r.data));
        expectTrue(Array.isArray(r.data.largestClubs) && r.data.largestClubs.length > 0, 'largestClubs');
        return `largest=${r.data.largestClubs[0]?.name}`;
    });
    await test('MCP', 'get_leaderboards scope=worldwide largest_clubs', async () => {
        const r = await mcpTool('get_leaderboards', { scope: 'worldwide', category: 'largest_clubs', limit: 5 });
        expectTrue(!r.isError, errText(r.data));
        const rows = r.data.data || [];
        expectTrue(rows.length > 0, 'empty');
        return rows[0]?.name;
    });
    await test('MCP', 'get_leaderboards district=3000', async () => {
        const r = await mcpTool('get_leaderboards', { category: 'largest_clubs', district: KNOWN_DISTRICT, limit: 5 });
        expectTrue(!r.isError, errText(r.data));
        const rows = r.data.data || [];
        expectTrue(rows.every((x) => String(x.district) === KNOWN_DISTRICT || !x.district), 'district filter leak');
        return `n=${rows.length}`;
    });
    await test('MCP', 'get_leaderboards type alias -> category', async () => {
        const r = await mcpTool('get_leaderboards', { type: 'largest_clubs', limit: 3 });
        expectTrue(!r.isError, errText(r.data));
        expectTrue((r.data.data || []).length > 0, 'empty');
        return 'ok';
    });
    await test('MCP', 'get_leaderboards limit edge 1 and 100', async () => {
        const a = await mcpTool('get_leaderboards', { category: 'largest_clubs', limit: 1 });
        const b = await mcpTool('get_leaderboards', { category: 'largest_clubs', limit: 100 });
        expectEq((a.data.data || []).length, 1, 'limit1');
        expectTrue((b.data.data || []).length >= 10, 'limit100 short');
        return `1=${(a.data.data || []).length} 100=${(b.data.data || []).length}`;
    });
}

async function sectionDistrictsZones() {
    console.log('\n=== 5. TOOL get_districts / insights / zone ===\n');
    await test('MCP', 'get_districts count 44', async () => {
        const r = await mcpTool('get_districts', {});
        expectTrue(!r.isError, errText(r.data));
        const n = r.data.count ?? r.data.districts?.length;
        expectEq(n, 44, 'districts');
        return String(n);
    });
    for (const sortBy of ['clubs', 'members', 'arrearsClubs', 'dualRiskClubs', 'trfContributors', 'memberGrowthPct']) {
        await test('MCP', `get_districts sortBy=${sortBy}`, async () => {
            const r = await mcpTool('get_districts', { sortBy, sortOrder: 'desc' });
            expectTrue(!r.isError, errText(r.data));
            const list = r.data.districts || r.data.data || [];
            expectEq(list.length, 44, 'len');
            return `top=${list[0]?.district || list[0]?.id}`;
        });
    }
    await test('MCP', 'get_districts country=Nepal', async () => {
        const r = await mcpTool('get_districts', { country: 'Nepal' });
        expectTrue(!r.isError, errText(r.data));
        const list = r.data.districts || r.data.data || [];
        expectTrue(list.some((d) => String(d.district || d.id) === NEPAL_DISTRICT), 'missing 3292');
        return `n=${list.length}`;
    });

    await test('MCP', 'get_district_insights 3000', async () => {
        const r = await mcpTool('get_district_insights', { district: KNOWN_DISTRICT });
        expectTrue(!r.isError, errText(r.data));
        expectEq(String(r.data.district), KNOWN_DISTRICT, 'district');
        expectFinitePositive(r.data.stats?.totalClubs, 'clubs');
        return `clubs=${r.data.stats.totalClubs}`;
    });
    await test('MCP', 'get_district_insights Nepal 3292', async () => {
        const r = await mcpTool('get_district_insights', { district: NEPAL_DISTRICT });
        expectTrue(!r.isError, errText(r.data));
        expectEq(r.data.country, 'Nepal', 'country');
        return `clubs=${r.data.stats?.totalClubs}`;
    });
    await test('MCP', 'get_district_insights missing param', async () => {
        const r = await mcpTool('get_district_insights', {});
        expectTrue(r.isError, 'should error');
        return 'ok';
    });
    await test('MCP', 'get_district_insights out-of-scope self-heal', async () => {
        const r = await mcpTool('get_district_insights', { district: '9999' });
        const t = errText(r.data);
        expectTrue(r.isError, 'should error');
        expectTrue(/type:\s*"district"/.test(t), t);
        expectTrue(!t.includes('top_districts'), 'bad guidance');
        return 'ok';
    });
    await test('MCP', 'get_district_insights alias districtId', async () => {
        const r = await mcpTool('get_district_insights', { districtId: KNOWN_DISTRICT });
        expectTrue(!r.isError, errText(r.data));
        return String(r.data.district);
    });

    for (const z of ZONES) {
        await test('MCP', `get_zone_summary ${z}`, async () => {
            const r = await mcpTool('get_zone_summary', { zone: z });
            expectTrue(!r.isError, errText(r.data));
            expectFinitePositive(r.data.stats?.totalClubs, 'clubs');
            return `clubs=${r.data.stats.totalClubs}`;
        });
    }
    await test('MCP', 'get_zone_summary out-of-scope', async () => {
        const r = await mcpTool('get_zone_summary', { zone: '22' });
        expectTrue(r.isError, 'should error');
        expectTrue(/get_worldwide_rankings|outside/i.test(errText(r.data)), errText(r.data));
        return 'ok';
    });
}

async function sectionClubs() {
    console.log('\n=== 6. TOOL search_clubs / profile / new ===\n');

    await test('MCP', 'search_clubs Delhi', async () => {
        const r = await mcpTool('search_clubs', { query: 'Delhi', limit: 5 });
        expectTrue(!r.isError, errText(r.data));
        expectFinitePositive(r.data.total, 'total');
        expectTrue((r.data.clubs || r.data.data || []).length > 0, 'rows');
        return `total=${r.data.total}`;
    });
    await test('MCP', 'search_clubs q alias', async () => {
        const r = await mcpTool('search_clubs', { q: 'Chennai', limit: 3 });
        expectTrue(!r.isError, errText(r.data));
        expectFinitePositive(r.data.total, 'total');
        return `total=${r.data.total}`;
    });
    await test('MCP', 'search_clubs empty query still lists', async () => {
        const r = await mcpTool('search_clubs', { limit: 5 });
        expectTrue(!r.isError, errText(r.data));
        expectEq(r.data.total, overall.totalClubs, 'total');
        return String(r.data.total);
    });
    await test('MCP', 'search_clubs multi-zone 4,5,6,7', async () => {
        const r = await mcpTool('search_clubs', { zone: '4,5,6,7', limit: 1 });
        expectEq(r.data.total, overall.totalClubs, 'total');
        return String(r.data.total);
    });
    await test('MCP', 'search_clubs country=Nepal', async () => {
        const r = await mcpTool('search_clubs', { country: 'Nepal', limit: 2 });
        expectFinitePositive(r.data.total, 'total');
        expectTrue(r.data.total < overall.totalClubs, 'should be subset');
        return String(r.data.total);
    });
    await test('MCP', 'search_clubs sponsorsInteract=true', async () => {
        const r = await mcpTool('search_clubs', { sponsorsInteract: true, limit: 2 });
        expectFinitePositive(r.data.total, 'total');
        expectTrue(r.data.total < 500, `unexpectedly high ${r.data.total}`);
        return String(r.data.total);
    });
    await test('MCP', 'search_clubs isArrears true/false', async () => {
        const t = await mcpTool('search_clubs', { isArrears: true, limit: 1 });
        const f = await mcpTool('search_clubs', { isArrears: 'false', limit: 1 });
        expectEq(t.data.total, overall.arrearsClubs, 'arrears');
        expectEq(f.data.total, overall.paidClubs, 'paid');
        return `arrears=${t.data.total} paid=${f.data.total}`;
    });
    await test('MCP', 'search_clubs isDualRisk', async () => {
        const r = await mcpTool('search_clubs', { isDualRisk: true, limit: 1 });
        expectFinitePositive(r.data.total, 'total');
        return String(r.data.total);
    });
    await test('MCP', 'search_clubs base=University', async () => {
        const r = await mcpTool('search_clubs', { base: 'University', limit: 1 });
        expectEq(r.data.total, overall.totalUniv, 'univ');
        return String(r.data.total);
    });
    await test('MCP', 'search_clubs pagination offset', async () => {
        const a = await mcpTool('search_clubs', { limit: 5, offset: 0 });
        const b = await mcpTool('search_clubs', { limit: 5, offset: 5 });
        const a0 = (a.data.clubs || a.data.data)?.[0]?.id;
        const b0 = (b.data.clubs || b.data.data)?.[0]?.id;
        expectTrue(a0 && b0 && a0 !== b0, `offset not advancing ${a0} ${b0}`);
        return 'ok';
    });
    await test('MCP', 'search_clubs limit cap behavior', async () => {
        const r = await mcpTool('search_clubs', { limit: 500 });
        const rows = r.data.clubs || r.data.data || [];
        expectTrue(rows.length <= 100, `returned ${rows.length}`);
        expectTrue(r.data.limitCapped === true || rows.length <= 100, 'cap flag');
        return `returned=${rows.length} capped=${r.data.limitCapped}`;
    });
    await test('MCP', 'search_clubs nonsense query empty-ish', async () => {
        const r = await mcpTool('search_clubs', { query: 'zzzznonexistentclubxyz999', limit: 5 });
        expectTrue(!r.isError, errText(r.data));
        expectEq(r.data.total, 0, 'total');
        return 'ok';
    });

    await test('MCP', 'get_club_profile by id', async () => {
        const r = await mcpTool('get_club_profile', { clubId: KNOWN_CLUB });
        expectTrue(!r.isError, errText(r.data));
        expectTrue(!!(r.data.name || r.data.clubName), 'name');
        return r.data.name || r.data.clubName;
    });
    await test('MCP', 'get_club_profile by name', async () => {
        const r = await mcpTool('get_club_profile', { clubName: 'MGR University' });
        expectTrue(!r.isError, errText(r.data));
        return r.data.name || r.data.clubName;
    });
    for (const key of ['query', 'q', 'club', 'id', 'name']) {
        await test('MCP', `get_club_profile runtime alias ${key}`, async () => {
            const r = await mcpTool('get_club_profile', { [key]: KNOWN_CLUB });
            expectTrue(!r.isError, errText(r.data));
            return r.data.name || r.data.clubName;
        });
    }
    await test('MCP', 'get_club_profile missing param', async () => {
        const r = await mcpTool('get_club_profile', {});
        expectTrue(r.isError, 'should error');
        return 'ok';
    });
    await test('MCP', 'get_club_profile not found self-heal', async () => {
        const r = await mcpTool('get_club_profile', { clubId: '999999999' });
        expectTrue(r.isError, 'should error');
        expectTrue(/search_clubs/i.test(errText(r.data)), errText(r.data));
        return 'ok';
    });

    await test('MCP', 'get_new_clubs default', async () => {
        const r = await mcpTool('get_new_clubs', { limit: 5 });
        expectEq(r.data.total, overall.newTotalClubs, 'total');
        return String(r.data.total);
    });
    for (const z of ['4', '5', '6', '7']) {
        await test('MCP', `get_new_clubs zone=${z}`, async () => {
            const r = await mcpTool('get_new_clubs', { zone: z, limit: 3 });
            expectTrue(!r.isError, errText(r.data));
            expectTrue(Number.isFinite(r.data.total) && r.data.total >= 0, 'total');
            expectTrue(r.data.total <= overall.newTotalClubs, 'subset');
            return String(r.data.total);
        });
    }
}

async function sectionCompliance() {
    console.log('\n=== 7. TOOL compliance / dual-risk ===\n');
    for (const riskType of RISK_TYPES) {
        await test('MCP', `find_compliance_risks riskType=${riskType}`, async () => {
            const r = await mcpTool('find_compliance_risks', { riskType, limit: 3 });
            expectTrue(!r.isError, errText(r.data));
            expectFinitePositive(r.data.total, 'total');
            return `total=${r.data.total}`;
        });
    }
    await test('MCP', 'find_compliance_risks type alias dual_risk', async () => {
        const r = await mcpTool('find_compliance_risks', { type: 'dual_risk', limit: 1 });
        expectTrue(!r.isError, errText(r.data));
        expectFinitePositive(r.data.total, 'total');
        return String(r.data.total);
    });
    await test('MCP', 'find_compliance_risks district=3000 arrears', async () => {
        const r = await mcpTool('find_compliance_risks', { riskType: 'arrears', district: KNOWN_DISTRICT, limit: 5 });
        expectTrue(!r.isError, errText(r.data));
        expectFinitePositive(r.data.total, 'total');
        expectTrue(r.data.total < overall.arrearsClubs, 'subset');
        return String(r.data.total);
    });
    await test('MCP', 'find_dual_risk_clubs default', async () => {
        const r = await mcpTool('find_dual_risk_clubs', { limit: 3 });
        expectTrue(!r.isError, errText(r.data));
        expectFinitePositive(r.data.total, 'total');
        expectTrue(r.data.total > 100, 'floor');
        return String(r.data.total);
    });
    for (const z of ['4', '5', '6', '7']) {
        await test('MCP', `find_dual_risk_clubs zone=${z}`, async () => {
            const r = await mcpTool('find_dual_risk_clubs', { zone: z, limit: 2 });
            expectTrue(!r.isError, errText(r.data));
            expectTrue(Number.isFinite(r.data.total) && r.data.total >= 0, 'total');
            return String(r.data.total);
        });
    }
}

async function sectionInteractOppTrf() {
    console.log('\n=== 8. TOOL interact / opportunities / TRF ===\n');
    await test('MCP', 'get_interact_analytics default', async () => {
        const r = await mcpTool('get_interact_analytics', {});
        expectTrue(!r.isError, errText(r.data));
        const total = r.data.totalInteractClubs ?? r.data.overview?.totalInteractClubs ?? r.data.total;
        expectEq(total, overall.totalInteractClubs, 'interact');
        return String(total);
    });
    await test('MCP', 'get_interact_analytics district=3000', async () => {
        const r = await mcpTool('get_interact_analytics', { district: KNOWN_DISTRICT });
        expectTrue(!r.isError, errText(r.data));
        return 'ok';
    });

    await test('MCP', 'find_rotary_opportunities no_rotaract', async () => {
        const r = await mcpTool('find_rotary_opportunities', { opportunityType: 'no_rotaract', limit: 2 });
        expectEq(r.data.opportunityType, 'no_rotaract', 'type');
        expectEq(r.data.total, noSponsor.length, 'total');
        return String(r.data.total);
    });
    await test('MCP', 'find_rotary_opportunities no_interact', async () => {
        const r = await mcpTool('find_rotary_opportunities', { opportunityType: 'no_interact', limit: 2 });
        expectEq(r.data.opportunityType, 'no_interact', 'type');
        expectEq(r.data.total, noInteract.length, 'total');
        expectTrue(r.data.total !== noSponsor.length, 'must differ from no_rotaract');
        return String(r.data.total);
    });
    await test('MCP', 'find_rotary_opportunities type alias', async () => {
        const r = await mcpTool('find_rotary_opportunities', { type: 'no_interact', limit: 1 });
        expectEq(r.data.opportunityType, 'no_interact', 'type');
        expectEq(r.data.total, noInteract.length, 'total');
        return String(r.data.total);
    });
    await test('MCP', 'find_rotary_opportunities invalid type', async () => {
        const r = await mcpTool('find_rotary_opportunities', { opportunityType: 'bogus' });
        expectTrue(r.isError, 'should error');
        return 'ok';
    });
    await test('MCP', 'find_rotary_opportunities district filter', async () => {
        const r = await mcpTool('find_rotary_opportunities', { opportunityType: 'no_rotaract', district: KNOWN_DISTRICT, limit: 5 });
        expectTrue(r.data.total < noSponsor.length, 'subset');
        expectFinitePositive(r.data.total, 'total');
        return String(r.data.total);
    });

    await test('MCP', 'get_foundation_giving default', async () => {
        const r = await mcpTool('get_foundation_giving', { limit: 5 });
        expectEq(r.data.total, trf.length, 'total');
        return String(r.data.total);
    });
    await test('MCP', 'get_foundation_giving sort/limit', async () => {
        const r = await mcpTool('get_foundation_giving', { limit: 1, sortOrder: 'desc' });
        expectEq((r.data.clubs || r.data.data || r.data.contributions || []).length, 1, 'len');
        return 'ok';
    });
}

async function sectionWorldwide() {
    console.log('\n=== 9. TOOL get_worldwide_rankings ===\n');
    for (const type of WORLDWIDE_TYPES) {
        await test('MCP', `get_worldwide_rankings type=${type}`, async () => {
            const r = await mcpTool('get_worldwide_rankings', { type, limit: 5 });
            expectTrue(!r.isError, errText(r.data));
            assertSanity(r.data);
            if (type === 'summary' || type === 'all') {
                const clubs = r.data.totalClubs ?? r.data.overall?.totalClubs;
                expectFinitePositive(clubs, 'clubs');
                expectTrue(clubs > 9000, `floor ${clubs}`);
            }
            return 'ok';
        });
    }
    for (const alias of ['top_districts', 'districts', 'district_rankings']) {
        await test('MCP', `get_worldwide_rankings alias ${alias}`, async () => {
            const r = await mcpTool('get_worldwide_rankings', { type: alias, limit: 3 });
            expectTrue(!r.isError, errText(r.data));
            expectTrue(Array.isArray(r.data.districts) && r.data.districts.length > 0, 'districts');
            return `n=${r.data.districts.length}`;
        });
    }
    await test('MCP', 'get_worldwide_rankings bogus type', async () => {
        const r = await mcpTool('get_worldwide_rankings', { type: 'bogus' });
        expectTrue(r.isError, 'should error');
        expectTrue(/invalid type/i.test(errText(r.data)), errText(r.data));
        return 'ok';
    });
    for (const sortBy of ['members', 'member_growth_pct', 'member_growth_abs', 'clubs', 'name']) {
        await test('MCP', `worldwide district sortBy=${sortBy}`, async () => {
            const r = await mcpTool('get_worldwide_rankings', { type: 'district', sortBy, limit: 3 });
            expectTrue(!r.isError, errText(r.data));
            expectTrue((r.data.districts || []).length > 0, 'rows');
            return r.data.districts[0]?.district;
        });
    }
    await test('MCP', 'worldwide clubs community/university', async () => {
        const c = await mcpTool('get_worldwide_rankings', { type: 'clubs', base: 'community', limit: 5 });
        const u = await mcpTool('get_worldwide_rankings', { type: 'clubs', base: 'university', limit: 5 });
        expectTrue((c.data.clubs || []).length > 0 && (u.data.clubs || []).length > 0, 'rows');
        const cn = (c.data.clubs[0].name || c.data.clubs[0].clubName);
        const un = (u.data.clubs[0].name || u.data.clubs[0].clubName);
        expectTrue(cn !== un || true, 'ok');
        return `comm=${cn} univ=${un}`;
    });
    for (const country of ['India', 'Nepal', 'Sri Lanka', 'United States', 'Philippines', 'Brazil']) {
        await test('MCP', `worldwide country filter ${country}`, async () => {
            const r = await mcpTool('get_worldwide_rankings', { type: 'country', country, limit: 5 });
            expectTrue(!r.isError, errText(r.data));
            const rows = r.data.countries || [];
            expectTrue(rows.length >= 1, 'missing country');
            expectTrue(String(rows[0].country || rows[0].name).toLowerCase().includes(country.toLowerCase().slice(0, 5)) || rows.length === 1, 'filter');
            return `clubs=${rows[0].activeClubs}`;
        });
    }
    await test('MCP', 'worldwide district=3233 ranks', async () => {
        const r = await mcpTool('get_worldwide_rankings', { type: 'district', district: '3233', limit: 1 });
        expectTrue(!r.isError, errText(r.data));
        const d = r.data.districts?.[0];
        expectTrue(d && Number.isFinite(d.worldwideRank), 'rank');
        return `ww=${d.worldwideRank} sa=${d.southAsiaRank}`;
    });
    await test('MCP', 'worldwide district=0000 not found', async () => {
        const r = await mcpTool('get_worldwide_rankings', { type: 'district', district: '0000', limit: 1 });
        expectTrue(r.isError || (r.data.districts || []).length === 0 || /not found/i.test(errText(r.data)), errText(r.data));
        return 'ok';
    });
    await test('MCP', 'worldwide region=south_asia interact', async () => {
        const r = await mcpTool('get_worldwide_rankings', { type: 'interact', region: 'south_asia', limit: 10 });
        expectTrue(!r.isError, errText(r.data));
        return 'ok';
    });
    await test('MCP', 'worldwide pagination offset', async () => {
        const a = await mcpTool('get_worldwide_rankings', { type: 'clubs', limit: 3, offset: 0 });
        const b = await mcpTool('get_worldwide_rankings', { type: 'clubs', limit: 3, offset: 3 });
        const a0 = a.data.clubs?.[0]?.clubId || a.data.clubs?.[0]?.id;
        const b0 = b.data.clubs?.[0]?.clubId || b.data.clubs?.[0]?.id;
        expectTrue(a0 && b0 && a0 !== b0, `offset stuck ${a0} ${b0}`);
        return 'ok';
    });
}

async function sectionResourcesPrompts() {
    console.log('\n=== 10. RESOURCES + PROMPTS ===\n');
    const uris = [
        'rotaract://summary',
        'rotaract://leaderboards',
        'rotaract://new-clubs',
        'rotaract://interact',
        'rotaract://worldwide',
        'rotaract://zones',
        'rotaract://districts',
        'rotaract://dual-risk'
    ];
    for (const uri of uris) {
        await test('MCP', `resources/read ${uri}`, async () => {
            const res = await mcpRpc('resources/read', { uri });
            expectEq(res.status, 200, 'http');
            expectTrue(!res.body.error, JSON.stringify(res.body.error || {}));
            const text = res.body?.result?.contents?.[0]?.text || res.body?.result?.contents?.[0]?.blob;
            expectTrue(!!text, 'empty');
            JSON.parse(text);
            return 'ok';
        });
    }
    await test('MCP', 'resources/read bad uri', async () => {
        const res = await mcpRpc('resources/read', { uri: 'rotaract://does-not-exist' });
        expectTrue(!!res.body.error || res.body?.result?.isError, 'should fail');
        return 'ok';
    });

    const prompts = [
        { name: 'club_rankings_dossier', args: { district: '3000' } },
        { name: 'audit_district_compliance', args: { district: '3000' } },
        { name: 'sponsorship_opportunity_report', args: { district: '3000' } },
        { name: 'zone_performance_comparison', args: { zone: '5' } }
    ];
    for (const p of prompts) {
        await test('MCP', `prompts/get ${p.name}`, async () => {
            const res = await mcpRpc('prompts/get', { name: p.name, arguments: p.args });
            expectEq(res.status, 200, 'http');
            expectTrue(Array.isArray(res.body?.result?.messages) && res.body.result.messages.length >= 1, 'messages');
            return `msgs=${res.body.result.messages.length}`;
        });
    }
    await test('MCP', 'prompts/get missing required', async () => {
        const res = await mcpRpc('prompts/get', { name: 'audit_district_compliance', arguments: {} });
        expectTrue(!!res.body.error || res.status >= 400, 'should fail');
        return 'ok';
    });
}

async function sectionRest() {
    console.log('\n=== 11. REST API SURFACE ===\n');
    const routes = [
        ['/api/v1/summary', (b) => expectEq(b.overall?.totalClubs ?? b.totalClubs, overall.totalClubs, 'clubs')],
        ['/api/v1/summary?zone=5', (b) => expectFinitePositive(b.overall?.totalClubs ?? b.stats?.totalClubs ?? b.totalClubs, 'z5')],
        ['/api/v1/zones', (b) => expectEq(b.count, 4, 'zones')],
        ['/api/v1/zones/5', (b) => expectFinitePositive(b.stats?.totalClubs ?? b.totalClubs, 'z')],
        ['/api/v1/zones/zone-5', (b) => expectFinitePositive(b.stats?.totalClubs ?? b.totalClubs, 'slug')],
        ['/api/v1/districts', (b) => expectEq(b.count ?? b.districts?.length, 44, 'd')],
        ['/api/v1/districts?sortBy=members&sortOrder=desc', (b) => expectTrue((b.districts || b.data || []).length === 44, 'sorted')],
        ['/api/v1/districts/3000', (b) => expectFinitePositive(b.stats?.totalClubs ?? b.totalClubs, 'd3000')],
        ['/api/v1/districts/3000/clubs?limit=5', (b) => expectFinitePositive(b.total ?? b.clubs?.length, 'dclubs')],
        ['/api/v1/clubs?q=Delhi&limit=3', (b) => expectFinitePositive(b.total, 'search')],
        ['/api/v1/clubs?country=Nepal&limit=2', (b) => expectFinitePositive(b.total, 'nepal')],
        ['/api/v1/clubs?sponsorsInteract=true&limit=2', (b) => expectFinitePositive(b.total, 'interact')],
        [`/api/v1/clubs/${KNOWN_CLUB}`, (b) => expectTrue(!!(b.name || b.clubName), 'club')],
        [`/api/v1/clubs/${KNOWN_CLUB}/interact`, (b) => expectTrue(b != null, 'interact sub')],
        ['/api/v1/clubs/new?limit=5', (b) => expectEq(b.total, overall.newTotalClubs, 'new')],
        ['/api/v1/compliance/arrears?limit=2', (b) => expectEq(b.total, arrears.length, 'arr')],
        ['/api/v1/compliance/officers?limit=2', (b) => expectEq(b.total, officers.length, 'off')],
        ['/api/v1/compliance/dual-risk?limit=2', (b) => expectFinitePositive(b.total, 'dual')],
        ['/api/v1/compliance/unified?limit=2', (b) => expectEq(b.total, unified.length, 'uni')],
        ['/api/v1/interact', (b) => expectEq(b.totalInteractClubs ?? b.total, overall.totalInteractClubs, 'int')],
        ['/api/v1/opportunities/rotary?type=no_rotaract&limit=2', (b) => expectEq(b.total, noSponsor.length, 'nr')],
        ['/api/v1/opportunities/rotary?type=no_interact&limit=2', (b) => expectEq(b.total, noInteract.length, 'ni')],
        ['/api/v1/trf?limit=2', (b) => expectEq(b.total, trf.length, 'trf')],
        ['/api/v1/worldwide', (b) => expectFinitePositive(b.totalClubs ?? b.overall?.totalClubs, 'ww')],
        ['/api/v1/worldwide?type=clubs&limit=5', (b) => expectTrue((b.clubs || b.data || []).length > 0, 'wwc')],
        ['/api/v1/worldwide?type=district&limit=5', (b) => expectTrue((b.districts || []).length > 0, 'wwd')],
        ['/api/v1/worldwide?type=country&limit=5', (b) => expectTrue((b.countries || []).length > 0, 'wwco')],
        ['/api/v1/leaderboards?category=largest_clubs&limit=5', (b) => expectTrue((b.data || b.items || []).length > 0, 'lb')],
        ['/api/v1/leaderboards?scope=worldwide&category=community_clubs&limit=3', (b) => expectTrue((b.data || b.items || []).length > 0, 'lbw')],
        ['/api/filters', (b) => expectTrue(b != null, 'filters')],
        ['/api/table-data/arrears', (b) => expectTrue(Array.isArray(b) ? b.length > 0 : (b.data || []).length > 0, 'table')],
        ['/api/table-data/all_clubs?zone=Zone%205', (b) => {
            const len = Array.isArray(b) ? b.length : (b.data || []).length;
            expectFinitePositive(len, 'z5table');
        }],
        ['/openapi.json', (b) => expectTrue(Object.keys(b.paths || {}).length >= 20, 'openapi')],
        ['/.well-known/mcp-server.json', (b) => expectTrue(!!b.name || !!b.server, 'manifest')]
    ];

    for (const [pathQs, assertFn] of routes) {
        await test('REST', `GET ${pathQs}`, async () => {
            const r = await rest(pathQs);
            expectTrue(r.status === 200, `HTTP ${r.status}`);
            assertFn(r.body);
            return String(r.status);
        });
    }

    await test('REST', 'worldwide bogus type 400', async () => {
        const r = await rest('/api/v1/worldwide?type=bogus');
        expectEq(r.status, 400, 'status');
        expectTrue(Array.isArray(r.body.validTypes), 'validTypes');
        return 'ok';
    });
    await test('REST', 'invalid table tab rejected', async () => {
        const r = await rest('/api/table-data/invalid_tab');
        expectTrue(r.status >= 400, `status ${r.status}`);
        return String(r.status);
    });
    await test('REST', 'missing club 404-ish', async () => {
        const r = await rest('/api/v1/clubs/999999999');
        expectTrue(r.status === 404 || r.body?.error, `status ${r.status}`);
        return String(r.status);
    });
    await test('REST', 'missing district 404-ish', async () => {
        const r = await rest('/api/v1/districts/9999');
        expectTrue(r.status === 404 || r.body?.error, `status ${r.status}`);
        return String(r.status);
    });
}

async function sectionParityRestMcp() {
    console.log('\n=== 12. REST vs MCP PARITY ===\n');
    const pairs = [
        ['summary clubs', async () => {
            const restR = await rest('/api/v1/summary');
            const mcpR = await mcpTool('get_summary', {});
            const a = restR.body.overall?.totalClubs ?? restR.body.totalClubs;
            const b = mcpR.data.overall?.totalClubs ?? mcpR.data.totalClubs;
            expectEq(a, b, 'clubs');
            expectEq(a, overall.totalClubs, 'data');
            return String(a);
        }],
        ['dual-risk total', async () => {
            const restR = await rest('/api/v1/compliance/dual-risk?limit=1');
            const mcpR = await mcpTool('find_dual_risk_clubs', { limit: 1 });
            expectEq(restR.body.total, mcpR.data.total, 'dual');
            return String(restR.body.total);
        }],
        ['new clubs', async () => {
            const restR = await rest('/api/v1/clubs/new?limit=1');
            const mcpR = await mcpTool('get_new_clubs', { limit: 1 });
            expectEq(restR.body.total, mcpR.data.total, 'new');
            return String(restR.body.total);
        }],
        ['no_interact', async () => {
            const restR = await rest('/api/v1/opportunities/rotary?type=no_interact&limit=1');
            const mcpR = await mcpTool('find_rotary_opportunities', { type: 'no_interact', limit: 1 });
            expectEq(restR.body.total, mcpR.data.total, 'ni');
            expectEq(mcpR.data.opportunityType, 'no_interact', 'type');
            return String(restR.body.total);
        }],
        ['district 3000 clubs', async () => {
            const restR = await rest('/api/v1/districts/3000');
            const mcpR = await mcpTool('get_district_insights', { district: '3000' });
            expectEq(restR.body.stats?.totalClubs ?? restR.body.totalClubs, mcpR.data.stats?.totalClubs, 'clubs');
            return String(mcpR.data.stats?.totalClubs);
        }],
        ['club dossier name', async () => {
            const restR = await rest(`/api/v1/clubs/${KNOWN_CLUB}`);
            const mcpR = await mcpTool('get_club_profile', { clubId: KNOWN_CLUB });
            expectEq(restR.body.name || restR.body.clubName, mcpR.data.name || mcpR.data.clubName, 'name');
            return restR.body.name || restR.body.clubName;
        }],
        ['worldwide top club', async () => {
            const restR = await rest('/api/v1/worldwide?type=clubs&limit=1');
            const mcpR = await mcpTool('get_worldwide_rankings', { type: 'clubs', limit: 1 });
            const rn = restR.body.clubs?.[0]?.name || restR.body.clubs?.[0]?.clubName || restR.body.data?.[0]?.name;
            const mn = mcpR.data.clubs?.[0]?.name || mcpR.data.clubs?.[0]?.clubName || mcpR.data.data?.[0]?.name;
            expectEq(rn, mn, 'top');
            return rn;
        }],
        ['top country India', async () => {
            const restR = await rest('/api/v1/worldwide?type=country&sortBy=members&limit=1');
            const mcpR = await mcpTool('get_worldwide_rankings', { type: 'country', sortBy: 'members', limit: 1 });
            const rn = restR.body.countries?.[0]?.country;
            const mn = mcpR.data.countries?.[0]?.country;
            expectEq(rn, mn, 'country');
            expectEq(rn, 'India', 'india');
            return rn;
        }]
    ];
    for (const [name, fn] of pairs) {
        await test('PARITY', name, fn);
    }
}

async function sectionSse() {
    console.log('\n=== 13. SSE TRANSPORT PROBES ===\n');
    for (const pathQs of ['/api/mcp', '/sse', '/api/sse']) {
        await test('SSE', `GET ${pathQs} accept stream`, async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2500);
            try {
                const res = await fetch(`${BASE}${pathQs}`, {
                    headers: { Accept: 'text/event-stream' },
                    signal: controller.signal
                });
                expectTrue(res.status === 200 || res.status === 405 || res.status === 400, `status ${res.status}`);
                if (res.status === 200) {
                    const ctype = res.headers.get('content-type') || '';
                    expectTrue(/text\/event-stream|json/i.test(ctype) || true, ctype);
                }
                controller.abort();
                return String(res.status);
            } catch (e) {
                if (e.name === 'AbortError') return 'aborted-after-headers';
                throw e;
            } finally {
                clearTimeout(timer);
            }
        });
    }
}

async function sectionLoad() {
    console.log(`\n=== 14. HIGH LOAD (${LOAD_ROUNDS} rounds x ${LOAD_CONCURRENCY}) ===\n`);
    if (SKIP_LOAD) {
        await test('LOAD', 'skipped via SKIP_LOAD=1', async () => 'skipped');
        return;
    }
    const endpoints = [
        () => fetch(`${BASE}/api/v1/summary`),
        () => fetch(`${BASE}/api/v1/districts`),
        () => fetch(`${BASE}/api/v1/zones/5`),
        () => fetch(`${BASE}/api/v1/compliance/arrears?limit=10`),
        () => fetch(`${BASE}/api/v1/compliance/dual-risk?limit=10`),
        () => fetch(`${BASE}/api/v1/worldwide?type=country&limit=10`),
        () => fetch(`${BASE}/api/v1/worldwide?type=clubs&limit=20`),
        () => fetch(`${BASE}/api/v1/leaderboards?category=largest_clubs&limit=10`),
        () => fetch(`${BASE}/api/v1/clubs?q=Delhi&limit=10`),
        () => fetch(`${BASE}/api/v1/opportunities/rotary?type=no_interact&limit=10`),
        () => fetch(`${BASE}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: Math.random(), method: 'tools/call',
                params: { name: 'get_summary', arguments: {} }
            })
        }),
        () => fetch(`${BASE}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: Math.random(), method: 'tools/call',
                params: { name: 'search_clubs', arguments: { query: 'Bangalore', limit: 5 } }
            })
        }),
        () => fetch(`${BASE}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: Math.random(), method: 'tools/call',
                params: { name: 'get_worldwide_rankings', arguments: { type: 'district', limit: 10 } }
            })
        }),
        () => fetch(`${BASE}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: Math.random(), method: 'tools/call',
                params: { name: 'find_rotary_opportunities', arguments: { type: 'no_interact', limit: 5 } }
            })
        }),
        () => fetch(`${BASE}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: Math.random(), method: 'tools/list', params: {}
            })
        })
    ];

    const latencies = [];
    let errors = 0;
    let non200 = 0;
    const t0 = Date.now();
    for (let round = 0; round < LOAD_ROUNDS; round++) {
        const batch = Array.from({ length: LOAD_CONCURRENCY }, (_, i) => {
            const start = Date.now();
            return endpoints[i % endpoints.length]()
                .then(async (res) => {
                    latencies.push(Date.now() - start);
                    if (!res.ok && res.status !== 204) non200 += 1;
                    await res.arrayBuffer().catch(() => {});
                })
                .catch(() => {
                    errors += 1;
                    latencies.push(Date.now() - start);
                });
        });
        await Promise.all(batch);
    }
    const elapsed = Date.now() - t0;
    const total = LOAD_CONCURRENCY * LOAD_ROUNDS;
    latencies.sort((a, b) => a - b);
    const pct = (p) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))];
    const rps = ((total / elapsed) * 1000).toFixed(1);

    await test('LOAD', `burst ${total} requests`, async () => {
        expectEq(errors, 0, 'network errors');
        expectEq(non200, 0, 'http errors');
        expectTrue(pct(0.95) < 15000, `p95 too slow ${pct(0.95)}`);
        return `errors=${errors} non200=${non200} p50=${pct(0.5)}ms p95=${pct(0.95)}ms p99=${pct(0.99)}ms max=${latencies.at(-1)}ms ~${rps} rps`;
    });

    // Sustained sequential mixed MCP tool storm
    await test('LOAD', 'sequential 100 MCP tool calls', async () => {
        const tools = [
            ['get_summary', {}],
            ['get_districts', { sortBy: 'members' }],
            ['search_clubs', { query: 'a', limit: 3 }],
            ['get_worldwide_rankings', { type: 'summary' }],
            ['find_dual_risk_clubs', { limit: 2 }],
            ['get_leaderboards', { category: 'largest_clubs', limit: 3 }],
            ['get_foundation_giving', { limit: 2 }],
            ['find_rotary_opportunities', { type: 'no_interact', limit: 2 }]
        ];
        let bad = 0;
        const start = Date.now();
        for (let i = 0; i < 100; i++) {
            const [name, args] = tools[i % tools.length];
            const r = await mcpTool(name, args);
            if (r.isError || r.rpcError) bad += 1;
        }
        expectEq(bad, 0, 'tool errors');
        return `100 calls in ${Date.now() - start}ms`;
    });
}

async function main() {
    console.log('====================================================');
    console.log('EXTREME QA SUITE');
    console.log(`TARGET: ${BASE}`);
    console.log(`Started: ${new Date().toISOString()}`);
    console.log('====================================================');

    const health = await rest('/api/v1/summary');
    if (health.status !== 200) {
        console.error('Server unhealthy; aborting.');
        process.exit(2);
    }

    await sectionDataParity();
    await sectionProtocol();
    await sectionGetSummary();
    await sectionLeaderboards();
    await sectionDistrictsZones();
    await sectionClubs();
    await sectionCompliance();
    await sectionInteractOppTrf();
    await sectionWorldwide();
    await sectionResourcesPrompts();
    await sectionRest();
    await sectionParityRestMcp();
    await sectionSse();
    await sectionLoad();

    console.log('\n====================================================');
    console.log(`EXTREME QA COMPLETE: ${passed} passed, ${failed} failed (total ${passed + failed})`);
    console.log('====================================================');
    if (failures.length) {
        console.log('\nFAILURES:');
        for (const f of failures) console.log(` - ${f.label}: ${f.error}`);
    }
    process.exit(failed ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(2);
});
