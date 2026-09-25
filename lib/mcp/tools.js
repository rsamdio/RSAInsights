import {
    getSummary,
    getZones,
    getZoneDetails,
    getDistricts,
    getDistrictDetails,
    searchClubs,
    getClubProfile,
    getArrearsList,
    getMissingOfficersList,
    getRotaryOpportunityList,
    getTRFList,
    getNewClubsList,
    getLeaderboards,
    getDualRiskList,
    getInteractAnalytics,
    getWorldwideStats
} from '../services/analyticsService.js';

export const TOOLS_DEFINITIONS = [
    {
        name: 'get_summary',
        description: 'Retrieve macro performance indicators and executive summary metrics for South Asia or scoped to a specific Zone (Zone 4, 5, 6, 7). Returns total clubs, reported members, financial arrears, total dues (INR/USD), clubs missing officers, TRF giving, new clubs, and university vs community breakdown.',
        inputSchema: {
            type: 'object',
            properties: {
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "Zone 5" or "5"). If omitted, returns entire South Asia macro metrics.'
                }
            }
        }
    },
    {
        name: 'get_leaderboards',
        description: 'Retrieve top rankings and leaderboards for clubs and districts across South Asia. Answers questions about the largest clubs (by membership), top TRF donors, highest arrears dues, at-risk clubs (dues >= $75 USD), top districts (by clubs, members, TRF, arrears, or growth), and new charters. Supports optional scoping to a district, zone, or country.',
        inputSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    enum: [
                        'all',
                        'largest_clubs',
                        'community_clubs',
                        'university_clubs',
                        'trf_giving',
                        'highest_arrears',
                        'at_risk_clubs',
                        'districts_by_clubs',
                        'districts_by_members',
                        'districts_by_trf',
                        'districts_by_arrears',
                        'districts_by_no_officers',
                        'districts_by_growth',
                        'new_clubs'
                    ],
                    description: 'Leaderboard category to retrieve. Use "largest_clubs" for biggest clubs, "at_risk_clubs" for clubs facing termination (dues >= $75 USD), or "districts_by_growth" for fastest growing districts. Default is "all".'
                },
                district: {
                    type: 'string',
                    description: 'Optional 4-digit district filter (e.g. "3000") to get top clubs within that district'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "5" or "Zone 5") to get top rankings within that zone'
                },
                country: {
                    type: 'string',
                    enum: ['India', 'Nepal', 'Sri Lanka'],
                    description: 'Optional country filter (e.g. "Nepal" or "Sri Lanka")'
                },
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Optional club base filter'
                },
                limit: {
                    type: 'integer',
                    description: 'Number of top items to return (1-50, default 10)'
                }
            }
        }
    },
    {
        name: 'get_districts',
        description: 'Retrieve all 44 Rotary districts in South Asia with comprehensive KPIs, leadership contacts (DG, DRR, DRC), financial health, TRF contributions, and growth metrics. Supports filtering by zone and sorting by any metric.',
        inputSchema: {
            type: 'object',
            properties: {
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "Zone 5" or "5")'
                },
                sortBy: {
                    type: 'string',
                    enum: ['totalClubs', 'members', 'arrearsClubs', 'outstanding', 'trf', 'newClubs', 'interactGrowth', 'noOfficers', 'district'],
                    description: 'Field to sort districts by (default "district")'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order: "desc" for highest first, "asc" for lowest first'
                }
            }
        }
    },
    {
        name: 'search_clubs',
        description: 'Search, filter, and sort Rotaract clubs in South Asia (2,877 records). Use sortBy="members" with sortOrder="desc" to find the largest clubs, or sortBy="outstanding" for clubs with highest unpaid dues. Supports filtering by country (India, Nepal, Sri Lanka) and Interact sponsorship.',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search keyword matching club name, club ID, sponsor club, or country'
                },
                district: {
                    type: 'string',
                    description: 'Rotary district number (e.g. "3000")'
                },
                zone: {
                    type: 'string',
                    description: 'Rotary zone (e.g. "Zone 5" or "5")'
                },
                country: {
                    type: 'string',
                    enum: ['India', 'Nepal', 'Sri Lanka'],
                    description: 'Filter clubs by country (India, Nepal, or Sri Lanka)'
                },
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Club base type'
                },
                sponsorsInteract: {
                    type: 'boolean',
                    description: 'Filter clubs that directly sponsor Interact clubs (65 clubs sponsor 137 Interact clubs)'
                },
                sortBy: {
                    type: 'string',
                    enum: ['members', 'outstanding', 'trf', 'interact', 'name', 'id', 'charterDate', 'district'],
                    description: 'Sort field: "members" (size), "outstanding" (unpaid dues), "trf" (donations), "interact" (sponsored Interact clubs), "name", or "charterDate"'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order: "desc" (highest/largest first, default for members and dues) or "asc"'
                },
                minMembers: {
                    type: 'integer',
                    description: 'Minimum reported members filter'
                },
                maxMembers: {
                    type: 'integer',
                    description: 'Maximum reported members filter'
                },
                minOutstanding: {
                    type: 'number',
                    description: 'Minimum outstanding dues in INR filter'
                },
                isArrears: {
                    type: 'boolean',
                    description: 'Filter clubs with outstanding dues in financial arrears'
                },
                isAtRisk: {
                    type: 'boolean',
                    description: 'Filter clubs with outstanding balance >= $75 USD at risk of termination'
                },
                isNoOfficers: {
                    type: 'boolean',
                    description: 'Filter clubs that have not reported active club officers'
                },
                isNewClub: {
                    type: 'boolean',
                    description: 'Filter newly chartered clubs'
                },
                limit: {
                    type: 'integer',
                    description: 'Number of results to return (1-100, default 25)'
                },
                offset: {
                    type: 'integer',
                    description: 'Number of results to skip (default 0)'
                }
            }
        }
    },
    {
        name: 'get_new_clubs',
        description: 'Retrieve newly chartered Rotaract clubs in South Asia (126 clubs chartered during the current 2026 period) with charter dates, member counts, sponsor Rotary clubs, and district mapping.',
        inputSchema: {
            type: 'object',
            properties: {
                district: {
                    type: 'string',
                    description: 'Optional district number filter (e.g. "3000")'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "5" or "Zone 5")'
                },
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Optional club base filter'
                },
                sortBy: {
                    type: 'string',
                    enum: ['charterDate', 'members', 'name'],
                    description: 'Sort field (default "charterDate")'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order (default "desc")'
                },
                limit: {
                    type: 'integer',
                    description: 'Number of results to return (1-100, default 25)'
                },
                offset: {
                    type: 'integer',
                    description: 'Number of results to skip (default 0)'
                }
            }
        }
    },
    {
        name: 'get_club_profile',
        description: 'Retrieve the comprehensive dossier for a single Rotaract club by its Rotary Club ID or club name, including membership, compliance status, dues outstanding, TRF giving, and sponsored Interact clubs.',
        inputSchema: {
            type: 'object',
            properties: {
                clubId: {
                    type: 'string',
                    description: 'The Rotary Club ID (e.g. "8824847") or club name'
                }
            },
            required: ['clubId']
        }
    },
    {
        name: 'get_district_insights',
        description: 'Get deep analytical insights, KPI metrics, leadership contacts (DG, DRR, DRC), club health metrics, and top clubs (largest, top TRF, highest arrears, new) for a specific Rotary district.',
        inputSchema: {
            type: 'object',
            properties: {
                district: {
                    type: 'string',
                    description: 'The 4-digit Rotary district number (e.g. "3000", "3141", "3292")'
                }
            },
            required: ['district']
        }
    },
    {
        name: 'get_zone_summary',
        description: 'Retrieve executive summary, total club counts, active members, arrears metrics, district leaderboards, and top clubs for an entire RI Zone (4, 5, 6, or 7).',
        inputSchema: {
            type: 'object',
            properties: {
                zone: {
                    type: 'string',
                    description: 'RI Zone identifier (e.g. "4", "5", "6", "7", or "Zone 5")'
                }
            },
            required: ['zone']
        }
    },
    {
        name: 'find_compliance_risks',
        description: 'Identify Rotaract clubs at risk of termination or non-compliance due to unpaid financial dues (arrears) or missing officer reporting. Supports dual-risk clubs with both issues.',
        inputSchema: {
            type: 'object',
            properties: {
                riskType: {
                    type: 'string',
                    enum: ['arrears', 'missing_officers', 'at_risk_only', 'dual_risk', 'both'],
                    description: 'Type of compliance risk: "arrears", "missing_officers", "at_risk_only" (dues >= $75 USD), or "dual_risk" / "both" (clubs with BOTH arrears AND missing officers)'
                },
                district: {
                    type: 'string',
                    description: 'Optional district number filter'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter'
                },
                country: {
                    type: 'string',
                    enum: ['India', 'Nepal', 'Sri Lanka'],
                    description: 'Optional country filter (India, Nepal, or Sri Lanka)'
                },
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Optional club base filter'
                },
                sortBy: {
                    type: 'string',
                    enum: ['outstanding', 'members', 'name', 'district', 'lastReported'],
                    description: 'Sort field (default "outstanding" for arrears, "name" for officers)'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order (default "desc")'
                },
                minOutstanding: {
                    type: 'number',
                    description: 'Minimum outstanding dues in INR'
                },
                lastReportedBefore: {
                    type: 'string',
                    description: 'For missing_officers: filter clubs that last reported before this term (e.g. "2024 - 2025")'
                },
                limit: {
                    type: 'integer',
                    description: 'Number of clubs to return (1-100, default 25)'
                },
                offset: {
                    type: 'integer',
                    description: 'Offset for pagination'
                }
            }
        }
    },
    {
        name: 'find_dual_risk_clubs',
        description: 'Find Rotaract clubs that have BOTH outstanding financial arrears AND missing officer reports simultaneously - the highest aggregate compliance risk group (761 clubs). These clubs need immediate attention from DRRs.',
        inputSchema: {
            type: 'object',
            properties: {
                district: {
                    type: 'string',
                    description: 'Optional district number filter'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter'
                },
                country: {
                    type: 'string',
                    enum: ['India', 'Nepal', 'Sri Lanka'],
                    description: 'Optional country filter'
                },
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Optional club base filter'
                },
                sortBy: {
                    type: 'string',
                    enum: ['outstanding', 'name', 'district'],
                    description: 'Sort field (default "outstanding")'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order (default "desc")'
                },
                minOutstanding: {
                    type: 'number',
                    description: 'Minimum outstanding dues in INR'
                },
                limit: {
                    type: 'integer',
                    description: 'Number of clubs to return (1-100, default 25)'
                },
                offset: {
                    type: 'integer',
                    description: 'Offset for pagination'
                }
            }
        }
    },
    {
        name: 'get_interact_analytics',
        description: 'Retrieve Interact statistics across South Asia: 8,921 total Interact clubs, 137 Interact clubs sponsored by 65 Rotaract clubs, district/zone breakdowns, and suspended club tracking.',
        inputSchema: {
            type: 'object',
            properties: {
                district: {
                    type: 'string',
                    description: 'Optional district number filter'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter'
                }
            }
        }
    },
    {
        name: 'find_rotary_opportunities',
        description: 'Identify Rotary clubs in South Asia that currently do not sponsor any Rotaract club (3,571 clubs) or do not sponsor any Interact club (2,964 clubs). Highlights strategic partnership opportunities for youth extension.',
        inputSchema: {
            type: 'object',
            properties: {
                opportunityType: {
                    type: 'string',
                    enum: ['no_rotaract', 'no_interact'],
                    description: 'Type of extension opportunity: "no_rotaract" or "no_interact" (default "no_rotaract")'
                },
                district: {
                    type: 'string',
                    description: 'Optional district number filter (e.g. "3000")'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "5" or "Zone 5")'
                },
                limit: {
                    type: 'integer',
                    description: 'Number of records to return (1-100, default 25)'
                },
                offset: {
                    type: 'integer',
                    description: 'Number of records to skip (default 0)'
                }
            }
        }
    },
    {
        name: 'get_foundation_giving',
        description: 'Analyze The Rotary Foundation (TRF) contributions from Rotaract clubs across South Asia, including total contributions, Annual Fund, PolioPlus, and other designations.',
        inputSchema: {
            type: 'object',
            properties: {
                district: {
                    type: 'string',
                    description: 'Optional district number filter'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter'
                },
                sortBy: {
                    type: 'string',
                    enum: ['total', 'annual', 'polio'],
                    description: 'Sort field (default "total")'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order (default "desc")'
                },
                limit: {
                    type: 'integer',
                    description: 'Maximum records to return (default 25)'
                },
                offset: {
                    type: 'integer',
                    description: 'Offset for pagination'
                }
            }
        }
    },
    {
        name: 'get_worldwide_rankings',
        description: 'Retrieve worldwide Rotaract and Interact statistics, country growth rankings, and district leaderboards across the globe.',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['all', 'summary', 'country', 'district', 'interact', 'new_clubs'],
                    description: 'Focus area: "summary" (macro totals), "country" (country rankings), "district" (district rankings), "interact" (Interact stats), "new_clubs" (new charter trends), or "all" (full dataset)'
                },
                country: {
                    type: 'string',
                    description: 'Filter country name (e.g. "India", "Nepal", "United States")'
                },
                limit: {
                    type: 'integer',
                    description: 'Limit number of results returned (default 10)'
                }
            }
        }
    }
];

