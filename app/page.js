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

    // Apply strict filtering if a zone or district is selected
    if (district) {
        // Find zone containing this district to filter everything else out
        let zoneStr = filteredZoneTableData.find(z => z['RI District'].toString() === district)?.['RI Zone'];
        if (zoneStr) {
            zoneStr = zoneStr.toString().startsWith('Zone') ? zoneStr : `Zone ${zoneStr}`;
            if (summary.current.zones[zoneStr]) {
                filteredZones = { [zoneStr]: summary.current.zones[zoneStr] };
            } else {
                filteredZones = {};
            }
        }
        filteredZoneTableData = filteredZoneTableData.filter(z => z['RI District'].toString() === district);
        filteredArrearsData = filteredArrearsData.filter(c => c.District.toString() === district);
        filteredOfficersData = filteredOfficersData.filter(c => c.District.toString() === district);
        filteredRotaryData = filteredRotaryData.filter(c => c.District.toString() === district);
        
        // Recompute overall for this specific district using the comprehensive zoneTableData row
        overall = {
            ...overall,
            totalClubs: filteredZoneTableData[0]?.['Total Clubs'] || 0,
            outstanding: filteredZoneTableData[0]?.TotalUSD || 0,
            arrearsClubs: filteredZoneTableData[0]?.TotalClubsArrears || 0,
            atRisk: filteredZoneTableData[0]?.['75PlusClubs'] || 0,
            noOfficers: filteredZoneTableData[0]?.['No Officer Total'] || 0,
            
            totalRotary: filteredZoneTableData[0]?.['Total Rotary Clubs'] || 0,
            rotaryWithSponsor: filteredZoneTableData[0]?.['Rotary with Rotaract Club'] || 0,
            rotaryWithoutSponsor: filteredZoneTableData[0]?.['Rotary without Rotaract Club'] || 0,
            
            arrUniv: filteredZoneTableData[0]?.ArrearsUnivesityClubs || 0,
            arrComm: filteredZoneTableData[0]?.ArrearsCommunityClubs || 0,
            noOffUniv: filteredZoneTableData[0]?.['No Officer University'] || 0,
            noOffComm: filteredZoneTableData[0]?.['No Officer Community'] || 0
        };
        prevOverall = {}; // Clear previous as we don't have historical district-level cuts in the JSON
    } else if (zone) {
        const fullZoneName = zone.startsWith('Zone') ? zone : `Zone ${zone}`;
        filteredZones = { [fullZoneName]: summary.current.zones[fullZoneName] };
        if (!summary.current.zones[fullZoneName]) filteredZones = {};
        
        filteredZoneTableData = filteredZoneTableData.filter(z => z['RI Zone'] === fullZoneName);
        filteredArrearsData = filteredArrearsData.filter(c => c['RI Zone'] === fullZoneName);
        filteredOfficersData = filteredOfficersData.filter(c => c['RI Zone'] === fullZoneName);
        filteredRotaryData = filteredRotaryData.filter(c => c['RI Zone'] === fullZoneName);
        
        // Recompute overall for zone
        const zStats = summary.current.zones[fullZoneName]?.stats || {};
        overall = {
            ...overall,
            totalClubs: zStats.totalClubs || 0,
            outstanding: zStats.outstanding || 0,
            arrearsClubs: zStats.arrearsClubs || 0,
            atRisk: zStats.atRisk || 0,
            noOfficers: zStats.noOfficers || 0,
            
            totalRotary: zStats.totalRotary || 0,
            rotaryWithSponsor: zStats.rotaryWithSponsor || 0,
            rotaryWithoutSponsor: zStats.rotaryWithoutSponsor || 0,
            
            arrUniv: zStats.arrUniv || 0,
            arrComm: zStats.arrComm || 0,
            noOffUniv: zStats.noOffUniv || 0,
            noOffComm: zStats.noOffComm || 0
        };
        prevOverall = {};
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

        return { text: textStr, type: isGood ? 'positive' : 'negative' };
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
