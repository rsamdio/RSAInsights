import {
    getDashboardSummary,
    getZoneSummary,
    getAllClubs,
    getClubDetails,
    getArrears,
    getNoOfficers,
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
        return {
            zone: normalizedZone,
            dataAsOf,
            stats: zoneObj.stats || {},
            previousStats: prevZoneObj?.stats || null,
            districtCount: Object.keys(zoneObj.districts || {}).length
        };
    }

    return {
        dataAsOf,
        overall: summary.current.overall || {},
        previousOverall: summary.previous?.overall || null,
        zonesSummary: Object.keys(summary.current.zones || {}).map(zKey => ({
            zone: zKey,
            stats: summary.current.zones[zKey]?.stats || {},
            districtCount: Object.keys(summary.current.zones[zKey]?.districts || {}).length
        }))
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
        return {
            zone: zKey,
            zoneNumber: parseInt(zKey.replace(/[^0-9]/g, ''), 10),
            stats: zData.stats || {},
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
    const zoneData = getZoneData(zoneId);
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

    return {
        zone: zoneData.name,
        zoneNumber: parseInt(zoneData.name.replace(/[^0-9]/g, ''), 10),
        stats: zoneData.stats || {},
        districts: districtsArray
    };
}

/**
 * Retrieves all 44 districts with key performance indicators and leadership.
 * @param {string|number} [zoneId]
 * @returns {Array<Object>}
 */
export async function getDistricts(zoneId) {
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

    return filtered.map(d => {
        const dId = d['RI District'].toString();
        const leadership = officerMap.get(dId) || null;
        return {
            district: dId,
            zone: normalizeZoneName(d['RI Zone']),
            totalClubs: Number(d['Total Clubs'] || 0),
            members: Number(d['Total Reported Members'] ?? d['Members'] ?? 0),
            avgMembership: Number(d['Avg Membership'] || (d['Total Clubs'] ? (d['Total Reported Members'] / d['Total Clubs']).toFixed(2) : 0)),
            rotaryClubs: Number(d['Total Rotary Clubs'] || 0),
            rotaryWithoutRotaract: Number(d['Rotary without Rotaract Club'] || 0),
            interactClubs: Number(d['TotalInteractClubs'] || 0),
            rotaryWithoutInteract: Number(d['Rotary without Interact Club'] || 0),
            outstandingINR: Number(d.TotalINR ?? d['Total Outstanding (INR)'] ?? 0),
            arrearsClubs: Number(d.TotalClubsArrears ?? d.arrearsClubs ?? 0),
            noOfficersClubs: Number(d['No Officer Total'] || 0),
            trfContributionsUSD: Number(d['Total Contributions USD'] || 0),
            newClubs: Number(d['NewTotalClubs'] || 0),
            leadership: leadership ? {
                dg: leadership.DG || '',
                drr: leadership.DRR || '',
                drc: leadership.DRC || ''
            } : null
        };
    }).sort((a, b) => Number(a.district) - Number(b.district));
}

/**
 * Retrieves full analytical dossier for a single district.
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

    return {
        district: cleanId,
        zone: distData.zone,
        stats: distData.stats,
        leadership: leadership ? {
            dg: leadership.DG || '',
            drr: leadership.DRR || '',
            drc: leadership.DRC || ''
        } : null,
        counts: {
            totalClubs: districtClubs.length,
            arrearsClubs: districtArrears.length,
            noOfficersClubs: districtNoOfficers.length,
            trfContributingClubs: districtTRF.length
        }
    };
}

/**
 * Searches and filters the master roster of Rotaract clubs (2,877 records).
 * @param {Object} options
 * @returns {{ clubs: Array<Object>, total: number, limit: number, offset: number }}
 */
export async function searchClubs({
    q = '',
    query = '',
    district = '',
    zone = '',
    base = '',
    status = '',
    isArrears,
    isAtRisk,
    isNoOfficers,
    limit = 25,
    offset = 0
} = {}) {
    const allClubs = await getAllClubs() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const queryLower = (q || query || '').toLowerCase().trim();
    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';
    const targetStatus = status ? status.toLowerCase().trim() : '';

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
            if (cStatus !== targetStatus) return false;
        }
        if (typeof isArrears === 'boolean') {
            const clubIsArrears = Boolean(c.isArrears || c.Arrears === 'Yes');
            if (clubIsArrears !== isArrears) return false;
        }
        if (typeof isAtRisk === 'boolean') {
            const clubIsAtRisk = Boolean(c.isAtRisk);
            if (clubIsAtRisk !== isAtRisk) return false;
        }
        if (typeof isNoOfficers === 'boolean') {
            const clubIsNoOfficers = Boolean(c.isNoOfficers || c.Officers === 'No');
            if (clubIsNoOfficers !== isNoOfficers) return false;
        }
        if (queryLower) {
            const name = (c['Club Name'] || c['Rotaract Club Name'] || c.name || '').toLowerCase();
            const id = String(c['Club ID'] || c['Rotaract Club ID'] || c.id || '');
            const sponsor = (c['Sponsor Clubs'] || c.sponsorClubs || '').toLowerCase();
            const country = (c['Country/Geographic Area'] || c.country || '').toLowerCase();
            if (!name.includes(queryLower) && !id.includes(queryLower) && !sponsor.includes(queryLower) && !country.includes(queryLower)) {
                return false;
            }
        }
        return true;
    });

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
        isNoOfficers: Boolean(c.isNoOfficers || c.Officers === 'No')
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
 * Retrieves the full universal dossier for a single club (O(1) hash map lookup).
 * @param {string|number} clubId
 * @returns {Object|null}
 */
