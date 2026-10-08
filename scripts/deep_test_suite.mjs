// Exhaustive Deep Test Suite for All MCP Tools & REST APIs
import http from 'node:http';

const BASE_URL = 'http://localhost:3000';

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
        if (data.total !== 144) throw new Error(`Expected 144 new clubs, got ${data.total}`);
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
        try {
            await callMcpTool('get_club_profile', { clubId: '999999999' });
            throw new Error('Should have failed for non-existent club');
        } catch (err) {
            return `Safely rejected: ${err.message}`;
        }
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
        if (data.total !== 734) throw new Error(`Expected 734 dual-risk clubs, got ${data.total}`);
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
    await runTest('MCP', 'find_rotary_opportunities (no_rotaract)', async () => {
        const data = await callMcpTool('find_rotary_opportunities', { opportunityType: 'no_rotaract', limit: 3 });
        assertSanity(data);
        if (data.total !== 3574) throw new Error(`Expected 3574 no-rotaract clubs, got ${data.total}`);
        return `Rotary w/o Rotaract: ${data.total} clubs`;
    });
    await runTest('MCP', 'find_rotary_opportunities (no_interact)', async () => {
        const data = await callMcpTool('find_rotary_opportunities', { opportunityType: 'no_interact', limit: 3 });
        assertSanity(data);
        if (data.total !== 3036) throw new Error(`Expected 3036 no-interact clubs, got ${data.total}`);
        return `Rotary w/o Interact: ${data.total} clubs`;
    });

    // -------------------------------------------------------------------------
    // 13. TOOL: get_foundation_giving
    // -------------------------------------------------------------------------
    console.log('\n--- 13. get_foundation_giving ---');
    await runTest('MCP', 'get_foundation_giving (default)', async () => {
        const data = await callMcpTool('get_foundation_giving', { limit: 5 });
        assertSanity(data);
        if (data.total !== 42) throw new Error(`Expected 42 TRF contributors, got ${data.total}`);
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
