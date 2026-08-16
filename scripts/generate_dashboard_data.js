const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const currMasterFile = args[0] || 'fulldata/MasterData.xlsx';
const prevMasterFile = args[1] || 'basedata/Zone45678 - 9July2026.xlsx'; // Defaulting to 9 July for deltas

function readSheetAsJson(wb, sheetName, options = { defval: "" }) {
  if (!wb.SheetNames.includes(sheetName)) return [];
  return xlsx.utils.sheet_to_json(wb.Sheets[sheetName], options);
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
let allClubsSheet = readSheetAsJson(currWb, 'All Rotaract Clubs');
let trfSheet = readSheetAsJson(currWb, 'ClubsTRFContribution');
let newClubsSheet = readSheetAsJson(currWb, 'NewClubs', { defval: "", raw: false, dateNF: 'dd-MMM-yyyy' });
let districtOfficersSheet = readSheetAsJson(currWb, 'District Officers_Simplified');
let rotaractByCountrySheet = readSheetAsJson(currWb, 'Rotaract by Country');
let rotaractByDistrictSheet = readSheetAsJson(currWb, 'Rotaract by District');
let rotaractByZoneSheetRaw = {};
rotaractByDistrictSheet.forEach(row => {
    const zone = (row['Zone'] || 'Unknown').toString().trim();
    if (!rotaractByZoneSheetRaw[zone]) {
        rotaractByZoneSheetRaw[zone] = { 'Zone': zone, 'Total Active Rotaract Clubs': 0, 'Total Reported Members': 0 };
    }
    rotaractByZoneSheetRaw[zone]['Total Active Rotaract Clubs'] += (parseInt(row['Total Active Rotaract Clubs']) || 0);
    rotaractByZoneSheetRaw[zone]['Total Reported Members'] += (parseInt(row['Total Reported Members']) || 0);
});
let rotaractByZoneSheet = Object.values(rotaractByZoneSheetRaw);
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
        totalMembers: 0,
        totalRotary: 0,
        rotaryWithSponsor: 0,
        rotaryWithoutSponsor: 0,
        arrUniv: 0,
        arrComm: 0,
        noOffUniv: 0,
        noOffComm: 0,
        trfClubs: 0,
        trfContributionsUSD: 0,
        trfAnnualUSD: 0,
        trfPolioUSD: 0,
        trfOtherUSD: 0,
        trfEndowmentUSD: 0,
        newTotalClubs: 0,
        newCommunityClubs: 0,
        newUniversityClubs: 0,
        totalUniv: 0,
        totalComm: 0,
        membersUniv: 0,
        membersComm: 0
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

const districtMembers = {};
allClubsSheet.forEach(row => {
    const dist = (row['District'] || '').toString().trim();
    if (!dist) return;
    const members = parseInt(row['Total Reported Members']) || 0;
    const baseType = (row['Rotaract Club Base'] || '').toString().trim().toLowerCase();
    
    if (!districtMembers[dist]) {
        districtMembers[dist] = { members: 0, univ: 0, comm: 0, membersUniv: 0, membersComm: 0 };
    }
    
    districtMembers[dist].members += members;
    if (baseType.includes('university') || baseType.includes('institution')) {
        districtMembers[dist].univ += 1;
        districtMembers[dist].membersUniv += members;
    } else if (baseType.includes('community')) {
        districtMembers[dist].comm += 1;
        districtMembers[dist].membersComm += members;
    }
});

const currentArrearsData = {};
arrearsSheet.forEach(row => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '').trim();
    const amt = parseCurrency(row[' USD Outstanding ']);
    if (dist) {
        if (!currentArrearsData[dist]) {
            currentArrearsData[dist] = { count: 0, atRisk: 0, outstanding: 0, arrUniv: 0, arrComm: 0 };
        }
        currentArrearsData[dist].count += 1;
        currentArrearsData[dist].outstanding += amt;
        if (amt >= 75) {
            currentArrearsData[dist].atRisk += 1;
        }
        const baseType = (row['Club Base'] || '').toString().toLowerCase();
        if (baseType.includes('university')) {
            currentArrearsData[dist].arrUniv += 1;
        } else if (baseType.includes('community')) {
            currentArrearsData[dist].arrComm += 1;
        }
    }
});

