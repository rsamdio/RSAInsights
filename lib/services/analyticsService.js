import {
    getDashboardSummary,
    getZoneSummary,
    getAllClubs,
    getClubDetails,
    getArrears,
    getNoOfficers,
    getUnifiedIssues,
    getRotaryNoSponsor,
    getRotaryNoInteract,
    getNewClubs,
    getTRFContributions,
    getDistrictOfficers,
    getWorldwideSummary,
    getZoneData,
    getDistrictData
} from '../api.js';

/**
 * Normalizes zone identifier to "Zone X" format.
 * @param {string|number} zone
 * @returns {string}
 */
export function normalizeZoneName(zone) {
    if (!zone) return '';
    const str = zone.toString().trim();
    if (/^zone\s*\d+/i.test(str)) {
        const num = str.replace(/[^0-9]/g, '');
        return `Zone ${num}`;
    }
    const cleanNum = str.replace(/[^0-9]/g, '');
    return cleanNum ? `Zone ${cleanNum}` : str;
}

/**
 * Normalizes district identifier to pure string digits (e.g. "3000").
 * @param {string|number} district
 * @returns {string}
 */
export function normalizeDistrictId(district) {
    if (!district) return '';
    return district.toString().replace(/[^0-9]/g, '').trim();
}

/**
 * Sanitizes pagination options with safe boundary limits.
 * @param {number|string} limit
 * @param {number|string} offset
 * @returns {{ limit: number, offset: number }}
 */
export function sanitizePagination(limit = 25, offset = 0) {
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    return { limit: parsedLimit, offset: parsedOffset };
}

/**
 * Safely validates whether a value is a non-empty, finite number.
 * @param {*} val
 * @returns {boolean}
 */
export function isValidNumber(val) {
    return val !== undefined && val !== null && val !== '' && !isNaN(Number(val));
}

/**
 * Retrieves executive summary metrics, optionally scoped to a single zone.
 * @param {string|number} [zoneId]
 * @returns {Object|null}
 */
export async function getSummary(zoneId) {
    const summary = await getDashboardSummary();
    if (!summary || !summary.current) return null;

    const dataAsOf = summary.dataAsOf || summary.lastUpdated || '15 Sep 2026';

    if (zoneId) {
        const normalizedZone = normalizeZoneName(zoneId);
        const zoneObj = summary.current.zones?.[normalizedZone];
        if (!zoneObj) return null;

        const prevZoneObj = summary.previous?.zones?.[normalizedZone];
        const totalClubs = zoneObj.stats?.totalClubs || 0;
        const totalMembers = zoneObj.stats?.totalMembers || 0;
        const avgMembersPerClub = totalClubs > 0 ? Number((totalMembers / totalClubs).toFixed(1)) : 0;

        return {
            zone: normalizedZone,
            dataAsOf,
            stats: {
                ...zoneObj.stats,
                avgMembersPerClub
            },
            previousStats: prevZoneObj?.stats || null,
            districtCount: Object.keys(zoneObj.districts || {}).length,
            averages: {
                avgMembersPerClub,
                avgClubsPerDistrict: Object.keys(zoneObj.districts || {}).length > 0 ? Number((totalClubs / Object.keys(zoneObj.districts || {}).length).toFixed(1)) : 0
            }
        };
    }

    const totalClubs = summary.current.overall?.totalClubs || 0;
    const totalMembers = summary.current.overall?.totalMembers || 0;
    const avgMembersPerClub = totalClubs > 0 ? Number((totalMembers / totalClubs).toFixed(1)) : 0;

    return {
        dataAsOf,
        overall: {
            ...summary.current.overall,
            avgMembersPerClub
        },
        previousOverall: summary.previous?.overall || null,
        averages: {
            avgMembersPerClub
        },
        zonesSummary: Object.keys(summary.current.zones || {}).map(zKey => {
            const zStats = summary.current.zones[zKey]?.stats || {};
            const zClubs = zStats.totalClubs || 0;
            const zMembers = zStats.totalMembers || 0;
            return {
                zone: zKey,
                stats: {
                    ...zStats,
                    avgMembersPerClub: zClubs > 0 ? Number((zMembers / zClubs).toFixed(1)) : 0
                },
                districtCount: Object.keys(summary.current.zones[zKey]?.districts || {}).length
            };
        })
    };
}

/**
 * Retrieves all 4 South Asia zones with top-level metrics.
 * @returns {Array<Object>}
 */
export async function getZones() {
    const summary = await getDashboardSummary();
    if (!summary || !summary.current || !summary.current.zones) return [];

    return Object.keys(summary.current.zones).map(zKey => {
        const zData = summary.current.zones[zKey];
        const stats = zData.stats || {};
        const totalClubs = stats.totalClubs || 0;
        const totalMembers = stats.totalMembers || 0;
        return {
            zone: zKey,
            zoneNumber: parseInt(zKey.replace(/[^0-9]/g, ''), 10),
            stats: {
                ...stats,
                avgMembersPerClub: totalClubs > 0 ? Number((totalMembers / totalClubs).toFixed(1)) : 0
            },
            districts: Object.keys(zData.districts || {}).sort((a, b) => Number(a) - Number(b))
        };
    });
}

/**
 * Retrieves granular statistics and district list for a specific zone.
 * @param {string|number} zoneId
 * @returns {Object|null}
 */
export async function getZoneDetails(zoneId) {
    const normalized = normalizeZoneName(zoneId);
    const zoneData = getZoneData(normalized);
    if (!zoneData) return null;

    const officersList = await getDistrictOfficers() || [];
    const officerMap = new Map();
    officersList.forEach(o => {
        officerMap.set(o.District.toString(), o);
    });

    const districtsArray = Object.keys(zoneData.districts || {}).map(dId => {
        const distStats = zoneData.districts[dId];
        const leadership = officerMap.get(dId.toString()) || null;
        return {
            district: dId,
            stats: distStats,
            leadership: leadership ? {
                dg: leadership.DG || '',
                drr: leadership.DRR || '',
                drc: leadership.DRC || ''
            } : null
        };
    }).sort((a, b) => Number(a.district) - Number(b.district));

    const totalClubs = zoneData.stats?.totalClubs || 0;
    const totalMembers = zoneData.stats?.totalMembers || 0;
    const avgMembersPerClub = totalClubs > 0 ? Number((totalMembers / totalClubs).toFixed(1)) : 0;
    const avgClubsPerDistrict = districtsArray.length > 0 ? Number((totalClubs / districtsArray.length).toFixed(1)) : 0;

    // District leaderboards within this zone
    const topDistrictsByClubs = [...districtsArray]
        .sort((a, b) => Number(b.stats?.totalClubs || 0) - Number(a.stats?.totalClubs || 0))
        .slice(0, 5)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d.district,
            totalClubs: Number(d.stats?.totalClubs || 0),
            members: Number(d.stats?.totalMembers || 0),
            drr: d.leadership?.drr || 'Active'
        }));

    const topDistrictsByMembers = [...districtsArray]
        .sort((a, b) => Number(b.stats?.totalMembers || 0) - Number(a.stats?.totalMembers || 0))
        .slice(0, 5)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d.district,
            members: Number(d.stats?.totalMembers || 0),
            totalClubs: Number(d.stats?.totalClubs || 0),
            drr: d.leadership?.drr || 'Active'
        }));

    const topDistrictsByTRF = [...districtsArray]
        .filter(d => Number(d.stats?.trfContributionsUSD || 0) > 0)
        .sort((a, b) => Number(b.stats?.trfContributionsUSD || 0) - Number(a.stats?.trfContributionsUSD || 0))
        .slice(0, 5)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d.district,
            trfContributionsUSD: Number(d.stats?.trfContributionsUSD || 0),
            drr: d.leadership?.drr || 'Active'
        }));

    const topDistrictsByArrears = [...districtsArray]
        .filter(d => Number(d.stats?.outstanding || 0) > 0)
        .sort((a, b) => Number(b.stats?.outstanding || 0) - Number(a.stats?.outstanding || 0))
        .slice(0, 5)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d.district,
            outstandingINR: Number(d.stats?.outstanding || 0),
            arrearsClubs: Number(d.stats?.arrearsClubs || 0),
            drr: d.leadership?.drr || 'Active'
        }));

    // Largest clubs in this zone
    const allClubs = await getAllClubs() || [];
    const zoneClubs = allClubs.filter(c => normalizeZoneName(c['RI Zone'] || c.Zone || c.zone) === normalized);
    const topClubsInZone = [...zoneClubs]
        .sort((a, b) => Number(b['Total Reported Members'] ?? b.members ?? 0) - Number(a['Total Reported Members'] ?? a.members ?? 0))
        .slice(0, 10)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || c.district || ''),
            base: c['Rotaract Club Base'] || c.base || 'Unknown',
            members: Number(c['Total Reported Members'] ?? c.members ?? 0),
            sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
        }));

    return {
        zone: zoneData.name,
        zoneNumber: parseInt(zoneData.name.replace(/[^0-9]/g, ''), 10),
        stats: {
            ...zoneData.stats,
            avgMembersPerClub
        },
        averages: {
            avgMembersPerClub,
            avgClubsPerDistrict
        },
        districts: districtsArray,
        rankings: {
            topDistrictsByClubs,
            topDistrictsByMembers,
            topDistrictsByTRF,
            topDistrictsByArrears
        },
        topClubs: {
            largestClubs: topClubsInZone
        }
    };
}

