const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const currMasterFile = args[0] || 'fulldata/DataMaster-31july26.xlsx';
const prevMasterFile = args[1] || '9July2026/Zone45678 - 9July2026.xlsx'; // Defaulting to 9 July for deltas

function readSheetAsJson(wb, sheetName) {
  if (!wb.SheetNames.includes(sheetName)) return [];
  return xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
}

function parseCurrency(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9.-]+/g,"")) || 0;
}

console.log(`Processing Current Data: ${currMasterFile}`);
const currWb = xlsx.readFile(currMasterFile);

const zoneSheet = readSheetAsJson(currWb, 'Zone45678');
let arrearsSheet = readSheetAsJson(currWb, 'Arrears');
let noOfficersSheet = readSheetAsJson(currWb, 'No Rotaract club officers');
let rotarySheet = readSheetAsJson(currWb, 'Rotary Club Details');

let prevZoneSheet = [];
if (prevMasterFile && fs.existsSync(prevMasterFile)) {
    console.log(`Processing Previous Data: ${prevMasterFile}`);
    const prevWb = xlsx.readFile(prevMasterFile);
    prevZoneSheet = readSheetAsJson(prevWb, prevWb.SheetNames[0]); // First sheet is the summary
}

function createEmptyStats() {
    return {
        outstanding: 0,
        arrearsClubs: 0,
        atRisk: 0,
        noOfficers: 0,
        totalClubs: 0,
        totalRotary: 0,
        rotaryWithSponsor: 0,
        rotaryWithoutSponsor: 0,
        arrUniv: 0,
        arrComm: 0,
        noOffUniv: 0,
        noOffComm: 0
    };
}

const summary = {
    overall: createEmptyStats(),
    zones: {}
};

const prevSummary = {
    overall: createEmptyStats(),
    zones: {}
};

// Also we need to build a map of District -> Zone to inject Zone into arrears/no_officers sheets if missing
const districtToZone = {};

zoneSheet.forEach(row => {
    const dist = (row['RI District'] || '').toString().trim();
    if (!dist || dist === 'Grand Total') return;
    
    // RI Zone might be formatted like "Zone 4", "4", "Zone 4 & 5", etc.
    let zone = (row['RI Zone'] || 'Unknown').toString().trim();
    if (!zone.toLowerCase().startsWith('zone')) zone = `Zone ${zone}`;
    districtToZone[dist] = zone;
    
    if (!summary.zones[zone]) {
        summary.zones[zone] = {
            stats: createEmptyStats(),
            districts: {}
        };
    }
    
    if (!summary.zones[zone].districts[dist]) {
        summary.zones[zone].districts[dist] = createEmptyStats();
    }
    
    const outstanding = parseCurrency(row['TotalUSD']);
    const arrearsClubs = parseInt(row['TotalClubsArrears']) || 0;
    const atRisk = parseInt(row['75PlusClubs']) || 0;
    const noOfficers = parseInt(row['No Officer Total']) || 0;
    const totalClubs = parseInt(row['Total Clubs']) || 0;
    const totalRotary = parseInt(row['Total Rotary Clubs']) || 0;
    const rotaryWithSponsor = parseInt(row['Rotary with Rotaract Club']) || 0;
    const rotaryWithoutSponsor = parseInt(row['Rotary without Rotaract Club']) || 0;
    const arrUniv = parseInt(row['ArrearsUnivesityClubs']) || 0;
    const arrComm = parseInt(row['ArrearsCommunityClubs']) || 0;
    const noOffUniv = parseInt(row['No Officer University']) || 0;
    const noOffComm = parseInt(row['No Officer Community']) || 0;
    
    const toAdd = { outstanding, arrearsClubs, atRisk, noOfficers, totalClubs, totalRotary, rotaryWithSponsor, rotaryWithoutSponsor, arrUniv, arrComm, noOffUniv, noOffComm };
    
    // Add to District
    for (const key in toAdd) summary.zones[zone].districts[dist][key] += toAdd[key];
    // Add to Zone
    for (const key in toAdd) summary.zones[zone].stats[key] += toAdd[key];
    // Add to Overall
    for (const key in toAdd) summary.overall[key] += toAdd[key];
});

