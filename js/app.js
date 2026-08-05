let dashboardData = null;
let arrearsData = null;
let noOfficersData = null;
let rotaryData = null;
let unifiedData = null;
let zoneData = null;

// UI Instances
let barChartInstance = null;
let doughnutChartInstance = null;
let chartBaseArrears = null;
let chartBaseOfficers = null;
let arrearsGrid = null;
let officersGrid = null;
let rotaryGrid = null;
let tableDistrict = null;
let tsZone = null;
let tsDistrict = null;

// Global Interactive Cross-Filters (set via clicking charts)
// e.g. { district: '3011', baseType: 'University', arrearsType: 'At Risk ($75+)' }
let activeChartFilters = {};

// Formatters
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const numberFormatter = new Intl.NumberFormat('en-US');
const pctFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

document.addEventListener('DOMContentLoaded', async () => {
    Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
    Chart.defaults.color = '#5f6368';

    await fetchData();
    initDropdowns();
    renderDashboard();
});

async function fetchData() {
    try {
        const [sumRes, arrRes, offRes, rotRes, uniRes, zoneRes] = await Promise.all([
            fetch('data/dashboard_summary.json').then(r => r.json()),
            fetch('data/arrears.json').then(r => r.json()),
            fetch('data/no_officers.json').then(r => r.json()),
            fetch('data/rotary_no_sponsor.json').then(r => r.json()),
            fetch('data/unified_issues.json').then(r => r.json()),
            fetch('data/zone_summary.json').then(r => r.json())
        ]);
        dashboardData = sumRes;
        arrearsData = arrRes;
        noOfficersData = offRes;
        rotaryData = rotRes;
        unifiedData = uniRes;
        zoneData = zoneRes;
        
        document.getElementById('last-updated').innerText = 'Last Updated: 31st July 2026';
    } catch (e) {
        console.error("Error fetching data:", e);
        alert("Failed to load dashboard data. Ensure you run generate_dashboard_data.js first.");
    }
}

function initDropdowns() {
    const zones = Object.keys(dashboardData.current.zones).sort();
    
    tsZone = new TomSelect('#zone-filter', {
        options: zones.map(z => ({ value: z, text: z })),
        plugins: ['remove_button'],
        placeholder: 'Select Zones...',
        onChange: function() {
            updateDistrictDropdown();
            renderDashboard();
        }
    });

    tsDistrict = new TomSelect('#district-filter', {
        valueField: 'value',
        labelField: 'text',
        searchField: 'text',
        plugins: ['remove_button'],
        placeholder: 'Select Districts...',
        onChange: function() {
            renderDashboard();
        }
    });
    
    updateDistrictDropdown();
}

function updateDistrictDropdown() {
    const selectedZones = tsZone.getValue();
    let districts = [];
    
    if (selectedZones.length === 0) {
        Object.values(dashboardData.current.zones).forEach(z => {
            districts = districts.concat(Object.keys(z.districts));
        });
    } else {
        selectedZones.forEach(z => {
            if (dashboardData.current.zones[z]) {
                districts = districts.concat(Object.keys(dashboardData.current.zones[z].districts));
            }
        });
    }
    
    tsDistrict.clearOptions();
    tsDistrict.addOptions(districts.sort().map(d => ({ value: d, text: `District ${d}` })));
}