export const MCP_RESOURCES = [
    {
        uri: 'rotaract://summary',
        name: 'South Asia Executive Summary',
        description: 'Real-time executive summary metrics and macro KPIs across Zones 4, 5, 6, and 7',
        mimeType: 'application/json'
    },
    {
        uri: 'rotaract://leaderboards',
        name: 'South Asia Top Rankings & Leaderboards',
        description: 'Master leaderboards for largest clubs, top TRF donors, highest arrears, and top districts',
        mimeType: 'application/json'
    },
    {
        uri: 'rotaract://new-clubs',
        name: 'Newly Chartered Clubs Roster',
        description: 'All 126 newly chartered clubs in South Asia with charter dates and sponsor clubs',
        mimeType: 'application/json'
    },
    {
        uri: 'rotaract://interact',
        name: 'Interact Analytics & Rotaract Sponsorships',
        description: 'Overview of 8,921 Interact clubs and 137 clubs sponsored by 65 Rotaract clubs in South Asia',
        mimeType: 'application/json'
    },
    {
        uri: 'rotaract://worldwide',
        name: 'Worldwide Statistics & Country Standings',
        description: 'Global statistics, country growth leaderboards, and district rankings across the world',
        mimeType: 'application/json'
    },
    {
        uri: 'rotaract://zones',
        name: 'All 4 RI Zones Roster',
        description: 'Macro demographics and district lists for Zones 4, 5, 6, and 7',
        mimeType: 'application/json'
    },
    {
        uri: 'rotaract://districts',
        name: 'All 44 Districts Summary',
        description: 'Complete roster of 44 districts with key performance indicators and leadership contacts',
        mimeType: 'application/json'
    },
    {
        uri: 'rotaract://dual-risk',
        name: 'High Risk Dual Non-Compliance Roster',
        description: '761 Rotaract clubs having both unpaid financial arrears and missing officer reports',
        mimeType: 'application/json'
    }
];