const currentOfficersData = {};
noOfficersSheet.forEach(row => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '').trim();
    if (dist) {
        if (!currentOfficersData[dist]) {
            currentOfficersData[dist] = { count: 0, noOffUniv: 0, noOffComm: 0 };
        }
        currentOfficersData[dist].count += 1;
        const baseType = (row['Club Base'] || '').toString().toLowerCase();
        if (baseType.includes('university')) {
            currentOfficersData[dist].noOffUniv += 1;
        } else if (baseType.includes('community')) {
            currentOfficersData[dist].noOffComm += 1;
        }
    }
});

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
    
    let outstanding = currentArrearsData[dist] ? currentArrearsData[dist].outstanding : 0;
    let arrearsClubs = currentArrearsData[dist] ? currentArrearsData[dist].count : 0;
    let atRisk = currentArrearsData[dist] ? currentArrearsData[dist].atRisk : 0;
    let noOfficers = currentOfficersData[dist] ? currentOfficersData[dist].count : 0;
    const totalClubs = parseInt(row['Total Clubs']) || 0;
    const totalRotary = parseInt(row['Total Rotary Clubs']) || 0;
    const rotaryWithSponsor = parseInt(row['Rotary with Rotaract Club']) || 0;
    const rotaryWithoutSponsor = parseInt(row['Rotary without Rotaract Club']) || 0;
    let arrUniv = currentArrearsData[dist] ? currentArrearsData[dist].arrUniv : 0;
    let arrComm = currentArrearsData[dist] ? currentArrearsData[dist].arrComm : 0;
    let noOffUniv = currentOfficersData[dist] ? currentOfficersData[dist].noOffUniv : 0;
    let noOffComm = currentOfficersData[dist] ? currentOfficersData[dist].noOffComm : 0;
    
    const trfClubs = parseInt(row['Clubs with Contribution']) || 0;
    const trfContributionsUSD = parseCurrency(row['Total Contributions USD']);
    const trfAnnualUSD = parseCurrency(row['Annual Fund Contribution USD']);
    const trfPolioUSD = parseCurrency(row['PolioPlus Fund Contribution USD']);
    const trfOtherUSD = parseCurrency(row['Other Funds Contribution USD']);
    const trfEndowmentUSD = parseCurrency(row['Endowment Fund Contribution USD']);
    const newTotalClubs = parseInt(row['NewTotalClubs']) || 0;
    const newCommunityClubs = parseInt(row['NewCommunityClubs']) || 0;
    const newUniversityClubs = parseInt(row['NewUniversityClubs']) || 0;
    
    const distInfo = districtMembers[dist] || { members: 0, univ: 0, comm: 0, membersUniv: 0, membersComm: 0 };
    const totalMembers = distInfo.members;
    const totalUniv = distInfo.univ;
    const totalComm = distInfo.comm;
    const membersUniv = distInfo.membersUniv;
    const membersComm = distInfo.membersComm;
    
    const toAdd = { outstanding, arrearsClubs, atRisk, noOfficers, totalClubs, totalMembers, totalRotary, rotaryWithSponsor, rotaryWithoutSponsor, arrUniv, arrComm, noOffUniv, noOffComm, trfClubs, trfContributionsUSD, trfAnnualUSD, trfPolioUSD, trfOtherUSD, trfEndowmentUSD, newTotalClubs, newCommunityClubs, newUniversityClubs, totalUniv, totalComm, membersUniv, membersComm };
    
    // Add to District
    for (const key in toAdd) summary.zones[zone].districts[dist][key] += toAdd[key];
    // Add to Zone
    for (const key in toAdd) summary.zones[zone].stats[key] += toAdd[key];
    // Add to Overall
    for (const key in toAdd) summary.overall[key] += toAdd[key];
});

const prevJulyData = {};
try {
    const wbJuly = xlsx.readFile('basedata/1july.csv');
    const julySheet = xlsx.utils.sheet_to_json(wbJuly.Sheets[wbJuly.SheetNames[0]]);
    julySheet.forEach(row => {
        const dist = (row['District'] || '').toString().trim();
        if (dist) {
            prevJulyData[dist] = {
                clubs: parseInt(row['Clubs']) || 0,
                members: parseInt(row['Members']) || 0,
                rotary: parseInt(row['RotaryClubs']) || 0
            };
        }
    });
} catch (e) {
    console.error('Could not load 1july.csv', e);
}