// 1. Get raw filtered arrays based on ALL active filters (dropdowns + chart clicks)
function getFilteredRawData(excludeKey = null) {
    const selectedZones = tsZone.getValue();
    const selectedDistricts = tsDistrict.getValue();
    
    let fArrears = [...arrearsData];
    let fOfficers = [...noOfficersData];
    let fRotary = [...rotaryData];
    let fUnified = [...unifiedData];
    let fZone = [...zoneData];
    
    // Dropdown Filters
    if (selectedDistricts.length > 0) {
        fArrears = fArrears.filter(c => selectedDistricts.includes(c['District']));
        fOfficers = fOfficers.filter(c => selectedDistricts.includes(c['District']));
        fRotary = fRotary.filter(c => selectedDistricts.includes(c['District']));
        fUnified = fUnified.filter(c => selectedDistricts.includes(c.district));
        fZone = fZone.filter(c => selectedDistricts.includes(c['RI District'].toString()));
    } else if (selectedZones.length > 0) {
        fArrears = fArrears.filter(c => selectedZones.includes(c['RI Zone']));
        fOfficers = fOfficers.filter(c => selectedZones.includes(c['RI Zone']));
        fRotary = fRotary.filter(c => selectedZones.includes(c['RI Zone']));
        fUnified = fUnified.filter(c => selectedZones.includes(c.zone));
        fZone = fZone.filter(c => selectedZones.includes(c['RI Zone']));
    }

    // Chart Cross-Filters
    if (activeChartFilters['district'] && excludeKey !== 'district') {
        const d = activeChartFilters['district'];
        fArrears = fArrears.filter(c => c['District'] == d);
        fOfficers = fOfficers.filter(c => c['District'] == d);
        fRotary = fRotary.filter(c => c['District'] == d);
        fUnified = fUnified.filter(c => c.district == d);
        fZone = fZone.filter(c => c['RI District'].toString() == d);
    }
    
    if (activeChartFilters['baseType'] && excludeKey !== 'baseType') {
        const b = activeChartFilters['baseType'];
        fArrears = fArrears.filter(c => c['Club Base'] && c['Club Base'].includes(b));
        fUnified = fUnified.filter(c => c.base && c.base.includes(b));
    }
    
    if (activeChartFilters['arrearsType'] && excludeKey !== 'arrearsType') {
        if (activeChartFilters['arrearsType'] === 'At Risk ($75+)') {
            fArrears = fArrears.filter(c => c[' USD Outstanding '] >= 75);
            fUnified = fUnified.filter(c => c.isAtRisk);
        } else {
            fArrears = fArrears.filter(c => c[' USD Outstanding '] < 75);
            fUnified = fUnified.filter(c => c.isArrears && !c.isAtRisk);
        }
    }
    
    return { fArrears, fOfficers, fRotary, fUnified, fZone };
}

// 2. Get high-level static metrics (Total Clubs, Total Rotary, Trends) 
function getStaticMetrics() {
    const selectedZones = tsZone.getValue();
    const selectedDistricts = tsDistrict.getValue();
    
    let curr = JSON.parse(JSON.stringify(dashboardData.current.overall));
    let prev = JSON.parse(JSON.stringify(dashboardData.previous.overall));
    
    const zeroObj = (obj) => { for(let k in obj) if(typeof obj[k] === 'number') obj[k] = 0; };
    
    if (selectedDistricts.length > 0) {
        zeroObj(curr); zeroObj(prev);
        selectedDistricts.forEach(d => {
            const zId = Object.keys(dashboardData.current.zones).find(z => dashboardData.current.zones[z].districts[d]);
            if (zId) {
                const cDist = dashboardData.current.zones[zId].districts[d];
                const pDist = dashboardData.previous.zones[zId].districts[d];
                for (let k in cDist) curr[k] += cDist[k];
                for (let k in pDist) prev[k] += pDist[k];
            }
        });
    } else if (selectedZones.length > 0) {
        zeroObj(curr); zeroObj(prev);
        selectedZones.forEach(z => {
            if (dashboardData.current.zones[z]) {
                const cZone = dashboardData.current.zones[z].stats;
                const pZone = dashboardData.previous.zones[z].stats;
                for (let k in cZone) curr[k] += cZone[k];
                for (let k in pZone) prev[k] += pZone[k];
            }
        });
    }
    return { curr, prev };
}