export const MCP_PROMPTS = [
    {
        name: 'club_rankings_dossier',
        description: 'Generate an executive leaderboard briefing comparing top clubs, largest clubs, and giving leaders for a district or zone',
        arguments: [
            {
                name: 'district',
                description: 'Rotary district number (e.g. "3000")',
                required: false
            },
            {
                name: 'zone',
                description: 'RI Zone identifier (e.g. "Zone 5")',
                required: false
            }
        ]
    },
    {
        name: 'audit_district_compliance',
        description: 'Comprehensive compliance and leadership health audit for a specific Rotary district',
        arguments: [
            {
                name: 'district',
                description: 'Rotary district number (e.g. "3000")',
                required: true
            }
        ]
    },
    {
        name: 'sponsorship_opportunity_report',
        description: 'Strategic report identifying Rotary clubs without Rotaract or Interact sponsorship in a district',
        arguments: [
            {
                name: 'district',
                description: 'Rotary district number (e.g. "3000")',
                required: true
            }
        ]
    },
    {
        name: 'zone_performance_comparison',
        description: 'Compare membership, clubs, and TRF giving trends across South Asian zones',
        arguments: [
            {
                name: 'zone',
                description: 'RI Zone identifier (e.g. "5")',
                required: false
            }
        ]
    }
];