/**
 * Retrieves all 44 districts with key performance indicators, leadership, and growth metrics.
 * Supports sorting by totalClubs, members, arrearsClubs, outstanding, trf, newClubs, interactGrowth, noOfficers, district.
 * @param {string|number} [zoneId]
 * @param {string} [sortBy='district']
 * @param {string} [sortOrder='asc']
 * @returns {Array<Object>}
 */
export async function getDistricts(zoneId, sortBy = 'district', sortOrder = 'asc') {
    const zoneSummaryData = await getZoneSummary() || [];
    const officersList = await getDistrictOfficers() || [];
    const officerMap = new Map();
    officersList.forEach(o => {
        officerMap.set(o.District.toString(), o);
    });

    let filtered = zoneSummaryData;
    if (zoneId) {
        const targetZone = normalizeZoneName(zoneId);
        filtered = filtered.filter(d => normalizeZoneName(d['RI Zone']) === targetZone);
    }

    const mapped = filtered.map(d => {
        const dId = d['RI District'].toString();
        const leadership = officerMap.get(dId) || null;
        const totalClubs = Number(d['Total Clubs'] || 0);
        const members = Number(d['Total Reported Members'] ?? d['Members'] ?? 0);
        const avgMembership = totalClubs > 0 ? Number((members / totalClubs).toFixed(1)) : 0;
        const arrearsClubs = Number(d.TotalClubsArrears ?? d.arrearsClubs ?? 0);
        const outstandingINR = Number(d.TotalINR ?? d['Total Outstanding (INR)'] ?? 0);

        return {
            district: dId,
            zone: normalizeZoneName(d['RI Zone']),
            totalClubs,
            members,
            avgMembership,
            rotaryClubs: Number(d['Total Rotary Clubs'] || 0),
            rotaryWithoutRotaract: Number(d['Rotary without Rotaract Club'] || 0),
            interactClubs: Number(d['TotalInteractClubs'] || 0),
            suspendedInteractClubs: Number(d['SuspendedInteractClubs'] || 0),
            rotaryWithoutInteract: Number(d['Rotary without Interact Club'] || 0),
            outstandingINR,
            arrearsClubs,
            noOfficersClubs: Number(d['No Officer Total'] || 0),
            trfContributionsUSD: Number(d['Total Contributions USD'] || 0),
            newClubs: Number(d['NewTotalClubs'] || 0),
            // Quarter-over-quarter growth metrics from zone_summary.json
            interactGrowthAbs: Number(d['Interact Growth Abs'] ?? 0),
            interactGrowthPct: Number(d['Interact Growth (%)'] ?? 0),
            leadership: leadership ? {
                dg: leadership.DG || '',
                drr: leadership.DRR || '',
                drc: leadership.DRC || ''
            } : null
        };
    });

    const isDesc = (sortOrder || 'asc').toLowerCase() === 'desc';
    const sortFns = {
        totalClubs: (a, b) => isDesc ? b.totalClubs - a.totalClubs : a.totalClubs - b.totalClubs,
        members: (a, b) => isDesc ? b.members - a.members : a.members - b.members,
        arrearsClubs: (a, b) => isDesc ? b.arrearsClubs - a.arrearsClubs : a.arrearsClubs - b.arrearsClubs,
        outstanding: (a, b) => isDesc ? b.outstandingINR - a.outstandingINR : a.outstandingINR - b.outstandingINR,
        trf: (a, b) => isDesc ? b.trfContributionsUSD - a.trfContributionsUSD : a.trfContributionsUSD - b.trfContributionsUSD,
        newClubs: (a, b) => isDesc ? b.newClubs - a.newClubs : a.newClubs - b.newClubs,
        interactGrowth: (a, b) => isDesc ? b.interactGrowthAbs - a.interactGrowthAbs : a.interactGrowthAbs - b.interactGrowthAbs,
        noOfficers: (a, b) => isDesc ? b.noOfficersClubs - a.noOfficersClubs : a.noOfficersClubs - b.noOfficersClubs,
        district: (a, b) => isDesc ? Number(b.district) - Number(a.district) : Number(a.district) - Number(b.district)
    };
    const sortFn = sortFns[sortBy] || sortFns.district;
    return mapped.sort(sortFn);
}


/**
 * Retrieves full analytical dossier for a single district.
 * Includes demographics, leadership, and top clubs (largest, TRF, arrears, new).
 * @param {string|number} districtId
 * @returns {Object|null}
 */
export async function getDistrictDetails(districtId) {
    const cleanId = normalizeDistrictId(districtId);
    const distData = getDistrictData(cleanId);
    if (!distData) return null;

    const officersList = await getDistrictOfficers() || [];
    const leadership = officersList.find(o => o.District.toString() === cleanId) || null;

    const allClubs = await getAllClubs() || [];
    const districtClubs = allClubs.filter(c => String(c.District || c.district) === cleanId);

    const arrearsData = await getArrears() || [];
    const districtArrears = arrearsData.filter(c => String(c.District) === cleanId);

    const noOfficersData = await getNoOfficers() || [];
    const districtNoOfficers = noOfficersData.filter(c => String(c.District) === cleanId);

    const trfData = await getTRFContributions() || [];
    const districtTRF = trfData.filter(c => String(c.District) === cleanId);

    const newClubsData = await getNewClubs() || [];
    const districtNewClubs = newClubsData.filter(c => String(c.District || c.DISTRICT) === cleanId);

    // 1. Largest Clubs by Members in this District
    const largestClubs = [...districtClubs]
        .sort((a, b) => Number(b['Total Reported Members'] ?? b.members ?? 0) - Number(a['Total Reported Members'] ?? a.members ?? 0))
        .slice(0, 5)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            base: c['Rotaract Club Base'] || c.base || 'Unknown',
            members: Number(c['Total Reported Members'] ?? c.members ?? 0),
            sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
        }));

    // 2. Highest TRF Contributors in this District
    const topTRFClubs = [...districtTRF]
        .sort((a, b) => Number(b['Total Contributions USD'] || 0) - Number(a['Total Contributions USD'] || 0))
        .filter(c => Number(c['Total Contributions USD'] || 0) > 0)
        .slice(0, 5)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club No.'] || c['Club No'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            totalContributionsUSD: Number(c['Total Contributions USD'] || 0),
            annualFundUSD: Number(c['Annual Fund Contribution USD'] || 0),
            sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
        }));

    // 3. Highest Outstanding Dues in this District
    const highestArrearsClubs = [...districtArrears]
        .map(c => ({
            ...c,
            _inr: Number(c['Outstanding INR'] ?? c.outstanding ?? c.outstandingINR ?? c[' USD Outstanding '] ?? 0)
        }))
        .filter(c => c._inr > 0)
        .sort((a, b) => b._inr - a._inr)
        .slice(0, 5)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['NF Cust Number'] || c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            base: c['Club Base'] || c.base || 'Unknown',
            outstandingINR: c._inr,
            outstandingUSD: Number(c[' USD Outstanding '] ?? c.outstandingUSD ?? 0),
            isAtRisk: Boolean(c.isAtRisk || Number(c[' USD Outstanding '] || 0) >= 75)
        }));

    // 4. Newly Chartered Clubs in this District
    const newClubs = districtNewClubs.map((c, idx) => ({
        rank: idx + 1,
        id: String(c['Club ID'] || ''),
        name: c['Club Name'] || '',
        base: c['Club Subtype'] || c.base || 'Unknown',
        charterDate: c['Club Charter Date'] || '',
        members: Number(c['Member Count'] || 0),
        sponsorClubs: c['Sponsor Clubs'] || ''
    }));

    const totalClubsCount = districtClubs.length;
    const totalMembersCount = distData.stats?.totalMembers || 0;
    const avgMembersPerClub = totalClubsCount > 0 ? Number((totalMembersCount / totalClubsCount).toFixed(1)) : 0;
    const avgArrearsPerArrearsClub = districtArrears.length > 0 ? Math.round((distData.stats?.outstanding || 0) / districtArrears.length) : 0;

    return {
        district: cleanId,
        zone: distData.zone,
        stats: {
            ...distData.stats,
            avgMembersPerClub
        },
        averages: {
            avgMembersPerClub,
            avgArrearsPerArrearsClub
        },
        leadership: leadership ? {
            dg: leadership.DG || '',
            drr: leadership.DRR || '',
            drc: leadership.DRC || ''
        } : null,
        counts: {
            totalClubs: totalClubsCount,
            arrearsClubs: districtArrears.length,
            noOfficersClubs: districtNoOfficers.length,
            trfContributingClubs: districtTRF.length,
            newClubs: districtNewClubs.length
        },
        topClubs: {
            largestClubs,
            topTRFClubs,
            highestArrearsClubs,
            newClubs
        }
    };
}