export async function getClubProfile(clubId) {
    if (!clubId) return null;
    return getClubDetails(clubId);
}

/**
 * Retrieves clubs in arrears with optional filtering and pagination.
 * @param {Object} options
 * @returns {{ clubs: Array<Object>, total: number, limit: number, offset: number }}
 */
export async function getArrearsList({
    district = '',
    zone = '',
    atRiskOnly = false,
    base = '',
    limit = 25,
    offset = 0
} = {}) {
    const arrearsData = await getArrears() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';

    let filtered = arrearsData.filter(c => {
        if (targetDistrict && String(c.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone'] || c['Current Zone'] || c.Zone) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c['Club Base'] || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        if (atRiskOnly && !c.isAtRisk && Number(c[' USD Outstanding '] || 0) < 75) return false;
        return true;
    });

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c['NF Cust Number'] || c['Club ID'] || ''),
        name: c['Club Name'] || '',
        district: String(c.District || ''),
        zone: normalizeZoneName(c['RI Zone'] || c['Current Zone'] || c.Zone),
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
 * @param {Object} options
 * @returns {{ clubs: Array<Object>, data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getMissingOfficersList({
    district = '',
    zone = '',
    base = '',
    limit = 25,
    offset = 0
} = {}) {
    const officersData = await getNoOfficers() || [];
    const { limit: safeLimit, offset: safeOffset } = sanitizePagination(limit, offset);

    const targetDistrict = district ? normalizeDistrictId(district) : '';
    const targetZone = zone ? normalizeZoneName(zone) : '';
    const targetBase = base ? base.toLowerCase().trim() : '';

    let filtered = officersData.filter(c => {
        if (targetDistrict && String(c.District) !== targetDistrict) return false;
        if (targetZone && normalizeZoneName(c['RI Zone'] || c.Zone) !== targetZone) return false;
        if (targetBase) {
            const cBase = (c['Club Base'] || c['Rotaract Club Base'] || '').toLowerCase();
            if (!cBase.includes(targetBase)) return false;
        }
        return true;
    });

    const total = filtered.length;
    const paginated = filtered.slice(safeOffset, safeOffset + safeLimit).map(c => ({
        id: String(c['Club ID'] || c['Rotaract Club ID'] || ''),
        name: c['Rotaract Club Name'] || c['Club Name'] || '',
        district: String(c.District || ''),
        zone: normalizeZoneName(c['RI Zone'] || c.Zone),
        base: c['Club Base'] || c['Rotaract Club Base'] || 'Unknown',
        sponsorClubs: c['Sponsor Clubs'] || c.sponsorClubs || '',
        status: c['Club Status'] || 'Active'
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
 * Retrieves Rotary clubs without sponsored Rotaract or without Interact clubs.
 * @param {Object} options
 * @returns {{ clubs: Array<Object>, data: Array<Object>, total: number, limit: number, offset: number, pagination: Object, opportunityType: string }}
 */
export async function getRotaryOpportunityList({
    type = 'no_rotaract',
    district = '',
    zone = '',
    limit = 25,
    offset = 0
} = {}) {
    const isNoInteract = type === 'no_interact';
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
 * @param {Object} options
 * @returns {{ contributions: Array<Object>, data: Array<Object>, total: number, limit: number, offset: number, pagination: Object }}
 */
export async function getTRFList({
    district = '',
    zone = '',
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
 * Retrieves global Rotaract & Interact worldwide statistics and rankings.
 * @returns {Object|null}
 */
export async function getWorldwideStats() {
    return getWorldwideSummary();
}
