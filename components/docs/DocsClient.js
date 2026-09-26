'use client';

import { useState } from 'react';

const MCP_TOOLS = [
    {
        name: 'get_summary',
        label: 'Executive Summary',
        badge: 'Macro KPIs',
        description: 'Retrieve macro performance indicators and executive summary metrics for South Asia or scoped to a specific Zone (Zone 4, 5, 6, 7). Returns total clubs, reported members, financial arrears, total dues (INR/USD), clubs missing officers, TRF giving, new clubs, and university vs community breakdown.',
        exampleArgs: { zone: 'Zone 5' },
        examplePrompt: 'What are the overall membership, club counts, and arrears dues for Zone 5?',
        params: [
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter (e.g. "Zone 5" or "5")' }
        ]
    },
    {
        name: 'get_leaderboards',
        label: 'Rankings & Leaderboards',
        badge: 'Top Charts',
        description: 'Retrieve top rankings across South Asia for largest clubs (by membership), top TRF donors, highest arrears dues, at-risk clubs, top districts (by clubs, members, TRF, arrears, or growth), and new charters. Supports optional scoping to a district, zone, or country.',
        exampleArgs: { category: 'largest_clubs', limit: 5 },
        examplePrompt: 'What are the top 5 largest Rotaract clubs in South Asia by reported membership?',
        params: [
            { name: 'category', type: 'string', required: false, desc: 'Category: "largest_clubs", "districts_by_member_growth", "community_clubs", "university_clubs", "trf_giving", "highest_arrears", "at_risk_clubs", "districts_by_clubs", "districts_by_members", "districts_by_trf", "districts_by_arrears", "districts_by_growth", "new_clubs", or "all"' },
            { name: 'district', type: 'string', required: false, desc: 'Optional 4-digit district filter (e.g. "3000")' },
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter (e.g. "Zone 5" or "5")' },
            { name: 'country', type: 'string', required: false, desc: 'Filter by country: "India", "Nepal", or "Sri Lanka"' },
            { name: 'base', type: 'string', required: false, desc: 'Base filter: "Community" or "University"' },
            { name: 'limit', type: 'integer', required: false, desc: 'Number of top items (1-50, default 10)' }
        ]
    },
    {
        name: 'get_districts',
        label: 'All Districts Directory',
        badge: '44 Districts',
        description: 'Retrieve all 44 Rotary districts in South Asia with comprehensive KPIs, leadership contacts (DG, DRR, DRC), financial health, TRF contributions, and growth metrics. Supports filtering by zone and sorting.',
        exampleArgs: { sortBy: 'totalClubs', sortOrder: 'desc' },
        examplePrompt: 'List all 44 districts sorted by total clubs descending.',
        params: [
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter (e.g. "Zone 5" or "5")' },
            { name: 'sortBy', type: 'string', required: false, desc: 'Sort by: "totalClubs", "members", "arrearsClubs", "outstanding", "trf", "newClubs", "interactGrowth", "district"' },
            { name: 'sortOrder', type: 'string', required: false, desc: 'Sort order: "desc" or "asc"' }
        ]
    },
    {
        name: 'search_clubs',
        label: 'Search & Filter Clubs',
        badge: 'Query Engine',
        description: 'Search, filter, and sort across 2,870+ Rotaract clubs in South Asia. Use sortBy="members" to find largest clubs, or sortBy="outstanding" for highest dues. Supports filtering by country (India, Nepal, Sri Lanka) and Interact sponsorship.',
        exampleArgs: { query: 'Delhi', sortBy: 'members', sortOrder: 'desc', limit: 3 },
        examplePrompt: 'Find active university-based Rotaract clubs in Delhi sorted by membership.',
        params: [
            { name: 'query', type: 'string', required: false, desc: 'Search keyword matching club name, club ID, sponsor club, or country' },
            { name: 'district', type: 'string', required: false, desc: 'Rotary district number (e.g. "3000")' },
            { name: 'zone', type: 'string', required: false, desc: 'Rotary zone (e.g. "Zone 5" or "5")' },
            { name: 'country', type: 'string', required: false, desc: 'Country: "India", "Nepal", or "Sri Lanka"' },
            { name: 'base', type: 'string', required: false, desc: 'Base type: "Community" or "University"' },
            { name: 'sponsorsInteract', type: 'boolean', required: false, desc: 'Filter clubs sponsoring Interact clubs' },
            { name: 'sortBy', type: 'string', required: false, desc: 'Sort field: "members", "outstanding", "trf", "interact", "name", or "charterDate"' },
            { name: 'sortOrder', type: 'string', required: false, desc: 'Sort order: "desc" (highest first) or "asc"' },
            { name: 'minMembers', type: 'integer', required: false, desc: 'Minimum reported members filter' },
            { name: 'maxMembers', type: 'integer', required: false, desc: 'Maximum reported members filter' },
            { name: 'minOutstanding', type: 'number', required: false, desc: 'Minimum outstanding dues filter' },
            { name: 'isArrears', type: 'boolean', required: false, desc: 'Filter clubs with outstanding dues' },
            { name: 'isAtRisk', type: 'boolean', required: false, desc: 'Filter clubs at termination risk (dues >= $75 USD)' },
            { name: 'isNoOfficers', type: 'boolean', required: false, desc: 'Filter clubs missing reported officers' },
            { name: 'isNewClub', type: 'boolean', required: false, desc: 'Filter newly chartered clubs' },
            { name: 'limit', type: 'integer', required: false, desc: 'Number of clubs to return (1-100, default 25)' },
            { name: 'offset', type: 'integer', required: false, desc: 'Pagination offset (default 0)' }
        ]
    },
    {
        name: 'get_new_clubs',
        label: 'Newly Chartered Clubs',
        badge: 'New Charters',
        description: 'Retrieve newly chartered Rotaract clubs in South Asia (126 clubs chartered during the current period) with charter dates, member counts, sponsor Rotary clubs, and district mapping.',
        exampleArgs: { limit: 5 },
        examplePrompt: 'Which new Rotaract clubs were chartered in District 3000?',
        params: [
            { name: 'district', type: 'string', required: false, desc: 'Optional district number filter' },
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter' },
            { name: 'base', type: 'string', required: false, desc: 'Base filter: "Community" or "University"' },
            { name: 'sortBy', type: 'string', required: false, desc: 'Sort field: "charterDate", "members", or "name"' },
            { name: 'sortOrder', type: 'string', required: false, desc: 'Sort order: "desc" or "asc"' },
            { name: 'limit', type: 'integer', required: false, desc: 'Number of clubs to return (1-100, default 25)' },
            { name: 'offset', type: 'integer', required: false, desc: 'Pagination offset (default 0)' }
        ]
    },
    {
        name: 'get_club_profile',
        label: 'Universal Club Profile',
        badge: 'O(1) Hash Map',
        description: 'Retrieve the complete dossier for a single Rotaract club by its Rotary Club ID or club name, including membership, compliance status, dues outstanding, TRF giving, and sponsored Interact clubs.',
        exampleArgs: { clubId: '8824847' },
        examplePrompt: 'Get the full profile and compliance standing for club ID 8824847.',
        params: [
            { name: 'clubId', type: 'string', required: true, desc: 'The unique Rotary Club ID or club name' }
        ]
    },
    {
        name: 'get_district_insights',
        label: 'District Insights & Leadership',
        badge: 'District Analytics',
        description: 'Get deep analytical insights, KPI metrics, leadership contacts (DG, DRR, DRC), and club health metrics for a specific Rotary district.',
        exampleArgs: { district: '3000' },
        examplePrompt: 'What is the current health and officer roster for District 3000?',
        params: [
            { name: 'district', type: 'string', required: true, desc: 'The 4-digit Rotary district number (e.g. "3000", "3141", "3292")' }
        ]
    },
    {
        name: 'get_zone_summary',
        label: 'Zone Macro Summary',
        badge: 'Zone Rollup',
        description: 'Retrieve executive summary, total club counts, active members, arrears metrics, and district breakdown for an entire RI Zone (4, 5, 6, or 7).',
        exampleArgs: { zone: '5' },
        examplePrompt: 'Give me a macro summary of membership and total clubs in Zone 5.',
        params: [
            { name: 'zone', type: 'string', required: true, desc: 'RI Zone identifier (e.g. "4", "5", "6", "7", or "Zone 5")' }
        ]
    },
    {
        name: 'find_compliance_risks',
        label: 'Compliance & Arrears Risks',
        badge: 'Risk Monitor',
        description: 'Identify Rotaract clubs at risk of termination or non-compliance due to unpaid financial dues (arrears) or missing officer reporting. Supports dual-risk queries.',
        exampleArgs: { riskType: 'at_risk_only', limit: 5 },
        examplePrompt: 'Which clubs have outstanding dues of $75 USD or more and are at immediate risk of termination?',
        params: [
            { name: 'riskType', type: 'string', required: false, desc: 'Type: "arrears", "missing_officers", "at_risk_only", or "dual_risk"' },
            { name: 'district', type: 'string', required: false, desc: 'Optional district number filter' },
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter' },
            { name: 'country', type: 'string', required: false, desc: 'Filter by country: "India", "Nepal", "Sri Lanka"' },
            { name: 'limit', type: 'integer', required: false, desc: 'Maximum clubs to return (1-100, default 25)' }
        ]
    },
    {
        name: 'find_dual_risk_clubs',
        label: 'Dual Non-Compliance Risk',
        badge: 'Highest Risk (761 Clubs)',
        description: 'Find Rotaract clubs that have BOTH outstanding financial arrears AND missing officer reports simultaneously - the highest aggregate compliance risk group.',
        exampleArgs: { limit: 5 },
        examplePrompt: 'Show me the clubs with both financial arrears and missing officers in District 3000.',
        params: [
            { name: 'district', type: 'string', required: false, desc: 'Optional district number filter' },
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter' },
            { name: 'country', type: 'string', required: false, desc: 'Filter by country: "India", "Nepal", "Sri Lanka"' },
            { name: 'limit', type: 'integer', required: false, desc: 'Maximum clubs to return (1-100, default 25)' }
        ]
    },
    {
        name: 'get_interact_analytics',
        label: 'Interact Analytics & Sponsors',
        badge: '8,921 Interact Clubs',
        description: 'Retrieve Interact statistics across South Asia: 8,921 total Interact clubs, 137 Interact clubs sponsored by 65 Rotaract clubs, district/zone breakdowns, and suspended club tracking.',
        exampleArgs: {},
        examplePrompt: 'Which Rotaract clubs in South Asia sponsor Interact clubs?',
        params: [
            { name: 'district', type: 'string', required: false, desc: 'Optional district number filter' },
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter' }
        ]
    },
    {
        name: 'find_rotary_opportunities',
        label: 'Rotary Sponsorship Opportunities',
        badge: 'Extension Opportunity',
        description: 'Find Rotary clubs with extension opportunities: Rotary clubs that do not currently sponsor any Rotaract club, or Rotary clubs without an Interact club.',
        exampleArgs: { opportunityType: 'no_rotaract', district: '3000', limit: 5 },
        examplePrompt: 'Which Rotary clubs in District 3000 do not sponsor any Rotaract club?',
        params: [
            { name: 'opportunityType', type: 'string', required: false, desc: 'Type: "no_rotaract" (default) or "no_interact"' },
            { name: 'district', type: 'string', required: false, desc: 'Optional district number filter' },
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter' },
            { name: 'limit', type: 'integer', required: false, desc: 'Maximum clubs to return (1-100, default 25)' }
        ]
    },
    {
        name: 'get_foundation_giving',
        label: 'The Rotary Foundation Giving',
        badge: 'TRF Contributions',
        description: 'Retrieve The Rotary Foundation (TRF) giving metrics for Rotaract clubs, including Annual Fund, PolioPlus, and total contributions.',
        exampleArgs: { limit: 5 },
        examplePrompt: 'Show me the top contributing Rotaract clubs to The Rotary Foundation.',
        params: [
            { name: 'district', type: 'string', required: false, desc: 'Optional district number filter' },
            { name: 'zone', type: 'string', required: false, desc: 'Optional zone filter' },
            { name: 'limit', type: 'integer', required: false, desc: 'Maximum records to return (default 25)' }
        ]
    },
    {
        name: 'get_worldwide_rankings',
        label: 'Worldwide Rankings & Growth',
        badge: 'Global Analytics',
        description: 'Retrieve worldwide Rotaract and Interact statistics, country growth rankings, and district leaderboards across the globe.',
        exampleArgs: { type: 'summary' },
        examplePrompt: 'How does India rank globally in total Rotaract clubs and member growth?',
        params: [
            { name: 'type', type: 'string', required: false, desc: 'Focus: "summary", "country", "district", "interact", "new_clubs", or "all"' },
            { name: 'country', type: 'string', required: false, desc: 'Filter country name (e.g. "India", "Nepal")' },
            { name: 'zone', type: 'string', required: false, desc: 'Filter Rotary zone (e.g. "6", "4", "19")' },
            { name: 'sortBy', type: 'string', required: false, desc: 'Sort metric: "member_growth_pct" (default), "members", "clubs", "club_growth_pct", etc.' },
            { name: 'sortOrder', type: 'string', required: false, desc: 'Sort order: "desc" (default) or "asc"' },
            { name: 'minMembers', type: 'integer', required: false, desc: 'Minimum reported members filter' },
            { name: 'limit', type: 'integer', required: false, desc: 'Page size limit (default 10)' }
        ]
    }
];

