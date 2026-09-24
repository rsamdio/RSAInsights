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
    getWorldwideStats
} from '../services/analyticsService.js';

export const TOOLS_DEFINITIONS = [
    {
        name: 'search_clubs',
        description: 'Search and filter Rotaract clubs in South Asia (Zones 4, 5, 6, 7) by name, ID, district, zone, base (Community/University), or compliance status.',
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
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Club base type'
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
        description: 'Retrieve the comprehensive dossier for a single Rotaract club by its Rotary Club ID, including membership, compliance status, dues outstanding, TRF giving, and sponsored Interact clubs.',
        inputSchema: {
            type: 'object',
            properties: {
                clubId: {
                    type: 'string',
                    description: 'The Rotary Club ID (e.g. "8824847")'
                }
            },
            required: ['clubId']
        }
    },
    {
        name: 'get_district_insights',
        description: 'Get deep analytical insights, KPI metrics, leadership contacts (DG, DRR, DRC), and club health metrics for a specific Rotary district.',
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
        description: 'Retrieve executive summary, total club counts, active members, arrears metrics, and district breakdown for an entire RI Zone (4, 5, 6, or 7).',
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
        description: 'Identify Rotaract clubs at risk of termination or non-compliance due to unpaid financial dues (arrears) or missing officer reporting.',
        inputSchema: {
            type: 'object',
            properties: {
                riskType: {
                    type: 'string',
                    enum: ['arrears', 'missing_officers', 'at_risk_only'],
                    description: 'Type of compliance risk to filter: "arrears", "missing_officers", or "at_risk_only" (dues >= $75 USD)'
                },
                district: {
                    type: 'string',
                    description: 'Optional district number filter'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter'
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
        name: 'find_rotary_opportunities',
        description: 'Find Rotary clubs with extension opportunities: Rotary clubs that do not currently sponsor any Rotaract club, or Rotary clubs without an Interact club.',
        inputSchema: {
            type: 'object',
            properties: {
                opportunityType: {
                    type: 'string',
                    enum: ['no_rotaract', 'no_interact'],
                    description: 'Opportunity type: "no_rotaract" (default) or "no_interact"'
                },
                district: {
                    type: 'string',
                    description: 'Optional district number filter'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter'
                },
                limit: {
                    type: 'integer',
                    description: 'Maximum records to return (1-100, default 25)'
                },
                offset: {
                    type: 'integer',
                    description: 'Offset for pagination'
                }
            }
        }
    },
    {
        name: 'get_foundation_giving',
        description: 'Retrieve The Rotary Foundation (TRF) giving metrics for Rotaract clubs, including Annual Fund, PolioPlus, and total contributions.',
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
            properties: {}
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
    }
];

export const MCP_PROMPTS = [
    {
        name: 'audit_district_compliance',
        description: 'Conduct a thorough compliance, arrears, and officer health audit for a Rotary district',
        arguments: [
            {
                name: 'district',
                description: 'The 4-digit Rotary district number (e.g. "3000")',
                required: true
            }
        ]
    },
    {
        name: 'sponsorship_opportunity_report',
        description: 'Generate a strategic report on Rotary clubs lacking Rotaract or Interact sponsorship',
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
        case 'search_clubs': {
            const result = await searchClubs({
                query: args.query || args.q,
                district: args.district,
                zone: args.zone,
                base: args.base,
                isArrears: args.isArrears ?? args.is_arrears,
                isAtRisk: args.isAtRisk ?? args.is_at_risk,
                isNoOfficers: args.isNoOfficers ?? args.is_no_officers,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(result);
        }

        case 'get_club_profile': {
            const clubId = args.clubId || args.club_id || args.id;
            const profile = await getClubProfile(clubId);
            if (!profile) {
                return formatError(`Club with ID '${clubId}' not found.`);
            }
            return formatResponse(profile);
        }

        case 'get_district_insights': {
            const district = args.district || args.district_id || args.districtId;
            const insights = await getDistrictDetails(district);
            if (!insights) {
                return formatError(`District '${district}' not found.`);
            }
            return formatResponse(insights);
        }

        case 'get_zone_summary': {
            const zone = args.zone || args.zone_id || args.zoneId;
            const summary = await getZoneDetails(zone);
            if (!summary) {
                return formatError(`Zone '${zone}' not found. Supported zones: 4, 5, 6, 7.`);
            }
            return formatResponse(summary);
        }

        case 'find_compliance_risks': {
            const riskType = args.riskType || args.risk_type || 'arrears';
            if (riskType === 'missing_officers') {
                const list = await getMissingOfficersList({
                    district: args.district,
                    zone: args.zone,
                    limit: args.limit,
                    offset: args.offset
                });
                return formatResponse(list);
            }
            const atRiskOnly = riskType === 'at_risk_only' || Boolean(args.atRiskOnly || args.at_risk_only);
            const list = await getArrearsList({
                district: args.district,
                zone: args.zone,
                atRiskOnly,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(list);
        }

        case 'find_rotary_opportunities': {
            const type = args.opportunityType || args.opportunity_type || args.type || 'no_rotaract';
            const list = await getRotaryOpportunityList({
                type,
                district: args.district,
                zone: args.zone,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(list);
        }

        case 'get_foundation_giving': {
            const list = await getTRFList({
                district: args.district,
                zone: args.zone,
                limit: args.limit,
                offset: args.offset
            });
            return formatResponse(list);
        }

        case 'get_worldwide_rankings': {
            const stats = await getWorldwideStats();
            return formatResponse(stats);
        }

        default:
            return formatError(`Unknown tool: '${name}'`);
    }
}

export async function readResource(uri) {
    switch (uri) {
        case 'rotaract://summary': {
            const data = await getSummary();
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        }
        case 'rotaract://worldwide': {
            const data = await getWorldwideStats();
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        }
        case 'rotaract://zones': {
            const data = await getZones();
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        }
        case 'rotaract://districts': {
            const data = await getDistricts();
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        }
        default:
            throw new Error(`Resource '${uri}' not found`);
    }
}

export async function getPrompt(name, args = {}) {
    switch (name) {
        case 'audit_district_compliance': {
            const dist = args.district || '3000';
            return {
                description: `Conduct a thorough compliance audit for District ${dist}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Please conduct a comprehensive compliance, financial arrears, and leadership audit for Rotary District ${dist} in South Asia. Check active clubs, clubs in arrears, high-risk clubs (dues >= $75 USD), and clubs missing reported officers on MyRotary. Provide recommendations for DG, DRR, and DRC.`
                        }
                    }
                ]
            };
        }
        case 'sponsorship_opportunity_report': {
            const dist = args.district || '3000';
            return {
                description: `Strategic report on sponsorship opportunities for District ${dist}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Please identify Rotary clubs in District ${dist} that currently do not sponsor any Rotaract club and Rotary clubs without an Interact club. Outline specific extension opportunities.`
                        }
                    }
                ]
            };
        }
        case 'zone_performance_comparison': {
            const zone = args.zone ? `Zone ${args.zone}` : 'all South Asian zones';
            return {
                description: `Compare performance metrics for ${zone}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Analyze macro performance and demographic trends for ${zone}. Detail total clubs, university vs community split, membership growth, and foundation giving.`
                        }
                    }
                ]
            };
        }
        default:
            throw new Error(`Prompt '${name}' not found`);
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
        content: [
            {
                type: 'text',
                text: JSON.stringify({ error: message }, null, 2)
            }
        ],
        isError: true
    };
}