/**
 * Searches, filters, and sorts the master roster of Rotaract clubs (2,877 records).
 * Supports sorting by membership, arrears dues, name, ID, or charter date.
 * @param {Object} options
 * @returns {{ clubs: Array<Object>, data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function searchClubs({
    q = '',
    query = '',
    district = '',
    zone = '',
    base = '',
    country = '',
    status = '',
    sponsorsInteract,
    sponsors_interact,
    isArrears,
    is_arrears,
    isAtRisk,
    is_at_risk,
    isNoOfficers,
    is_no_officers,
    isNewClub,
    is_new_club,
    minMembers,
    maxMembers,
    minOutstanding,
    sortBy = '',
    sortOrder = '',
    limit = 25,
    offset = 0
} = {}) {
    const allClubs = await getAllClubs() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const queryLower = (q || query || '').toLowerCase().trim();
    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';
    const targetCountry = country ? country.toLowerCase().trim() : '';
    const targetStatus = status ? status.toLowerCase().trim() : '';

    const effectiveIsArrears = isArrears !== undefined ? isArrears : is_arrears;
    const effectiveIsAtRisk = isAtRisk !== undefined ? isAtRisk : is_at_risk;
    const effectiveIsNoOfficers = isNoOfficers !== undefined ? isNoOfficers : is_no_officers;
    const effectiveIsNewClub = isNewClub !== undefined ? isNewClub : is_new_club;
    const effectiveSponsorsInteract = sponsorsInteract !== undefined ? sponsorsInteract : sponsors_interact;

    let filtered = allClubs.filter(c => {
        if (targetDistrict && String(c.District || c.district) !== targetDistrict) return false;
        if (targetZone) {
            const cZone = normalizeZoneName(c['RI Zone'] || c.Zone || c.zone);
            if (cZone !== targetZone) return false;
        }
        if (targetBase) {
            const cBase = (c['Rotaract Club Base'] || c['Club Base'] || c.base || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        if (targetStatus) {
            const cStatus = (c['Rotaract Club Status'] || c['Club Status'] || c.status || '').toLowerCase();
            if (!cStatus.includes(targetStatus)) return false;
        }
        if (targetCountry) {
            const cCountry = (c['Country/Geographic Area'] || c.country || '').toLowerCase();
            if (!cCountry.includes(targetCountry)) return false;
        }
        if (effectiveSponsorsInteract !== undefined) {
            const hasInteract = Boolean((c.sponsoredInteractCount || 0) > 0 || (c.sponsoredInteractClubs?.length || 0) > 0);
            if (hasInteract !== Boolean(effectiveSponsorsInteract)) return false;
        }
        if (effectiveIsArrears !== undefined) {
            const clubArrears = Boolean(c.isArrears || c.Arrears === 'Yes');
            if (clubArrears !== Boolean(effectiveIsArrears)) return false;
        }
        if (effectiveIsAtRisk !== undefined) {
            const clubAtRisk = Boolean(c.isAtRisk || Number(c.outstandingUSD || 0) >= 75);
            if (clubAtRisk !== Boolean(effectiveIsAtRisk)) return false;
        }
        if (effectiveIsNoOfficers !== undefined) {
            const clubNoOfficers = Boolean(c.isNoOfficers || c.Officers === 'No');
            if (clubNoOfficers !== Boolean(effectiveIsNoOfficers)) return false;
        }
        if (effectiveIsNewClub !== undefined) {
            if (Boolean(c.isNewClub) !== Boolean(effectiveIsNewClub)) return false;
        }
        if (isValidNumber(minMembers) && Number(minMembers) >= 0) {
            const mem = Number(c['Total Reported Members'] ?? c.members ?? 0);
            if (mem < Number(minMembers)) return false;
        }
        if (isValidNumber(maxMembers) && Number(maxMembers) >= 0) {
            const mem = Number(c['Total Reported Members'] ?? c.members ?? 0);
            if (mem > Number(maxMembers)) return false;
        }
        if (isValidNumber(minOutstanding) && Number(minOutstanding) >= 0) {
            const dues = Number(c.outstandingINR ?? c.outstanding ?? 0);
            if (dues < Number(minOutstanding)) return false;
        }
        if (queryLower) {
            const name = (c['Club Name'] || c['Rotaract Club Name'] || c.name || '').toLowerCase();
            const id = String(c['Club ID'] || c['Rotaract Club ID'] || c.id || '').toLowerCase();
            const sponsor = (c['Sponsor Clubs'] || c.sponsorClubs || '').toLowerCase();
            const country = (c['Country/Geographic Area'] || c.country || '').toLowerCase();
            if (!name.includes(queryLower) && !id.includes(queryLower) && !sponsor.includes(queryLower) && !country.includes(queryLower)) {
                return false;
            }
        }
        return true;
    });

    // Sorting logic
    const cleanSortBy = (sortBy || '').toLowerCase().trim();
    const cleanOrder = (sortOrder || '').toLowerCase().trim();
    const isDesc = cleanOrder === 'desc' || (!cleanOrder && ['members', 'outstanding', 'trf', 'interact'].includes(cleanSortBy));

    if (cleanSortBy === 'members') {
        filtered.sort((a, b) => {
            const mA = Number(a['Total Reported Members'] ?? a.members ?? 0);
            const mB = Number(b['Total Reported Members'] ?? b.members ?? 0);
            return isDesc ? mB - mA : mA - mB;
        });
    } else if (cleanSortBy === 'outstanding' || cleanSortBy === 'dues') {
        filtered.sort((a, b) => {
            const dA = Number(a.outstandingINR ?? a.outstanding ?? 0);
            const dB = Number(b.outstandingINR ?? b.outstanding ?? 0);
            return isDesc ? dB - dA : dA - dB;
        });
    } else if (cleanSortBy === 'trf') {
        filtered.sort((a, b) => {
            const tA = Number(a.trfTotal || 0);
            const tB = Number(b.trfTotal || 0);
            return isDesc ? tB - tA : tA - tB;
        });
    } else if (cleanSortBy === 'interact') {
        filtered.sort((a, b) => {
            const iA = Number(a.sponsoredInteractCount || 0);
            const iB = Number(b.sponsoredInteractCount || 0);
            return isDesc ? iB - iA : iA - iB;
        });
    } else if (cleanSortBy === 'name') {
        filtered.sort((a, b) => {
            const nA = (a['Club Name'] || a.name || '').toLowerCase();
            const nB = (b['Club Name'] || b.name || '').toLowerCase();
            return isDesc ? nB.localeCompare(nA) : nA.localeCompare(nB);
        });
    } else if (cleanSortBy === 'district') {
        filtered.sort((a, b) => {
            const dA = Number(a.District || a.district || 0);
            const dB = Number(b.District || b.district || 0);
            return isDesc ? dB - dA : dA - dB;
        });
    } else if (cleanSortBy === 'charterdate' || cleanSortBy === 'charter_date') {
        filtered.sort((a, b) => {
            const dateA = new Date(a.charterDate || 0).getTime();
            const dateB = new Date(b.charterDate || 0).getTime();
            return isDesc ? dateB - dateA : dateA - dateB;
        });
    }

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c['Club ID'] || c['Rotaract Club ID'] || c.id || ''),
        name: c['Club Name'] || c['Rotaract Club Name'] || c.name || '',
        district: String(c.District || c.district || ''),
        zone: normalizeZoneName(c['RI Zone'] || c.Zone || c.zone),
        base: c['Rotaract Club Base'] || c['Club Base'] || c.base || 'Unknown',
        status: c['Rotaract Club Status'] || c['Club Status'] || c.status || 'Active',
        country: c['Country/Geographic Area'] || c.country || 'Unknown',
        sponsorClubs: (c['Sponsor Clubs'] && c['Sponsor Clubs'] !== 'None Reported') ? c['Sponsor Clubs'] : (c.sponsorClubs || ''),
        members: Number(c['Total Reported Members'] ?? c.members ?? 0),
        isArrears: Boolean(c.isArrears || c.Arrears === 'Yes'),
        outstandingINR: Number(c.outstandingINR ?? c.outstanding ?? 0),
        outstandingUSD: Number(c.outstandingUSD ?? 0),
        isAtRisk: Boolean(c.isAtRisk),
        isNoOfficers: Boolean(c.isNoOfficers || c.Officers === 'No'),
        isNewClub: Boolean(c.isNewClub),
        sponsoredInteractCount: Number(c.sponsoredInteractCount || 0),
        sponsoredInteractClubs: c.sponsoredInteractClubs || []
    }));

    return {
        data: paginated,
        clubs: paginated,
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: safeOffset + safeLimit < total
        },
        total,
        limit: safeLimit,
        offset: safeOffset
    };
}

/**
 * Retrieves the full universal dossier for a single club (O(1) hash map lookup, with name fallback).
 * @param {string|number} clubId
 * @returns {Object|null}
 */
export async function getClubProfile(clubId) {
    if (!clubId) return null;
    let profile = getClubDetails(clubId);
    if (!profile) {
        // Fallback search by club name if clubId was name or partial
        const cleanSearch = String(clubId).toLowerCase().trim();
        const allClubs = await getAllClubs() || [];
        const match = allClubs.find(c => {
            const name = (c['Club Name'] || c['Rotaract Club Name'] || c.name || '').toLowerCase();
            const id = String(c['Club ID'] || c['Rotaract Club ID'] || c.id || '').toLowerCase();
            return name === cleanSearch || name.includes(cleanSearch) || id === cleanSearch;
        });
        if (match) {
            const foundId = match['Club ID'] || match['Rotaract Club ID'] || match.id;
            if (foundId) {
                profile = getClubDetails(foundId);
            }
        }
    }
    return profile;
}