export async function executeTool(name, args = {}) {
    switch (name) {
        case 'get_summary': {
            const summary = await getSummary(args.zone);
            return formatResponse(summary);
        }

        case 'get_leaderboards': {
            const category = args.category || args.type || args.leaderboard || 'all';
            const result = await getLeaderboards({
                category,
                district: args.district,
                zone: args.zone,
                base: args.base,
                country: args.country,
                limit: args.limit
            });
            return formatResponse(result);
        }

        case 'get_districts': {
            const result = await getDistricts(args.zone, args.sortBy, args.sortOrder);
            return formatResponse({
                count: result.length,
                districts: result
            });
        }

        case 'search_clubs': {
            const result = await searchClubs({
                query: args.query || args.q,
                district: args.district,
                zone: args.zone,
                country: args.country,
                base: args.base,
                sponsorsInteract: args.sponsorsInteract ?? args.sponsors_interact,
                sortBy: args.sortBy,
                sortOrder: args.sortOrder,
                minMembers: args.minMembers,
                maxMembers: args.maxMembers,
                minOutstanding: args.minOutstanding,
                isArrears: args.isArrears ?? args.is_arrears,
                isAtRisk: args.isAtRisk ?? args.is_at_risk,
                isNoOfficers: args.isNoOfficers ?? args.is_no_officers,
                isNewClub: args.isNewClub ?? args.is_new_club,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(result);
        }

        case 'get_new_clubs': {
            const result = await getNewClubsList({
                district: args.district,
                zone: args.zone,
                base: args.base,
                sortBy: args.sortBy,
                sortOrder: args.sortOrder,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(result);
        }

        case 'get_club_profile': {
            const clubId = args.clubId || args.club_id || args.id;
            const profile = await getClubProfile(clubId);
            if (!profile) {
                return formatError(`Club '${clubId}' not found.`);
            }
            return formatResponse(profile);
        }

        case 'get_district_insights': {
            const district = args.district || args.districtId || args.id;
            const details = await getDistrictDetails(district);
            if (!details) {
                return formatError(`District '${district}' not found.`);
            }
            return formatResponse(details);
        }

        case 'get_zone_summary': {
            const zone = args.zone || args.zoneId;
            const details = await getZoneDetails(zone);
            if (!details) {
                return formatError(`Zone '${zone}' not found. Supported zones: Zone 4, Zone 5, Zone 6, Zone 7.`);
            }
            return formatResponse(details);
        }

        case 'find_compliance_risks': {
            const riskType = args.riskType || args.risk_type || 'arrears';
            if (riskType === 'dual_risk' || riskType === 'both') {
                const result = await getDualRiskList({
                    district: args.district,
                    zone: args.zone,
                    base: args.base,
                    country: args.country,
                    minOutstanding: args.minOutstanding,
                    sortBy: args.sortBy || args.sort_by,
                    sortOrder: args.sortOrder || args.sort_order,
                    limit: args.limit,
                    offset: args.offset
                });
                return formatResponse(result);
            }
            if (riskType === 'missing_officers') {
                const result = await getMissingOfficersList({
                    district: args.district,
                    zone: args.zone,
                    base: args.base,
                    country: args.country,
                    lastReportedBefore: args.lastReportedBefore || args.last_reported_before,
                    sortBy: args.sortBy || args.sort_by || 'name',
                    sortOrder: args.sortOrder || args.sort_order || 'asc',
                    limit: args.limit,
                    offset: args.offset
                });
                return formatResponse(result);
            }
            const result = await getArrearsList({
                district: args.district,
                zone: args.zone,
                base: args.base,
                country: args.country,
                atRiskOnly: riskType === 'at_risk_only' || args.atRiskOnly || args.at_risk_only,
                minOutstanding: args.minOutstanding,
                sortBy: args.sortBy || args.sort_by,
                sortOrder: args.sortOrder || args.sort_order,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(result);
        }

        case 'find_dual_risk_clubs': {
            const result = await getDualRiskList({
                district: args.district,
                zone: args.zone,
                base: args.base,
                country: args.country,
                minOutstanding: args.minOutstanding,
                sortBy: args.sortBy || args.sort_by,
                sortOrder: args.sortOrder || args.sort_order,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(result);
        }

        case 'get_interact_analytics': {
            const result = await getInteractAnalytics({
                district: args.district,
                zone: args.zone
            });
            return formatResponse(result);
        }

        case 'find_rotary_opportunities': {
            const oppType = args.opportunityType || args.opportunity_type || 'no_rotaract';
            const result = await getRotaryOpportunityList({
                opportunityType: oppType,
                district: args.district,
                zone: args.zone,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(result);
        }

        case 'get_foundation_giving': {
            const result = await getTRFList({
                district: args.district,
                zone: args.zone,
                sortBy: args.sortBy,
                sortOrder: args.sortOrder,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(result);
        }

        case 'get_worldwide_rankings': {
            const result = await getWorldwideStats({
                type: args.type,
                country: args.country,
                limit: args.limit
            });
            if (!result) {
                return formatError('Worldwide analytics data currently unavailable.');
            }
            return formatResponse(result);
        }

        default:
            return formatError(`Unknown tool: ${name}`);
    }
}

export async function readResource(uri) {
    switch (uri) {
        case 'rotaract://summary': {
            const summary = await getSummary();
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(summary, null, 2)
                }]
            };
        }
        case 'rotaract://leaderboards': {
            const leaderboards = await getLeaderboards({ category: 'all', limit: 10 });
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(leaderboards, null, 2)
                }]
            };
        }
        case 'rotaract://new-clubs': {
            const newClubs = await getNewClubsList({ limit: 100 });
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(newClubs, null, 2)
                }]
            };
        }
        case 'rotaract://interact': {
            const interact = await getInteractAnalytics();
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(interact, null, 2)
                }]
            };
        }
        case 'rotaract://worldwide': {
            const worldwide = await getWorldwideStats();
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(worldwide, null, 2)
                }]
            };
        }
        case 'rotaract://zones': {
            const zones = await getZones();
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(zones, null, 2)
                }]
            };
        }
        case 'rotaract://districts': {
            const districts = await getDistricts();
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(districts, null, 2)
                }]
            };
        }
        case 'rotaract://dual-risk': {
            const dualRisk = await getDualRiskList({ limit: 100 });
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(dualRisk, null, 2)
                }]
            };
        }
        default:
            throw new Error(`Resource with URI '${uri}' not found.`);
    }
}

