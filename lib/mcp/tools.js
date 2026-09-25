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

const READ_ONLY_ANNOTATIONS = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
};

export const TOOLS_DEFINITIONS = [
    {
        name: 'get_summary',
        description: 'Get the top-level executive KPI dashboard for all of South Asia (Zones 4, 5, 6, 7 combined; 2,877 clubs; 44 districts) or scoped to a single zone. Returns: total clubs, reported members, financial arrears in both INR and USD, clubs missing officer reports, TRF giving totals, new charters this period, and university vs community club breakdown. Use this as the FIRST call to understand the overall landscape before drilling into specific zones, districts, or clubs. Do NOT use this for a specific district - use get_district_insights instead.',
        annotations: READ_ONLY_ANNOTATIONS,
        inputSchema: {
            type: 'object',
            properties: {
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "Zone 5" or "5"). If omitted, returns entire South Asia macro metrics.'
                }
            }
        },
        outputSchema: {
            type: 'object',
            properties: {
                dataAsOf: { type: 'string', description: 'Data cut-off date' },
                overall: {
                    type: 'object',
                    properties: {
                        totalClubs: { type: 'integer' },
                        totalMembers: { type: 'integer' },
                        outstanding: { type: 'number' },
                        arrearsClubs: { type: 'integer' },
                        atRisk: { type: 'integer' },
                        noOfficers: { type: 'integer' },
                        totalRotary: { type: 'integer' },
                        rotaryWithSponsor: { type: 'integer' },
                        rotaryWithoutSponsor: { type: 'integer' },
                        totalInteractClubs: { type: 'integer' }
                    }
                },
                zones: { type: 'array' }
            }
        }
    },
    {
        name: 'get_leaderboards',
        description: 'Get ranked top-N lists for clubs and districts in South Asia. Answers: Who are the largest clubs? Which clubs have the highest unpaid dues? Which clubs face termination risk (dues >= $75 USD)? Which districts grew the fastest? Set scope="south_asia" (default) for rankings within the 44 South Asian districts, or scope="worldwide" to rank South Asian districts against all 599 global districts. IMPORTANT: districts_by_member_growth ranks districts by Rotaract membership count change vs baseline. districts_by_growth ranks districts by Interact club growth - these are different metrics. Use category="all" only when you need every leaderboard simultaneously; otherwise specify the exact category for a faster response.',
        annotations: READ_ONLY_ANNOTATIONS,
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
                        'districts_by_member_growth',
                        'districts_by_trf',
                        'districts_by_arrears',
                        'districts_by_no_officers',
                        'districts_by_growth',
                        'new_clubs'
                    ],
                    description: 'Leaderboard category. Clubs: "largest_clubs" (by membership), "community_clubs", "university_clubs", "trf_giving" (TRF donors), "highest_arrears" (unpaid dues), "at_risk_clubs" (dues >= $75 USD, termination risk). Districts: "districts_by_clubs", "districts_by_members", "districts_by_trf", "districts_by_arrears", "districts_by_no_officers", "districts_by_member_growth" (Rotaract member growth vs baseline), "districts_by_growth" (Interact club growth). Other: "new_clubs". Default "all" returns every category at once.'
                },
                scope: {
                    type: 'string',
                    enum: ['south_asia', 'worldwide'],
                    description: 'Geographic scope: "south_asia" (default, restricted to Zones 4, 5, 6, 7) or "worldwide" (for global district growth leaderboards across all 599 districts)'
                },
                district: {
                    type: 'string',
                    description: 'Optional 4-digit district filter (e.g. "3000") to get top clubs within that district'
                },
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "5", "Zone 6", "4,5,6,7", or "South Asia") to get top rankings within that zone or region'
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
                },
                offset: {
                    type: 'integer',
                    description: 'Number of items to skip for pagination (default 0)'
                }
            }
        },
        outputSchema: {
            type: 'object',
            properties: {
                category: { type: 'string' },
                count: { type: 'integer' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            rank: { type: 'integer' },
                            worldwideRank: { type: 'integer', description: 'Global rank among all 599 districts worldwide' },
                            southAsiaRank: { type: 'integer', description: 'Rank among South Asian districts (Zones 4, 5, 6, 7)' },
                            id: { type: 'string' },
                            name: { type: 'string' },
                            district: { type: 'string' },
                            zone: { type: 'string' },
                            region: { type: 'string' },
                            isSouthAsia: { type: 'boolean' },
                            country: { type: 'string' },
                            members: { type: 'integer' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'get_districts',
        description: 'List all 44 Rotary districts in South Asia with KPIs, leadership contacts (DG, DRR, DRC), financial health, TRF contributions, and growth metrics. Filter by zone (4, 5, 6, or 7) or country (India, Nepal, Sri Lanka). Sort by members, totalClubs, arrearsClubs, outstanding, trf, newClubs, interactGrowth, or noOfficers. Returns all 44 districts at once (no pagination needed). Do NOT use this for a single district deep-dive - use get_district_insights for that. Do NOT use this to list clubs within a district - use search_clubs with a district filter.',
        annotations: READ_ONLY_ANNOTATIONS,
        inputSchema: {
            type: 'object',
            properties: {
                zone: {
                    type: 'string',
                    description: 'Optional zone filter (e.g. "Zone 5" or "5")'
                },
                country: {
                    type: 'string',
                    enum: ['India', 'Nepal', 'Sri Lanka'],
                    description: 'Optional country filter (e.g. "India", "Nepal", "Sri Lanka")'
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
        },
        outputSchema: {
            type: 'object',
            properties: {
                total: { type: 'integer' },
                districts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            district: { type: 'string' },
                            zone: { type: 'string' },
                            totalClubs: { type: 'integer' },
                            members: { type: 'integer' },
                            drr: { type: 'string' },
                            dg: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'search_clubs',
        description: 'Search, filter, and paginate the full 2,877-club South Asia Rotaract roster. Answers: What clubs exist in District 3000? Which clubs in Nepal are in arrears? Which clubs sponsor Interact? Core filters: district, zone, country (India/Nepal/Sri Lanka), base (Community/University), isArrears, isAtRisk (dues >= $75 USD facing termination), isNoOfficers, isNewClub, sponsorsInteract, minMembers, maxMembers, minOutstanding, maxOutstanding. Supports full-text query across club name, ID, and sponsor club name. Returns paginated results with total count (limit 1-100). Use get_club_profile for a single club by ID. Use get_leaderboards for pre-ranked top-N lists.',
        annotations: READ_ONLY_ANNOTATIONS,
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
                maxOutstanding: {
                    type: 'number',
                    description: 'Maximum outstanding dues in INR filter'
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
        },
        outputSchema: {
            type: 'object',
            properties: {
                total: { type: 'integer' },
                offset: { type: 'integer' },
                limit: { type: 'integer' },
                clubs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            district: { type: 'string' },
                            zone: { type: 'string' },
                            country: { type: 'string' },
                            members: { type: 'integer' },
                            base: { type: 'string' },
                            status: { type: 'string' },
                            sponsorClubs: { type: 'string' },
                            outstandingINR: { type: 'number' },
                            isArrears: { type: 'boolean' },
                            isNoOfficers: { type: 'boolean' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'get_new_clubs',
        description: 'Get the 126 newly chartered Rotaract clubs in South Asia during the current period. Shows charter date, member count at chartering, and sponsor Rotary club for each. Filter by district, zone, country (India/Nepal/Sri Lanka), or base (Community/University). Sort by charterDate (default, newest first), members, or name. Use this when asked about growth, expansion, or new clubs chartered this year.',
        annotations: READ_ONLY_ANNOTATIONS,
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
        },
        outputSchema: {
            type: 'object',
            properties: {
                total: { type: 'integer' },
                clubs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            district: { type: 'string' },
                            zone: { type: 'string' },
                            country: { type: 'string' },
                            base: { type: 'string' },
                            charterDate: { type: 'string' },
                            members: { type: 'integer' },
                            sponsorClubs: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'get_club_profile',
        description: 'Get the full dossier for one specific Rotaract club. Accepts a Rotary Club ID (numeric string like "8824847") OR a partial club name for lookup. Returns: membership count, compliance status (arrears, at-risk, missing officers), outstanding dues in INR and USD, TRF giving breakdown (Annual Fund, PolioPlus, Other), sponsored Interact clubs list, charter date, sponsor Rotary club, and district leadership contacts. Use this when you know the specific club. Use search_clubs to find clubs by filters.',
        annotations: READ_ONLY_ANNOTATIONS,
        inputSchema: {
            type: 'object',
            properties: {
                clubId: {
                    type: 'string',
                    description: 'The Rotary Club ID (e.g. "8824847") or club name'
                }
            },
            required: ['clubId']
        },
        outputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                district: { type: 'string' },
                zone: { type: 'string' },
                country: { type: 'string' },
                members: { type: 'integer' },
                base: { type: 'string' },
                status: { type: 'string' },
                sponsorClubs: { type: 'string' },
                charterDate: { type: 'string' },
                compliance: { type: 'object' },
                trf: { type: 'object' },
                interact: { type: 'object' },
                districtLeadership: { type: 'object' }
            }
        }
    },
    {
        name: 'get_district_insights',
        description: 'Get full analytics for ONE specific Rotary district. Returns: total clubs, members, arrears count and outstanding INR/USD, missing officers count, TRF contributions, new clubs, and average club size. Includes leadership contacts (DG, DRR, DRC) and pre-computed top-5 lists for largest clubs, top TRF contributors, highest arrears clubs, and newly chartered clubs. Use this when auditing or briefing on a single district. For all 44 districts at once, use get_districts. For clubs within the district, use search_clubs with district filter.',
        annotations: READ_ONLY_ANNOTATIONS,
        inputSchema: {
            type: 'object',
            properties: {
                district: {
                    type: 'string',
                    description: 'The 4-digit Rotary district number (e.g. "3000", "3141", "3292")'
                }
            },
            required: ['district']
        },
        outputSchema: {
            type: 'object',
            properties: {
                district: { type: 'string' },
                zone: { type: 'string' },
                stats: { type: 'object' },
                leadership: { type: 'object' },
                counts: { type: 'object' },
                topClubs: { type: 'object' },
                averages: { type: 'object' },
                summary: { type: 'object' },
                officers: { type: 'object' },
                clubsCount: { type: 'integer' },
                issuesCount: { type: 'integer' },
                charts: { type: 'object' }
            }
        }
    },
    {
        name: 'get_zone_summary',
        description: 'Get comprehensive analytics for one entire RI Zone. Valid zones: 4, 5, 6, or 7 ONLY (South Asia). Returns: zone KPIs (clubs, members, arrears, TRF), growth vs baseline (member growth abs and pct, club growth), intra-zone district leaderboards (top 5 by clubs, members, TRF, arrears), and the top 10 largest clubs within the zone. For cross-zone comparison call this tool once per zone (4 calls total). For all 44 districts with sortable metrics use get_districts. For a single district deep-dive use get_district_insights.',
        annotations: READ_ONLY_ANNOTATIONS,
        inputSchema: {
            type: 'object',
            properties: {
                zone: {
                    type: 'string',
                    description: 'RI Zone identifier (e.g. "4", "5", "6", "7", or "Zone 5")'
                }
            },
            required: ['zone']
        },
        outputSchema: {
            type: 'object',
            properties: {
                zone: { type: 'string' },
                districtsCount: { type: 'integer' },
                kpis: { type: 'object' },
                stats: { type: 'object' },
                growth: { type: 'object' },
                districts: { type: 'array' },
                rankings: { type: 'object' },
                topClubs: { type: 'object' },
                demographics: { type: 'object' }
            }
        }
    },
    {
        name: 'find_compliance_risks',
        description: 'Find clubs with a SINGLE type of compliance issue: financial arrears, missing officer reports, or termination-level risk. riskType must be one of: "arrears" (1,021 clubs with any unpaid dues), "at_risk_only" (499 clubs with dues >= $75 USD facing charter cancellation - most urgent), or "missing_officers" (1,070 clubs that have not reported current officers on MyRotary). Filter by district, zone, country (India/Nepal/Sri Lanka), base (Community/University), and minOutstanding. Do NOT use this for clubs with BOTH issues simultaneously - use find_dual_risk_clubs for that.',
        annotations: READ_ONLY_ANNOTATIONS,
        inputSchema: {
            type: 'object',
            properties: {
                riskType: {
                    type: 'string',
                    enum: ['arrears', 'missing_officers', 'at_risk_only'],
                    description: 'Type of compliance issue: "arrears" (any unpaid dues, 1,021 clubs), "at_risk_only" (dues >= $75 USD, 499 clubs at termination risk), or "missing_officers" (1,070 clubs not reporting officers). For clubs with BOTH arrears AND missing officers, call find_dual_risk_clubs instead.'
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
                maxOutstanding: {
                    type: 'number',
                    description: 'Maximum outstanding dues in INR'
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
        },
        outputSchema: {
            type: 'object',
            properties: {
                riskType: { type: 'string' },
                total: { type: 'integer' },
                clubs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            district: { type: 'string' },
                            zone: { type: 'string' },
                            outstandingINR: { type: 'number' },
                            outstandingUSD: { type: 'number' },
                            missingOfficers: { type: 'boolean' },
                            isAtRisk: { type: 'boolean' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'find_dual_risk_clubs',
        description: 'Find the 761 Rotaract clubs that simultaneously have BOTH unpaid financial dues AND missing officer reports - the highest-risk compliance group in South Asia. These clubs are most likely to face charter cancellation and need immediate DRR attention. Filter by district, zone, country (India/Nepal/Sri Lanka), base (Community/University), minOutstanding. Sort by outstanding (default, highest first), name, or district. If you only need arrears OR only missing officers (not both simultaneously), use find_compliance_risks instead.',
        annotations: READ_ONLY_ANNOTATIONS,
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
        },
        outputSchema: {
            type: 'object',
            properties: {
                total: { type: 'integer' },
                clubs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            district: { type: 'string' },
                            zone: { type: 'string' },
                            outstandingINR: { type: 'number' },
                            outstandingUSD: { type: 'number' },
                            missingOfficers: { type: 'boolean' },
                            isAtRisk: { type: 'boolean' },
                            sponsorClubs: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'get_interact_analytics',
        description: 'Get Interact club statistics for South Asia: 8,921 total Interact clubs (735 suspended), including 137 Interact clubs directly sponsored by 65 Rotaract clubs. Returns zone-level and district-level breakdowns with growth trends. Use this to understand youth service extension reach and Interact sponsorship patterns. Filter by district, zone, country (India/Nepal/Sri Lanka), or base (Community/University of the sponsoring Rotaract club). For Rotary clubs that have NOT sponsored any Interact club yet, use find_rotary_opportunities with opportunityType="no_interact".',
        annotations: READ_ONLY_ANNOTATIONS,
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
                    description: 'Optional country filter (India, Nepal, or Sri Lanka)'
                },
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Optional sponsoring Rotaract club base filter'
                }
            }
        },
        outputSchema: {
            type: 'object',
            properties: {
                totalInteractClubs: { type: 'integer' },
                suspendedInteractClubs: { type: 'integer' },
                rotaractWithInteract: { type: 'integer' },
                sponsoredClubs: { type: 'array' },
                districtData: { type: 'array' },
                zoneData: { type: 'array' },
                overview: { type: 'object' },
                rotaractSponsors: { type: 'array' },
                districts: { type: 'array' }
            }
        }
    },
    {
        name: 'find_rotary_opportunities',
        description: 'Identify Rotary clubs in South Asia that have NOT yet sponsored a Rotaract or Interact club - strategic youth extension targets. opportunityType: "no_rotaract" (3,571 Rotary clubs without any sponsored Rotaract club) or "no_interact" (2,964 Rotary clubs without any sponsored Interact club). Filter by district or zone. Sort by district (default, asc), name, zone, or members. Use this to build outreach plans for DRRs and DRCs. Use get_district_insights to see how many Rotary clubs exist in a district for context.',
        annotations: READ_ONLY_ANNOTATIONS,
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
                sortBy: {
                    type: 'string',
                    enum: ['district', 'name', 'zone', 'members'],
                    description: 'Sort field (default "district")'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort order: "asc" (default) or "desc"'
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
        },
        outputSchema: {
            type: 'object',
            properties: {
                opportunityType: { type: 'string' },
                total: { type: 'integer' },
                clubs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            district: { type: 'string' },
                            zone: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'get_foundation_giving',
        description: 'Get The Rotary Foundation (TRF) contribution data from Rotaract clubs in South Asia. 38 clubs have contributed. Breaks down giving into Annual Fund, PolioPlus, and Other designations per club. Filter by district, zone, country (India/Nepal/Sri Lanka), or base (Community/University). Sort by total (default, highest first), annual, polio, or name. NOTE: This is Rotaract-to-TRF giving only, not Rotary club giving. Use get_leaderboards with category="trf_giving" for a quick pre-ranked top-10 list.',
        annotations: READ_ONLY_ANNOTATIONS,
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
                    description: 'Optional country filter (India, Nepal, or Sri Lanka)'
                },
                base: {
                    type: 'string',
                    enum: ['Community', 'University'],
                    description: 'Optional club base filter'
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
        },
        outputSchema: {
            type: 'object',
            properties: {
                totalClubs: { type: 'integer' },
                totalContributedUSD: { type: 'number' },
                clubs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            district: { type: 'string' },
                            zone: { type: 'string' },
                            country: { type: 'string' },
                            base: { type: 'string' },
                            totalContributionsUSD: { type: 'number' },
                            annualFundUSD: { type: 'number' },
                            polioPlusUSD: { type: 'number' }
                        }
                    }
                }
            }
        }
    },
    {
        name: 'get_worldwide_rankings',
        description: 'Get global Rotaract statistics across all 599 worldwide districts or 200+ countries. Default returns worldwide data. Use zone="4,5,6,7" or region="south_asia" to narrow to South Asia only. type values: "district" (rankings of all 599 districts, default sort: member_growth_pct), "country" (country rankings by clubs and members), "summary" (global macro totals only), "interact" (worldwide Interact stats), "new_clubs" (new charter trends by country). Each district result includes worldwideRank (1-599 globally) AND southAsiaRank (1-44, or null if outside South Asia). Use minMembers to filter out tiny districts from growth rankings. For South-Asia-only leaderboards use get_leaderboards with scope="south_asia".',
        annotations: READ_ONLY_ANNOTATIONS,
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
                zone: {
                    type: 'string',
                    description: 'Filter by Rotary Zone (e.g. "6", "4", "4,5,6,7", or "South Asia")'
                },
                region: {
                    type: 'string',
                    description: 'Geographic region filter: "south_asia" (Zones 4, 5, 6, 7), "southeast_asia" (Zones 9, 10), "pacific" (Zone 8), "europe", "north_america", "latin_america", or "worldwide" (default)'
                },
                sortBy: {
                    type: 'string',
                    enum: ['member_growth_pct', 'member_growth_abs', 'members', 'clubs', 'club_growth_pct', 'club_growth_abs', 'district'],
                    description: 'Sort rankings by field: "member_growth_pct" (highest growth %, default for districts), "member_growth_abs" (net new members), "members" (total size), "clubs" (active clubs), "club_growth_pct", or "district"'
                },
                sortOrder: {
                    type: 'string',
                    enum: ['desc', 'asc'],
                    description: 'Sort order: "desc" (default, highest first) or "asc"'
                },
                minMembers: {
                    type: 'integer',
                    description: 'Minimum reported members to include in district rankings'
                },
                limit: {
                    type: 'integer',
                    description: 'Limit number of results returned (default 10)'
                },
                offset: {
                    type: 'integer',
                    description: 'Number of results to skip for pagination (default 0)'
                }
            }
        },
        outputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string' },
                sortBy: { type: 'string' },
                sortOrder: { type: 'string' },
                total: { type: 'integer' },
                count: { type: 'integer' },
                districts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            rank: { type: 'integer' },
                            worldwideRank: { type: 'integer', description: 'Global rank across all 599 districts worldwide' },
                            southAsiaRank: { type: 'integer', description: 'Rank among South Asian districts (or null if outside)' },
                            district: { type: 'string' },
                            zone: { type: 'integer' },
                            region: { type: 'string' },
                            isSouthAsia: { type: 'boolean' },
                            country: { type: 'string' },
                            activeClubs: { type: 'integer' },
                            suspendedClubs: { type: 'integer' },
                            totalMembers: { type: 'integer' },
                            clubsGrowthAbs: { type: 'number' },
                            membersGrowthAbs: { type: 'number' },
                            clubsGrowthPct: { type: 'number' },
                            membersGrowthPct: { type: 'number' }
                        }
                    }
                },
                countries: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            rank: { type: 'integer' },
                            country: { type: 'string' },
                            activeClubs: { type: 'integer' },
                            suspendedClubs: { type: 'integer' },
                            totalMembers: { type: 'integer' },
                            clubsGrowthAbs: { type: 'number' },
                            membersGrowthAbs: { type: 'number' },
                            clubsGrowthPct: { type: 'number' },
                            membersGrowthPct: { type: 'number' }
                        }
                    }
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

const TOOL_HANDLERS = {
    get_summary: async (args) => {
        const summary = await getSummary(args.zone);
        return formatResponse(summary);
    },

    get_leaderboards: async (args) => {
        const category = args.category || args.type || args.leaderboard || 'all';
        const result = await getLeaderboards({
            category,
            district: args.district,
            zone: args.zone,
            base: args.base,
            country: args.country,
            scope: args.scope,
            limit: args.limit,
            offset: args.offset
        });
        return formatResponse(result);
    },

    get_districts: async (args) => {
        const result = await getDistricts({
            zone: args.zone,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
            country: args.country
        });
        return formatResponse({
            count: result.length,
            districts: result
        });
    },

    search_clubs: async (args) => {
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
            maxOutstanding: args.maxOutstanding,
            isArrears: args.isArrears ?? args.is_arrears,
            isAtRisk: args.isAtRisk ?? args.is_at_risk,
            isNoOfficers: args.isNoOfficers ?? args.is_no_officers,
            isNewClub: args.isNewClub ?? args.is_new_club,
            limit: args.limit,
            offset: args.offset
        });
        return formatResponse(result);
    },

    get_new_clubs: async (args) => {
        const result = await getNewClubsList({
            district: args.district,
            zone: args.zone,
            country: args.country,
            base: args.base,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
            limit: args.limit,
            offset: args.offset
        });
        return formatResponse(result);
    },

    get_club_profile: async (args) => {
        const clubId = args.clubId || args.club_id || args.id;
        if (!clubId) {
            return formatError('Missing required parameter: "clubId" (or club name).');
        }
        const profile = await getClubProfile(clubId);
        if (!profile) {
            return formatError(`Club '${clubId}' not found.`);
        }
        return formatResponse(profile);
    },

    get_district_insights: async (args) => {
        const district = args.district || args.districtId || args.id;
        if (!district) {
            return formatError('Missing required parameter: "district" (e.g. "3000").');
        }
        const details = await getDistrictDetails(district);
        if (!details) {
            return formatError(`District '${district}' not found.`);
        }
        return formatResponse(details);
    },

    get_zone_summary: async (args) => {
        const zone = args.zone || args.zoneId;
        if (!zone) {
            return formatError('Missing required parameter: "zone" (e.g. "5" or "Zone 5").');
        }
        const details = await getZoneDetails(zone);
        if (!details) {
            return formatError(`Zone '${zone}' not found. Supported zones: Zone 4, Zone 5, Zone 6, Zone 7.`);
        }
        return formatResponse(details);
    },

    find_compliance_risks: async (args) => {
        const riskType = args.riskType || args.risk_type || 'arrears';
        if (riskType === 'dual_risk' || riskType === 'both') {
            return formatError("The 'dual_risk'/'both' riskType has been separated into its own specialized tool. Please use find_dual_risk_clubs instead to query clubs with both financial arrears and missing officer reports.");
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
            maxOutstanding: args.maxOutstanding,
            sortBy: args.sortBy || args.sort_by,
            sortOrder: args.sortOrder || args.sort_order,
            limit: args.limit,
            offset: args.offset
        });
        return formatResponse(result);
    },

    find_dual_risk_clubs: async (args) => {
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
    },

    get_interact_analytics: async (args) => {
        const result = await getInteractAnalytics({
            district: args.district,
            zone: args.zone,
            country: args.country,
            base: args.base
        });
        return formatResponse(result);
    },

    find_rotary_opportunities: async (args) => {
        const oppType = args.opportunityType || args.opportunity_type || 'no_rotaract';
        const result = await getRotaryOpportunityList({
            opportunityType: oppType,
            district: args.district,
            zone: args.zone,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
            limit: args.limit,
            offset: args.offset
        });
        return formatResponse(result);
    },

    get_foundation_giving: async (args) => {
        const result = await getTRFList({
            district: args.district,
            zone: args.zone,
            country: args.country,
            base: args.base,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
            limit: args.limit,
            offset: args.offset
        });
        return formatResponse(result);
    },

    get_worldwide_rankings: async (args) => {
        const result = await getWorldwideStats({
            type: args.type,
            country: args.country,
            zone: args.zone,
            region: args.region,
            sortBy: args.sortBy,
            sortOrder: args.sortOrder,
            minMembers: args.minMembers,
            limit: args.limit,
            offset: args.offset
        });
        if (!result) {
            return formatError('Worldwide analytics data currently unavailable.');
        }
        return formatResponse(result);
    }
};

export async function executeTool(name, args = {}) {
    const handler = TOOL_HANDLERS[name];
    if (!handler) {
        return formatError(`Unknown tool: ${name}`);
    }
    return handler(args);
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
            const newClubs = await getNewClubsList({ limit: 200 });
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
            const scopeArg = district ? `district='${district}'` : (zone ? `zone='${zone}'` : '');
            const sep = scopeArg ? `, ${scopeArg}` : '';

            return {
                description: `Executive leaderboard briefing for ${targetScope}`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `[System Context: Rotaract South Asia Analytics Domain]\nYou are an executive analytics specialist for Rotary International Zones 4, 5, 6, and 7 (covering 44 districts, 2,820+ clubs, and 82,000+ members across India, Nepal, Sri Lanka, and Maldives). Execute the requested multi-step analytical tool chain to compile a verified executive rankings dossier.`
                        }
                    },
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Generate an executive leaderboard and rankings briefing for ${targetScope}.

Execute this ordered tool chain:
1. get_leaderboards(category='largest_clubs'${sep}, limit=5)
2. get_leaderboards(category='trf_giving'${sep}, limit=5)
3. get_leaderboards(category='highest_arrears'${sep}, limit=5)
4. get_leaderboards(category='new_clubs'${sep}, limit=5)

Output format:
- Executive Summary of macro indicators for ${targetScope}
- 4 formatted markdown tables (Largest Clubs, Top TRF Contributors, Highest Arrears, Newly Chartered Clubs)
- Strategic recommendations for regional and district leadership`
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
                            text: `[System Context: Rotaract South Asia Compliance Audit]\nYou are a senior compliance officer for Rotary International South Asia MDIO. Conduct a rigorous, multi-tiered compliance audit for the specified district by chaining dedicated compliance tools in sequence. Ground all findings in precise club-level financial and officer reporting records.`
                        }
                    },
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Perform a detailed compliance audit for Rotary District ${district}.

Execute this ordered tool chain:
1. get_district_insights(district='${district}') - verify total clubs, active membership, and overall compliance health
2. find_dual_risk_clubs(district='${district}') - isolate highest-priority clubs with BOTH arrears and missing officers
3. find_compliance_risks(riskType='at_risk_only', district='${district}') - identify clubs with dues >= $75 USD at imminent charter termination risk
4. find_compliance_risks(riskType='missing_officers', district='${district}') - identify clubs with missing officer reporting on MyRotary

Output format:
- District Compliance Scorecard (total dues, at-risk count, non-reporting count)
- High-Risk Dual Non-Compliance table with club IDs and outstanding amounts
- Immediate Intervention List (clubs >= $75 USD)
- Actionable 30/60-day remediation roadmap for DRR, DG, and DRC`
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
                            text: `[System Context: Youth Service Extension Analytics]\nYou are a youth service extension director for Rotary International Zones 4, 5, 6, and 7. Analyze untapped club sponsorship potential across Rotary clubs to expand Rotaract and Interact footprints.`
                        }
                    },
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Analyze Rotary club sponsorship opportunities in District ${district}.