function renderDashboard() {
    const { fArrears, fOfficers, fRotary, fZone } = getFilteredRawData();
    const { curr: staticCurr, prev: staticPrev } = getStaticMetrics();
    
    const isDeepFiltered = activeChartFilters['baseType'] || activeChartFilters['arrearsType'] || activeChartFilters['district'];
    
    let kpiCurr = {}, kpiPrev = {};
    if (isDeepFiltered) {
        // Dynamic KPIs for deep dive (trends disabled)
        kpiCurr.outstanding = fArrears.reduce((sum, c) => sum + (parseFloat(c[' USD Outstanding ']) || 0), 0);
        kpiCurr.arrearsClubs = fArrears.length;
        kpiCurr.atRisk = fArrears.filter(c => c[' USD Outstanding '] >= 75).length;
        kpiCurr.noOfficers = fOfficers.length;
    } else {
        // Static KPIs for full trends
        kpiCurr = staticCurr;
        kpiPrev = staticPrev;
    }
    
    const elValTotal = document.getElementById('val-total');
    if (isDeepFiltered) {
        elValTotal.innerText = "Filtered View";
        elValTotal.style.fontSize = "20px";
        elValTotal.style.color = "var(--text-muted)";
    } else {
        elValTotal.innerText = numberFormatter.format(staticCurr.totalClubs || 0);
        elValTotal.style.fontSize = "34px";
        elValTotal.style.color = "var(--text-main)";
    }
    
    updateTrendMetric('outstanding', kpiCurr.outstanding || 0, kpiPrev.outstanding || 0, true, isDeepFiltered);
    updateTrendMetric('arrears', kpiCurr.arrearsClubs || 0, kpiPrev.arrearsClubs || 0, false, isDeepFiltered);
    updateTrendMetric('atrisk', kpiCurr.atRisk || 0, kpiPrev.atRisk || 0, false, isDeepFiltered);
    updateTrendMetric('officers', kpiCurr.noOfficers || 0, kpiPrev.noOfficers || 0, false, isDeepFiltered);
    
    // Rotary Penetration Metrics (unaffected by deep cross-filtering)
    const totRotary = staticCurr.totalRotary || 0;
    const rotSponsor = staticCurr.rotaryWithSponsor || 0;
    const rotNoSponsor = staticCurr.rotaryWithoutSponsor || 0;
    
    document.getElementById('val-rotary').innerText = numberFormatter.format(totRotary);
    document.getElementById('val-rotary-sponsor').innerText = numberFormatter.format(rotSponsor);
    document.getElementById('val-rotary-no-sponsor').innerText = numberFormatter.format(rotNoSponsor);
    
    let penGood = totRotary > 0 ? (rotSponsor / totRotary) : 0;
    let penBad = totRotary > 0 ? (rotNoSponsor / totRotary) : 0;
    
    document.getElementById('val-rotary-pen-good').innerText = `${pctFormatter.format(penGood)} Penetration`;
    document.getElementById('val-rotary-pen-bad').innerText = `${pctFormatter.format(penBad)} Missed Opportunity`;
    
    renderActiveFilterBadges();
    renderCharts();
    renderTables(fArrears, fOfficers, fRotary, fZone);
}

function updateTrendMetric(id, currVal, prevVal, isCurrency, hideTrend) {
    const elVal = document.getElementById(`val-${id}`);
    const elDelta = document.getElementById(`delta-${id}`);
    
    elVal.innerText = isCurrency ? currencyFormatter.format(currVal) : numberFormatter.format(currVal);
    
    if (hideTrend) {
        elDelta.style.display = 'none';
        return;
    }
    
    elDelta.style.display = 'inline-flex';
    const diff = currVal - prevVal;
    if (diff === 0) {
        elDelta.innerText = "No change vs July 7";
        elDelta.className = "trend neutral";
    } else {
        const arrow = diff > 0 ? '↑' : '↓';
        const cssClass = diff < 0 ? 'positive' : 'negative';
        
        let pct = prevVal > 0 ? (Math.abs(diff) / prevVal) : 0;
        const formattedDiff = isCurrency ? currencyFormatter.format(Math.abs(diff)) : numberFormatter.format(Math.abs(diff));
        
        elDelta.innerText = `${arrow} ${formattedDiff} (${pctFormatter.format(pct)})`;
        elDelta.className = `trend ${cssClass}`;
    }
}