const prevArrearsData = {};
try {
    const wbArrears = xlsx.readFile('basedata/Rotaract clubs in arrears - 9July2026.xlsx');
    const arrSheet = xlsx.utils.sheet_to_json(wbArrears.Sheets['Clubs']);
    arrSheet.forEach(row => {
        const dist = (row['District'] || '').toString().trim();
        const amt = parseCurrency(row[' USD Outstanding ']);
        if (dist) {
            if (!prevArrearsData[dist]) {
                prevArrearsData[dist] = { count: 0, atRisk: 0, outstanding: 0, arrUniv: 0, arrComm: 0 };
            }
            prevArrearsData[dist].count += 1;
            prevArrearsData[dist].outstanding += amt;
            if (amt >= 75) {
                prevArrearsData[dist].atRisk += 1;
            }
            const baseType = (row['Club Base'] || '').toString().toLowerCase();
            if (baseType.includes('university')) {
                prevArrearsData[dist].arrUniv += 1;
            } else if (baseType.includes('community')) {
                prevArrearsData[dist].arrComm += 1;
            }
        }
    });
} catch (e) {
    console.error('Could not load Rotaract clubs in arrears - 9July2026.xlsx', e);
}

const prevOfficersData = {};
try {
    const wbOfficers = xlsx.readFile('basedata/Current_Officer_Not_Reported - 9July2026.xlsx');
    const offSheet = xlsx.utils.sheet_to_json(wbOfficers.Sheets['Rotaract club without Officer']);
    offSheet.forEach(row => {
        const dist = (row['District'] || '').toString().trim();
        if (dist) {
            if (!prevOfficersData[dist]) {
                prevOfficersData[dist] = { count: 0, noOffUniv: 0, noOffComm: 0 };
            }
            prevOfficersData[dist].count += 1;
            const baseType = (row['Club Base'] || '').toString().toLowerCase();
            if (baseType.includes('university')) {
                prevOfficersData[dist].noOffUniv += 1;
            } else if (baseType.includes('community')) {
                prevOfficersData[dist].noOffComm += 1;
            }
        }
    });
} catch (e) {
    console.error('Could not load Current_Officer_Not_Reported - 9July2026.xlsx', e);
}

prevZoneSheet.forEach(row => {
    const dist = (row['RI District'] || '').toString().trim();
    if (!dist || dist === 'Grand Total') return;
    
    // Force the use of the CURRENT zone mapping (so historical data is attributed to the new merged zones)
    // Map historical district to its current zone structure
    let zone = districtToZone[dist];
    if (!zone) return; // If the historical district doesn't exist in the current master data, drop it
    
    if (!prevSummary.zones[zone]) {
        prevSummary.zones[zone] = {
            stats: createEmptyStats(),
            districts: {}
        };
    }
    
    if (!prevSummary.zones[zone].districts[dist]) {
        prevSummary.zones[zone].districts[dist] = createEmptyStats();
    }
    
    let outstanding = prevArrearsData[dist] ? prevArrearsData[dist].outstanding : 0;
    let arrearsClubs = prevArrearsData[dist] ? prevArrearsData[dist].count : 0;
    let atRisk = prevArrearsData[dist] ? prevArrearsData[dist].atRisk : 0;
    let noOfficers = prevOfficersData[dist] ? prevOfficersData[dist].count : 0;
    // We only care about deltas for the main metrics, not necessarily Rotary ones for now, but we'll add them if they exist
    let totalClubs = parseInt(row['Total Clubs']) || 0;
    let totalMembers = 0;
    let totalRotary = parseInt(row['Total Rotary Clubs']) || 0;
    
    // Override with accurate 1 July data if available
    if (prevJulyData[dist]) {
        totalClubs = prevJulyData[dist].clubs;
        totalMembers = prevJulyData[dist].members;
        totalRotary = prevJulyData[dist].rotary || totalRotary;
    }
    
    const rotaryWithSponsor = parseInt(row['Rotary with Rotaract Club']) || 0;
    const rotaryWithoutSponsor = parseInt(row['Rotary without Rotaract Club']) || 0;
    let arrUniv = prevArrearsData[dist] ? prevArrearsData[dist].arrUniv : 0;
    let arrComm = prevArrearsData[dist] ? prevArrearsData[dist].arrComm : 0;
    let noOffUniv = prevOfficersData[dist] ? prevOfficersData[dist].noOffUniv : 0;
    let noOffComm = prevOfficersData[dist] ? prevOfficersData[dist].noOffComm : 0;
    
    const toAdd = { outstanding, arrearsClubs, atRisk, noOfficers, totalClubs, totalMembers, totalRotary, rotaryWithSponsor, rotaryWithoutSponsor, arrUniv, arrComm, noOffUniv, noOffComm };
    
    for (const key in toAdd) prevSummary.zones[zone].districts[dist][key] += toAdd[key];
    for (const key in toAdd) prevSummary.zones[zone].stats[key] += toAdd[key];
    for (const key in toAdd) prevSummary.overall[key] += toAdd[key];
});