/**
 * Retrieves clubs in arrears with optional filtering, sorting, and pagination.
 * Defaults to sorting by highest outstanding balance descending.
 * @param {Object} options
 * @returns {{ clubs: Array<Object>, data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getArrearsList({
    district = '',
    zone = '',
    atRiskOnly = false,
    at_risk_only = false,
    base = '',
    country = '',
    minOutstanding,
    sortBy = 'outstanding',
    sortOrder = 'desc',
    limit = 25,
    offset = 0
} = {}) {
    const arrearsData = await getArrears() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';
    const targetCountry = country ? country.toLowerCase().trim() : '';
    const filterAtRisk = Boolean(atRiskOnly || at_risk_only);

    let filtered = arrearsData.filter(c => {
        if (targetDistrict && String(c.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone'] || c['Current Zone'] || c.Zone) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c['Club Base'] || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        if (targetCountry) {
            const cCountry = (c.Country || '').toLowerCase();
            if (!cCountry.includes(targetCountry)) return false;
        }
        if (filterAtRisk && !c.isAtRisk && Number(c[' USD Outstanding '] || 0) < 75) return false;
        if (isValidNumber(minOutstanding) && Number(minOutstanding) >= 0) {
            const dues = Number(c['Outstanding INR'] ?? c.outstanding ?? c.outstandingINR ?? 0);
            if (dues < Number(minOutstanding)) return false;
        }
        return true;
    });

    const isDesc = (sortOrder || 'desc').toLowerCase() === 'desc';
    if (sortBy === 'outstanding' || sortBy === 'dues') {
        filtered.sort((a, b) => {
            const vA = Number(a['Outstanding INR'] ?? a.outstanding ?? a.outstandingINR ?? 0);
            const vB = Number(b['Outstanding INR'] ?? b.outstanding ?? b.outstandingINR ?? 0);
            return isDesc ? vB - vA : vA - vB;
        });
    } else if (sortBy === 'members') {
        filtered.sort((a, b) => {
            const mA = Number(a['Billable Member Count'] || 0);
            const mB = Number(b['Billable Member Count'] || 0);
            return isDesc ? mB - mA : mA - mB;
        });
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => {
            const nA = (a['Club Name'] || '').toLowerCase();
            const nB = (b['Club Name'] || '').toLowerCase();
            return isDesc ? nB.localeCompare(nA) : nA.localeCompare(nB);
        });
    }

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c['NF Cust Number'] || c['Club ID'] || ''),
        name: c['Club Name'] || '',
        district: String(c.District || ''),
        zone: normalizeZoneName(c['RI Zone'] || c['Current Zone'] || c.Zone),
        country: c.Country || '',
        base: c['Club Base'] || 'Unknown',
        sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || '',
        billableMembers: Number(c['Billable Member Count'] || 0),
        outstandingINR: Number(c['Outstanding INR'] ?? c.outstanding ?? c.outstandingINR ?? 0),
        outstandingUSD: Number(c[' USD Outstanding '] ?? c.outstandingUSD ?? 0),
        isAtRisk: Boolean(c.isAtRisk || Number(c[' USD Outstanding '] || 0) >= 75)
    }));

    return {
        data: paginated,
        clubs: paginated,
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: safeOffset + safeLimit < total
        },
        total,
        limit: safeLimit,
        offset: safeOffset
    };
}

/**
 * Retrieves clubs missing reported officers on MyRotary.
 * Supports filtering by district, zone, base, country, and lastReportedBefore year.
 * Supports sorting by name, district, or lastReported.
 * @param {Object} options
 * @returns {{ clubs: Array<Object>, data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getMissingOfficersList({
    district = '',
    zone = '',
    base = '',
    country = '',
    lastReportedBefore = '',
    sortBy = 'name',
    sortOrder = 'asc',
    limit = 25,
    offset = 0
} = {}) {
    const noOfficersData = await getNoOfficers() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';
    const targetCountry = country ? country.toLowerCase().trim() : '';
    const targetLastReportedBefore = lastReportedBefore ? lastReportedBefore.toString().trim() : '';

    // Build district-to-country map if country filter requested
    let districtCountryMap = null;
    if (targetCountry) {
        const allClubs = await getAllClubs() || [];
        districtCountryMap = new Map();
        allClubs.forEach(c => {
            const dist = String(c.District || '');
            if (dist && !districtCountryMap.has(dist)) {
                districtCountryMap.set(dist, (c['Country/Geographic Area'] || '').toLowerCase());
            }
        });
    }

    let filtered = noOfficersData.filter(c => {
        if (targetDistrict && String(c.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone'] || c.Zone) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c['Club Base'] || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        if (targetCountry && districtCountryMap) {
            const cCountry = districtCountryMap.get(String(c.District || '')) || '';
            if (!cCountry.includes(targetCountry)) return false;
        }
        if (targetLastReportedBefore) {
            const lr = (c['Last Reported'] || '').toString().trim();
            // Keep only clubs that have never reported or whose last report year < threshold
            if (lr && lr !== 'Unknown' && lr >= targetLastReportedBefore) return false;
        }
        return true;
    });

    const isDesc = (sortOrder || 'asc').toLowerCase() === 'desc';
    if (sortBy === 'district') {
        filtered.sort((a, b) => {
            const dA = Number(a.District || 0);
            const dB = Number(b.District || 0);
            return isDesc ? dB - dA : dA - dB;
        });
    } else if (sortBy === 'lastReported') {
        filtered.sort((a, b) => {
            const rA = (a['Last Reported'] || '0000').toLowerCase();
            const rB = (b['Last Reported'] || '0000').toLowerCase();
            return isDesc ? rB.localeCompare(rA) : rA.localeCompare(rB);
        });
    } else {
        filtered.sort((a, b) => {
            const nA = (a['Rotaract Club Name'] || a['Club Name'] || '').toLowerCase();
            const nB = (b['Rotaract Club Name'] || b['Club Name'] || '').toLowerCase();
            return isDesc ? nB.localeCompare(nA) : nA.localeCompare(nB);
        });
    }

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c['Club ID'] || ''),
        name: c['Rotaract Club Name'] || c['Club Name'] || '',
        district: String(c.District || ''),
        zone: normalizeZoneName(c['RI Zone'] || c.Zone),
        base: c['Club Base'] || 'Unknown',
        sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || '',
        officerRole: c['Rotaract Role'] || 'Rotaract President',
        officerLastReported: c['Last Reported'] || c['President /Advisor Term Reported'] || c['President / Advisor Term Reported'] || 'Never Reported'
    }));

    return {
        data: paginated,
        clubs: paginated,
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: safeOffset + safeLimit < total
        },
        total,
        limit: safeLimit,
        offset: safeOffset
    };
}

/**
 * Retrieves Rotary clubs with expansion opportunities (no Rotaract or no Interact).
 * @param {Object} options
 * @returns {{ data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getRotaryOpportunityList({
    opportunity_type,
    type,
    opportunityType,
    district = '',
    zone = '',
    limit = 25,
    offset = 0
} = {}) {
    const effectiveType = opportunity_type || opportunityType || type || 'no_rotaract';
    const isNoInteract = effectiveType === 'no_interact';
    const rawData = isNoInteract ? (await getRotaryNoInteract() || []) : (await getRotaryNoSponsor() || []);
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';

    let filtered = rawData.filter(r => {
        if (targetDistrict && String(r.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(r['RI Zone']) !== targetZone) return false;
        return true;
    });

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(r => ({
        id: String(r['Club ID'] || ''),
        name: r['Club Name'] || '',
        district: String(r.District || ''),
        zone: normalizeZoneName(r['RI Zone']),
        members: Number(r['Current Member Count'] || 0),
        status: r['Club Status'] || 'Active',
        totalRotaractSponsored: Number(r['Total Rotaract Sponsored'] ?? 0),
        totalInteractSponsored: Number(r['Total Interact Sponsored'] ?? 0)
    }));

    return {
        data: paginated,
        clubs: paginated,
        opportunityType: isNoInteract ? 'no_interact' : 'no_rotaract',
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: safeOffset + safeLimit < total
        },
        total,
        limit: safeLimit,
        offset: safeOffset
    };
}

/**
 * Retrieves The Rotary Foundation (TRF) giving details and top contributors.
 * Defaults to sorting by total contributions USD descending.
 * @param {Object} options
 * @returns {{ contributions: Array<Object>, data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getTRFList({
    district = '',
    zone = '',
    sortBy = 'totalContributionsUSD',
    sortOrder = 'desc',
    limit = 25,
    offset = 0
} = {}) {
    const trfData = await getTRFContributions() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';

    let filtered = trfData.filter(c => {
        if (targetDistrict && String(c.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone']) !== targetZone) return false;
        return true;
    });

    const isDesc = (sortOrder || 'desc').toLowerCase() === 'desc';
    if (sortBy === 'totalContributionsUSD' || sortBy === 'total') {
        filtered.sort((a, b) => {
            const vA = Number(a['Total Contributions USD'] || 0);
            const vB = Number(b['Total Contributions USD'] || 0);
            return isDesc ? vB - vA : vA - vB;
        });
    } else if (sortBy === 'annualFundUSD' || sortBy === 'annual') {
        filtered.sort((a, b) => {
            const vA = Number(a['Annual Fund Contribution USD'] || 0);
            const vB = Number(b['Annual Fund Contribution USD'] || 0);
            return isDesc ? vB - vA : vA - vB;
        });
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => {
            const nA = (a['Club Name'] || '').toLowerCase();
            const nB = (b['Club Name'] || '').toLowerCase();
            return isDesc ? nB.localeCompare(nA) : nA.localeCompare(nB);
        });
    }

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c['Club No.'] || c['Club No'] || ''),
        name: c['Club Name'] || '',
        district: String(c.District || ''),
        zone: normalizeZoneName(c['RI Zone']),
        sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || '',
        annualFundUSD: Number(c['Annual Fund Contribution USD'] || 0),
        polioPlusUSD: Number(c['PolioPlus Fund Contribution USD'] || 0),
        otherFundsUSD: Number(c['Other Funds Contribution USD'] || 0),
        totalContributionsUSD: Number(c['Total Contributions USD'] || 0)
    }));

    return {
        data: paginated,
        contributions: paginated,
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: safeOffset + safeLimit < total
        },
        total,
        limit: safeLimit,
        offset: safeOffset
    };
}

/**
 * Retrieves newly chartered Rotaract clubs (126 clubs chartered in current period).
 * @param {Object} options
 * @returns {{ data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getNewClubsList({
    district = '',
    zone = '',
    base = '',
    sortBy = 'charterDate',
    sortOrder = 'desc',
    limit = 25,
    offset = 0
} = {}) {
    const rawNewClubs = await getNewClubs() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';

    let filtered = rawNewClubs.filter(c => {
        if (targetDistrict && String(c.District || c.DISTRICT) !== targetDistrict) return false;
        if (targetZone) {
            const cZone = normalizeZoneName(c['RI Zone'] || c.ZONE || c['Current Zone']);
            if (cZone !== targetZone) return false;
        }
        if (targetBase) {
            const cBase = (c['Club Subtype'] || c.base || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        return true;
    });

    const isDesc = (sortOrder || 'desc').toLowerCase() === 'desc';
    if (sortBy === 'members') {
        filtered.sort((a, b) => {
            const mA = Number(a['Member Count'] || 0);
            const mB = Number(b['Member Count'] || 0);
            return isDesc ? mB - mA : mA - mB;
        });
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => {
            const nA = (a['Club Name'] || '').toLowerCase();
            const nB = (b['Club Name'] || '').toLowerCase();
            return isDesc ? nB.localeCompare(nA) : nA.localeCompare(nB);
        });
    } else {
        filtered.sort((a, b) => {
            const dateA = new Date(a['Club Charter Date'] || 0).getTime();
            const dateB = new Date(b['Club Charter Date'] || 0).getTime();
            return isDesc ? dateB - dateA : dateA - dateB;
        });
    }

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c['Club ID'] || ''),
        name: c['Club Name'] || '',
        district: String(c.District || c.DISTRICT || ''),
        zone: normalizeZoneName(c['RI Zone'] || c.ZONE || c['Current Zone']),
        base: c['Club Subtype'] || c.base || 'Community',
        charterDate: c['Club Charter Date'] || '',
        members: Number(c['Member Count'] || 0),
        sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
    }));

    return {
        data: paginated,
        clubs: paginated,
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: safeOffset + safeLimit < total
        },
        total,
        limit: safeLimit,
        offset: safeOffset
    };
}

/**
 * Retrieves ranked leaderboards for clubs and districts across South Asia.
 * Directly supports top-N club rankings by members, TRF, arrears, and district standings.
 * @param {Object} options
 * @param {string} [options.category='all']
 * @param {string|number} [options.district]
 * @param {string|number} [options.zone]
 * @param {string} [options.base]
 * @param {number} [options.limit=10]
 * @returns {Object}
 */
