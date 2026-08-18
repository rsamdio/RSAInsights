import { getDashboardSummary, getArrears, getNoOfficers, getRotaryNoSponsor, getZoneSummary, getAllClubs, getTRFContributions, getNewClubs } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import DoughnutChart from '@/components/charts/DoughnutChart';
import BarChart from '@/components/charts/BarChart';
import GlobalTables from '@/components/tables/GlobalTables';
import TopChartsSection from '@/components/sections/TopChartsSection';

export default async function GlobalDashboard({ searchParams }) {
    const { zone, district } = await searchParams;
    const summary = await getDashboardSummary();
    const arrearsData = await getArrears() || [];
    const officersData = await getNoOfficers() || [];
    const rotaryData = await getRotaryNoSponsor() || [];
    const zoneTableData = await getZoneSummary() || [];
    const allClubsData = await getAllClubs() || [];
    const trfData = await getTRFContributions() || [];
    
    if (!summary) return <div>Error loading data. Run data generation script first.</div>;
    
    let overall = summary.current.overall;
    let prevOverall = summary.previous?.overall || {};
    let filteredZones = { ...summary.current.zones };
    let filteredZoneTableData = zoneTableData;
    let filteredArrearsData = arrearsData;
    let filteredOfficersData = officersData;
    let filteredRotaryData = rotaryData;
    let filteredNewClubsData = await getNewClubs() || [];
    let filteredTrfData = trfData;
    let filteredAllClubsData = allClubsData;

    const normalizeZoneName = (val) => val.toString().startsWith('Zone') ? val.toString() : `Zone ${val.toString()}`;
    const selectedDistricts = district ? district.split(',') : [];
    const selectedZones = zone ? zone.split(',') : [];

    // Apply strict filtering if a zone or district is selected
    if (selectedDistricts.length > 0) {
        filteredZoneTableData = filteredZoneTableData.filter(z => selectedDistricts.includes(z['RI District'].toString()));
        filteredArrearsData = filteredArrearsData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredOfficersData = filteredOfficersData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredRotaryData = filteredRotaryData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredNewClubsData = filteredNewClubsData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredTrfData = filteredTrfData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredAllClubsData = filteredAllClubsData.filter(c => selectedDistricts.includes(c.District?.toString()));
        
        let zoneNames = Array.from(new Set(filteredZoneTableData.map(z => normalizeZoneName(z['RI Zone']))));
        filteredZones = {};
        zoneNames.forEach(zName => {
            if (summary.current.zones[zName]) {
                const zoneData = summary.current.zones[zName];
                const filteredDistrictsForZone = {};
                
                Object.keys(zoneData.districts || {}).forEach(d => {
                    if (selectedDistricts.includes(d)) {
                        filteredDistrictsForZone[d] = zoneData.districts[d];
                    }
                });

                filteredZones[zName] = {
                    ...zoneData,
                    districts: filteredDistrictsForZone
                };
            }
        });
        
        // Recompute overall for these specific districts by summing rows
        overall = {
            ...overall,
            totalClubs: filteredZoneTableData.reduce((sum, row) => sum + (row['Total Clubs'] || 0), 0),
            totalMembers: filteredZoneTableData.reduce((sum, row) => sum + (summary.current.zones[normalizeZoneName(row['RI Zone'])]?.districts[row['RI District']]?.totalMembers || 0), 0),
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
            noOffComm: filteredZoneTableData.reduce((sum, row) => sum + (row['No Officer Community'] || 0), 0),

            trfClubs: filteredZoneTableData.reduce((sum, row) => sum + (row['Clubs with Contribution'] || 0), 0),
            trfContributionsUSD: filteredZoneTableData.reduce((sum, row) => sum + (row['Total Contributions USD'] || 0), 0),
            trfAnnualUSD: filteredZoneTableData.reduce((sum, row) => sum + (row['Annual Fund Contribution USD'] || 0), 0),
            trfPolioUSD: filteredZoneTableData.reduce((sum, row) => sum + (row['PolioPlus Fund Contribution USD'] || 0), 0),
            trfOtherUSD: filteredZoneTableData.reduce((sum, row) => sum + (row['Other Funds Contribution USD'] || 0), 0),
            trfEndowmentUSD: filteredZoneTableData.reduce((sum, row) => sum + (row['Endowment Fund Contribution USD'] || 0), 0),
            newTotalClubs: filteredZoneTableData.reduce((sum, row) => sum + (row['NewTotalClubs'] || 0), 0),
            totalUniv: filteredZoneTableData.reduce((sum, row) => sum + (summary.current.zones[normalizeZoneName(row['RI Zone'])]?.districts[row['RI District']]?.totalUniv || 0), 0),
            totalComm: filteredZoneTableData.reduce((sum, row) => sum + (summary.current.zones[normalizeZoneName(row['RI Zone'])]?.districts[row['RI District']]?.totalComm || 0), 0),
            membersUniv: filteredZoneTableData.reduce((sum, row) => sum + (summary.current.zones[normalizeZoneName(row['RI Zone'])]?.districts[row['RI District']]?.membersUniv || 0), 0),
            membersComm: filteredZoneTableData.reduce((sum, row) => sum + (summary.current.zones[normalizeZoneName(row['RI Zone'])]?.districts[row['RI District']]?.membersComm || 0), 0)
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
            totalMembers: prevFilteredDistricts.reduce((sum, d) => sum + (d.totalMembers || 0), 0),
            totalRotary: prevFilteredDistricts.reduce((sum, d) => sum + (d.totalRotary || 0), 0),
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
        filteredNewClubsData = filteredNewClubsData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredTrfData = filteredTrfData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        // Note: allClubsData only has 'Zone' not 'RI Zone' usually, but let's check. Actually wait, let's just pass all or filter if 'Zone' matches.
        filteredAllClubsData = filteredAllClubsData.filter(c => c['Zone'] && formattedZones.includes(normalizeZoneName(c['Zone'])));
        
        // Recompute overall for zones
        overall = {
            ...overall,
            totalClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalClubs || 0), 0),
            totalMembers: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalMembers || 0), 0),
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
            noOffComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.noOffComm || 0), 0),

            trfClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfClubs || 0), 0),
            trfContributionsUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfContributionsUSD || 0), 0),
            trfAnnualUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfAnnualUSD || 0), 0),
            trfPolioUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfPolioUSD || 0), 0),
            trfOtherUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfOtherUSD || 0), 0),
            trfEndowmentUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfEndowmentUSD || 0), 0),
            newTotalClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.newTotalClubs || 0), 0),
            totalUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalUniv || 0), 0),
            totalComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalComm || 0), 0),
            membersUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.membersUniv || 0), 0),
            membersComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.membersComm || 0), 0)
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
            totalMembers: prevFilteredZones.reduce((sum, z) => sum + (z.stats.totalMembers || 0), 0),
            totalRotary: prevFilteredZones.reduce((sum, z) => sum + (z.stats.totalRotary || 0), 0),
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
        const isGood = key === 'totalClubs' || key === 'totalMembers' || key === 'totalRotary' ? diff > 0 : diff < 0; // Growth is good, arrears/dues are bad
        
        const arrow = diff > 0 ? '↑' : '↓';
        const absDiff = Math.abs(diff);
        const diffStr = format === 'usd' ? `$${absDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : absDiff.toLocaleString();

        const textStr = `${arrow} ${diffStr} (${pct}%)`;

        return { text: textStr, type: isGood ? 'positive' : 'negative', baseline: 'vs July 1' };
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

    const atRiskUniv = filteredArrearsData.filter(c => Number(c[' USD Outstanding '] || 0) >= 75 && (c['Club Base'] || '').toLowerCase().includes('university')).length;
    const atRiskComm = filteredArrearsData.filter(c => Number(c[' USD Outstanding '] || 0) >= 75 && (c['Club Base'] || '').toLowerCase().includes('community')).length;

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
    
    const termBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Subject to Termination',
            data: [atRiskUniv, atRiskComm],
            backgroundColor: ['#d93025', '#c5221f'],
            borderRadius: 6
        }]
    };

    const demographicsBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Total Clubs',
            data: [overall.totalUniv, overall.totalComm],
            backgroundColor: ['#1a73e8', '#1e8e3e'],
            borderRadius: 6
        }]
    };

    const membersBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Total Members',
            data: [overall.membersUniv, overall.membersComm],
            backgroundColor: ['#1a73e8', '#f9ab00'],
            borderRadius: 6
        }]
    };

    const trfFundChart = {
        labels: ['Annual', 'PolioPlus', 'Endowment', 'Other'],
        datasets: [{
            label: 'TRF Contributions (USD)',
            data: [overall.trfAnnualUSD, overall.trfPolioUSD, overall.trfEndowmentUSD, overall.trfOtherUSD],
            backgroundColor: ['#1a73e8', '#d93025', '#f9ab00', '#8e24aa'],
            borderRadius: 6
        }]
    };

    // --- Rotary Penentration Logic ---
    const penGood = overall.totalRotary ? Math.round((overall.rotaryWithSponsor / overall.totalRotary) * 100) : 0;
    const penBad = overall.totalRotary ? Math.round((overall.rotaryWithoutSponsor / overall.totalRotary) * 100) : 0;

    const avgMembers = overall.totalClubs > 0 ? (overall.totalMembers / overall.totalClubs) : 0;
    const prevAvgMembers = prevOverall?.totalClubs > 0 ? (prevOverall.totalMembers / prevOverall.totalClubs) : 0;
    
    let avgDelta = null;
    if (prevAvgMembers) {
        const diff = avgMembers - prevAvgMembers;
        if (diff !== 0) {
            const pct = Math.abs((diff / prevAvgMembers) * 100).toFixed(1);
            const isGood = diff > 0;
            const arrow = diff > 0 ? '↑' : '↓';
            const absDiff = Math.abs(diff);
            const diffStr = absDiff.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
            const textStr = `${arrow} ${diffStr} (${pct}%)`;
            avgDelta = { text: textStr, type: isGood ? 'positive' : 'negative', baseline: 'vs July 1' };
        }
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 className="section-title" style={{ marginTop: 0 }}>
                Executive Summary
            </h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Total Rotaract Clubs" value={overall.totalClubs?.toLocaleString()} trend={getDelta('totalClubs')} />
                <MetricCard title="Total Members" value={overall.totalMembers?.toLocaleString()} trend={getDelta('totalMembers')} />
                <MetricCard title="Average Membership" value={avgMembers.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} trend={avgDelta} />
                <MetricCard title="New Chartered Clubs" value={overall.newTotalClubs?.toLocaleString()} />
                <MetricCard title="Clubs w/ TRF Contribution" value={overall.trfClubs?.toLocaleString()} />
                <MetricCard title="Total TRF Contributions" value={`$${overall.trfContributionsUSD?.toLocaleString()}`} />
            </section>

            <h2 className="section-title">Demographics & Foundation Breakdown</h2>
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={demographicsBaseChart} title="Total Clubs by Base Type" />
                <BarChart data={membersBaseChart} title="Total Members by Base Type" />
                <BarChart data={trfFundChart} title="TRF Contributions by Fund (USD)" />
            </section>

            <h2 className="section-title">Rotary-Rotaract Integration</h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Rotary Clubs" value={overall.totalRotary?.toLocaleString()} trend={getDelta('totalRotary')} />
                <MetricCard title="Rotary with Sponsored Rotaract" value={overall.rotaryWithSponsor.toLocaleString()} trend={{text: `${penGood}% Integration`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Sponsored Rotaract" value={overall.rotaryWithoutSponsor.toLocaleString()} trend={{text: `${penBad}% Missed Opportunity`, type: 'negative'}} isWarning={true} />
            </section>

            <h2 className="section-title">Compliance & Risks</h2>
            <section className="metrics-grid four-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Outstanding Dues" value={`$${overall.outstanding?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} trend={getDelta('outstanding', 'usd')} />
                <MetricCard title="Clubs in Arrears" value={overall.arrearsClubs?.toLocaleString()} trend={getDelta('arrearsClubs')} />
                <MetricCard title="Subject to Termination" value={overall.atRisk?.toLocaleString()} isWarning={true} trend={getDelta('atRisk')} />
                <MetricCard title="Unreported Officers" value={overall.noOfficers?.toLocaleString()} trend={getDelta('noOfficers')} />
            </section>
            
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={termBaseChart} title="Subject to Termination by Base" />
                <BarChart data={arrearsBaseChart} title="Arrears by Base" />
                <BarChart data={officersBaseChart} title="Missing Officers by Base" />
            </section>

            <TopChartsSection summary={{ zones: filteredZones }} arrearsData={filteredArrearsData} allClubsData={filteredAllClubsData} trfData={filteredTrfData} />

            <section style={{ marginBottom: '40px' }}>
                <Link href="/worldwide" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--primary), #0a3a7a)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', color: 'white' }}>🌍 Rotaract Worldwide Statistics</h2>
                            <p style={{ margin: 0, opacity: 0.9 }}>View the Worldwide Rotaract Leaderboards and Statistics.</p>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Explore Statistics →</div>
                    </div>
                </Link>
            </section>

            <h2 className="section-title">Drill Down by Zone</h2>
            <section style={{ marginBottom: '40px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h2 style={{ margin: '0 0 5px 0' }}>Zones Directory</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, marginBottom: '15px' }}>
                        Click on a zone below to perform a deep-dive analysis into its districts and individual clubs.
                    </p>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {zoneLabels.map(zLabel => {
                            const zStats = filteredZones[zLabel]?.stats;
                            if (!zStats) return null;
                            return (
                                <Link 
                                    key={zLabel} 
                                    href={`/zone/${zLabel.replace('Zone ', '')}`}
                                    className="zone-dir-row"
                                >
                                    <span style={{ fontSize: '18px' }}>{zLabel}</span>
                                    <div className="zone-dir-stats">
                                        <span><strong>{zStats.totalClubs}</strong> Clubs</span>
                                        <span><strong>{zStats.totalMembers}</strong> Members</span>
                                        <span><strong>${zStats.trfContributionsUSD?.toLocaleString()}</strong> TRF</span>
                                        <span style={{ color: zStats.arrearsClubs > 0 ? 'var(--danger)' : 'var(--success)' }}><strong>{zStats.arrearsClubs}</strong> Arrears</span>
                                        <span style={{ color: 'var(--primary)', marginLeft: '10px' }}>Explore →</span>
                                    </div>
                                </Link>
                            )
                        })}
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
                        newClubsData={filteredNewClubsData}
                        trfData={filteredTrfData}
                        allClubsData={filteredAllClubsData}
                    />
                </div>
            </section>
        </div>
    );
}
