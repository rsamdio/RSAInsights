import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

function readJsonFile(filename) {
    try {
        const filePath = path.join(dataDirectory, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: File not found ${filePath}`);
            return null;
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
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

// Helper functions for specific drill-downs

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
    const unified = getUnifiedIssues() || [];
    return unified.find(c => c.id.toString() === clubId.toString()) || null;
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
