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
let allInteractSheet = readSheetAsJson(currWb, 'All Interact Clubs');
let interactByDistrictSheet = readSheetAsJson(currWb, 'Interact by District');
let trfSheet = readSheetAsJson(currWb, 'ClubsTRFContribution');
let newClubsSheet = readSheetAsJson(currWb, 'NewClubs', { defval: "", raw: false, dateNF: 'dd-MMM-yyyy' });
let districtOfficersSheet = readSheetAsJson(currWb, 'District Officers_Simplified');
let rotaractByCountrySheet = readSheetAsJson(currWb, 'Rotaract by Country');
let rotaractByDistrictSheet = readSheetAsJson(currWb, 'Rotaract by District');
let prevZoneSheet = [];
if (prevMasterFile && fs.existsSync(prevMasterFile)) {
    console.log(`Processing Previous Data: ${prevMasterFile}`);
    const prevWb = xlsx.readFile(prevMasterFile);
    prevZoneSheet = readSheetAsJson(prevWb, prevWb.SheetNames[0]); // First sheet is the summary
}

const prevJulyData = {};
let prevWorldwideClubs = 0;
let prevWorldwideMembers = 0;
let prevWorldwideInteractClubs = 0;
try {
    const wbJuly = xlsx.readFile('basedata/1july.csv');
    const julySheet = xlsx.utils.sheet_to_json(wbJuly.Sheets[wbJuly.SheetNames[0]]);
    julySheet.forEach(row => {
        const dist = (row['District'] || '').toString().trim();
        if (dist) {
            const clubs = parseInt(row['Clubs']) || 0;
            const members = typeof row['Members'] === 'string' ? (parseInt(row['Members'].replace(/,/g, '')) || 0) : (parseInt(row['Members']) || 0);
            const rotary = parseInt(row['RotaryClubs']) || 0;
            const interact = parseInt(row['InteractClubs']) || 0;
            prevJulyData[dist] = {
                clubs: clubs,
                members: members,
                rotary: rotary,
                interactClubs: interact
            };
            prevWorldwideClubs += clubs;
            prevWorldwideMembers += members;
            prevWorldwideInteractClubs += interact;
        }
    });
} catch (e) {
    console.error('Could not load 1july.csv', e);
}