export async function getPrompt(name, args = {}) {
    switch (name) {
        case 'club_rankings_dossier': {
            const district = args.district || '';
            const zone = args.zone || '';
            const targetScope = district ? `District ${district}` : (zone ? `Zone ${zone}` : 'South Asia (All Zones)');
            return {
                description: `Executive leaderboard briefing for ${targetScope}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Generate an executive leaderboard and rankings briefing for ${targetScope}. Include:
1. Top 5 largest Rotaract clubs by reported membership
2. Top 5 contributing clubs to The Rotary Foundation (TRF)
3. Clubs with the highest outstanding financial arrears
4. Newly chartered clubs during this period
5. Macro key performance indicators and recommendations for leadership.`
                        }
                    }
                ]
            };
        }
        case 'audit_district_compliance': {
            const district = args.district || '3000';
            return {
                description: `Conduct a thorough compliance audit for District ${district}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Please perform a detailed compliance audit for Rotary District ${district}.
1. Inspect overall health and total dues in arrears.
2. Identify clubs with dues >= $75 USD at termination risk.
3. List clubs with missing officer reporting.
4. Recommend actionable steps for the District Rotaract Representative (DRR) and District Governor (DG).`
                        }
                    }
                ]
            };
        }
        case 'sponsorship_opportunity_report': {
            const district = args.district || '3000';
            return {
                description: `Strategic report on sponsorship opportunities for District ${district}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Analyze Rotary club sponsorship opportunities in District ${district}:
1. Identify Rotary clubs without any sponsored Rotaract club.
2. Identify Rotary clubs without an Interact club.
3. Create an outreach plan for youth service extension.`
                        }
                    }
                ]
            };
        }
        case 'zone_performance_comparison': {
            const zone = args.zone || 'All';
            return {
                description: `Compare performance metrics for South Asian zones (focus: ${zone})`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Compare membership, clubs, and TRF giving trends across South Asian zones (focus: ${zone}).
1. Compare active members and total clubs across Zones 4, 5, 6, and 7.
2. Compare compliance health and arrears rates.
3. Compare foundation contributions and community vs university distribution.`
                        }
                    }
                ]
            };
        }
        default:
            throw new Error(`Prompt with name '${name}' not found.`);
    }
}

function formatResponse(data) {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }
        ]
    };
}

function formatError(message) {
    return {
        isError: true,
        content: [
            {
                type: 'text',
                text: JSON.stringify({ error: message }, null, 2)
            }
        ]
    };
}