prevZoneSheet.forEach(row => {
    const dist = (row['RI District'] || '').toString().trim();
    if (!dist || dist === 'Grand Total') return;
    
    let zone = (row['RI Zone'] || districtToZone[dist] || 'Unknown').toString().trim();
    if (!zone.toLowerCase().startsWith('zone')) zone = `Zone ${zone}`;
    
    if (!prevSummary.zones[zone]) {
        prevSummary.zones[zone] = {
            stats: createEmptyStats(),
            districts: {}
        };
    }
    
    if (!prevSummary.zones[zone].districts[dist]) {
        prevSummary.zones[zone].districts[dist] = createEmptyStats();
    }
    
    const outstanding = parseCurrency(row['TotalUSD']);
    const arrearsClubs = parseInt(row['TotalClubsArrears']) || 0;
    const atRisk = parseInt(row['75PlusClubs']) || 0;
    const noOfficers = parseInt(row['No Officer Total']) || 0;
    // We only care about deltas for the main metrics, not necessarily Rotary ones for now, but we'll add them if they exist
    const totalClubs = parseInt(row['Total Clubs']) || 0;
    const totalRotary = parseInt(row['Total Rotary Clubs']) || 0;
    const rotaryWithSponsor = parseInt(row['Rotary with Rotaract Club']) || 0;
    const rotaryWithoutSponsor = parseInt(row['Rotary without Rotaract Club']) || 0;
    const arrUniv = parseInt(row['ArrearsUnivesityClubs']) || 0;
    const arrComm = parseInt(row['ArrearsCommunityClubs']) || 0;
    const noOffUniv = parseInt(row['No Officer University']) || 0;
    const noOffComm = parseInt(row['No Officer Community']) || 0;
    
    const toAdd = { outstanding, arrearsClubs, atRisk, noOfficers, totalClubs, totalRotary, rotaryWithSponsor, rotaryWithoutSponsor, arrUniv, arrComm, noOffUniv, noOffComm };
    
    for (const key in toAdd) prevSummary.zones[zone].districts[dist][key] += toAdd[key];
    for (const key in toAdd) prevSummary.zones[zone].stats[key] += toAdd[key];
    for (const key in toAdd) prevSummary.overall[key] += toAdd[key];
});

// Inject Zone into Arrears and No Officers Data so they can be easily filtered globally
arrearsSheet = arrearsSheet.map(row => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    row['RI Zone'] = districtToZone[dist] || 'Unknown';
    row['District'] = dist;
    return row;
});

noOfficersSheet = noOfficersSheet.map(row => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    row['RI Zone'] = districtToZone[dist] || 'Unknown';
    row['District'] = dist;
    return row;
});

// Filter Rotary Clubs with no Rotaract Sponsor
let rotaryNoSponsorSheet = rotarySheet.filter(row => {
    return parseInt(row['Total Clubs Sponsored']) === 0;
}).map(row => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    row['RI Zone'] = districtToZone[dist] || 'Unknown';
    row['District'] = dist;
    return {
        'RI Zone': row['RI Zone'],
        'District': row['District'],
        'Club Name': row['Club Name'],
        'Club Status': row['Club Status'],
        'Current Member Count': row['Current Member Count'],
        'Club ID': row['Club ID']
    };
});

const dashboardData = {
    current: summary,
    previous: prevSummary,
    lastUpdated: new Date().toISOString()
};

// Create Unified Data Model for Deep Cross-Filtering
const unifiedMap = new Map();

arrearsSheet.forEach(c => {
    const id = c['NF Cust Number'];
    if (!id) return;
    unifiedMap.set(id, {
        id: id,
        name: c['Club Name'],
        zone: c['RI Zone'],
        district: c['District'],
        base: c['Club Base'] || 'Unknown',
        isArrears: true,
        outstanding: parseCurrency(c[' USD Outstanding ']),
        isAtRisk: parseCurrency(c[' USD Outstanding ']) >= 75,
        isNoOfficers: false
    });
});

noOfficersSheet.forEach(c => {
    const id = c['Club ID'];
    if (!id) return;
    if (unifiedMap.has(id)) {
        const existing = unifiedMap.get(id);
        existing.isNoOfficers = true;
    } else {
        unifiedMap.set(id, {
            id: id,
            name: c['Rotaract Club Name'],
            zone: c['RI Zone'],
            district: c['District'],
            base: c['Club Base'] || 'Unknown',
            isArrears: false,
            outstanding: 0,
            isAtRisk: false,
            isNoOfficers: true
        });
    }
});

const unifiedIssuesSheet = Array.from(unifiedMap.values());

fs.writeFileSync('data/dashboard_summary.json', JSON.stringify(dashboardData, null, 2));
console.log('Saved data/dashboard_summary.json');

// Export CSV
function exportToCsv(data, filename) {
    if (data.length === 0) return;
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Data");
    xlsx.writeFile(wb, filename);
    console.log(`Saved ${filename}`);
}

exportToCsv(zoneSheet, 'data/zone_summary.csv');
exportToCsv(arrearsSheet, 'data/arrears.csv');
exportToCsv(noOfficersSheet, 'data/no_officers.csv');
exportToCsv(rotaryNoSponsorSheet, 'data/rotary_no_sponsor.csv');

fs.writeFileSync('data/arrears.json', JSON.stringify(arrearsSheet, null, 2));
fs.writeFileSync('data/no_officers.json', JSON.stringify(noOfficersSheet, null, 2));
fs.writeFileSync('data/rotary_no_sponsor.json', JSON.stringify(rotaryNoSponsorSheet, null, 2));
fs.writeFileSync('data/unified_issues.json', JSON.stringify(unifiedIssuesSheet, null, 2));
fs.writeFileSync('data/zone_summary.json', JSON.stringify(zoneSheet, null, 2));

console.log('Data generation complete.');
