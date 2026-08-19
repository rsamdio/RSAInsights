import { getDistrictData, getUnifiedIssues, getZoneSummary, getArrears, getNoOfficers, getRotaryNoSponsor, getRotaryNoInteract, getDashboardSummary, getDistrictOfficers, getNewClubs, getTRFContributions, getAllClubs } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import DistrictTable from '@/components/tables/DistrictTable';
import GlobalTables from '@/components/tables/GlobalTables';
import BarChart from '@/components/charts/BarChart';
import ClubLeaderboardsSection from '@/components/sections/ClubLeaderboardsSection';

export async function generateMetadata({ params }) {
    const { districtId } = await params;
    return {
        title: `District ${districtId} Insights`,
    };
}

export default async function DistrictPage({ params }) {
    const { districtId } = await params;
    const districtData = await getDistrictData(districtId);
    
    if (!districtData) return <div style={{ padding: '20px' }}>District {districtId} not found.</div>;
    
    const stats = districtData.stats;
    const allIssues = await getUnifiedIssues();
    
    // Filter clubs for this district
    const districtClubs = allIssues.filter(c => c.district.toString() === districtId.toString());

    const penGood = stats.totalRotary ? Math.round((stats.rotaryWithSponsor / stats.totalRotary) * 100) : 0;
    const penBad = stats.totalRotary ? Math.round((stats.rotaryWithoutSponsor / stats.totalRotary) * 100) : 0;

    const allZoneTableData = await getZoneSummary() || [];
    const allArrearsData = await getArrears() || [];
    const allOfficersData = await getNoOfficers() || [];
    const allRotaryData = await getRotaryNoSponsor() || [];
    const allRotaryNoInteractData = await getRotaryNoInteract() || [];
    const allNewClubs = await getNewClubs() || [];
    const allTrfData = await getTRFContributions() || [];
    const allClubsRoster = await getAllClubs() || [];

    const prevSummary = await getDashboardSummary();
    let prevDistrictStats = null;
    
    if (prevSummary && prevSummary.previous && prevSummary.previous.zones) {
        Object.keys(prevSummary.previous.zones).forEach(z => {
            if (prevSummary.previous.zones[z].districts && prevSummary.previous.zones[z].districts[districtId]) {
                prevDistrictStats = prevSummary.previous.zones[z].districts[districtId];
            }
        });
    }

    const getDelta = (key, format = 'number') => {
        if (!prevDistrictStats || (!prevDistrictStats[key] && prevDistrictStats[key] !== 0)) return null;
        const diff = stats[key] - prevDistrictStats[key];
        if (diff === 0) return null;
        
        const pct = prevDistrictStats[key] ? Math.abs((diff / prevDistrictStats[key]) * 100).toFixed(1) : 0;
        const isGood = key === 'totalClubs' || key === 'totalMembers' || key === 'totalRotary' || key === 'totalInteractClubs' ? diff > 0 : diff < 0; 
        
        const arrow = diff > 0 ? '↑' : '↓';
        const absDiff = Math.abs(diff);
        const diffStr = format === 'usd' ? `$${absDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : absDiff.toLocaleString();

        const textStr = `${arrow} ${diffStr} (${pct}%)`;
        return { text: textStr, type: isGood ? 'positive' : 'negative', baseline: 'vs July 1' };
    };

    const zoneTableData = allZoneTableData.filter(z => z['RI District'].toString() === districtId.toString());
    const arrearsData = allArrearsData.filter(c => c.District.toString() === districtId.toString());
    const officersData = allOfficersData.filter(c => c.District.toString() === districtId.toString());
    const rotaryData = allRotaryData.filter(c => c.District.toString() === districtId.toString());
    const rotaryNoInteractData = allRotaryNoInteractData.filter(c => c.District.toString() === districtId.toString());
    const newClubsData = allNewClubs.filter(c => c.District.toString() === districtId.toString());
    const trfData = allTrfData.filter(c => c.District.toString() === districtId.toString());
    const allClubsData = allClubsRoster.filter(c => c.District.toString() === districtId.toString());
    
    const allOfficersList = await getDistrictOfficers() || [];
    const distLeadership = allOfficersList.find(r => r.District.toString() === districtId.toString());

    const atRiskUniv = arrearsData.filter(c => Number(c[' USD Outstanding '] || 0) >= 75 && (c['Club Base'] || '').toLowerCase().includes('university')).length;
    const atRiskComm = arrearsData.filter(c => Number(c[' USD Outstanding '] || 0) >= 75 && (c['Club Base'] || '').toLowerCase().includes('community')).length;

    const demographicsBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Total Clubs',
            data: [stats.totalUniv, stats.totalComm],
            backgroundColor: ['#1a73e8', '#1e8e3e'],
            borderRadius: 6
        }]
    };

    const membersBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Total Members',
            data: [stats.membersUniv, stats.membersComm],
            backgroundColor: ['#1a73e8', '#f9ab00'],
            borderRadius: 6
        }]
    };

    const trfFundChart = {
        labels: ['Annual', 'PolioPlus', 'Endowment', 'Other'],
        datasets: [{
            label: 'Contributions (USD)',
            data: [stats.trfAnnualUSD, stats.trfPolioUSD, stats.trfEndowmentUSD, stats.trfOtherUSD],
            backgroundColor: ['#1a73e8', '#d93025', '#9c27b0', '#00acc1'],
            borderRadius: 6
        }]
    };

    const arrearsBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Clubs in Arrears',
            data: [stats.arrUniv, stats.arrComm],
            backgroundColor: ['#1a73e8', '#f9ab00'],
            borderRadius: 6
        }]
    };

    const officersBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Clubs missing Officers',
            data: [stats.noOffUniv, stats.noOffComm],
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

    const avgMembers = stats.totalClubs > 0 ? (stats.totalMembers / stats.totalClubs) : 0;
    const prevAvgMembers = prevDistrictStats?.totalClubs > 0 ? (prevDistrictStats.totalMembers / prevDistrictStats.totalClubs) : 0;
    
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

    const activeInteract = (stats.totalInteractClubs || 0) - (stats.suspendedInteractClubs || 0);
    const activeInteractPct = stats.totalInteractClubs > 0 ? Math.round((activeInteract / stats.totalInteractClubs) * 100) : 0;
    const rotaractSponsorPct = stats.totalClubs > 0 ? ((stats.rotaractWithInteract / stats.totalClubs) * 100).toFixed(1) : 0;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Link href={`/zone/${districtData.zone.replace('Zone ', '')}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to {districtData.zone}
                </Link>
                <h2 className="section-title" style={{ margin: 0 }}>Executive Summary - District {districtId}</h2>
            </div>
            
            {distLeadership && (
                <div className="card" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(to bottom right, #e8f0fe, #fff)', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ textAlign: 'center', paddingBottom: '15px', borderBottom: '1px solid #d2e3fc' }}>
                        <span style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: 600 }}>District Governor (DG)</span>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '5px' }}>{distLeadership['DG'] || 'Unknown'}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                        <div>
                            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: 600 }}>District Rotaract Representative (DRR)</span>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '5px' }}>{distLeadership['DRR'] || 'Unknown'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: 600 }}>District Rotaract Committee Chair (DRC)</span>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '5px' }}>{distLeadership['DRC'] || 'Unknown'}</div>
                        </div>
                    </div>
                </div>
            )}
            
            <section className="metrics-grid three-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Total Rotaract Clubs" value={stats.totalClubs?.toLocaleString()} trend={getDelta('totalClubs')} />
                <MetricCard title="Total Members" value={stats.totalMembers?.toLocaleString()} trend={getDelta('totalMembers')} />
                <MetricCard title="Average Membership" value={avgMembers.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} trend={avgDelta} />
                <MetricCard title="New Chartered Clubs" value={stats.newTotalClubs?.toLocaleString()} />
                <MetricCard title="Clubs w/ TRF Contribution" value={stats.trfClubs?.toLocaleString()} />
                <MetricCard title="Total TRF Contributions" value={`$${stats.trfContributionsUSD?.toLocaleString()}`} />
            </section>

            <h2 className="section-title">Demographics & Foundation Breakdown</h2>
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={demographicsBaseChart} title="Total Clubs by Base Type" />
                <BarChart data={membersBaseChart} title="Total Members by Base Type" />
                <BarChart data={trfFundChart} title="TRF Contributions by Fund (USD)" />
            </section>

            <h2 className="section-title">Rotary-Rotaract Integration</h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Rotary Clubs" value={stats.totalRotary?.toLocaleString() || '0'} trend={getDelta('totalRotary')} />
                <MetricCard title="Rotary with Sponsored Rotaract" value={stats.rotaryWithSponsor?.toLocaleString() || '0'} trend={{text: `${penGood}% Integration`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Sponsored Rotaract" value={stats.rotaryWithoutSponsor?.toLocaleString() || '0'} trend={{text: `${penBad}% Missed Opportunity`, type: 'negative'}} isWarning={true} />
            </section>

            <h2 className="section-title">Interact Ecosystem</h2>
            <section className="metrics-grid four-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Interact Clubs" value={stats.totalInteractClubs?.toLocaleString() || '0'} trend={getDelta('totalInteractClubs')} />
                <MetricCard title="Active Interact Clubs" value={activeInteract.toLocaleString()} trend={{text: `${activeInteractPct}% Active Rate`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Interact Club" value={stats.rotaryWithoutInteract?.toLocaleString() || '0'} trend={stats.totalRotary ? {text: `${Math.round(((stats.rotaryWithoutInteract || 0) / stats.totalRotary) * 100)}% Opportunity`, type: 'negative'} : null} isWarning={true} />
                <MetricCard title="Rotaract Sponsoring Interact" value={stats.rotaractWithInteract?.toLocaleString() || '0'} trend={{text: `${rotaractSponsorPct}% of Rotaract Clubs`, type: 'positive'}} />
            </section>

            <h2 className="section-title">Compliance & Risks</h2>
            <section className="metrics-grid five-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Outstanding Dues" value={`$${stats.outstanding?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} trend={getDelta('outstanding', 'usd')} />
                <MetricCard title="Clubs in Arrears" value={stats.arrearsClubs?.toLocaleString()} trend={getDelta('arrearsClubs')} />
                <MetricCard title="Subject to Termination" value={stats.atRisk?.toLocaleString()} isWarning={true} trend={getDelta('atRisk')} />
                <MetricCard title="Unreported Officers" value={stats.noOfficers?.toLocaleString()} trend={getDelta('noOfficers')} />
                <MetricCard title="Suspended Interact" value={stats.suspendedInteractClubs?.toLocaleString() || '0'} trend={stats.totalInteractClubs ? {text: `${Math.round(((stats.suspendedInteractClubs || 0) / stats.totalInteractClubs) * 100)}% of Interact`, type: 'negative'} : null} isWarning={true} />
            </section>
            
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={termBaseChart} title="Subject to Termination by Base" />
                <BarChart data={arrearsBaseChart} title="Arrears by Base" />
                <BarChart data={officersBaseChart} title="Missing Officers by Base" />
            </section>
            
            <ClubLeaderboardsSection 
                allClubsData={allClubsData} 
                trfData={trfData} 
                arrearsData={arrearsData} 
            />
            
            <h2 className="section-title">Clubs with Issues in District {districtId}</h2>
            <DistrictTable districtClubs={districtClubs} />

            <h2 className="section-title" style={{ marginTop: '40px' }}>Deep Data Drilldown - District {districtId}</h2>
            <GlobalTables 
                zoneTableData={zoneTableData} 
                arrearsData={arrearsData} 
                officersData={officersData} 
                rotaryData={rotaryData} 
                rotaryNoInteractData={rotaryNoInteractData}
                newClubsData={newClubsData}
                trfData={trfData}
                allClubsData={allClubsData}
            />
        </div>
    );
}
