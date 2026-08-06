import { getDashboardSummary, getArrears, getNoOfficers, getRotaryNoSponsor, getZoneSummary } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import DoughnutChart from '@/components/charts/DoughnutChart';
import BarChart from '@/components/charts/BarChart';
import GlobalTables from '@/components/tables/GlobalTables';

export default async function GlobalDashboard({ searchParams }) {
    const { zone, district } = await searchParams;
    const summary = await getDashboardSummary();
    const arrearsData = await getArrears() || [];
    const officersData = await getNoOfficers() || [];
    const rotaryData = await getRotaryNoSponsor() || [];
    const zoneTableData = await getZoneSummary() || [];
    
    if (!summary) return <div>Error loading data. Run data generation script first.</div>;
    
    let overall = summary.current.overall;
    let prevOverall = summary.previous?.overall || {};
    let filteredZones = { ...summary.current.zones };
    let filteredZoneTableData = [...zoneTableData];
    let filteredArrearsData = [...arrearsData];
    let filteredOfficersData = [...officersData];
    let filteredRotaryData = [...rotaryData];

    const normalizeZoneName = (val) => val.toString().startsWith('Zone') ? val.toString() : `Zone ${val.toString()}`;
    const selectedDistricts = district ? district.split(',') : [];
    const selectedZones = zone ? zone.split(',') : [];

    // Apply strict filtering if a zone or district is selected
    if (selectedDistricts.length > 0) {
        filteredZoneTableData = filteredZoneTableData.filter(z => selectedDistricts.includes(z['RI District'].toString()));
        filteredArrearsData = filteredArrearsData.filter(c => selectedDistricts.includes(c.District.toString()));
        filteredOfficersData = filteredOfficersData.filter(c => selectedDistricts.includes(c.District.toString()));
        filteredRotaryData = filteredRotaryData.filter(c => selectedDistricts.includes(c.District.toString()));
        
        let zoneNames = Array.from(new Set(filteredZoneTableData.map(z => normalizeZoneName(z['RI Zone']))));
        filteredZones = {};
        zoneNames.forEach(zName => {
            if (summary.current.zones[zName]) {
                filteredZones[zName] = summary.current.zones[zName];
            }
        });
        
        // Recompute overall for these specific districts by summing rows
        overall = {
            ...overall,
            totalClubs: filteredZoneTableData.reduce((sum, row) => sum + (row['Total Clubs'] || 0), 0),
            outstanding: filteredZoneTableData.reduce((sum, row) => sum + (row.TotalUSD || 0), 0),
            arrearsClubs: filteredZoneTableData.reduce((sum, row) => sum + (row.TotalClubsArrears || 0), 0),
            atRisk: filteredZoneTableData.reduce((sum, row) => sum + (row['75PlusClubs'] || 0), 0),
            noOfficers: filteredZoneTableData.reduce((sum, row) => sum + (row['No Officer Total'] || 0), 0),
            
            totalRotary: filteredZoneTableData.reduce((sum, row) => sum + (row['Total Rotary Clubs'] || 0), 0),
            rotaryWithSponsor: filteredZoneTableData.reduce((sum, row) => sum + (row['Rotary with Rotaract Club'] || 0), 0),
            rotaryWithoutSponsor: filteredZoneTableData.reduce((sum, row) => sum + (row['Rotary without Rotaract Club'] || 0), 0),
            
            arrUniv: filteredZoneTableData.reduce((sum, row) => sum + (row.ArrearsUnivesityClubs || 0), 0),
            arrComm: filteredZoneTableData.reduce((sum, row) => sum + (row.ArrearsCommunityClubs || 0), 0),
            noOffUniv: filteredZoneTableData.reduce((sum, row) => sum + (row['No Officer University'] || 0), 0),
            noOffComm: filteredZoneTableData.reduce((sum, row) => sum + (row['No Officer Community'] || 0), 0)
        };
        // Compute prevOverall for filtered districts
        const dSet = new Set(selectedDistricts);
        let prevFilteredDistricts = [];
        
        Object.keys(summary.previous.zones).forEach(z => {
            Object.keys(summary.previous.zones[z].districts || {}).forEach(d => {
                if (dSet.has(d)) {
                    prevFilteredDistricts.push(summary.previous.zones[z].districts[d]);
                }
            });
        });
        
        prevOverall = {
            totalClubs: prevFilteredDistricts.reduce((sum, d) => sum + (d.totalClubs || 0), 0),
            outstanding: prevFilteredDistricts.reduce((sum, d) => sum + (d.outstanding || 0), 0),
            arrearsClubs: prevFilteredDistricts.reduce((sum, d) => sum + (d.arrearsClubs || 0), 0),
            atRisk: prevFilteredDistricts.reduce((sum, d) => sum + (d.atRisk || 0), 0),
            noOfficers: prevFilteredDistricts.reduce((sum, d) => sum + (d.noOfficers || 0), 0)
        };
    } else if (selectedZones.length > 0) {
        const formattedZones = selectedZones.map(normalizeZoneName);
        
        filteredZones = {};
        formattedZones.forEach(zName => {
            if (summary.current.zones[zName]) {
                filteredZones[zName] = summary.current.zones[zName];
            }
        });
        
        filteredZoneTableData = filteredZoneTableData.filter(z => formattedZones.includes(normalizeZoneName(z['RI Zone'])));
        filteredArrearsData = filteredArrearsData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredOfficersData = filteredOfficersData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredRotaryData = filteredRotaryData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        
        // Recompute overall for zones
        overall = {
            ...overall,
            totalClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalClubs || 0), 0),
            outstanding: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.outstanding || 0), 0),
            arrearsClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.arrearsClubs || 0), 0),
            atRisk: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.atRisk || 0), 0),
            noOfficers: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.noOfficers || 0), 0),
            
            totalRotary: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalRotary || 0), 0),
            rotaryWithSponsor: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaryWithSponsor || 0), 0),
            rotaryWithoutSponsor: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaryWithoutSponsor || 0), 0),
            
            arrUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.arrUniv || 0), 0),
            arrComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.arrComm || 0), 0),
            noOffUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.noOffUniv || 0), 0),
            noOffComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.noOffComm || 0), 0)
        };
        // Compute prevOverall for filtered zones
        let prevFilteredZones = [];
        formattedZones.forEach(zName => {
            if (summary.previous.zones[zName]) {
                prevFilteredZones.push(summary.previous.zones[zName]);
            }
        });
        
        prevOverall = {
            totalClubs: prevFilteredZones.reduce((sum, z) => sum + (z.stats.totalClubs || 0), 0),
            outstanding: prevFilteredZones.reduce((sum, z) => sum + (z.stats.outstanding || 0), 0),
            arrearsClubs: prevFilteredZones.reduce((sum, z) => sum + (z.stats.arrearsClubs || 0), 0),
            atRisk: prevFilteredZones.reduce((sum, z) => sum + (z.stats.atRisk || 0), 0),
            noOfficers: prevFilteredZones.reduce((sum, z) => sum + (z.stats.noOfficers || 0), 0)
        };
    }

    // --- Trend Computation Helpers ---
    const getDelta = (key, format = 'number') => {
        if (!prevOverall[key] && prevOverall[key] !== 0) return null; // No history available for this cut
        const diff = overall[key] - prevOverall[key];
        if (diff === 0) return null;
        
        const pct = prevOverall[key] ? Math.abs((diff / prevOverall[key]) * 100).toFixed(1) : 0;
        const isGood = key === 'totalClubs' ? diff > 0 : diff < 0; // Growth is good, arrears/dues are bad
        
        const arrow = diff > 0 ? '↑' : '↓';
        const absDiff = Math.abs(diff);
        const diffStr = format === 'usd' ? `$${absDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : absDiff.toLocaleString();

        const textStr = `${arrow} ${diffStr} (${pct}%)`;

        return { text: textStr, type: isGood ? 'positive' : 'negative', baseline: 'since 9 July' };
    };

    // --- Chart Data Preps ---
    const zoneLabels = Object.keys(filteredZones);
    const zoneArrears = zoneLabels.map(z => filteredZones[z]?.stats?.arrearsClubs || 0);
    
    const arrearsByZoneChart = {
        labels: zoneLabels,
        datasets: [{
            data: zoneArrears,
            backgroundColor: ['#1a73e8', '#1e8e3e', '#d93025', '#f9ab00', '#8e24aa', '#00acc1'],
            borderWidth: 0, hoverOffset: 10
        }]
    };

    const arrearsBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Clubs in Arrears',
            data: [overall.arrUniv, overall.arrComm],
            backgroundColor: ['#1a73e8', '#f9ab00'],
            borderRadius: 6
        }]
    };

    const officersBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Clubs missing Officers',
            data: [overall.noOffUniv, overall.noOffComm],
            backgroundColor: ['#d93025', '#8e24aa'],
            borderRadius: 6
        }]
    };

    // --- Rotary Penentration Logic ---
    const penGood = overall.totalRotary ? Math.round((overall.rotaryWithSponsor / overall.totalRotary) * 100) : 0;
    const penBad = overall.totalRotary ? Math.round((overall.rotaryWithoutSponsor / overall.totalRotary) * 100) : 0;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 className="section-title" style={{ marginTop: 0 }}>
                {district ? `Performance - District ${district}` : zone ? `Performance - ${zone}` : 'Overall Performance - South Asia'}
            </h2>
            <section className="metrics-grid five-cols">
                <MetricCard title="Total Rotaract Clubs" value={overall.totalClubs?.toLocaleString()} />
                <MetricCard title="Outstanding Dues" value={`$${overall.outstanding?.toLocaleString()}`} trend={getDelta('outstanding', 'usd')} />
                <MetricCard title="Clubs in Arrears" value={overall.arrearsClubs?.toLocaleString()} trend={getDelta('arrearsClubs')} />
                <MetricCard title="Subject to Termination" value={overall.atRisk?.toLocaleString()} isWarning={true} trend={getDelta('atRisk')} />
                <MetricCard title="Unreported Officers" value={overall.noOfficers?.toLocaleString()} trend={getDelta('noOfficers')} />
            </section>
            
            <h2 className="section-title">Rotary Sponsorship Penetration</h2>
            <section className="metrics-grid three-cols">
                <MetricCard title="Total Rotary Clubs" value={overall.totalRotary.toLocaleString()} />
                <MetricCard title="Rotary with Sponsored Rotaract" value={overall.rotaryWithSponsor.toLocaleString()} trend={{text: `${penGood}% Penetration`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Sponsored Rotaract" value={overall.rotaryWithoutSponsor.toLocaleString()} trend={{text: `${penBad}% Missed Opportunity`, type: 'negative'}} isWarning={true} />
            </section>

            <h2 className="section-title">Base Type Analysis (University vs Community)</h2>
            <section className="charts-grid two-cols">
                <BarChart data={arrearsBaseChart} title="Arrears by Base Type" />
                <BarChart data={officersBaseChart} title="No Officers by Base Type" />
            </section>

            <h2 className="section-title">Drill Down by Zone</h2>
            <section className="charts-grid two-cols">
                <DoughnutChart data={arrearsByZoneChart} title="Arrears Distribution by Zone" />
                
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h2>Zones Directory</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>
                        Click on a zone below to perform a deep-dive analysis into its districts and individual clubs.
                    </p>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {zoneLabels.map(zLabel => (
                            filteredZones[zLabel] && (
                                <Link 
                                    key={zLabel} 
                                    href={`/zone/${zLabel.replace('Zone ', '')}`}
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', padding: '15px', 
                                        border: '1px solid var(--border-color)', borderRadius: '8px',
                                        textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600,
                                        background: '#fafafa', transition: 'all 0.2s'
                                    }}
                                >
                                    <span>{zLabel}</span>
                                    <span>{filteredZones[zLabel].stats?.arrearsClubs || 0} Arrears →</span>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            </section>

            <h2 className="section-title">Deep Data Drilldown</h2>
            <section style={{ marginBottom: '40px' }}>
                <div className="card">
                    <GlobalTables 
                        zoneTableData={filteredZoneTableData} 
                        arrearsData={filteredArrearsData} 
                        officersData={filteredOfficersData} 
                        rotaryData={filteredRotaryData} 
                    />
                </div>
            </section>
        </div>
    );
}
