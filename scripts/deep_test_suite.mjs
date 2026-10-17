// Exhaustive Deep Test Suite for All MCP Tools & REST APIs.
// Do not pin volatile census totals; update data via ETL, not test constants.
// Keep exact asserts only for true invariants (known club/district IDs, protocol codes, filter correctness).
import http from 'node:http';

const BASE_URL = process.env.TEST_URL || process.argv[2] || 'http://localhost:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function recordPass(testName, detail = '') {
    totalTests++;
    passedTests++;
    console.log(`  ✔ [PASS] ${testName}${detail ? ' -> ' + detail : ''}`);
}

function recordFail(testName, error, payload = null) {
    totalTests++;
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} -> ${error}`);
    findings.push({ testName, error, payload });
}

async function callMcpTool(name, args = {}) {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: `test-${Date.now()}-${Math.random()}`,
            method: 'tools/call',
            params: { name, arguments: args }
        })
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    if (json.error) {
        throw new Error(`RPC Error ${json.error.code}: ${json.error.message}`);
    }
    const textContent = json.result?.content?.[0]?.text;
    if (!textContent) {
        throw new Error('Empty text content in MCP response');
    }
    try {
        return JSON.parse(textContent);
    } catch {
        return textContent;
    }
}

async function callRest(path) {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
}

// Check for suspicious anomalies: NaN, undefined strings, null in mandatory fields
function assertSanity(obj, path = '') {
    if (obj === null || obj === undefined) return;
    if (typeof obj === 'number' && isNaN(obj)) {
        throw new Error(`NaN found at path: ${path}`);
    }
    if (typeof obj === 'string') {
        if (obj.includes('NaN')) throw new Error(`"NaN" string found at ${path}: "${obj}"`);
        if (obj === 'undefined') throw new Error(`"undefined" string found at ${path}`);
    }
    if (Array.isArray(obj)) {
        obj.slice(0, 10).forEach((item, idx) => assertSanity(item, `${path}[${idx}]`));
    } else if (typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
            assertSanity(v, path ? `${path}.${k}` : k);
        }
    }
}

async function runTest(category, name, testFn) {
    try {
        const detail = await testFn();
        recordPass(`[${category}] ${name}`, detail);
    } catch (err) {
        recordFail(`[${category}] ${name}`, err.message);
    }
}

async function main() {
    console.log('====================================================');
    console.log('STARTING DEEP SUITE: EXHAUSTIVE TESTING ALL TOOLS & APIS');
    console.log(`TARGET: ${BASE_URL}\n`);

    // -------------------------------------------------------------------------
    // 1. TOOL: get_summary
    // -------------------------------------------------------------------------
    console.log('\n--- 1. get_summary ---');
    await runTest('MCP', 'get_summary (default)', async () => {
        const data = await callMcpTool('get_summary', {});
        assertSanity(data);
        const clubs = data.totalClubs || data.overall?.totalClubs;
        if (!clubs || clubs < 2800) throw new Error(`Unexpected club total: ${clubs}`);
        return `Total Clubs: ${clubs}, Members: ${data.totalMembers || data.overall?.totalMembers}`;
    });
    await runTest('MCP', 'get_summary (zone=5)', async () => {
        const data = await callMcpTool('get_summary', { zone: '5' });
        assertSanity(data);
        if (data.zone !== 'Zone 5') throw new Error(`Expected Zone 5, got ${data.zone}`);
        const clubs = data.totalClubs || data.stats?.totalClubs;
        return `Zone 5 Clubs: ${clubs}, Districts: ${data.districts?.length || data.districtCount}`;
    });
    await runTest('REST', 'GET /api/v1/summary (default & filtered)', async () => {
        const all = await callRest('/api/v1/summary');
        const z5 = await callRest('/api/v1/summary?zone=5');
        const d3000 = await callRest('/api/v1/summary?district=3000');
        assertSanity(all);
        assertSanity(z5);
        assertSanity(d3000);
        return `All: ${all.totalClubs}, Zone 5: ${z5.totalClubs}, Dist 3000: ${d3000.totalClubs}`;
    });

    // -------------------------------------------------------------------------
    // 2. TOOL: get_leaderboards
    // -------------------------------------------------------------------------
    console.log('\n--- 2. get_leaderboards ---');
    const categories = [
        'largest_clubs', 'top_trf', 'most_arrears', 'districts_by_clubs',
        'districts_by_growth', 'districts_by_member_growth', 'community_clubs', 'university_clubs'
    ];
    for (const cat of categories) {
        await runTest('MCP', `get_leaderboards (category: ${cat})`, async () => {
            const data = await callMcpTool('get_leaderboards', { category: cat, limit: 3 });
            assertSanity(data);
            if (!Array.isArray(data.data) || data.data.length === 0) throw new Error(`Empty data for ${cat}`);
            return `Category: ${data.category}, 1st: ${data.data[0]?.name || data.data[0]?.district}`;
        });
    }
    await runTest('MCP', 'get_leaderboards (scope: worldwide, category: largest_clubs)', async () => {
        const data = await callMcpTool('get_leaderboards', { scope: 'worldwide', category: 'largest_clubs', limit: 3 });
        assertSanity(data);
        if (data.data[0]?.country === 'Unknown') throw new Error('Country resolved as Unknown in worldwide leaderboard');
        return `Top Worldwide: ${data.data[0]?.name} (${data.data[0]?.country}, ${data.data[0]?.members} members)`;
    });
    await runTest('REST', 'GET /api/v1/leaderboards (category=largest_clubs&zone=5)', async () => {
        const data = await callRest('/api/v1/leaderboards?category=largest_clubs&zone=5&limit=3');
        assertSanity(data);
        return `Top in Zone 5: ${data.data[0]?.name} (${data.data[0]?.members} members)`;
    });

    // -------------------------------------------------------------------------
    // 3. TOOL: get_districts
    // -------------------------------------------------------------------------
    console.log('\n--- 3. get_districts ---');
    const sortFields = ['clubs', 'members', 'arrearsClubs', 'dualRiskClubs', 'trfContributors', 'memberGrowthPct'];
    for (const sf of sortFields) {
        await runTest('MCP', `get_districts (sortBy: ${sf}, order: desc)`, async () => {
            const data = await callMcpTool('get_districts', { sortBy: sf, sortOrder: 'desc', limit: 3 });
            assertSanity(data);
            if (!data.districts || data.districts.length === 0) throw new Error('No districts returned');
            return `Top by ${sf}: Dist ${data.districts[0]?.district} (Zone ${data.districts[0]?.zone})`;
        });
    }
    await runTest('MCP', 'get_districts (country filter: Nepal)', async () => {
        const data = await callMcpTool('get_districts', { country: 'Nepal' });
        assertSanity(data);
        if (data.total !== 1 || String(data.districts[0]?.district) !== '3292') throw new Error(`Expected Nepal Dist 3292, got ${data.total}`);
        return `Nepal District: ${data.districts[0]?.district} (${data.districts[0]?.clubs} clubs)`;
    });
    await runTest('MCP', 'get_districts (country filter: Sri Lanka)', async () => {
        const data = await callMcpTool('get_districts', { country: 'Sri Lanka' });
        assertSanity(data);
        if (data.total !== 1 || String(data.districts[0]?.district) !== '3220') throw new Error(`Expected Sri Lanka Dist 3220, got ${data.total}`);
        return `Sri Lanka District: ${data.districts[0]?.district} (${data.districts[0]?.clubs} clubs)`;
    });

    // -------------------------------------------------------------------------
    // 4. TOOL: search_clubs
    // -------------------------------------------------------------------------
    console.log('\n--- 4. search_clubs ---');
    await runTest('MCP', 'search_clubs (query: Bangalore, limit: 3)', async () => {
        const data = await callMcpTool('search_clubs', { query: 'Bangalore', limit: 3 });
        assertSanity(data);
        if (data.total < 10) throw new Error(`Expected at least 10 Bangalore clubs, got ${data.total}`);
        return `Matched: ${data.total}, Sample: ${data.data[0]?.name} (Dist ${data.data[0]?.district})`;
    });
    await runTest('MCP', 'search_clubs (filter: base=university, status=Active)', async () => {
        const data = await callMcpTool('search_clubs', { base: 'university', status: 'Active', limit: 3 });
        assertSanity(data);
        if (data.data.some(c => c.base !== 'University' || c.status !== 'Active')) throw new Error('Filter mismatch');
        return `Active University Clubs: ${data.total}, First: ${data.data[0]?.name}`;
    });
    await runTest('MCP', 'search_clubs (filter: sponsorsInteract=true)', async () => {
        const data = await callMcpTool('search_clubs', { sponsorsInteract: true, limit: 3 });
        assertSanity(data);
        if (data.data.some(c => !c.sponsoredInteractCount || c.sponsoredInteractCount < 1)) throw new Error('Expected positive sponsoredInteractCount');
        return `Sponsors Interact: ${data.total} clubs, Sample: ${data.data[0]?.name} (${data.data[0]?.sponsoredInteractCount} clubs)`;
    });
    await runTest('MCP', 'search_clubs (filter: isDualRisk=true)', async () => {
        const data = await callMcpTool('search_clubs', { isDualRisk: true, limit: 3 });
        assertSanity(data);
        if (data.data.some(c => !c.isArrears || !c.isNoOfficers)) throw new Error('Expected both isArrears and isNoOfficers');
        return `Dual Risk Clubs: ${data.total}, Sample: ${data.data[0]?.name}`;
    });

    // -------------------------------------------------------------------------
    // 5. TOOL: get_new_clubs
    // -------------------------------------------------------------------------
    console.log('\n--- 5. get_new_clubs ---');
    await runTest('MCP', 'get_new_clubs (default)', async () => {
        const data = await callMcpTool('get_new_clubs', { limit: 5 });
        assertSanity(data);
        if (!Number.isFinite(data.total) || data.total <= 0) {
            throw new Error(`Expected positive new-clubs total, got ${data.total}`);
        }
        if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('Expected new-clubs sample rows');
        return `Total: ${data.total}, 1st: ${data.data[0]?.name} (Charter: ${data.data[0]?.charterDate})`;
    });
    await runTest('MCP', 'get_new_clubs (zone=4)', async () => {
        const data = await callMcpTool('get_new_clubs', { zone: '4', limit: 3 });
        assertSanity(data);
        return `Zone 4 New Clubs: ${data.total}, Sample: ${data.data[0]?.name}`;
    });

    // -------------------------------------------------------------------------
    // 6. TOOL: get_club_profile
    // -------------------------------------------------------------------------
    console.log('\n--- 6. get_club_profile ---');
    await runTest('MCP', 'get_club_profile (by clubId: 8824847)', async () => {
        const data = await callMcpTool('get_club_profile', { clubId: '8824847' });
        assertSanity(data);
        if (data.id !== '8824847' && data.id !== 8824847) throw new Error(`Expected 8824847, got ${data.id}`);
        if (!data.name || !data.district) throw new Error('Missing name or district in profile');
        return `Club: ${data.name}, Dist: ${data.district}, Base: ${data.base}, Outstanding: ₹${data.outstanding}`;
    });
    await runTest('MCP', 'get_club_profile (by name: MGR University)', async () => {
        const data = await callMcpTool('get_club_profile', { clubName: 'MGR University' });
        assertSanity(data);
        if (!data.name.includes('MGR')) throw new Error(`Unexpected club name: ${data.name}`);
        return `Found by name: ${data.name} (${data.members} members)`;
    });
    await runTest('MCP', 'get_club_profile (non-existent: 999999999)', async () => {
        const data = await callMcpTool('get_club_profile', { clubId: '999999999' });
        const errText = typeof data === 'string' ? data : (data?.error || JSON.stringify(data));
        if (!/not found/i.test(errText)) {
            throw new Error(`Expected not-found error, got: ${errText}`);
        }
        if (!errText.includes('search_clubs')) {
            throw new Error(`Expected search_clubs self-healing guidance, got: ${errText}`);
        }
        return `Self-healing not-found mentions search_clubs`;
    });

    // -------------------------------------------------------------------------
    // 7. TOOL: get_district_insights
    // -------------------------------------------------------------------------
    console.log('\n--- 7. get_district_insights ---');
    await runTest('MCP', 'get_district_insights (district: 3000)', async () => {
        const data = await callMcpTool('get_district_insights', { district: '3000' });
        assertSanity(data);
        if (data.district !== '3000' || !data.leadership?.drr) throw new Error('Incomplete district insights');
        return `Dist 3000: ${data.stats?.totalClubs} clubs, DRR: ${data.leadership?.drr}, Zone: ${data.zone}`;
    });
    await runTest('MCP', 'get_district_insights (district: 3292 Nepal)', async () => {
        const data = await callMcpTool('get_district_insights', { district: '3292' });
        assertSanity(data);
        if (data.country !== 'Nepal') throw new Error(`Expected country Nepal, got ${data.country}`);
        return `Nepal Dist 3292: ${data.stats?.totalClubs} clubs, Members: ${data.stats?.totalMembers}`;
    });
    await runTest('MCP', 'get_district_insights (out-of-scope: 9999)', async () => {
        const data = await callMcpTool('get_district_insights', { district: '9999' });
        const errText = typeof data === 'string'
            ? data
            : (data?.error || (typeof data?.message === 'string' ? data.message : JSON.stringify(data)));
        if (!/not found/i.test(errText)) {
            throw new Error(`Expected not-found error, got: ${errText}`);
        }
        if (!errText.includes('get_worldwide_rankings') && !errText.includes('get_districts')) {
            throw new Error(`Expected get_worldwide_rankings or get_districts guidance, got: ${errText}`);
        }
        if (errText.includes('top_districts')) {
            throw new Error('Self-heal must not recommend invalid type top_districts');
        }
        if (!/type:\s*"district"/.test(errText)) {
            throw new Error(`Expected type: "district" guidance, got: ${errText}`);
        }
        return `Self-healing district miss guides to worldwide type district`;
    });

    // -------------------------------------------------------------------------
    // 8. TOOL: get_zone_summary
    // -------------------------------------------------------------------------
    console.log('\n--- 8. get_zone_summary ---');
    const zones = ['Zone 4', 'Zone 5', 'Zone 6', 'Zone 7'];
    for (const z of zones) {
        await runTest('MCP', `get_zone_summary (${z})`, async () => {
            const data = await callMcpTool('get_zone_summary', { zone: z });
            assertSanity(data);
            if (!data.stats?.totalClubs || data.stats.totalClubs < 100) throw new Error(`Invalid stats for ${z}`);
            return `${z}: ${data.districts?.length} districts, ${data.stats?.totalClubs} clubs, ${data.stats?.totalMembers} members`;
        });
    }
    await runTest('MCP', 'get_zone_summary (out-of-scope: 22)', async () => {
        const data = await callMcpTool('get_zone_summary', { zone: '22' });
        const errText = typeof data === 'string' ? data : (data?.error || JSON.stringify(data));
        if (!/outside|not found/i.test(errText)) {
            throw new Error(`Expected out-of-scope error, got: ${errText}`);
        }
        if (!errText.includes('get_worldwide_rankings')) {
            throw new Error(`Expected get_worldwide_rankings guidance, got: ${errText}`);
        }
        return `Self-healing zone miss guides to get_worldwide_rankings`;
    });

    // -------------------------------------------------------------------------
    // 9. TOOL: find_compliance_risks
    // -------------------------------------------------------------------------
    console.log('\n--- 9. find_compliance_risks ---');
    const riskTypes = ['arrears', 'missing_officers', 'dual_risk'];
    for (const rt of riskTypes) {
        await runTest('MCP', `find_compliance_risks (type: ${rt})`, async () => {
            const data = await callMcpTool('find_compliance_risks', { riskType: rt, limit: 3 });
            assertSanity(data);
            if (data.total < 100) throw new Error(`Unexpectedly low count for ${rt}: ${data.total}`);
            return `Risk ${rt}: ${data.total} clubs, Sample: ${data.data[0]?.name}`;
        });
    }
    await runTest('MCP', 'find_compliance_risks (district=3000, riskType=arrears)', async () => {
        const data = await callMcpTool('find_compliance_risks', { riskType: 'arrears', district: '3000', limit: 3 });
        assertSanity(data);
        if (data.data.some(c => String(c.district) !== '3000')) throw new Error('District filter leak');
        return `Arrears in Dist 3000: ${data.total} clubs`;
    });

    // -------------------------------------------------------------------------
    // 10. TOOL: find_dual_risk_clubs
    // -------------------------------------------------------------------------
    console.log('\n--- 10. find_dual_risk_clubs ---');
    await runTest('MCP', 'find_dual_risk_clubs (default)', async () => {
        const data = await callMcpTool('find_dual_risk_clubs', { limit: 5 });
        assertSanity(data);
        if (!Number.isFinite(data.total) || data.total <= 100) {
            throw new Error(`Expected dual-risk total > 100, got ${data.total}`);
        }
        if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('Expected dual-risk sample rows');
        return `Total Dual-Risk: ${data.total}, Sample: ${data.data[0]?.name}`;
    });
    await runTest('MCP', 'find_dual_risk_clubs (zone=5)', async () => {
        const data = await callMcpTool('find_dual_risk_clubs', { zone: '5', limit: 3 });
        assertSanity(data);
        if (data.data.some(c => c.zone !== 'Zone 5')) throw new Error('Zone filter leak');
        return `Zone 5 Dual-Risk: ${data.total} clubs`;
    });

    // -------------------------------------------------------------------------
    // 11. TOOL: get_interact_analytics
    // -------------------------------------------------------------------------
    console.log('\n--- 11. get_interact_analytics ---');
    await runTest('MCP', 'get_interact_analytics (default)', async () => {
        const data = await callMcpTool('get_interact_analytics', {});
        assertSanity(data);
        if (!data.overview?.totalInteractClubs || data.overview.totalInteractClubs < 8000) throw new Error('Low Interact count');
        return `Total Interact: ${data.overview.totalInteractClubs}, Sponsored by Rotaract: ${data.overview.totalInteractClubsSponsoredByRotaract}`;
    });
    await runTest('MCP', 'get_interact_analytics (district=3000)', async () => {
        const data = await callMcpTool('get_interact_analytics', { district: '3000' });
        assertSanity(data);
        return `Dist 3000 Interact: ${data.district?.district} (${data.district?.totalInteractClubs} clubs)`;
    });

    // -------------------------------------------------------------------------
    // 12. TOOL: find_rotary_opportunities
    // -------------------------------------------------------------------------
    console.log('\n--- 12. find_rotary_opportunities ---');
    let noRotaractTotal = 0;
    await runTest('MCP', 'find_rotary_opportunities (no_rotaract)', async () => {
        const data = await callMcpTool('find_rotary_opportunities', { opportunityType: 'no_rotaract', limit: 3 });
        assertSanity(data);
        if (data.opportunityType !== 'no_rotaract') {
            throw new Error(`Expected opportunityType no_rotaract, got ${data.opportunityType}`);
        }
        if (!Number.isFinite(data.total) || data.total <= 1000) {
            throw new Error(`Expected no_rotaract total > 1000, got ${data.total}`);
        }
        noRotaractTotal = data.total;
        return `Rotary w/o Rotaract: ${data.total} clubs`;
    });
    await runTest('MCP', 'find_rotary_opportunities (no_interact)', async () => {
        const data = await callMcpTool('find_rotary_opportunities', { opportunityType: 'no_interact', limit: 3 });
        assertSanity(data);
        if (data.opportunityType !== 'no_interact') {
            throw new Error(`Expected opportunityType no_interact, got ${data.opportunityType}`);
        }
        if (!Number.isFinite(data.total) || data.total <= 1000) {
            throw new Error(`Expected no_interact total > 1000, got ${data.total}`);
        }
        if (noRotaractTotal > 0 && data.total === noRotaractTotal) {
            throw new Error(`no_interact total must differ from no_rotaract (${noRotaractTotal})`);
        }
        return `Rotary w/o Interact: ${data.total} clubs`;
    });
    await runTest('MCP', 'find_rotary_opportunities type alias = opportunityType', async () => {
        const data = await callMcpTool('find_rotary_opportunities', { type: 'no_interact', limit: 1 });
        assertSanity(data);
        if (data.opportunityType !== 'no_interact') {
            throw new Error(`type alias must resolve to no_interact, got ${data.opportunityType}`);
        }
        if (!Number.isFinite(data.total) || data.total <= 1000) {
            throw new Error(`Expected no_interact total via type alias > 1000, got ${data.total}`);
        }
        return `type alias ok: opportunityType=${data.opportunityType} total=${data.total}`;
    });

    // -------------------------------------------------------------------------
    // 13. TOOL: get_foundation_giving
    // -------------------------------------------------------------------------
    console.log('\n--- 13. get_foundation_giving ---');
    await runTest('MCP', 'get_foundation_giving (default)', async () => {
        const data = await callMcpTool('get_foundation_giving', { limit: 5 });
        assertSanity(data);
        if (!Number.isFinite(data.total) || data.total <= 0) {
            throw new Error(`Expected positive TRF donor total, got ${data.total}`);
        }
        if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('Expected TRF sample rows');
        return `TRF Contributing Clubs: ${data.total}, Top: ${data.data[0]?.name} ($${data.data[0]?.totalContributionsUSD})`;
    });
    await runTest('MCP', 'get_foundation_giving (fundType: annual)', async () => {
        const data = await callMcpTool('get_foundation_giving', { fundType: 'annual', limit: 3 });
        assertSanity(data);
        return `Annual Fund Donors: ${data.total}, 1st: ${data.data[0]?.name} ($${data.data[0]?.annualFundUSD})`;
    });

    // -------------------------------------------------------------------------
    // 14. TOOL: get_worldwide_rankings (Exhaustive Permutations)
    // -------------------------------------------------------------------------
    console.log('\n--- 14. get_worldwide_rankings ---');
    const worldwideTypes = [
        { type: 'summary', desc: 'Summary Totals' },
        { type: 'country', sortBy: 'members', desc: 'Country by Members' },
        { type: 'country', sortBy: 'growth_pct', desc: 'Country by Growth %' },
        { type: 'country', sortBy: 'clubs', desc: 'Country by Clubs' },
        { type: 'country', sortBy: 'name', sortOrder: 'asc', desc: 'Country Alphabetical' },
        { type: 'district', sortBy: 'member_growth_pct', desc: 'District Growth %' },
        { type: 'district', sortBy: 'members', desc: 'District by Members' },
        { type: 'district', zone: '4,5,6,7', desc: 'South Asia Districts Only' },
        { type: 'clubs', base: 'all', desc: 'All Worldwide Clubs' },
        { type: 'clubs', base: 'community', desc: 'Worldwide Community Clubs' },
        { type: 'clubs', base: 'university', desc: 'Worldwide University Clubs' },
        { type: 'interact', desc: 'Worldwide Interact Stats' },
        { type: 'new_clubs', desc: 'Worldwide New Clubs' }
    ];

    for (const wt of worldwideTypes) {
        await runTest('MCP', `get_worldwide_rankings (${wt.desc})`, async () => {
            const data = await callMcpTool('get_worldwide_rankings', { ...wt, limit: 5 });
            assertSanity(data);
            if (wt.type === 'country') {
                if (data.countries?.[0]?.country === 'Unknown') throw new Error('Country name returned Unknown');
                return `Top: ${data.countries[0]?.country} (${data.countries[0]?.totalMembers} members, ${data.countries[0]?.activeClubs} clubs)`;
            }
            if (wt.type === 'district') {
                return `Top: Dist ${data.districts[0]?.district} (Worldwide Rank: ${data.districts[0]?.worldwideRank})`;
            }
            if (wt.type === 'clubs') {
                return `Top: ${data.clubs[0]?.clubName} (${data.clubs[0]?.members} members, ${data.clubs[0]?.country})`;
            }
            if (wt.type === 'summary') {
                return `Worldwide: ${data.totalClubs} clubs, ${data.totalMembers} members`;
            }
            return `OK: returned ${data.returned || data.count || data.total}`;
        });
    }

    // Worldwide Country Filter Tests
    const testCountries = ['India', 'Philippines', 'Italy', 'United States', 'Uganda', 'Nigeria', 'Brazil', 'Nepal', 'Sri Lanka'];
    for (const c of testCountries) {
        await runTest('MCP', `get_worldwide_rankings (country filter: ${c})`, async () => {
            const data = await callMcpTool('get_worldwide_rankings', { type: 'country', country: c });
            assertSanity(data);
            const found = data.countries?.find(item => item.country.toLowerCase().includes(c.toLowerCase()));
            if (!found) throw new Error(`Could not find ${c} in country filter results`);
            return `Matched ${found.country}: ${found.activeClubs} clubs, ${found.totalMembers} members`;
        });
    }

    // -------------------------------------------------------------------------
    // 15. Edge-case / deep-pass regressions (test report + plan matrix)
    // -------------------------------------------------------------------------
    console.log('\n--- 15. Edge-case regressions ---');
    await runTest('MCP', 'get_worldwide_rankings district=3233 limit=1', async () => {
        const data = await callMcpTool('get_worldwide_rankings', { type: 'district', district: '3233', limit: 1 });
        assertSanity(data);
        if (String(data.districts?.[0]?.district) !== '3233') {
            throw new Error(`Expected district 3233, got ${data.districts?.[0]?.district}`);
        }
        if (!data.districts[0].worldwideRank) throw new Error('Missing worldwideRank');
        return `3233 worldwideRank=${data.districts[0].worldwideRank} southAsiaRank=${data.districts[0].southAsiaRank}`;
    });
    await runTest('MCP', 'get_worldwide_rankings district=0000 not found', async () => {
        const data = await callMcpTool('get_worldwide_rankings', { type: 'district', district: '0000', limit: 1 });
        if (!data.error || data.total !== 0 || (data.districts && data.districts.length !== 0)) {
            throw new Error(`Expected not-found empty payload, got total=${data.total} error=${data.error} districts=${data.districts?.length}`);
        }
        return data.error;
    });
    await runTest('MCP', 'get_summary invalid zone errors', async () => {
        const res = await fetch(`${BASE_URL}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'bad-zone',
                method: 'tools/call',
                params: { name: 'get_summary', arguments: { zone: '9' } }
            })
        });
        const json = await res.json();
        const text = json.result?.content?.[0]?.text || '';
        if (!json.result?.isError && !/not found|unsupported|invalid/i.test(text)) {
            throw new Error(`Expected error for zone 9, got: ${text.slice(0, 200)}`);
        }
        return 'zone 9 rejected';
    });
    await runTest('MCP', 'search_clubs isArrears="false" not truthy', async () => {
        const data = await callMcpTool('search_clubs', { isArrears: 'false', limit: 5 });
        assertSanity(data);
        if (data.data?.some(c => c.isArrears)) throw new Error('isArrears=false returned arrears clubs');
        return `non-arrears sample total=${data.total}`;
    });
    await runTest('MCP', 'search_clubs multi-zone 4,5,6,7', async () => {
        const data = await callMcpTool('search_clubs', { zone: '4,5,6,7', limit: 100 });
        assertSanity(data);
        const [z4, z5, z6, z7] = await Promise.all([
            callMcpTool('search_clubs', { zone: '4', limit: 1 }),
            callMcpTool('search_clubs', { zone: '5', limit: 1 }),
            callMcpTool('search_clubs', { zone: '6', limit: 1 }),
            callMcpTool('search_clubs', { zone: '7', limit: 1 })
        ]);
        const expected = z4.total + z5.total + z6.total + z7.total;
        if (data.total !== expected) throw new Error(`Expected multi-zone total ${expected}, got ${data.total}`);
        if (data.data?.some(c => !['Zone 4', 'Zone 5', 'Zone 6', 'Zone 7'].includes(c.zone))) {
            throw new Error('Unexpected zone outside 4-7');
        }
        return `multi total=${data.total} (== sum of zones)`;
    });
    await runTest('MCP', 'get_leaderboards zone=5 TRF non-empty', async () => {
        const data = await callMcpTool('get_leaderboards', { category: 'trf_giving', zone: '5', limit: 5 });
        assertSanity(data);
        if (!data.data?.length) throw new Error('TRF zone=5 returned empty');
        if (data.data.some(c => c.zone && c.zone !== 'Zone 5')) throw new Error('Zone leak in TRF');
        return `TRF zone5 count=${data.data.length}`;
    });
    await runTest('MCP', 'get_club_profile districtLeadership', async () => {
        const data = await callMcpTool('get_club_profile', { clubId: '8825786' });
        assertSanity(data);
        if (!data.districtLeadership) throw new Error('Missing districtLeadership');
        return `DG=${data.districtLeadership.dg || '(none)'} DRR=${data.districtLeadership.drr || '(none)'}`;
    });
    await runTest('MCP', 'search_clubs limitCapped', async () => {
        const data = await callMcpTool('search_clubs', { limit: 250 });
        if (!data.pagination?.limitCapped && !data.limitCapped) throw new Error('Expected limitCapped');
        if ((data.pagination?.limit || data.limit) > 100) throw new Error('Limit not capped to 100');
        return `limit=${data.pagination?.limit || data.limit} capped`;
    });
    await runTest('MCP', 'worldwide interact region=south_asia no zone 15/16/25', async () => {
        const data = await callMcpTool('get_worldwide_rankings', {
            type: 'interact',
            region: 'south_asia',
            limit: 100
        });
        assertSanity(data);
        if (!data.total || data.total < 10) throw new Error(`Expected SA interact districts, got ${data.total}`);
        const zoneNum = (z) => parseInt(String(z || '').replace(/\D/g, ''), 10);
        const bad = (data.districts || []).filter(d => ![4, 5, 6, 7].includes(zoneNum(d.Zone || d.zone)));
        if (bad.length) throw new Error(`Non-SA zone leak: ${bad.map(d => d.Zone).join(',')}`);
        const fifteen = (data.districts || []).filter(d => [15, 16, 25].includes(zoneNum(d.Zone || d.zone)));
        if (fifteen.length) throw new Error(`Substring zone leak: ${fifteen.map(d => d.Zone).join(',')}`);
        return `SA interact districts=${data.total}`;
    });
    await runTest('MCP', 'tools/call missing name -> -32602', async () => {
        const res = await fetch(`${BASE_URL}/api/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'no-name',
                method: 'tools/call',
                params: { arguments: {} }
            })
        });
        const json = await res.json();
        if (json.error?.code !== -32602) throw new Error(`Expected -32602, got ${JSON.stringify(json.error)}`);
        return json.error.message;
    });
    await runTest('MCP', 'get_worldwide_rankings rejects bogus type', async () => {
        const data = await callMcpTool('get_worldwide_rankings', { type: 'bogus', limit: 3 });
        const errText = typeof data === 'string' ? data : (data?.error || JSON.stringify(data));
        if (!/Invalid type/i.test(errText) || !errText.includes('district')) {
            throw new Error(`Expected invalid-type guidance, got: ${errText}`);
        }
        return 'bogus type rejected';
    });
    await runTest('MCP', 'get_worldwide_rankings top_districts alias', async () => {
        const data = await callMcpTool('get_worldwide_rankings', {
            type: 'top_districts',
            sortBy: 'member_growth_pct',
            limit: 3
        });
        if (data.error && !data.districts) throw new Error(`Alias failed: ${data.error}`);
        if (!Array.isArray(data.districts) || data.districts.length === 0) {
            throw new Error('Expected districts array from top_districts alias');
        }
        if (!Number.isFinite(data.total) || data.total <= 0) {
            throw new Error(`Expected positive total, got ${data.total}`);
        }
        return `alias ok total=${data.total} returned=${data.districts.length}`;
    });

    console.log('\n====================================================');
    console.log(`DEEP TEST SUITE COMPLETE: ${passedTests} / ${totalTests} PASSED, ${failedTests} FAILED`);
    console.log('====================================================');

    if (failedTests > 0) {
        console.error('\nFAILURES SUMMARY:');
        findings.forEach(f => console.error(`- ${f.testName}: ${f.error}`));
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error in test suite:', err);
    process.exit(1);
});