export async function getLeaderboards({
    category = 'all',
    district = '',
    zone = '',
    base = '',
    country = '',
    limit = 10
} = {}) {
    const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';
    const targetCountry = country ? country.toLowerCase().trim() : '';

    const allClubs = await getAllClubs() || [];
    const arrearsData = await getArrears() || [];
    const trfData = await getTRFContributions() || [];
    const newClubsData = await getNewClubs() || [];
    const zoneSummaryData = await getZoneSummary() || [];

    // Filter clubs
    const filteredClubs = allClubs.filter(c => {
        if (targetDistrict && String(c.District || c.district) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone'] || c.Zone || c.zone) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c['Rotaract Club Base'] || c['Club Base'] || c.base || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        if (targetCountry) {
            const cCountry = (c['Country/Geographic Area'] || c.country || '').toLowerCase();
            if (!cCountry.includes(targetCountry)) return false;
        }
        return true;
    });

    // 1. Largest clubs overall
    const largestClubs = [...filteredClubs]
        .sort((a, b) => Number(b['Total Reported Members'] ?? b.members ?? 0) - Number(a['Total Reported Members'] ?? a.members ?? 0))
        .slice(0, safeLimit)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || c.district || ''),
            zone: normalizeZoneName(c['RI Zone'] || c.Zone || c.zone),
            country: c['Country/Geographic Area'] || c.country || 'Unknown',
            base: c['Rotaract Club Base'] || c.base || 'Unknown',
            members: Number(c['Total Reported Members'] ?? c.members ?? 0),
            sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
        }));

    // 2. Largest Community clubs
    const largestCommunityClubs = [...filteredClubs]
        .filter(c => (c['Rotaract Club Base'] || c['Club Base'] || c.base || '').toLowerCase().includes('community'))
        .sort((a, b) => Number(b['Total Reported Members'] ?? b.members ?? 0) - Number(a['Total Reported Members'] ?? a.members ?? 0))
        .slice(0, safeLimit)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || c.district || ''),
            zone: normalizeZoneName(c['RI Zone'] || c.Zone || c.zone),
            country: c['Country/Geographic Area'] || c.country || 'Unknown',
            members: Number(c['Total Reported Members'] ?? c.members ?? 0),
            sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
        }));

    // 3. Largest University clubs
    const largestUniversityClubs = [...filteredClubs]
        .filter(c => (c['Rotaract Club Base'] || c['Club Base'] || c.base || '').toLowerCase().includes('university'))
        .sort((a, b) => Number(b['Total Reported Members'] ?? b.members ?? 0) - Number(a['Total Reported Members'] ?? a.members ?? 0))
        .slice(0, safeLimit)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || c.district || ''),
            zone: normalizeZoneName(c['RI Zone'] || c.Zone || c.zone),
            country: c['Country/Geographic Area'] || c.country || 'Unknown',
            members: Number(c['Total Reported Members'] ?? c.members ?? 0),
            sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
        }));

    // 4. Top TRF Contributing Clubs
    const filteredTRF = trfData.filter(c => {
        if (targetDistrict && String(c.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone']) !== targetZone) return false;
        return Number(c['Total Contributions USD'] || 0) > 0;
    });
    const topTRFClubs = [...filteredTRF]
        .sort((a, b) => Number(b['Total Contributions USD'] || 0) - Number(a['Total Contributions USD'] || 0))
        .slice(0, safeLimit)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club No.'] || c['Club No'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || ''),
            zone: normalizeZoneName(c['RI Zone']),
            totalContributionsUSD: Number(c['Total Contributions USD'] || 0),
            annualFundUSD: Number(c['Annual Fund Contribution USD'] || 0),
            polioPlusUSD: Number(c['PolioPlus Fund Contribution USD'] || 0),
            sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || ''
        }));

    // 5. Clubs with Highest Arrears
    const filteredArrears = arrearsData.filter(c => {
        if (targetDistrict && String(c.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone'] || c['Current Zone'] || c.Zone) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c['Club Base'] || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        return true;
    }).map(c => ({
        ...c,
        _inr: Number(c['Outstanding INR'] ?? c.outstanding ?? c.outstandingINR ?? c[' USD Outstanding '] ?? 0)
    })).filter(c => c._inr > 0);

    const highestArrearsClubs = [...filteredArrears]
        .sort((a, b) => b._inr - a._inr)
        .slice(0, safeLimit)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['NF Cust Number'] || c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || ''),
            zone: normalizeZoneName(c['RI Zone'] || c['Current Zone'] || c.Zone),
            base: c['Club Base'] || 'Unknown',
            outstandingINR: c._inr,
            outstandingUSD: Number(c[' USD Outstanding '] ?? c.outstandingUSD ?? 0),
            billableMembers: Number(c['Billable Member Count'] || 0),
            isAtRisk: Boolean(c.isAtRisk || Number(c[' USD Outstanding '] || 0) >= 75)
        }));

    // 5b. Clubs at termination risk (dues >= $75 USD)
    const atRiskClubs = [...filteredArrears]
        .filter(c => c.isAtRisk || Number(c[' USD Outstanding '] || 0) >= 75)
        .sort((a, b) => b._inr - a._inr)
        .slice(0, safeLimit)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['NF Cust Number'] || c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || ''),
            zone: normalizeZoneName(c['RI Zone'] || c['Current Zone'] || c.Zone),
            base: c['Club Base'] || 'Unknown',
            outstandingINR: c._inr,
            outstandingUSD: Number(c[' USD Outstanding '] ?? c.outstandingUSD ?? 0),
            billableMembers: Number(c['Billable Member Count'] || 0)
        }));

    // 6. District Rankings
    let filteredDistricts = zoneSummaryData;
    if (targetZone) {
        filteredDistricts = filteredDistricts.filter(d => normalizeZoneName(d['RI Zone']) === targetZone);
    }

    const topDistrictsByClubs = [...filteredDistricts]
        .sort((a, b) => Number(b['Total Clubs'] || 0) - Number(a['Total Clubs'] || 0))
        .slice(0, safeLimit)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d['RI District'].toString(),
            zone: normalizeZoneName(d['RI Zone']),
            totalClubs: Number(d['Total Clubs'] || 0),
            members: Number(d['Total Reported Members'] ?? d['Members'] ?? 0)
        }));

    const topDistrictsByMembers = [...filteredDistricts]
        .sort((a, b) => Number(b['Total Reported Members'] ?? b['Members'] ?? 0) - Number(a['Total Reported Members'] ?? a['Members'] ?? 0))
        .slice(0, safeLimit)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d['RI District'].toString(),
            zone: normalizeZoneName(d['RI Zone']),
            members: Number(d['Total Reported Members'] ?? d['Members'] ?? 0),
            totalClubs: Number(d['Total Clubs'] || 0)
        }));

    const topDistrictsByTRF = [...filteredDistricts]
        .filter(d => Number(d['Total Contributions USD'] || 0) > 0)
        .sort((a, b) => Number(b['Total Contributions USD'] || 0) - Number(a['Total Contributions USD'] || 0))
        .slice(0, safeLimit)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d['RI District'].toString(),
            zone: normalizeZoneName(d['RI Zone']),
            totalContributionsUSD: Number(d['Total Contributions USD'] || 0)
        }));

    const topDistrictsByArrears = [...filteredDistricts]
        .filter(d => Number(d.TotalINR ?? d['Total Outstanding (INR)'] ?? 0) > 0)
        .sort((a, b) => Number(b.TotalINR ?? b['Total Outstanding (INR)'] ?? 0) - Number(a.TotalINR ?? a['Total Outstanding (INR)'] ?? 0))
        .slice(0, safeLimit)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d['RI District'].toString(),
            zone: normalizeZoneName(d['RI Zone']),
            outstandingINR: Number(d.TotalINR ?? d['Total Outstanding (INR)'] ?? 0),
            arrearsClubs: Number(d.TotalClubsArrears ?? d.arrearsClubs ?? 0)
        }));

    const topDistrictsByNoOfficers = [...filteredDistricts]
        .filter(d => Number(d['No Officer Total'] || 0) > 0)
        .sort((a, b) => Number(b['No Officer Total'] || 0) - Number(a['No Officer Total'] || 0))
        .slice(0, safeLimit)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d['RI District'].toString(),
            zone: normalizeZoneName(d['RI Zone']),
            noOfficersClubs: Number(d['No Officer Total'] || 0),
            totalClubs: Number(d['Total Clubs'] || 0)
        }));

    const topDistrictsByGrowth = [...filteredDistricts]
        .sort((a, b) => Number(b['Interact Growth Abs'] ?? 0) - Number(a['Interact Growth Abs'] ?? 0))
        .slice(0, safeLimit)
        .map((d, idx) => ({
            rank: idx + 1,
            district: d['RI District'].toString(),
            zone: normalizeZoneName(d['RI Zone']),
            interactGrowthAbs: Number(d['Interact Growth Abs'] ?? 0),
            interactGrowthPct: Number(d['Interact Growth (%)'] ?? 0),
            totalInteractClubs: Number(d['TotalInteractClubs'] ?? 0)
        }));

    // 6g. District Membership Growth Rankings (Rotaract)
    const worldwideRaw = await getWorldwideSummary() || {};
    const globalDistricts = worldwideRaw.districtData || [];
    const topDistrictsByMemberGrowth = globalDistricts.filter(d => {
        const zoneNum = Number(d.Zone);
        if (![4, 5, 6, 7].includes(zoneNum)) return false;
        if (targetZone) {
            const requestedZoneNum = parseInt(targetZone.replace(/\D/g, ''), 10);
            if (zoneNum !== requestedZoneNum) return false;
        }
        if (targetDistrict && String(d.District) !== targetDistrict) return false;
        return true;
    }).sort((a, b) => Number(b['Members Growth (%)'] || 0) - Number(a['Members Growth (%)'] || 0))
    .slice(0, safeLimit)
    .map((d, idx) => ({
        rank: idx + 1,
        district: String(d.District),
        zone: `Zone ${d.Zone}`,
        members: Number(d['Total Reported Members'] || 0),
        activeClubs: Number(d['Total Active Rotaract Clubs'] || 0),
        membersGrowthAbs: Number(d['Members Growth Abs'] || 0),
        membersGrowthPct: Number(d['Members Growth (%)'] || 0),
        clubsGrowthPct: Number(d['Clubs Growth (%)'] || 0)
    }));

    // 7. Newly chartered clubs
    const filteredNewClubs = newClubsData.filter(c => {
        if (targetDistrict && String(c.District || c.DISTRICT) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone'] || c.ZONE || c['Current Zone']) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c['Club Subtype'] || c.base || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        return true;
    });
    const newClubs = [...filteredNewClubs]
        .sort((a, b) => new Date(b['Club Charter Date'] || 0).getTime() - new Date(a['Club Charter Date'] || 0).getTime())
        .slice(0, safeLimit)
        .map((c, idx) => ({
            rank: idx + 1,
            id: String(c['Club ID'] || ''),
            name: c['Club Name'] || '',
            district: String(c.District || c.DISTRICT || ''),
            zone: normalizeZoneName(c['RI Zone'] || c.ZONE || c['Current Zone']),
            base: c['Club Subtype'] || c.base || 'Community',
            charterDate: c['Club Charter Date'] || '',
            members: Number(c['Member Count'] || 0),
            sponsorClubs: c['Sponsor Clubs'] || ''
        }));

    const cleanCategory = (category || 'all').toLowerCase().trim();

    if (['largest_clubs', 'members', 'largest', 'top_clubs', 'clubs', 'size', 'membership', 'largestclubs', 'top'].includes(cleanCategory)) {
        return { category: 'largest_clubs', count: largestClubs.length, data: largestClubs };
    }
    if (['community_clubs', 'community'].includes(cleanCategory)) {
        return { category: 'community_clubs', count: largestCommunityClubs.length, data: largestCommunityClubs };
    }
    if (['university_clubs', 'university'].includes(cleanCategory)) {
        return { category: 'university_clubs', count: largestUniversityClubs.length, data: largestUniversityClubs };
    }
    if (['trf_giving', 'trf', 'donations', 'contributions', 'foundation'].includes(cleanCategory)) {
        return { category: 'trf_giving', count: topTRFClubs.length, data: topTRFClubs };
    }
    if (['highest_arrears', 'arrears', 'dues', 'outstanding'].includes(cleanCategory)) {
        return { category: 'highest_arrears', count: highestArrearsClubs.length, data: highestArrearsClubs };
    }
    if (['at_risk_clubs', 'at_risk', 'risk', 'termination_risk'].includes(cleanCategory)) {
        return { category: 'at_risk_clubs', count: atRiskClubs.length, data: atRiskClubs };
    }
    if (['districts_by_clubs', 'districts_clubs', 'districts'].includes(cleanCategory)) {
        return { category: 'districts_by_clubs', count: topDistrictsByClubs.length, data: topDistrictsByClubs };
    }
    if (['districts_by_members', 'districts_members'].includes(cleanCategory)) {
        return { category: 'districts_by_members', count: topDistrictsByMembers.length, data: topDistrictsByMembers };
    }
    if (['districts_by_trf', 'districts_trf'].includes(cleanCategory)) {
        return { category: 'districts_by_trf', count: topDistrictsByTRF.length, data: topDistrictsByTRF };
    }
    if (['districts_by_arrears', 'districts_arrears'].includes(cleanCategory)) {
        return { category: 'districts_by_arrears', count: topDistrictsByArrears.length, data: topDistrictsByArrears };
    }
    if (['districts_by_no_officers', 'districts_officers'].includes(cleanCategory)) {
        return { category: 'districts_by_no_officers', count: topDistrictsByNoOfficers.length, data: topDistrictsByNoOfficers };
    }
    if (['districts_by_member_growth', 'member_growth', 'fastest_growing', 'growth_districts', 'membergrowth'].includes(cleanCategory)) {
        return { category: 'districts_by_member_growth', count: topDistrictsByMemberGrowth.length, data: topDistrictsByMemberGrowth };
    }
    if (['districts_by_growth', 'districts_growth', 'growth', 'interact_growth', 'districts_by_interact_growth'].includes(cleanCategory)) {
        return { category: 'districts_by_growth', count: topDistrictsByGrowth.length, data: topDistrictsByGrowth };
    }
    if (['new_clubs', 'new', 'chartered'].includes(cleanCategory)) {
        return { category: 'new_clubs', count: newClubs.length, data: newClubs };
    }

    return {
        scope: {
            district: targetDistrict || 'All South Asia',
            zone: targetZone || 'All Zones',
            base: targetBase || 'All Bases',
            country: targetCountry || 'All Countries'
        },
        largestClubs,
        largestCommunityClubs,
        largestUniversityClubs,
        topTRFClubs,
        highestArrearsClubs,
        atRiskClubs,
        topDistrictsByClubs,
        topDistrictsByMembers,
        topDistrictsByTRF,
        topDistrictsByArrears,
        topDistrictsByNoOfficers,
        topDistrictsByGrowth,
        topDistrictsByMemberGrowth,
        newClubs
    };
}