// --- Chart Interactions & Rendering ---

function setChartFilter(key, value) {
    if (activeChartFilters[key] === value) {
        delete activeChartFilters[key]; // toggle off
    } else {
        activeChartFilters[key] = value;
    }
    renderDashboard();
}

function renderActiveFilterBadges() {
    const container = document.getElementById('active-filters');
    container.innerHTML = '';
    
    Object.entries(activeChartFilters).forEach(([key, val]) => {
        const badge = document.createElement('div');
        badge.className = 'filter-badge';
        badge.innerHTML = `${val} <span class="close">×</span>`;
        badge.onclick = () => { delete activeChartFilters[key]; renderDashboard(); };
        container.appendChild(badge);
    });
}

function renderCharts() {
    // Isolate datasets for each chart so they don't filter themselves to 0
    const { fUnified: uForSev } = getFilteredRawData('arrearsType');
    const { fUnified: uForBase } = getFilteredRawData('baseType');
    
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    const ctxArrBase = document.getElementById('chartBaseArrears').getContext('2d');
    const ctxOffBase = document.getElementById('chartBaseOfficers').getContext('2d');
    if (doughnutChartInstance) doughnutChartInstance.destroy();
    if (chartBaseArrears) chartBaseArrears.destroy();
    if (chartBaseOfficers) chartBaseOfficers.destroy();

    // 1. Doughnut: Arrears Severity
    const atRiskCount = uForSev.filter(c => c.isAtRisk).length;
    const stdCount = uForSev.filter(c => c.isArrears && !c.isAtRisk).length;
    const totalSev = atRiskCount + stdCount;
    const atRiskPct = totalSev ? ((atRiskCount / totalSev) * 100).toFixed(1) : 0;
    const stdPct = totalSev ? ((stdCount / totalSev) * 100).toFixed(1) : 0;
    
    const dLabels = ['At Risk ($75+)', 'Standard Arrears (<$75)'];
    const dDisplayLabels = [`At Risk (${atRiskPct}%)`, `Standard (${stdPct}%)`];
    const dColors = ['#d93025', '#1a73e8'];
    const dAlphaColors = ['rgba(217,48,37,0.1)', 'rgba(26,115,232,0.1)']; 
    const activeArrearsType = activeChartFilters['arrearsType'];
    
    doughnutChartInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: dDisplayLabels,
            datasets: [{
                data: [atRiskCount, stdCount],
                backgroundColor: dLabels.map((l, i) => activeArrearsType && activeArrearsType !== l ? dAlphaColors[i] : dColors[i]),
                borderWidth: 2, borderColor: '#ffffff'
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: { legend: { position: 'bottom' } },
            onClick: (evt, elements) => {
                if (elements.length > 0) setChartFilter('arrearsType', dLabels[elements[0].index]);
            }
        }
    });

    // 2. Doughnut: Base Type Analysis
    const uArr = uForBase.filter(c => c.base && c.base.includes('University') && c.isArrears).length;
    const cArr = uForBase.filter(c => c.base && c.base.includes('Community') && c.isArrears).length;
    const totalArr = uArr + cArr;
    const uArrPct = totalArr ? ((uArr / totalArr) * 100).toFixed(1) : 0;
    const cArrPct = totalArr ? ((cArr / totalArr) * 100).toFixed(1) : 0;
    const bArrLabels = [`University (${uArrPct}%)`, `Community (${cArrPct}%)`];
    
    const uOff = uForBase.filter(c => c.base && c.base.includes('University') && c.isNoOfficers).length;
    const cOff = uForBase.filter(c => c.base && c.base.includes('Community') && c.isNoOfficers).length;
    const totalOff = uOff + cOff;
    const uOffPct = totalOff ? ((uOff / totalOff) * 100).toFixed(1) : 0;
    const cOffPct = totalOff ? ((cOff / totalOff) * 100).toFixed(1) : 0;
    const bOffLabels = [`University (${uOffPct}%)`, `Community (${cOffPct}%)`];
    
    const bLabels = ['University', 'Community'];
    const bColors = ['#1a73e8', '#1e8e3e']; 
    const bAlphaColors = ['rgba(26,115,232,0.1)', 'rgba(30,142,62,0.1)'];
    const activeBase = activeChartFilters['baseType'];
    
    const baseOpt = { 
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'bottom' } },
        onClick: (evt, elements) => {
            if (elements.length > 0) setChartFilter('baseType', bLabels[elements[0].index]);
        }
    };

    chartBaseArrears = new Chart(ctxArrBase, { 
        type: 'doughnut', 
        data: { labels: bArrLabels, datasets: [{ data: [uArr, cArr], backgroundColor: bLabels.map((l,i) => activeBase && activeBase !== l ? bAlphaColors[i] : bColors[i]), borderWidth: 2, borderColor: '#fff' }] }, 
        options: baseOpt 
    });
    
    chartBaseOfficers = new Chart(ctxOffBase, { 
        type: 'doughnut', 
        data: { labels: bOffLabels, datasets: [{ data: [uOff, cOff], backgroundColor: bLabels.map((l,i) => activeBase && activeBase !== l ? bAlphaColors[i] : bColors[i]), borderWidth: 2, borderColor: '#fff' }] }, 
        options: baseOpt 
    });
}