export default function DocsClient() {
    const [activeTab, setActiveTab] = useState('api');
    const [activeClientTab, setActiveClientTab] = useState('claude');
    const [copiedKey, setCopiedKey] = useState('');
    
    // Live Tool Tester state
    const [selectedToolIndex, setSelectedToolIndex] = useState(0);
    const [toolArgsText, setToolArgsText] = useState(JSON.stringify(MCP_TOOLS[0].exampleArgs, null, 2));
    const [testLoading, setTestLoading] = useState(false);
    const [testResponse, setTestResponse] = useState(null);

    const handleCopy = (key, text) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(''), 2500);
    };

    const handleSelectTool = (idx) => {
        setSelectedToolIndex(idx);
        setToolArgsText(JSON.stringify(MCP_TOOLS[idx].exampleArgs, null, 2));
        setTestResponse(null);
    };

    const handleRunTool = async () => {
        setTestLoading(true);
        setTestResponse(null);
        const tool = MCP_TOOLS[selectedToolIndex];
        let parsedArgs = {};
        try {
            parsedArgs = toolArgsText.trim() ? JSON.parse(toolArgsText) : {};
        } catch (e) {
            setTestResponse({ error: 'Invalid JSON in arguments input: ' + e.message });
            setTestLoading(false);
            return;
        }

        const startTime = Date.now();
        try {
            const res = await fetch('/api/mcp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'tools/call',
                    params: {
                        name: tool.name,
                        arguments: parsedArgs
                    }
                })
            });
            const data = await res.json();
            const elapsed = Date.now() - startTime;
            setTestResponse({
                status: res.status,
                elapsedMs: elapsed,
                body: data
            });
        } catch (err) {
            setTestResponse({
                status: 500,
                error: err.message
            });
        } finally {
            setTestLoading(false);
        }
    };

    const claudeConfig = JSON.stringify({
        mcpServers: {
            "rotaract-south-asia": {
                command: "node",
                args: ["<ABSOLUTE_PATH_TO_REPO>/scripts/mcp_server.js"]
            }
        }
    }, null, 2);

    const cursorConfig = JSON.stringify({
        name: "rotaract-south-asia",
        type: "command",
        command: "node <ABSOLUTE_PATH_TO_REPO>/scripts/mcp_server.js"
    }, null, 2);

    const antigravityConfig = JSON.stringify({
        mcpServers: {
            "rotaract-south-asia": {
                command: "node",
                args: ["<ABSOLUTE_PATH_TO_REPO>/scripts/mcp_server.js"]
            }
        }
    }, null, 2);

    const httpConfig = `POST https://insights.rsamdio.org/api/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_clubs",
    "arguments": { "query": "Delhi", "limit": 5 }
  }
}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '50px' }}>
            {/* Header Hero */}
            <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: '#e6f0fa',
                        border: '1px solid #bfdbfe',
                        marginBottom: '10px'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f4c81' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f4c81' }}>Developer & AI Agent Hub</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>
                        Rotaract South Asia Analytics API & MCP Server
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', maxWidth: '780px', lineHeight: '1.6' }}>
                        Open, verified analytics for Rotaract Zones 4, 5, 6, and 7 (44 districts, 2,870+ clubs).
                        Explore via standard REST endpoints or empower AI coding assistants with the Model Context Protocol (MCP) server.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a
                        href="/openapi.json"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '9px 16px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1e293b',
                            textDecoration: 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        Download openapi.json
                    </a>
                    <a
                        href="/docs.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '9px 16px',
                            background: '#0f4c81',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#ffffff',
                            textDecoration: 'none',
                            boxShadow: '0 1px 3px rgba(15, 76, 129, 0.25)'
                        }}
                    >
                        Fullscreen Docs ↗
                    </a>
                </div>
            </div>

            {/* Top Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => setActiveTab('api')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'api' ? '#ffffff' : 'transparent',
                        border: '1px solid',
                        borderColor: activeTab === 'api' ? '#e2e8f0' : 'transparent',
                        borderBottom: activeTab === 'api' ? '3px solid #0f4c81' : '3px solid transparent',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: activeTab === 'api' ? '#0f4c81' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '-2px'
                    }}
                >
                    <span>📡 REST API Reference</span>
                    <span style={{ fontSize: '11px', background: '#e6f0fa', color: '#0f4c81', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>19 Endpoints</span>
                </button>
                <button
                    onClick={() => setActiveTab('mcp')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'mcp' ? '#ffffff' : 'transparent',
                        border: '1px solid',
                        borderColor: activeTab === 'mcp' ? '#e2e8f0' : 'transparent',
                        borderBottom: activeTab === 'mcp' ? '3px solid #0f4c81' : '3px solid transparent',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: activeTab === 'mcp' ? '#0f4c81' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '-2px'
                    }}
                >
                    <span>🤖 Model Context Protocol (MCP) Server</span>
                    <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>14 AI Tools</span>
                </button>
            </div>

            {/* TAB 1: REST API Reference */}
            {activeTab === 'api' && (
                <div style={{
                    width: '100%',
                    height: '850px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    background: '#ffffff'
                }}>
                    <iframe
                        src="/docs.html"
                        title="Rotaract South Asia Analytics REST API Documentation"
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    />
                </div>
            )}

            {/* TAB 2: Model Context Protocol (MCP) Documentation */}
            {activeTab === 'mcp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* What is MCP section */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '26px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '19px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>What is Model Context Protocol (MCP)?</span>
                        </h3>
                        <p style={{ margin: 0, color: '#475569', fontSize: '14.5px', lineHeight: '1.6' }}>
                            Model Context Protocol (MCP) is an open standard that enables AI assistants (such as Claude Desktop, Cursor IDE, Antigravity, and custom LLM workflows) to securely discover and invoke specialized tools. With this MCP server, your AI agent can query membership records, calculate arrears risks, lookup district leadership, and verify compliance directly against verified South Asian data.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '6px' }}>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f4c81', marginBottom: '4px' }}>⚡ Stdio Local Transport</div>
                                <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.5' }}>Run locally with zero network overhead using <code>scripts/mcp_server.js</code>.</div>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f4c81', marginBottom: '4px' }}>🌐 Remote HTTP Endpoint</div>
                                <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.5' }}>Send JSON-RPC 2.0 requests to <code>https://insights.rsamdio.org/api/mcp</code>.</div>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f4c81', marginBottom: '4px' }}>🛡️ Zero Authentication</div>
                                <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.5' }}>Public, open data, read-only analytics with instant answers.</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Connect Configuration Cards */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '26px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Connect to Your AI Assistant</h3>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Select your AI client below to copy the connection configuration.</div>
                            </div>
                        </div>

                        {/* Client Selector Pills */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                                { id: 'claude', name: 'Claude Desktop' },
                                { id: 'cursor', name: 'Cursor IDE' },
                                { id: 'antigravity', name: 'Antigravity / Gemini' },
                                { id: 'http', name: 'Remote HTTP / JSON-RPC' }
                            ].map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveClientTab(c.id)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        border: '1px solid',
                                        borderColor: activeClientTab === c.id ? '#0f4c81' : '#cbd5e1',
                                        background: activeClientTab === c.id ? '#e6f0fa' : '#ffffff',
                                        color: activeClientTab === c.id ? '#0f4c81' : '#475569',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>

                        {/* Code snippet display */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                background: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '10px',
                                padding: '18px',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontSize: '13px',
                                color: '#f8fafc',
                                overflowX: 'auto',
                                maxHeight: '240px',
                                lineHeight: '1.5'
                            }}>
                                <pre style={{ margin: 0 }}>
                                    {activeClientTab === 'claude' && claudeConfig}
                                    {activeClientTab === 'cursor' && cursorConfig}
                                    {activeClientTab === 'antigravity' && antigravityConfig}
                                    {activeClientTab === 'http' && httpConfig}
                                </pre>
                            </div>
                            <button
                                onClick={() => {
                                    const text = activeClientTab === 'claude' ? claudeConfig :
                                        activeClientTab === 'cursor' ? cursorConfig :
                                        activeClientTab === 'antigravity' ? antigravityConfig : httpConfig;
                                    handleCopy('client_config', text);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    padding: '7px 14px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#ffffff',
                                    cursor: 'pointer'
                                }}
                            >
                                {copiedKey === 'client_config' ? '✔ Copied!' : 'Copy Config'}
                            </button>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                            {activeClientTab === 'claude' && 'Add this block to claude_desktop_config.json located in your Claude Application Support directory.'}
                            {activeClientTab === 'cursor' && 'Add in Cursor under Settings > Features > MCP Servers (Command type).'}
                            {activeClientTab === 'antigravity' && 'Add to your mcp_config.json file in ~/.gemini/config/.'}
                            {activeClientTab === 'http' && 'Send HTTP POST requests with Content-Type: application/json to execute tools directly over the web.'}
                        </div>
                    </div>

                    {/* Live Interactive MCP Playground */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '26px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Live MCP Tool Playground</h3>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Test any of the 14 MCP tools live in your browser against the API endpoint.</div>
                            </div>
                            <button
                                onClick={handleRunTool}
                                disabled={testLoading}
                                style={{
                                    padding: '10px 22px',
                                    background: testLoading ? '#94a3b8' : '#0f4c81',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: testLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 4px rgba(15, 76, 129, 0.2)'
                                }}
                            >
                                {testLoading ? 'Executing...' : '▶ Execute Tool'}
                            </button>
                        </div>

                        {/* Tool selector with clean, high-contrast light theme */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            background: '#f8fafc',
                            padding: '14px 18px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>Select Tool:</label>
                            <select
                                value={selectedToolIndex}
                                onChange={(e) => handleSelectTool(Number(e.target.value))}
                                style={{
                                    padding: '9px 14px',
                                    borderRadius: '8px',
                                    background: '#ffffff',
                                    border: '1.5px solid #cbd5e1',
                                    color: '#0f172a',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    minWidth: '320px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                }}
                            >
                                {MCP_TOOLS.map((t, idx) => (
                                    <option key={t.name} value={idx}>{t.name} ({t.label})</option>
                                ))}
                            </select>
                            <span style={{ fontSize: '13px', color: '#64748b', flex: 1 }}>
                                {MCP_TOOLS[selectedToolIndex].description}
                            </span>
                        </div>

                        {/* Arguments & Response Split View with clean light theme */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Arguments (JSON):</div>
                                <textarea
                                    value={toolArgsText}
                                    onChange={(e) => setToolArgsText(e.target.value)}
                                    rows={8}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '8px',
                                        background: '#ffffff',
                                        border: '1.5px solid #cbd5e1',
                                        color: '#0f172a',
                                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                        fontSize: '13px',
                                        lineHeight: '1.5',
                                        boxSizing: 'border-box',
                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>Response:</span>
                                    {testResponse?.elapsedMs && (
                                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                                            ✔ {testResponse.elapsedMs}ms | HTTP {testResponse.status}
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '175px',
                                    padding: '12px 14px',
                                    borderRadius: '8px',
                                    background: '#f8fafc',
                                    border: '1.5px solid #cbd5e1',
                                    color: testResponse?.error ? '#dc2626' : '#0f172a',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                    fontSize: '12.5px',
                                    lineHeight: '1.5',
                                    overflowY: 'auto',
                                    boxSizing: 'border-box',
                                    whiteSpace: 'pre-wrap',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                                }}>
                                    {testResponse ? (
                                        JSON.stringify(testResponse.body || testResponse.error, null, 2)
                                    ) : (
                                        <span style={{ color: '#94a3b8' }}>Click "Execute Tool" to test response from /api/mcp...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Tool Reference Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ margin: '8px 0 4px 0', fontSize: '20px', color: '#1e293b' }}>
                                Available AI Tools Directory (8 Tools)
                            </h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                Your AI model can invoke any of the following tools automatically based on the user's conversational intent.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
                            {MCP_TOOLS.map(tool => (
                                <div
                                    key={tool.name}
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '15px', fontWeight: 'bold', color: '#0f4c81' }}>
                                                {tool.name}
                                            </span>
                                        </div>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '3px 10px',
                                            borderRadius: '6px',
                                            background: '#e6f0fa',
                                            color: '#0f4c81',
                                            border: '1px solid #bfdbfe'
                                        }}>
                                            {tool.badge}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
                                        {tool.description}
                                    </div>

                                    {/* Parameters table */}
                                    {tool.params.length > 0 && (
                                        <div style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '10px 14px',
                                            fontSize: '12px'
                                        }}>
                                            <div style={{ fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Parameters:</div>
                                            {tool.params.map(p => (
                                                <div key={p.name} style={{ display: 'flex', gap: '8px', marginBottom: '5px', lineHeight: '1.4' }}>
                                                    <code style={{ color: '#0f4c81', fontWeight: 600, fontSize: '12px' }}>{p.name}</code>
                                                    <span style={{ color: '#64748b', fontSize: '11px' }}>({p.type}{p.required ? ', required' : ''}):</span>
                                                    <span style={{ color: '#475569', flex: 1 }}>{p.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Example Prompt */}
                                    <div style={{
                                        fontSize: '12.5px',
                                        color: '#475569',
                                        background: '#f1f5f9',
                                        borderLeft: '3px solid #0f4c81',
                                        padding: '8px 12px',
                                        borderRadius: '0 6px 6px 0',
                                        lineHeight: '1.4'
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>Example AI Prompt: </span>
                                        <span style={{ fontStyle: 'italic', color: '#334155' }}>"{tool.examplePrompt}"</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full MCP Resources Reference */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ margin: '8px 0 4px 0', fontSize: '20px', color: '#1e293b' }}>
                                Available MCP Resources (6 Data URIs)
                            </h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                AI clients can directly attach or inspect these live contextual resources via MCP URI without invoking tools.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                            {[
                                { uri: 'rotaract://summary', name: 'South Asia Executive Summary', desc: 'Real-time executive summary metrics and macro KPIs across Zones 4, 5, 6, and 7' },
                                { uri: 'rotaract://leaderboards', name: 'South Asia Top Rankings & Leaderboards', desc: 'Master leaderboards for largest clubs, top TRF donors, highest arrears, and top districts' },
                                { uri: 'rotaract://new-clubs', name: 'Newly Chartered Clubs Roster', desc: 'All 126 newly chartered clubs in South Asia with charter dates and sponsor clubs' },
                                { uri: 'rotaract://worldwide', name: 'Worldwide Statistics & Country Standings', desc: 'Global statistics, country growth leaderboards, and district rankings across the world' },
                                { uri: 'rotaract://zones', name: 'All 4 RI Zones Roster', desc: 'Macro demographics and district lists for Zones 4, 5, 6, and 7' },
                                { uri: 'rotaract://districts', name: 'All 44 Districts Summary', desc: 'Complete roster of 44 districts with key performance indicators and leadership contacts' }
                            ].map(res => (
                                <div
                                    key={res.uri}
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '18px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ color: '#0f4c81', fontWeight: 700, fontSize: '13.5px' }}>{res.uri}</code>
                                        <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>JSON</span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{res.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>{res.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pre-packaged AI Prompts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ margin: '8px 0 4px 0', fontSize: '20px', color: '#1e293b' }}>
                                Pre-Packaged AI Prompt Templates (4 Workflows)
                            </h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                Ready-to-run prompt templates for Claude Desktop and Cursor slash commands.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                            {[
                                { name: 'club_rankings_dossier', label: 'Club Rankings & Leaderboards Briefing', args: 'district (optional), zone (optional)', desc: 'Generates an executive briefing comparing top clubs, largest clubs, and TRF giving leaders.' },
                                { name: 'audit_district_compliance', label: 'District Compliance Audit', args: 'district (e.g. "3000")', desc: 'Deep automated audit of club arrears, termination dues risk, and officer reporting status.' },
                                { name: 'sponsorship_opportunity_report', label: 'Sponsorship Opportunity Report', args: 'district (e.g. "3000")', desc: 'Identifies Rotary clubs without Rotaract or Interact sponsorship and produces extension targets.' },
                                { name: 'zone_performance_comparison', label: 'Zone Performance Comparison', args: 'zone (e.g. "5")', desc: 'Macro performance analysis comparing club growth, university vs community split, and TRF giving.' }
                            ].map(p => (
                                <div
                                    key={p.name}
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '18px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ color: '#0f4c81', fontWeight: 700, fontSize: '13.5px' }}>/{p.name}</code>
                                        <span style={{ fontSize: '11px', background: '#e6f0fa', color: '#0f4c81', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>Workflow</span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{p.label}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>{p.desc}</div>
                                    <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                                        <strong>Arguments:</strong> <code>{p.args}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