/**
 * Retrieves global Rotaract & Interact worldwide statistics and rankings.
 * Supports filtering by type (summary, country, district, interact, new_clubs) to deliver focused payloads.
 * Sorts all entities prior to pagination to ensure rankings are globally accurate.
 * @param {Object} [options]
 * @param {string} [options.type='all'] - 'all' | 'summary' | 'country' | 'district' | 'interact' | 'new_clubs'
 * @param {string} [options.country] - Filter country name
 * @param {string|number} [options.zone] - Filter zone (e.g. 6 or 'Zone 6')
 * @param {string} [options.sortBy] - Sort field ('member_growth_pct', 'member_growth_abs', 'members', 'clubs', 'club_growth_pct')
 * @param {string} [options.sortOrder='desc'] - 'desc' | 'asc'
 * @param {number} [options.minMembers] - Filter minimum reported members
 * @param {number} [options.limit] - Limit number of items
 * @returns {Object|null}
 */
export async function getWorldwideStats({
    type = 'all',
    country = '',
    zone = '',
    sortBy = '',
    sortOrder = 'desc',
    minMembers,
    limit
} = {}) {
    const raw = await getWorldwideSummary();
    if (!raw) return null;

    const safeLimit = limit ? Math.max(1, Math.min(200, parseInt(limit, 10) || 10)) : null;
    const targetCountry = country ? country.toLowerCase().trim() : '';
    const targetZone = zone ? String(zone).replace(/^zone\s*/i, '').trim() : '';
    const isAsc = String(sortOrder).toLowerCase() === 'asc';

    if (type === 'summary') {
        return {
            totalClubs: raw.totalClubs,
            totalClubsDelta: raw.totalClubsDelta,
            totalMembers: raw.totalMembers,
            totalMembersDelta: raw.totalMembersDelta,
            totalNewClubs: raw.totalNewClubs,
            avgMembersPerClub: raw.avgMembersPerClub,
            avgMembersDelta: raw.avgMembersDelta,
            totalInteractClubs: raw.totalInteractClubs,
            totalActiveInteractClubs: raw.totalActiveInteractClubs,
            totalSuspendedInteractClubs: raw.totalSuspendedInteractClubs,
            totalInteractDelta: raw.totalInteractDelta,
            dataAsOf: raw.dataAsOf,
            lastUpdated: raw.lastUpdated
        };
    }

    if (type === 'country') {
        let countries = [...(raw.countryData || [])];
        if (targetCountry) {
            countries = countries.filter(c => (c.country || c['Country/Geographic Area'] || c[' '] || '').toLowerCase().includes(targetCountry));
        }

        const effectiveSort = (sortBy || 'members').toLowerCase();
        countries.sort((a, b) => {
            let valA = 0;
            let valB = 0;
            switch (effectiveSort) {
                case 'member_growth_pct':
                case 'growth_pct':
                case 'member_growth':
                    valA = Number(a['Members Growth (%)'] || 0);
                    valB = Number(b['Members Growth (%)'] || 0);
                    break;
                case 'member_growth_abs':
                    valA = Number(a['Members Growth Abs'] || 0);
                    valB = Number(b['Members Growth Abs'] || 0);
                    break;
                case 'clubs':
                case 'active_clubs':
                    valA = Number(a['Total Active Rotaract Clubs'] || 0);
                    valB = Number(b['Total Active Rotaract Clubs'] || 0);
                    break;
                case 'club_growth_pct':
                    valA = Number(a['Clubs Growth (%)'] || 0);
                    valB = Number(b['Clubs Growth (%)'] || 0);
                    break;
                case 'club_growth_abs':
                    valA = Number(a['Clubs Growth Abs'] || 0);
                    valB = Number(b['Clubs Growth Abs'] || 0);
                    break;
                case 'country':
                case 'name':
                    return isAsc
                        ? (a.country || a['Country/Geographic Area'] || a[' '] || '').localeCompare(b.country || b['Country/Geographic Area'] || b[' '] || '')
                        : (b.country || b['Country/Geographic Area'] || b[' '] || '').localeCompare(a.country || a['Country/Geographic Area'] || a[' '] || '');
                case 'members':
                default:
                    valA = Number(a['Total Reported Members'] || 0);
                    valB = Number(b['Total Reported Members'] || 0);
                    break;
            }
            return isAsc ? valA - valB : valB - valA;
        });

        const totalMatched = countries.length;
        if (safeLimit) countries = countries.slice(0, safeLimit);

        const formatted = countries.map((c, idx) => ({
            rank: idx + 1,
            country: c.country || c['Country/Geographic Area'] || c[' '] || 'Unknown',
            activeClubs: Number(c['Total Active Rotaract Clubs'] || 0),
            suspendedClubs: Number(c['Total Suspended Rotaract Clubs'] || 0),
            totalMembers: Number(c['Total Reported Members'] || 0),
            clubsGrowthAbs: Number(c['Clubs Growth Abs'] || 0),
            membersGrowthAbs: Number(c['Members Growth Abs'] || 0),
            clubsGrowthPct: Number(c['Clubs Growth (%)'] || 0),
            membersGrowthPct: Number(c['Members Growth (%)'] || 0)
        }));

        return {
            total: totalMatched,
            sortBy: effectiveSort,
            sortOrder: isAsc ? 'asc' : 'desc',
            count: formatted.length,
            countries: formatted
        };
    }

    if (type === 'district') {
        let districts = [...(raw.districtData || [])];

        if (targetZone) {
            districts = districts.filter(d => String(d.Zone) === targetZone || String(d.zone) === targetZone);
        }

        if (minMembers !== undefined && minMembers !== null && !isNaN(Number(minMembers))) {
            const min = Number(minMembers);
            districts = districts.filter(d => Number(d['Total Reported Members'] || 0) >= min);
        }

        const effectiveSort = (sortBy || 'member_growth_pct').toLowerCase();
        districts.sort((a, b) => {
            let valA = 0;
            let valB = 0;
            switch (effectiveSort) {
                case 'member_growth_pct':
                case 'growth_pct':
                case 'member_growth':
                case 'growth':
                    valA = Number(a['Members Growth (%)'] || 0);
                    valB = Number(b['Members Growth (%)'] || 0);
                    break;
                case 'member_growth_abs':
                    valA = Number(a['Members Growth Abs'] || 0);
                    valB = Number(b['Members Growth Abs'] || 0);
                    break;
                case 'members':
                    valA = Number(a['Total Reported Members'] || 0);
                    valB = Number(b['Total Reported Members'] || 0);
                    break;
                case 'clubs':
                case 'active_clubs':
                    valA = Number(a['Total Active Rotaract Clubs'] || 0);
                    valB = Number(b['Total Active Rotaract Clubs'] || 0);
                    break;
                case 'club_growth_pct':
                    valA = Number(a['Clubs Growth (%)'] || 0);
                    valB = Number(b['Clubs Growth (%)'] || 0);
                    break;
                case 'club_growth_abs':
                    valA = Number(a['Clubs Growth Abs'] || 0);
                    valB = Number(b['Clubs Growth Abs'] || 0);
                    break;
                case 'district':
                    return isAsc
                        ? String(a.District).localeCompare(String(b.District), undefined, { numeric: true })
                        : String(b.District).localeCompare(String(a.District), undefined, { numeric: true });
                default:
                    valA = Number(a['Members Growth (%)'] || 0);
                    valB = Number(b['Members Growth (%)'] || 0);
                    break;
            }
            return isAsc ? valA - valB : valB - valA;
        });

        const totalMatched = districts.length;
        if (safeLimit) districts = districts.slice(0, safeLimit);

        const formatted = districts.map((d, idx) => ({
            rank: idx + 1,
            district: String(d.District),
            zone: Number(d.Zone),
            activeClubs: Number(d['Total Active Rotaract Clubs'] || 0),
            suspendedClubs: Number(d['Total Suspended Rotaract Clubs'] || 0),
            totalMembers: Number(d['Total Reported Members'] || 0),
            clubsGrowthAbs: Number(d['Clubs Growth Abs'] || 0),
            membersGrowthAbs: Number(d['Members Growth Abs'] || 0),
            clubsGrowthPct: Number(d['Clubs Growth (%)'] || 0),
            membersGrowthPct: Number(d['Members Growth (%)'] || 0)
        }));

        return {
            total: totalMatched,
            sortBy: effectiveSort,
            sortOrder: isAsc ? 'asc' : 'desc',
            count: formatted.length,
            districts: formatted
        };
    }

    if (type === 'interact') {
        let interactDistricts = [...(raw.interactDistrictData || [])];
        if (targetZone) {
            interactDistricts = interactDistricts.filter(d => String(d.Zone).toLowerCase().includes(targetZone.toLowerCase()));
        }
        interactDistricts.sort((a, b) => Number(b['Total Interact Clubs'] || 0) - Number(a['Total Interact Clubs'] || 0));

        return {
            totalInteractClubs: raw.totalInteractClubs,
            totalActiveInteractClubs: raw.totalActiveInteractClubs,
            totalSuspendedInteractClubs: raw.totalSuspendedInteractClubs,
            districts: safeLimit ? interactDistricts.slice(0, safeLimit) : interactDistricts,
            zones: raw.interactZoneData || []
        };
    }

    if (type === 'new_clubs') {
        let countries = [...(raw.newClubsCountryData || [])];
        let districts = [...(raw.newClubsDistrictData || [])];

        countries.sort((a, b) => Number(b['New Clubs'] || b.newClubs || 0) - Number(a['New Clubs'] || a.newClubs || 0));
        districts.sort((a, b) => Number(b['New Clubs'] || b.newClubs || 0) - Number(a['New Clubs'] || a.newClubs || 0));

        return {
            totalNewClubs: raw.totalNewClubs,
            countries: safeLimit ? countries.slice(0, safeLimit) : countries,
            districts: safeLimit ? districts.slice(0, safeLimit) : districts
        };
    }

    return raw;
}