// Inject Zone into Arrears and No Officers Data so they can be easily filtered globally
arrearsSheet = arrearsSheet.reduce((acc, row) => {
    if (!row['District']) return acc;
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    const zone = districtToZone[dist];
    if (!zone) return acc;
    
    row['RI Zone'] = zone;
    row['District'] = dist;
    acc.push(row);
    return acc;
}, []);

noOfficersSheet = noOfficersSheet.reduce((acc, row) => {
    if (!row['District']) return acc;
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    const zone = districtToZone[dist];
    if (!zone) return acc;
    
    row['RI Zone'] = zone;
    row['District'] = dist;
    acc.push(row);
    return acc;
}, []);

// Clean up all clubs sheet, strictly mapping only master districts
allClubsSheet = allClubsSheet.reduce((acc, row) => {
    const clubId = (row['Rotaract Club ID'] || '').toString().trim();
    if (!clubId) return acc; // Skip empty rows

    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    const zone = districtToZone[dist];
    if (!zone) return acc;

    row['RI Zone'] = zone;
    row['Zone'] = zone; // Overwrite just in case
    row['District'] = dist;
    
    // Map to clean frontend keys
    row['Club ID'] = clubId;
    row['Club Name'] = row['Rotaract Club Name'] || 'Unknown Club';
    
    acc.push(row);
    return acc;
}, []);

// Map Club IDs to Names for TRF
const clubIdToName = {};
allClubsSheet.forEach(row => {
    clubIdToName[row['Club ID']] = row['Club Name'];
});

// Clean up TRF sheet
trfSheet = trfSheet.reduce((acc, row) => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    const zone = districtToZone[dist] || 'Unknown';
    
    row['RI Zone'] = zone;
    row['District'] = dist;

    // Use proper name from all clubs sheet if available
    const clubId = (row['Club No'] || row['Club No.'] || '').toString().trim();
    row['Club No.'] = clubId;
    if (clubIdToName[clubId]) {
        row['Club Name'] = clubIdToName[clubId];
    } else {
        row['Club Name'] = row['Name'] || 'Unknown Club';
    }
    
    // Map messy headers to clean UI keys
    const totalCont = parseCurrency(row['-- Total --'] || row['Total Contributions USD']);
    row['Total Contributions USD'] = totalCont;
    row['Annual Fund Contribution USD'] = parseCurrency(row['Annual Fund\nYTD']);
    row['PolioPlus Fund Contribution USD'] = parseCurrency(row['PolioPlus Fund\nYTD']);
    row['Other Funds Contribution USD'] = parseCurrency(row['Other Funds\nYTD']);
    
    // Only include rows that have actual TRF contribution data > 0
    if (totalCont > 0) {
        acc.push(row);
    }
    return acc;
}, []);

// Clean up New Clubs sheet
newClubsSheet = newClubsSheet.filter(row => row['DISTRICT'] || row['District']).map(row => {
    const dist = (row['DISTRICT'] || row['District'] || '').toString().replace(/\.0$/, '');
    row['RI Zone'] = districtToZone[dist] || 'Unknown';
    row['District'] = dist;
    return row;
});

// Clean up District Officers sheet
districtOfficersSheet = districtOfficersSheet.filter(row => row['District']).map(row => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    row['RI Zone'] = districtToZone[dist] || 'Unknown';
    row['District'] = dist;
    return row;
});