Execute this ordered tool chain:
1. get_district_insights(district='${district}') - review total Rotary clubs and current Rotaract footprint
2. find_rotary_opportunities(opportunityType='no_rotaract', district='${district}', limit=25) - identify Rotary clubs without any sponsored Rotaract club
3. find_rotary_opportunities(opportunityType='no_interact', district='${district}', limit=25) - identify Rotary clubs without an Interact club

Output format:
- Strategic Sponsorship Opportunity Overview (Rotary clubs without Rotaract vs without Interact)
- Priority Extension Target Table (Rotary club name, club ID, zone)
- Outreach plan and action steps for the District Youth Service Committee and DRR`
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
                            text: `[System Context: Inter-Zone Performance Benchmarking]\nYou are a regional operations analyst for Rotary International South Asia. Produce comparative performance analyses across RI Zones 4, 5, 6, and 7 with deep drilldowns into growth, compliance, and foundation giving.`
                        }
                    },
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Compare performance metrics across South Asian zones (focus: ${zone}).

Execute this ordered tool chain:
1. get_zone_summary(zone='4'), get_zone_summary(zone='5'), get_zone_summary(zone='6'), get_zone_summary(zone='7') - gather macro KPIs across all 4 zones
2. get_leaderboards(category='districts_by_member_growth', limit=10) - identify top growth districts across South Asia
3. get_leaderboards(category='trf_giving', limit=10) - assess foundation giving distribution

Output format:
- 4-Zone Comparative Matrix (Active Members, Total Clubs, Arrears %, Total TRF USD)
- Top 10 Growth Districts Spotlight
- Deep dive on focus area (${zone}) with strategic strengths and growth opportunities`
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
        ],
        structuredContent: data
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