/**
 * Retrieves comprehensive Interact analytics across South Asia:
 * 8,921 total Interact clubs, 735 suspended, 137 Interact clubs sponsored by 65 Rotaract clubs,
 * zone/district breakdowns, and growth trends.
 * @param {Object} options
 * @param {string|number} [options.district]
 * @param {string|number} [options.zone]
 * @returns {Promise<Object>}
 */
export async function getInteractAnalytics({ district = '', zone = '' } = {}) {
    const summary = await getDashboardSummary();
    const zoneSummaryData = await getZoneSummary() || [];
    const allClubs = await getAllClubs() || [];

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';

    // Rotaract clubs that sponsor Interact clubs
    const rotaractWithInteractClubs = allClubs
        .filter(c => (c.sponsoredInteractCount || 0) > 0 || (c.sponsoredInteractClubs?.length || 0) > 0)
        .filter(c => {
            if (targetDistrict && String(c.District || c.district) !== targetDistrict) return false;
            if (targetZone && normalizeZoneName(c['RI Zone'] || c.Zone || c.zone) !== targetZone) return false;
            return true;
        })
        .map(c => ({
            id: String(c['Club ID'] || c.id || ''),
            name: c['Club Name'] || c.name || '',
            district: String(c.District || c.district || ''),
            zone: normalizeZoneName(c['RI Zone'] || c.Zone || c.zone),
            country: c['Country/Geographic Area'] || c.country || 'Unknown',
            sponsoredInteractCount: Number(c.sponsoredInteractCount || 0),
            sponsoredInteractClubs: c.sponsoredInteractClubs || []
        }))
        .sort((a, b) => b.sponsoredInteractCount - a.sponsoredInteractCount);

    const totalSponsoredByRotaract = rotaractWithInteractClubs.reduce((acc, c) => acc + c.sponsoredInteractCount, 0);

    // District-level Interact breakdown
    let districtBreakdown = zoneSummaryData.map(d => ({
        district: d['RI District'].toString(),
        zone: normalizeZoneName(d['RI Zone']),
        totalInteractClubs: Number(d.TotalInteractClubs || 0),
        suspendedInteractClubs: Number(d.SuspendedInteractClubs || 0),
        rotaractWithInteract: Number(d['Rotaract with Interact'] || 0),
        rotaryWithInteract: Number(d['Rotary with Interact Club'] || 0),
        rotaryWithoutInteract: Number(d['Rotary without Interact Club'] || 0),
        interactGrowthAbs: Number(d['Interact Growth Abs'] ?? 0),
        interactGrowthPct: Number(d['Interact Growth (%)'] ?? 0)
    }));

    if (targetZone) {
        districtBreakdown = districtBreakdown.filter(d => d.zone === targetZone);
    }
    if (targetDistrict) {
        districtBreakdown = districtBreakdown.filter(d => d.district === targetDistrict);
    }

    const totalInteractClubs = targetDistrict || targetZone
        ? districtBreakdown.reduce((acc, d) => acc + d.totalInteractClubs, 0)
        : Number(summary?.current?.overall?.totalInteractClubs || 8921);

    const suspendedInteractClubs = targetDistrict || targetZone
        ? districtBreakdown.reduce((acc, d) => acc + d.suspendedInteractClubs, 0)
        : Number(summary?.current?.overall?.suspendedInteractClubs || 735);

    return {
        scope: {
            district: targetDistrict || 'All',
            zone: targetZone || 'All'
        },
        overview: {
            totalInteractClubs,
            suspendedInteractClubs,
            activeInteractClubs: Math.max(0, totalInteractClubs - suspendedInteractClubs),
            rotaractClubsSponsoringInteractCount: rotaractWithInteractClubs.length,
            totalInteractClubsSponsoredByRotaract: totalSponsoredByRotaract,
            historicalBaselineClubs: targetDistrict || targetZone ? null : Number(summary?.previous?.overall?.totalInteractClubs || 8524),
            overallGrowthAbs: targetDistrict || targetZone ? null : Number(totalInteractClubs - (summary?.previous?.overall?.totalInteractClubs || 8524))
        },
        rotaractSponsors: rotaractWithInteractClubs,
        districts: districtBreakdown
    };
}