const prevJulyCountryData = {};
try {
    const csvContent = fs.readFileSync('basedata/1julyCountries.csv', 'utf8');
    const wbCountry = xlsx.read(csvContent, { type: 'string' });
    const julyCountrySheet = xlsx.utils.sheet_to_json(wbCountry.Sheets[wbCountry.SheetNames[0]]);
    julyCountrySheet.forEach(row => {
        const c = (row['Country'] || '').toString().trim();
        if (c) {
            const clubs = parseInt(row['Clubs']) || 0;
            const members = typeof row['Members'] === 'string' ? (parseInt(row['Members'].replace(/,/g, '')) || 0) : (parseInt(row['Members']) || 0);
            const interactClubs = parseInt(row['InteractClubs']) || 0;
            prevJulyCountryData[c.toLowerCase()] = { clubs, members, interactClubs };
        }
    });
} catch (e) {
    console.error('Could not load 1julyCountries.csv', e);
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
        membersComm: 0,
        totalInteractClubs: 0,
        suspendedInteractClubs: 0,
        rotaractWithInteract: 0,
        rotaryWithInteract: 0,
        rotaryWithoutInteract: 0,
        rotaryWithSuspendedInteract: 0,
        prevInteractClubs: 0
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

    // Interact Metrics
    const totalInteractClubs = parseInt(row['TotalInteractClubs']) || 0;
    const suspendedInteractClubs = parseInt(row['SuspendedInteractClubs']) || 0;
    const rotaractWithInteract = parseInt(row['Rotaract with Interact']) || 0;
    const rotaryWithInteract = parseInt(row['Rotary with Interact Club']) || 0;
    const rotaryWithoutInteract = parseInt(row['Rotary without Interact Club']) || 0;
    const rotaryWithSuspendedInteract = parseInt(row['Rotary with Suspended Interact Clubs']) || 0;
    const prevInteractClubs = prevJulyData[dist] ? prevJulyData[dist].interactClubs : 0;
    
    const distInfo = districtMembers[dist] || { members: 0, univ: 0, comm: 0, membersUniv: 0, membersComm: 0 };
    const totalMembers = distInfo.members;
    const totalUniv = distInfo.univ;
    const totalComm = distInfo.comm;
    const membersUniv = distInfo.membersUniv;
    const membersComm = distInfo.membersComm;
    const avgMembership = totalClubs > 0 ? Number((totalMembers / totalClubs).toFixed(2)) : 0;
    
    row['Total Reported Members'] = totalMembers;
    row['Members'] = totalMembers;
    row['Avg Membership'] = avgMembership;
    row['TotalInteractClubs'] = totalInteractClubs;
    row['SuspendedInteractClubs'] = suspendedInteractClubs;
    row['Rotaract with Interact'] = rotaractWithInteract;
    row['Rotary with Interact Club'] = rotaryWithInteract;
    row['Rotary without Interact Club'] = rotaryWithoutInteract;
    row['Rotary with Suspended Interact Clubs'] = rotaryWithSuspendedInteract;
    row['Interact Growth Abs'] = totalInteractClubs - prevInteractClubs;
    row['Interact Growth (%)'] = prevInteractClubs > 0 ? Number((((totalInteractClubs - prevInteractClubs) / prevInteractClubs) * 100).toFixed(1)) : 0;
    
    const toAdd = { 
        outstanding, arrearsClubs, atRisk, noOfficers, totalClubs, totalMembers, totalRotary, rotaryWithSponsor, rotaryWithoutSponsor, 
        arrUniv, arrComm, noOffUniv, noOffComm, trfClubs, trfContributionsUSD, trfAnnualUSD, trfPolioUSD, trfOtherUSD, trfEndowmentUSD, 
        newTotalClubs, newCommunityClubs, newUniversityClubs, totalUniv, totalComm, membersUniv, membersComm,
        totalInteractClubs, suspendedInteractClubs, rotaractWithInteract, rotaryWithInteract, rotaryWithoutInteract, rotaryWithSuspendedInteract, prevInteractClubs
    };
    
    // Add to District
    for (const key in toAdd) summary.zones[zone].districts[dist][key] += toAdd[key];
    // Add to Zone
    for (const key in toAdd) summary.zones[zone].stats[key] += toAdd[key];
    // Add to Overall
    for (const key in toAdd) summary.overall[key] += toAdd[key];
});

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
    
    const toAdd = { 
        outstanding, arrearsClubs, atRisk, noOfficers, totalClubs, totalMembers, totalRotary, rotaryWithSponsor, rotaryWithoutSponsor, 
        arrUniv, arrComm, noOffUniv, noOffComm,
        totalInteractClubs: prevJulyData[dist] ? prevJulyData[dist].interactClubs : 0
    };
    
    for (const key in toAdd) prevSummary.zones[zone].districts[dist][key] = (prevSummary.zones[zone].districts[dist][key] || 0) + toAdd[key];
    for (const key in toAdd) prevSummary.zones[zone].stats[key] = (prevSummary.zones[zone].stats[key] || 0) + toAdd[key];
    for (const key in toAdd) prevSummary.overall[key] = (prevSummary.overall[key] || 0) + toAdd[key];
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

// Clean up TRF sheet first so we can use it to enrich all clubs
trfSheet = trfSheet.reduce((acc, row) => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    const zone = districtToZone[dist] || 'Unknown';
    if (!districtToZone[dist]) return acc;
    
    row['RI Zone'] = zone;
    row['District'] = dist;

    const clubId = (row['Club No'] || row['Club No.'] || '').toString().trim();
    row['Club No.'] = clubId;
    row['Club Name'] = row['Name'] || 'Unknown Club';
    
    const totalCont = parseCurrency(row['-- Total --'] || row['Total Contributions USD']);
    row['Total Contributions USD'] = totalCont;
    row['Annual Fund Contribution USD'] = parseCurrency(row['Annual Fund\nYTD']);
    row['PolioPlus Fund Contribution USD'] = parseCurrency(row['PolioPlus Fund\nYTD']);
    row['Other Funds Contribution USD'] = parseCurrency(row['Other Funds\nYTD']);
    row['Endowment Fund Contribution USD'] = parseCurrency(row['Endowment Fund\nYTD']);
    row['AF Per Capita'] = parseCurrency(row['AF Per Capita']);
    
    if (totalCont > 0) {
        acc.push(row);
    }
    return acc;
}, []);