// Filter Rotary Clubs with no Rotaract Sponsor
let rotaryNoSponsorSheet = rotarySheet.filter(row => {
    return parseInt(row['Total Clubs Sponsored']) === 0 && row['District'];
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

// Calculate growth for districts
Object.keys(summary.zones).forEach(z => {
    const zoneData = summary.zones[z];
    Object.keys(zoneData.districts).forEach(d => {
        const curr = zoneData.districts[d];
        const prev = prevSummary.zones[z]?.districts[d];

        let membersGrowthAbs = 0;
        let membersGrowthPct = 0;
        let clubsGrowthAbs = 0;
        let clubsGrowthPct = 0;

        if (prev) {
            membersGrowthAbs = curr.totalMembers - prev.totalMembers;
            membersGrowthPct = prev.totalMembers > 0 ? (membersGrowthAbs / prev.totalMembers) * 100 : 0;
            
            clubsGrowthAbs = curr.totalClubs - prev.totalClubs;
            clubsGrowthPct = prev.totalClubs > 0 ? (clubsGrowthAbs / prev.totalClubs) * 100 : 0;
        } else {
            membersGrowthAbs = curr.totalMembers;
            membersGrowthPct = 100;
            clubsGrowthAbs = curr.totalClubs;
            clubsGrowthPct = 100;
        }

        curr.membersGrowthAbs = membersGrowthAbs;
        curr.membersGrowthPct = membersGrowthPct;
        curr.clubsGrowthAbs = clubsGrowthAbs;
        curr.clubsGrowthPct = clubsGrowthPct;
    });
});

const outputSummary = {
    current: summary,
    previous: prevSummary,
    lastUpdated: new Date().toISOString()
};

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

const sortByDistrict = (arr, key = 'District') => arr.sort((a, b) => {
    const d1 = String(a[key] || '');
    const d2 = String(b[key] || '');
    return d1.localeCompare(d2, undefined, { numeric: true });
});

sortByDistrict(zoneSheet, 'RI District');
sortByDistrict(arrearsSheet);
sortByDistrict(noOfficersSheet);
sortByDistrict(rotaryNoSponsorSheet);
sortByDistrict(unifiedIssuesSheet, 'RI District'); // unified issues uses RI District
sortByDistrict(allClubsSheet);
sortByDistrict(trfSheet);
sortByDistrict(newClubsSheet);
sortByDistrict(districtOfficersSheet);

exportToCsv(zoneSheet, 'data/zone_summary.csv');
exportToCsv(arrearsSheet, 'data/arrears.csv');
exportToCsv(noOfficersSheet, 'data/no_officers.csv');
exportToCsv(rotaryNoSponsorSheet, 'data/rotary_no_sponsor.csv');

fs.writeFileSync('data/arrears.json', JSON.stringify(arrearsSheet, null, 2));
fs.writeFileSync('data/no_officers.json', JSON.stringify(noOfficersSheet, null, 2));
fs.writeFileSync('data/rotary_no_sponsor.json', JSON.stringify(rotaryNoSponsorSheet, null, 2));
fs.writeFileSync('data/unified_issues.json', JSON.stringify(unifiedIssuesSheet, null, 2));
fs.writeFileSync('data/zone_summary.json', JSON.stringify(zoneSheet, null, 2));
fs.writeFileSync('data/all_clubs.json', JSON.stringify(allClubsSheet, null, 2));
fs.writeFileSync('data/trf_contributions.json', JSON.stringify(trfSheet, null, 2));
fs.writeFileSync('data/new_clubs.json', JSON.stringify(newClubsSheet, null, 2));
fs.writeFileSync('data/district_officers.json', JSON.stringify(districtOfficersSheet, null, 2));

let totalWorldwideClubs = 0;
let totalWorldwideMembers = 0;
rotaractByDistrictSheet.forEach(row => {
    totalWorldwideClubs += (parseInt(row['Total Active Rotaract Clubs']) || 0);
    totalWorldwideMembers += (parseInt(row['Total Reported Members']) || 0);
});

let prevTotalWorldwideClubs = 0;
let prevTotalWorldwideMembers = 0;

if (prevMasterFile && fs.existsSync(prevMasterFile)) {
    const prevWb = xlsx.readFile(prevMasterFile);
    let prevRotaractByCountrySheet = readSheetAsJson(prevWb, 'Rotaract by Country');
    let prevRotaractByDistrictSheet = readSheetAsJson(prevWb, 'Rotaract by District');
    let prevRotaractByZoneSheetRaw = {};
    prevRotaractByDistrictSheet.forEach(row => {
        const zone = (row['Zone'] || 'Unknown').toString().trim();
        if (!prevRotaractByZoneSheetRaw[zone]) {
            prevRotaractByZoneSheetRaw[zone] = { 'Zone': zone, 'Total Active Rotaract Clubs': 0, 'Total Reported Members': 0 };
        }
        prevRotaractByZoneSheetRaw[zone]['Total Active Rotaract Clubs'] += (parseInt(row['Total Active Rotaract Clubs']) || 0);
        prevRotaractByZoneSheetRaw[zone]['Total Reported Members'] += (parseInt(row['Total Reported Members']) || 0);
    });
    let prevRotaractByZoneSheet = Object.values(prevRotaractByZoneSheetRaw);
    
    prevRotaractByDistrictSheet.forEach(row => {
        prevTotalWorldwideClubs += (parseInt(row['Total Active Rotaract Clubs']) || 0);
        prevTotalWorldwideMembers += (parseInt(row['Total Reported Members']) || 0);
    });

    // Helper to inject growth rates
    const injectGrowth = (currSheet, prevSheet, matchKey) => {
        currSheet.forEach(currRow => {
            const currKey = (currRow[matchKey] || '').toString().trim();
            const prevRow = prevSheet.find(r => (r[matchKey] || '').toString().trim() === currKey);
            
            const currClubs = parseInt(currRow['Total Active Rotaract Clubs']) || 0;
            const currMembers = parseInt(currRow['Total Reported Members']) || 0;
            
            if (prevRow) {
                const prevClubs = parseInt(prevRow['Total Active Rotaract Clubs']) || 0;
                const prevMembers = parseInt(prevRow['Total Reported Members']) || 0;
                
                currRow['Clubs Growth Abs'] = currClubs - prevClubs;
                currRow['Members Growth Abs'] = currMembers - prevMembers;
                currRow['Clubs Growth (%)'] = prevClubs > 0 ? ((currClubs - prevClubs) / prevClubs) * 100 : 0;
                currRow['Members Growth (%)'] = prevMembers > 0 ? ((currMembers - prevMembers) / prevMembers) * 100 : 0;
            } else {
                currRow['Clubs Growth Abs'] = currClubs;
                currRow['Members Growth Abs'] = currMembers;
                currRow['Clubs Growth (%)'] = 100;
                currRow['Members Growth (%)'] = 100;
            }
        });
    };

    injectGrowth(rotaractByCountrySheet, prevRotaractByCountrySheet, ' '); // Country column is ' '
    injectGrowth(rotaractByDistrictSheet, prevRotaractByDistrictSheet, 'District');
    injectGrowth(rotaractByZoneSheet, prevRotaractByZoneSheet, 'Zone');
}

function calcDelta(curr, prev) {
    if (!prev) return { text: 'New', type: 'positive', baseline: 'vs July 1st' };
    const diff = curr - prev;
    if (diff === 0) return { text: 'No change', type: 'neutral', baseline: 'vs July 1st' };
    const pct = ((Math.abs(diff) / prev) * 100).toFixed(1);
    return {
        text: `${diff > 0 ? '+' : '-'}${Math.abs(diff).toFixed(curr % 1 !== 0 ? 3 : 0)} (${pct}%)`,
        type: diff > 0 ? 'positive' : 'negative',
        baseline: 'vs July 1st'
    };
}

const avgMembersPerClub = totalWorldwideClubs > 0 ? parseFloat((totalWorldwideMembers / totalWorldwideClubs).toFixed(3)) : 0;
const prevAvgMembersPerClub = prevTotalWorldwideClubs > 0 ? parseFloat((prevTotalWorldwideMembers / prevTotalWorldwideClubs).toFixed(3)) : 0;

const worldwideSummary = {
    totalClubs: totalWorldwideClubs,
    totalClubsDelta: prevTotalWorldwideClubs > 0 ? calcDelta(totalWorldwideClubs, prevTotalWorldwideClubs) : null,
    totalMembers: totalWorldwideMembers,
    totalMembersDelta: prevTotalWorldwideMembers > 0 ? calcDelta(totalWorldwideMembers, prevTotalWorldwideMembers) : null,
    avgMembersPerClub: avgMembersPerClub,
    avgMembersDelta: prevAvgMembersPerClub > 0 ? calcDelta(avgMembersPerClub, prevAvgMembersPerClub) : null,
    countryData: rotaractByCountrySheet,
    districtData: rotaractByDistrictSheet,
    zoneData: rotaractByZoneSheet
};

fs.writeFileSync('data/worldwide_summary.json', JSON.stringify(worldwideSummary, null, 2));

console.log('Data generation complete.');