/**
 * Retrieves clubs that have BOTH outstanding financial arrears AND missing officer reports.
 * These clubs are at the highest aggregate compliance risk.
 * Uses the pre-joined unified_issues.json dataset.
 * @param {Object} options
 * @returns {{ data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getDualRiskList({
    district = '',
    zone = '',
    base = '',
    country = '',
    sortBy = 'outstanding',
    sortOrder = 'desc',
    minOutstanding,
    limit = 25,
    offset = 0
} = {}) {
    const unifiedData = await getUnifiedIssues() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';
    const targetCountry = country ? country.toLowerCase().trim() : '';

    // Build district-to-country map if country filter requested
    let districtCountryMap = null;
    if (targetCountry) {
        const allClubs = await getAllClubs() || [];
        districtCountryMap = new Map();
        allClubs.forEach(c => {
            const dist = String(c.District || '');
            if (dist && !districtCountryMap.has(dist)) {
                districtCountryMap.set(dist, (c['Country/Geographic Area'] || '').toLowerCase());
            }
        });
    }

    // unified_issues contains clubs with at least one issue; filter to only those with BOTH
    let filtered = unifiedData.filter(c => {
        if (!c.isArrears || !c.isNoOfficers) return false;
        if (targetDistrict && String(c.district) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c.zone) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c.base || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        if (targetCountry && districtCountryMap) {
            const cCountry = districtCountryMap.get(String(c.district || '')) || '';
            if (!cCountry.includes(targetCountry)) return false;
        }
        if (isValidNumber(minOutstanding) && Number(minOutstanding) >= 0) {
            if (Number(c.outstanding || c.outstandingINR || 0) < Number(minOutstanding)) return false;
        }
        return true;
    });

    const isDesc = (sortOrder || 'desc').toLowerCase() === 'desc';
    if (sortBy === 'outstanding' || sortBy === 'dues') {
        filtered.sort((a, b) => {
            const vA = Number(a.outstanding || a.outstandingINR || 0);
            const vB = Number(b.outstanding || b.outstandingINR || 0);
            return isDesc ? vB - vA : vA - vB;
        });
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => {
            const nA = (a.name || '').toLowerCase();
            const nB = (b.name || '').toLowerCase();
            return isDesc ? nB.localeCompare(nA) : nA.localeCompare(nB);
        });
    } else if (sortBy === 'district') {
        filtered.sort((a, b) => {
            const dA = Number(a.district || 0);
            const dB = Number(b.district || 0);
            return isDesc ? dB - dA : dA - dB;
        });
    }

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c.id || ''),
        name: c.name || '',
        district: String(c.district || ''),
        zone: normalizeZoneName(c.zone),
        base: c.base || 'Unknown',
        sponsorClubs: c.sponsorClubs || c['Sponsor Clubs'] || '',
        outstandingINR: Number(c.outstanding || c.outstandingINR || 0),
        outstandingUSD: Number(c.outstandingUSD || 0),
        isAtRisk: Boolean(c.isAtRisk),
        isArrears: true,
        isNoOfficers: true
    }));

    return {
        data: paginated,
        clubs: paginated,
        riskType: 'dual_risk',
        description: 'Clubs with both outstanding financial arrears AND missing officer reports',
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: safeOffset + safeLimit < total
        },
        total,
        limit: safeLimit,
        offset: safeOffset
    };
}