function renderTables(fArrears, fOfficers, fRotary, fZone) {
    const formatPct = (val) => {
        if (!val) return '0.0%';
        const num = parseFloat(val);
        return isNaN(num) ? '0.0%' : (num * 100).toFixed(1) + '%';
    };

    const distTableData = fZone.map(c => [
        String(c['RI Zone'] || ''), 
        String(c['RI District'] || ''), 
        Number(c['Total Clubs'] || 0), 
        `${c['TotalClubsArrears'] || 0} (${formatPct(c['% Clubs Arrears'])})`, 
        `${c['75PlusClubs'] || 0} (${formatPct(c['% 75PlusClubs'])})`, 
        currencyFormatter.format(Number(c['TotalUSD']) || 0),
        `${c['No Officer Total'] || 0} (${formatPct(c['% No Officer'])})`,
        Number(c['Rotary without Rotaract Club'] || 0)
    ]);
    const arrTableData = fArrears.map(c => [
        String(c['RI Zone'] || ''), 
        String(c['District'] || ''), 
        String(c['Club Name'] || ''), 
        String(c['Club Base'] || 'Unknown'), 
        Number(c['Billable Member Count'] || 0), 
        currencyFormatter.format(Number(c[' USD Outstanding ']) || 0)
    ]);
    const offTableData = fOfficers.map(c => [
        String(c['RI Zone'] || ''), 
        String(c['District'] || ''), 
        String(c['Rotaract Club Name'] || ''), 
        String(c['Rotaract Role'] || ''), 
        String(c['Name'] || ''), 
        String(c['Email'] || '')
    ]);
    const rotTableData = fRotary.map(c => [
        String(c['RI Zone'] || ''), 
        String(c['District'] || ''), 
        String(c['Club Name'] || ''), 
        String(c['Club Status'] || ''), 
        Number(c['Current Member Count'] || 0)
    ]);

    const numericCompare = (a, b) => {
        const getNum = (v) => {
            if (typeof v === 'number') return v;
            if (!v) return 0;
            const s = String(v).replace(/,/g, '').match(/-?[\d\.]+/);
            return s ? parseFloat(s[0]) : 0;
        };
        const nA = getNum(a), nB = getNum(b);
        return nA > nB ? 1 : (nA < nB ? -1 : 0);
    };

    const arrCols = [{name:"Zone", sort:{compare:numericCompare}}, {name:"District", sort:{compare:numericCompare}}, "Club Name", "Base", "Members", {name:"Outstanding", sort:{compare:numericCompare}}];
    const offCols = [{name:"Zone", sort:{compare:numericCompare}}, {name:"District", sort:{compare:numericCompare}}, "Club Name", "Rotaract Role", "Name", "Email"];
    const distCols = [{name:"Zone", sort:{compare:numericCompare}}, {name:"District", sort:{compare:numericCompare}}, "Total Clubs", {name:"Clubs in Arrears", sort:{compare:numericCompare}}, {name:"At Risk ($75+)", sort:{compare:numericCompare}}, {name:"Total Outstanding", sort:{compare:numericCompare}}, {name:"Unreported Officers", sort:{compare:numericCompare}}, "Rotary w/o Sponsor"];
    const rotCols = [{name:"Zone", sort:{compare:numericCompare}}, {name:"District", sort:{compare:numericCompare}}, "Rotary Club Name", "Status", "Members"];

    if (!arrearsGrid) {
        arrearsGrid = new gridjs.Grid({
            columns: arrCols,
            data: arrTableData, search: true, sort: true, pagination: { limit: 10 }
        }).render(document.getElementById("arrears-table-container"));
    } else { arrearsGrid.updateConfig({ data: arrTableData }).forceRender(); }
    
    if (!officersGrid) {
        officersGrid = new gridjs.Grid({
            columns: offCols,
            data: offTableData, search: true, sort: true, pagination: { limit: 10 }
        }).render(document.getElementById("officers-table-container"));
    } else { officersGrid.updateConfig({ data: offTableData }).forceRender(); }
    
    if (tableDistrict) {
        tableDistrict.updateConfig({ data: distTableData }).forceRender();
    } else {
        tableDistrict = new gridjs.Grid({
            columns: distCols,
            data: distTableData,
            sort: true, search: true, pagination: { enabled: true, limit: 10 },
            style: { table: { width: '100%' } },
            className: { th: 'gridjs-th', td: 'gridjs-td' }
        }).render(document.getElementById("district-table-container"));
    }
    
    if (!rotaryGrid) {
        rotaryGrid = new gridjs.Grid({
            columns: rotCols,
            data: rotTableData, search: true, sort: true, pagination: { limit: 10 }
        }).render(document.getElementById("rotary-table-container"));
    } else { rotaryGrid.updateConfig({ data: rotTableData }).forceRender(); }

    generateCsvDownload(fArrears, "btn-dl-arrears", `filtered_arrears.csv`);
    generateCsvDownload(fOfficers, "btn-dl-officers", `filtered_officers.csv`);
    generateCsvDownload(fRotary, "btn-dl-rotary", `filtered_rotary_no_sponsor.csv`);
}

function generateCsvDownload(jsonData, btnId, filename) {
    const btn = document.getElementById(btnId);
    if (!jsonData || jsonData.length === 0) {
        btn.href = '#';
        btn.onclick = (e) => { e.preventDefault(); alert('No data to download.'); };
        return;
    }
    const headers = Object.keys(jsonData[0]).join(',') + '\\n';
    const rows = jsonData.map(row => 
        Object.values(row).map(val => {
            let str = (val === null || val === undefined) ? '' : val.toString();
            if (str.includes(',') || str.includes('"') || str.includes('\\n')) str = `"${str.replace(/"/g, '""')}"`;
            return str;
        }).join(',')
    ).join('\\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    btn.href = URL.createObjectURL(blob);
    btn.download = filename;
    btn.onclick = null;
}