// Clean up New Clubs sheet
function formatCharterDate(rawDate) {
    if (!rawDate) return null;
    if (typeof rawDate === 'number') {
        const d = new Date((rawDate - 25569) * 86400 * 1000);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return rawDate.toString();
}

newClubsSheet = newClubsSheet.filter(row => row['DISTRICT'] || row['District']).map(row => {
    const dist = (row['DISTRICT'] || row['District'] || '').toString().replace(/\.0$/, '');
    row['RI Zone'] = districtToZone[dist] || 'Unknown';
    row['District'] = dist;
    row['Club ID'] = (row['Club ID'] || '').toString().trim();
    row['Club Charter Date'] = formatCharterDate(row['Club Charter Date']);
    return row;
});

// Build lookup maps for enriching all clubs
const arrearsMap = new Map();
arrearsSheet.forEach(c => {
    const id = String(c['NF Cust Number'] || '').trim();
    if (!id) return;
    const outstanding = parseCurrency(c[' USD Outstanding ']);
    arrearsMap.set(id, {
        isArrears: true,
        outstanding: outstanding,
        isAtRisk: outstanding >= 75
    });
});

const officersMap = new Map();
noOfficersSheet.forEach(c => {
    const id = String(c['Club ID'] || '').trim();
    if (!id) return;
    officersMap.set(id, {
        isNoOfficers: true,
        role: c['Rotaract Role'] || c['Rotaract Role Name'] || 'Rotaract President',
        lastReported: c['Last Reported'] || 'N/A',
        myRotaryAccount: c['Online Account With My Rotary'] || c['Online Account with My Rotary'] || 'N'
    });
});

const trfMap = new Map();
trfSheet.forEach(c => {
    const id = String(c['Club No.'] || c['Club No'] || '').trim();
    if (!id) return;
    trfMap.set(id, {
        total: c['Total Contributions USD'] || 0,
        annual: c['Annual Fund Contribution USD'] || 0,
        polio: c['PolioPlus Fund Contribution USD'] || 0,
        other: c['Other Funds Contribution USD'] || 0,
        endowment: c['Endowment Fund Contribution USD'] || 0,
        perCapita: c['AF Per Capita'] || 0
    });
});

const newClubsMap = new Map();
newClubsSheet.forEach(c => {
    const id = String(c['Club ID'] || '').trim();
    if (!id) return;
    newClubsMap.set(id, {
        isNewClub: true,
        charterDate: c['Club Charter Date'] || null,
        charterMembers: parseInt(c['Member Count']) || 0
    });
});

// Map Rotaract clubs that sponsor/co-sponsor Interact clubs
const rotaractSponsoredInteract = allInteractSheet.filter(r => (r['Sponsor Club Type'] || '').toLowerCase().includes('rotaract'));
const interactByRotaract = {};

rotaractSponsoredInteract.forEach(i => {
    const sponsorName = (i['Sponsor Clubs'] || '').toString().trim().toLowerCase();
    const dist = (i['District'] || '').toString().trim();
    
    const match = allClubsSheet.find(r => {
        const rName = (r['Rotaract Club Name'] || r['Club Name'] || '').toString().trim().toLowerCase();
        const rDist = (r['District'] || '').toString().trim();
        return (rName === sponsorName || sponsorName.includes(rName) || rName.includes(sponsorName)) && (dist === '' || dist === rDist);
    });
    
    if (match) {
        const clubId = (match['Rotaract Club ID'] || match['Club ID'] || '').toString().trim();
        if (clubId) {
            if (!interactByRotaract[clubId]) interactByRotaract[clubId] = [];
            interactByRotaract[clubId].push({
                id: i['Interact Club ID'],
                name: i['Interact Club Name'],
                status: i['Interact Club Status'],
                term: i['President /Advisor Term Reported']
            });
        }
    }
});

// Clean up and enrich all clubs sheet, strictly mapping only master districts
allClubsSheet = allClubsSheet.reduce((acc, row) => {
    const clubId = (row['Rotaract Club ID'] || row['Club ID'] || '').toString().trim();
    if (!clubId) return acc; // Skip empty rows

    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    const zone = districtToZone[dist];
    if (!zone) return acc;

    const arrInfo = arrearsMap.get(clubId) || { isArrears: false, outstanding: 0, isAtRisk: false };
    const offInfo = officersMap.get(clubId) || { isNoOfficers: false, role: 'N/A', lastReported: row['President / Advisor Term Reported'] || 'N/A', myRotaryAccount: 'N/A' };
    const trfInfo = trfMap.get(clubId) || { total: 0, annual: 0, polio: 0, other: 0, endowment: 0, perCapita: 0 };
    const newClubInfo = newClubsMap.get(clubId) || { isNewClub: false, charterDate: null, charterMembers: 0 };
    const sponsoredInteract = interactByRotaract[clubId] || [];

    const members = parseInt(row['Total Reported Members']) || 0;
    const baseType = (row['Rotaract Club Base'] || 'Unknown').toString().trim();
    const name = row['Rotaract Club Name'] || row['Club Name'] || 'Unknown Club';
    const status = row['Rotaract Club Status'] || 'Active';
    const country = row['Country/Geographic Area'] || 'Unknown';
    const sponsorClubs = row['Sponsor Clubs'] || 'None Reported';
    const termReported = (row['President /Advisor Term Reported'] || row['President / Advisor Term Reported'] || row['Last Reported'] || 'N/A').toString().trim();

    const enrichedClub = {
        'Club ID': clubId,
        'Club Name': name,
        'Rotaract Club Name': name,
        'Rotaract Club ID': clubId,
        'Rotaract Club Status': status,
        'Rotaract Club Base': baseType,
        'Country/Geographic Area': country,
        'Sponsor Clubs': sponsorClubs,
        'President / Advisor Term Reported': termReported,
        'District': dist,
        'Zone': zone,
        'RI Zone': zone,
        'Total Reported Members': members,
        
        // Compliance
        'Arrears': arrInfo.isArrears ? 'Yes' : 'No',
        'Officers': offInfo.isNoOfficers ? 'No' : 'Yes',
        'isArrears': arrInfo.isArrears,
        'outstanding': arrInfo.outstanding,
        'isAtRisk': arrInfo.isAtRisk,
        'isNoOfficers': offInfo.isNoOfficers,
        'officerRole': offInfo.role,
        'officerLastReported': offInfo.lastReported,
        'myRotaryAccount': offInfo.myRotaryAccount,
        
        // TRF Details
        'trfTotal': trfInfo.total,
        'trfAnnual': trfInfo.annual,
        'trfPolio': trfInfo.polio,
        'trfOther': trfInfo.other,
        'trfEndowment': trfInfo.endowment,
        'afPerCapita': trfInfo.perCapita,
        
        // New Club Details
        'isNewClub': newClubInfo.isNewClub,
        'charterDate': newClubInfo.charterDate,
        'charterMembers': newClubInfo.charterMembers,

        // Interact Sponsorship Details
        'sponsoredInteractClubs': sponsoredInteract,
        'sponsoredInteractCount': sponsoredInteract.length
    };

    acc.push(enrichedClub);
    return acc;
}, []);

// Update TRF club names from allClubsSheet
const clubIdToName = {};
allClubsSheet.forEach(row => {
    clubIdToName[row['Club ID']] = row['Club Name'];
});
trfSheet.forEach(row => {
    const clubId = row['Club No.'];
    if (clubIdToName[clubId]) {
        row['Club Name'] = clubIdToName[clubId];
    }
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

// Filter Rotary Clubs with no Interact Sponsor
let rotaryNoInteractSheet = rotarySheet.filter(row => {
    return (parseInt(row['Total Interact Clubs Sponsored']) || 0) === 0 && row['District'];
}).map(row => {
    const dist = (row['District'] || '').toString().replace(/\.0$/, '');
    const zone = districtToZone[dist] || (row['Zone'] ? (String(row['Zone']).startsWith('Zone') ? row['Zone'] : `Zone ${row['Zone']}`) : 'Unknown');
    return {
        'RI Zone': zone,
        'District': dist,
        'Club Name': row['Club Name'] || row['Club Name with Rotary'] || 'Unknown Rotary Club',
        'Club Status': row['Club Status'] || 'Active',
        'Current Member Count': parseInt(row['Current Member Count']) || 0,
        'Club ID': String(row['Club ID'] || ''),
        'Total Rotaract Sponsored': parseInt(row['Total Clubs Sponsored']) || 0,
        'Total Interact Sponsored': parseInt(row['Total Interact Clubs Sponsored']) || 0
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
        let interactGrowthAbs = 0;
        let interactGrowthPct = 0;

        if (prev) {
            membersGrowthAbs = curr.totalMembers - prev.totalMembers;
            membersGrowthPct = prev.totalMembers > 0 ? (membersGrowthAbs / prev.totalMembers) * 100 : 0;
            
            clubsGrowthAbs = curr.totalClubs - prev.totalClubs;
            clubsGrowthPct = prev.totalClubs > 0 ? (clubsGrowthAbs / prev.totalClubs) * 100 : 0;

            interactGrowthAbs = curr.totalInteractClubs - prev.totalInteractClubs;
            interactGrowthPct = prev.totalInteractClubs > 0 ? (interactGrowthAbs / prev.totalInteractClubs) * 100 : 0;
        } else {
            membersGrowthAbs = curr.totalMembers;
            membersGrowthPct = 100;
            clubsGrowthAbs = curr.totalClubs;
            clubsGrowthPct = 100;
            interactGrowthAbs = curr.totalInteractClubs;
            interactGrowthPct = 100;
        }

        curr.membersGrowthAbs = membersGrowthAbs;
        curr.membersGrowthPct = membersGrowthPct;
        curr.clubsGrowthAbs = clubsGrowthAbs;
        curr.clubsGrowthPct = clubsGrowthPct;
        curr.interactGrowthAbs = interactGrowthAbs;
        curr.interactGrowthPct = interactGrowthPct;
    });
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

const sortByDistrict = (arr, key = 'District') => arr.sort((a, b) => {
    const d1 = String(a[key] || '');
    const d2 = String(b[key] || '');
    return d1.localeCompare(d2, undefined, { numeric: true });
});

sortByDistrict(zoneSheet, 'RI District');
sortByDistrict(arrearsSheet);
sortByDistrict(noOfficersSheet);
sortByDistrict(rotaryNoSponsorSheet);
sortByDistrict(rotaryNoInteractSheet);
sortByDistrict(unifiedIssuesSheet, 'RI District'); // unified issues uses RI District
sortByDistrict(allClubsSheet);
sortByDistrict(trfSheet);
sortByDistrict(newClubsSheet);
sortByDistrict(districtOfficersSheet);

exportToCsv(zoneSheet, 'data/zone_summary.csv');
exportToCsv(arrearsSheet, 'data/arrears.csv');
exportToCsv(noOfficersSheet, 'data/no_officers.csv');
exportToCsv(rotaryNoSponsorSheet, 'data/rotary_no_sponsor.csv');
exportToCsv(rotaryNoInteractSheet, 'data/rotary_no_interact.csv');

fs.writeFileSync('data/arrears.json', JSON.stringify(arrearsSheet, null, 2));
fs.writeFileSync('data/no_officers.json', JSON.stringify(noOfficersSheet, null, 2));
fs.writeFileSync('data/rotary_no_sponsor.json', JSON.stringify(rotaryNoSponsorSheet, null, 2));
fs.writeFileSync('data/rotary_no_interact.json', JSON.stringify(rotaryNoInteractSheet, null, 2));
fs.writeFileSync('data/unified_issues.json', JSON.stringify(unifiedIssuesSheet, null, 2));
fs.writeFileSync('data/zone_summary.json', JSON.stringify(zoneSheet, null, 2));
fs.writeFileSync('data/all_clubs.json', JSON.stringify(allClubsSheet, null, 2));
fs.writeFileSync('data/trf_contributions.json', JSON.stringify(trfSheet, null, 2));
fs.writeFileSync('data/new_clubs.json', JSON.stringify(newClubsSheet, null, 2));
fs.writeFileSync('data/district_officers.json', JSON.stringify(districtOfficersSheet, null, 2));

let totalWorldwideClubs = 0;
let totalWorldwideMembers = 0;
const worldwideZoneMap = {};

rotaractByDistrictSheet.forEach(currRow => {
    const dist = (currRow['District'] || '').toString().trim();
    const currClubs = parseInt(currRow['Total Active Rotaract Clubs']) || 0;
    const currMembers = parseInt(currRow['Total Reported Members']) || 0;
    const zoneRaw = (currRow['Zone'] || '').toString().trim();
    const zoneKey = zoneRaw.toLowerCase().startsWith('zone') ? zoneRaw : (zoneRaw ? `Zone ${zoneRaw}` : 'Unknown');

    totalWorldwideClubs += currClubs;
    totalWorldwideMembers += currMembers;

    const prevClubs = prevJulyData[dist] ? prevJulyData[dist].clubs : 0;
    const prevMembers = prevJulyData[dist] ? prevJulyData[dist].members : 0;

    currRow['Clubs Growth Abs'] = currClubs - prevClubs;
    currRow['Members Growth Abs'] = currMembers - prevMembers;
    currRow['Clubs Growth (%)'] = prevClubs > 0 ? ((currClubs - prevClubs) / prevClubs) * 100 : (currClubs > 0 ? 100 : 0);
    currRow['Members Growth (%)'] = prevMembers > 0 ? ((currMembers - prevMembers) / prevMembers) * 100 : (currMembers > 0 ? 100 : 0);

    // Roll up to Zone (District-First)
    if (zoneRaw && zoneRaw !== 'Unknown') {
        if (!worldwideZoneMap[zoneKey]) {
            worldwideZoneMap[zoneKey] = {
                Zone: zoneKey,
                'Total Active Rotaract Clubs': 0,
                'Total Reported Members': 0,
                prevClubs: 0,
                prevMembers: 0
            };
        }
        worldwideZoneMap[zoneKey]['Total Active Rotaract Clubs'] += currClubs;
        worldwideZoneMap[zoneKey]['Total Reported Members'] += currMembers;
        worldwideZoneMap[zoneKey].prevClubs += prevClubs;
        worldwideZoneMap[zoneKey].prevMembers += prevMembers;
    }
});

const rotaractByZoneSheet = Object.values(worldwideZoneMap).map(z => {
    const clubsGrowthAbs = z['Total Active Rotaract Clubs'] - z.prevClubs;
    const membersGrowthAbs = z['Total Reported Members'] - z.prevMembers;
    const clubsGrowthPct = z.prevClubs > 0 ? (clubsGrowthAbs / z.prevClubs) * 100 : 0;
    const membersGrowthPct = z.prevMembers > 0 ? (membersGrowthAbs / z.prevMembers) * 100 : 0;
    return {
        Zone: z.Zone,
        'Total Active Rotaract Clubs': z['Total Active Rotaract Clubs'],
        'Total Reported Members': z['Total Reported Members'],
        'Clubs Growth Abs': clubsGrowthAbs,
        'Members Growth Abs': membersGrowthAbs,
        'Clubs Growth (%)': clubsGrowthPct,
        'Members Growth (%)': membersGrowthPct
    };
});

// Process Country Growth from 1julyCountries.csv
const getCountryName = (row) => (row['Country'] || row[' '] || row['Country/Geographic Area'] || '').toString().trim();

rotaractByCountrySheet.forEach(currRow => {
    const countryName = getCountryName(currRow);
    const currClubs = parseInt(currRow['Total Active Rotaract Clubs']) || 0;
    const currMembers = parseInt(currRow['Total Reported Members']) || 0;
    
    const prev = prevJulyCountryData[countryName.toLowerCase()];
    const prevClubs = prev ? prev.clubs : 0;
    const prevMembers = prev ? prev.members : 0;
    
    currRow['Clubs Growth Abs'] = currClubs - prevClubs;
    currRow['Members Growth Abs'] = currMembers - prevMembers;
    currRow['Clubs Growth (%)'] = prevClubs > 0 ? ((currClubs - prevClubs) / prevClubs) * 100 : (currClubs > 0 ? 100 : 0);
    currRow['Members Growth (%)'] = prevMembers > 0 ? ((currMembers - prevMembers) / prevMembers) * 100 : (currMembers > 0 ? 100 : 0);
});

// Process Worldwide Interact Data from Interact by District & 1july.csv
let totalWorldwideActiveInteractClubs = 0;
let totalWorldwideSuspendedInteractClubs = 0;
let totalWorldwideInteractClubs = 0;
let prevTotalWorldwideInteractClubs = 0;
const worldwideInteractZoneMap = {};

const interactDistrictData = interactByDistrictSheet.filter(d => d['District'] && String(d['District']) !== '-1').map(currRow => {
    const dist = String(currRow['District']).trim();
    const currActive = parseInt(currRow['Total Active Interact Clubs']) || 0;
    const currSuspended = parseInt(currRow['Total Suspended Interact Clubs']) || 0;
    const currTotal = currActive + currSuspended;
    const zoneRaw = (currRow['Zone'] || '').toString().trim();
    const zoneKey = zoneRaw.toLowerCase().startsWith('zone') ? zoneRaw : (zoneRaw ? `Zone ${zoneRaw}` : 'Unknown');

    totalWorldwideActiveInteractClubs += currActive;
    totalWorldwideSuspendedInteractClubs += currSuspended;
    totalWorldwideInteractClubs += currTotal;

    const prevInteract = prevJulyData[dist] ? prevJulyData[dist].interactClubs : 0;
    prevTotalWorldwideInteractClubs += prevInteract;

    const growthAbs = currTotal - prevInteract;
    const growthPct = prevInteract > 0 ? Number(((growthAbs / prevInteract) * 100).toFixed(1)) : (currTotal > 0 ? 100 : 0);

    if (zoneRaw && zoneRaw !== 'Unknown') {
        if (!worldwideInteractZoneMap[zoneKey]) {
            worldwideInteractZoneMap[zoneKey] = {
                Zone: zoneKey,
                'Total Active Interact Clubs': 0,
                'Total Suspended Interact Clubs': 0,
                'Total Interact Clubs': 0,
                prevInteract: 0
            };
        }
        worldwideInteractZoneMap[zoneKey]['Total Active Interact Clubs'] += currActive;
        worldwideInteractZoneMap[zoneKey]['Total Suspended Interact Clubs'] += currSuspended;
        worldwideInteractZoneMap[zoneKey]['Total Interact Clubs'] += currTotal;
        worldwideInteractZoneMap[zoneKey].prevInteract += prevInteract;
    }

    return {
        District: dist,
        Zone: zoneKey,
        'Total Active Interact Clubs': currActive,
        'Total Suspended Interact Clubs': currSuspended,
        'Total Interact Clubs': currTotal,
        'Interact Growth Abs': growthAbs,
        'Interact Growth (%)': growthPct
    };
});

const interactZoneData = Object.values(worldwideInteractZoneMap).map(z => {
    const growthAbs = z['Total Interact Clubs'] - z.prevInteract;
    const growthPct = z.prevInteract > 0 ? Number(((growthAbs / z.prevInteract) * 100).toFixed(1)) : 0;
    return {
        Zone: z.Zone,
        'Total Active Interact Clubs': z['Total Active Interact Clubs'],
        'Total Suspended Interact Clubs': z['Total Suspended Interact Clubs'],
        'Total Interact Clubs': z['Total Interact Clubs'],
        'Interact Growth Abs': growthAbs,
        'Interact Growth (%)': growthPct
    };
});

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
const prevAvgMembersPerClub = prevWorldwideClubs > 0 ? parseFloat((prevWorldwideMembers / prevWorldwideClubs).toFixed(3)) : 0;

const worldwideSummary = {
    totalClubs: totalWorldwideClubs,
    totalClubsDelta: prevWorldwideClubs > 0 ? calcDelta(totalWorldwideClubs, prevWorldwideClubs) : null,
    totalMembers: totalWorldwideMembers,
    totalMembersDelta: prevWorldwideMembers > 0 ? calcDelta(totalWorldwideMembers, prevWorldwideMembers) : null,
    avgMembersPerClub: avgMembersPerClub,
    avgMembersDelta: prevAvgMembersPerClub > 0 ? calcDelta(avgMembersPerClub, prevAvgMembersPerClub) : null,
    totalInteractClubs: totalWorldwideInteractClubs,
    totalActiveInteractClubs: totalWorldwideActiveInteractClubs,
    totalSuspendedInteractClubs: totalWorldwideSuspendedInteractClubs,
    totalInteractDelta: prevTotalWorldwideInteractClubs > 0 ? calcDelta(totalWorldwideInteractClubs, prevTotalWorldwideInteractClubs) : null,
    countryData: rotaractByCountrySheet,
    districtData: rotaractByDistrictSheet,
    zoneData: rotaractByZoneSheet,
    interactDistrictData: interactDistrictData,
    interactZoneData: interactZoneData
};

fs.writeFileSync('data/worldwide_summary.json', JSON.stringify(worldwideSummary, null, 2));

console.log('Data generation complete.');
