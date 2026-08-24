import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

const globalCache = global.apiCache || new Map();
global.apiCache = globalCache;

let clubIdMap = null;
let lastAllClubsMtime = 0;

function getClubMap() {
    const filePath = path.join(dataDirectory, 'all_clubs.json');
    if (!fs.existsSync(filePath)) return new Map();
    try {
        const stats = fs.statSync(filePath);
        if (clubIdMap && lastAllClubsMtime >= stats.mtimeMs) {
            return clubIdMap;
        }
        const allClubs = getAllClubs() || [];
        const map = new Map();
        for (let i = 0; i < allClubs.length; i++) {
            const c = allClubs[i];
            const id = String(c['Club ID'] || c.id || '');
            if (id) map.set(id, c);
        }
        clubIdMap = map;
        lastAllClubsMtime = stats.mtimeMs;
        return clubIdMap;
    } catch {
        return new Map();
    }
}

function readJsonFile(filename) {
    const filePath = path.join(dataDirectory, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found ${filePath}`);
        return null;
    }

    try {
        const stats = fs.statSync(filePath);
        const cacheEntry = globalCache.get(filename);
        if (cacheEntry && cacheEntry.mtime >= stats.mtimeMs) {
            return cacheEntry.data;
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(fileContents);
        
        globalCache.set(filename, { data: parsedData, mtime: stats.mtimeMs });
        return parsedData;
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

export function getDashboardSummary() {
    return readJsonFile('dashboard_summary.json');
}

export function getUnifiedIssues() {
    return readJsonFile('unified_issues.json');
}

export function getZoneSummary() {
    return readJsonFile('zone_summary.json');
}

export function getArrears() {
    return readJsonFile('arrears.json');
}

export function getNoOfficers() {
    return readJsonFile('no_officers.json');
}

export function getRotaryNoSponsor() {
    return readJsonFile('rotary_no_sponsor.json');
}

export function getRotaryNoInteract() {
    return readJsonFile('rotary_no_interact.json');
}

// Helper functions for specific drill-downs

export function getAllClubs() {
    return readJsonFile('all_clubs.json');
}

export function getTRFContributions() {
    return readJsonFile('trf_contributions.json');
}

export function getNewClubs() {
    return readJsonFile('new_clubs.json');
}

export function getDistrictOfficers() {
    return readJsonFile('district_officers.json');
}

export function getWorldwideSummary() {
    return readJsonFile('worldwide_summary.json');
}


export function getZoneData(zoneId) {
    const summary = getDashboardSummary();
    if (!summary || !summary.current || !summary.current.zones) return null;
    const formattedZoneId = zoneId.toLowerCase().startsWith('zone') ? zoneId : `Zone ${zoneId}`;
    
    // Find matching zone ignoring case
    const exactZoneKey = Object.keys(summary.current.zones).find(
        key => key.toLowerCase() === formattedZoneId.toLowerCase()
    );
    
    if (exactZoneKey) {
        return {
            name: exactZoneKey,
            ...summary.current.zones[exactZoneKey]
        };
    }
    return null;
}

export function getDistrictData(districtId) {
    const summary = getDashboardSummary();
    if (!summary || !summary.current || !summary.current.zones) return null;
    
    for (const [zoneName, zoneData] of Object.entries(summary.current.zones)) {
        if (zoneData.districts && zoneData.districts[districtId]) {
            return {
                district: districtId,
                zone: zoneName,
                stats: zoneData.districts[districtId]
            };
        }
    }
    return null;
}

export function getClubDetails(clubId) {
    const clubMap = getClubMap();
    const club = clubMap.get(String(clubId));
    if (club) {
        return {
            id: club['Club ID'] || club.id,
            name: club['Club Name'] || club.name,
            district: String(club.District || club.district || ''),
            zone: String(club['RI Zone'] || club.Zone || club.zone || ''),
            base: club['Rotaract Club Base'] || club.base || 'Unknown',
            status: club['Rotaract Club Status'] || club.status || 'Active',
            country: club['Country/Geographic Area'] || club.country || 'Unknown',
            sponsorClubs: (club['Sponsor Clubs'] && club['Sponsor Clubs'] !== 'None Reported') ? club['Sponsor Clubs'] : (club.sponsorClubs && club.sponsorClubs !== 'None Reported' ? club.sponsorClubs : ''),
            termReported: (club['President /Advisor Term Reported'] || club['President / Advisor Term Reported'] || club.termReported || 'N/A').toString().trim(),
            members: Number(club['Total Reported Members'] ?? club.members ?? 0),
            isArrears: Boolean(club.isArrears || club.Arrears === 'Yes'),
            outstanding: Number(club.outstanding || 0),
            isAtRisk: Boolean(club.isAtRisk),
            isNoOfficers: Boolean(club.isNoOfficers || club.Officers === 'No'),
            officerRole: club.officerRole || 'Rotaract President',
            officerLastReported: (club.officerLastReported || club['President /Advisor Term Reported'] || club['President / Advisor Term Reported'] || club.termReported || 'N/A').toString().trim(),
            myRotaryAccount: club.myRotaryAccount || 'N/A',
            trfTotal: Number(club.trfTotal || 0),
            trfAnnual: Number(club.trfAnnual || 0),
            trfPolio: Number(club.trfPolio || 0),
            trfOther: Number(club.trfOther || 0),
            trfEndowment: Number(club.trfEndowment || 0),
            afPerCapita: Number(club.afPerCapita || 0),
            isNewClub: Boolean(club.isNewClub),
            charterDate: club.charterDate || null,
            charterMembers: Number(club.charterMembers || 0),
            sponsoredInteractClubs: club.sponsoredInteractClubs || [],
            sponsoredInteractCount: Number(club.sponsoredInteractCount || club['Sponsored Interact Clubs Count'] || (club.sponsoredInteractClubs ? club.sponsoredInteractClubs.length : 0))
        };
    }
    
    // Fallback to unified issues if not found in all_clubs
    const unified = getUnifiedIssues() || [];
    const issueClub = unified.find(c => c.id.toString() === clubId.toString());
    if (issueClub) {
        return {
            id: issueClub.id,
            name: issueClub.name,
            district: String(issueClub.district || ''),
            zone: String(issueClub.zone || ''),
            base: issueClub.base || 'Unknown',
            status: 'Active',
            country: 'Unknown',
            sponsorClubs: (issueClub.sponsorClubs && issueClub.sponsorClubs !== 'None Reported') ? issueClub.sponsorClubs : (issueClub['Sponsor Clubs'] && issueClub['Sponsor Clubs'] !== 'None Reported' ? issueClub['Sponsor Clubs'] : ''),
            termReported: 'N/A',
            members: 0,
            isArrears: Boolean(issueClub.isArrears),
            outstanding: Number(issueClub.outstanding || 0),
            isAtRisk: Boolean(issueClub.isAtRisk),
            isNoOfficers: Boolean(issueClub.isNoOfficers),
            officerRole: 'Rotaract President',
            officerLastReported: 'N/A',
            myRotaryAccount: 'N/A',
            trfTotal: 0,
            trfAnnual: 0,
            trfPolio: 0,
            trfOther: 0,
            trfEndowment: 0,
            afPerCapita: 0,
            isNewClub: false,
            charterDate: null,
            charterMembers: 0,
            sponsoredInteractClubs: [],
            sponsoredInteractCount: 0
        };
    }
    return null;
}

export async function getFilterOptions() {
    const summary = await getDashboardSummary();
    if (!summary || !summary.current || !summary.current.zones) return { zones: [], districts: [] };
    
    const zones = Object.keys(summary.current.zones).map(z => ({ value: z, label: z }));
    
    const zoneData = await getZoneSummary();
    const districts = [];
    const districtToZone = {};
    const districtsSet = new Set();
    
    zoneData.forEach(d => {
        const dStr = d['RI District'].toString();
        if (!districtsSet.has(dStr)) {
            districtsSet.add(dStr);
            const zName = d['RI Zone'].toString().startsWith('Zone') ? d['RI Zone'].toString() : `Zone ${d['RI Zone']}`;
            districts.push({ value: dStr, label: `District ${dStr}`, zone: zName });
            districtToZone[dStr] = zName;
        }
    });
    
    districts.sort((a, b) => Number(a.value) - Number(b.value));
    
    return { zones, districts, districtToZone };
}
