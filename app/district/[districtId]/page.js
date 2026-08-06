import { getDistrictData, getUnifiedIssues, getZoneSummary, getArrears, getNoOfficers, getRotaryNoSponsor, getDashboardSummary } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import DistrictTable from '@/components/tables/DistrictTable';
import GlobalTables from '@/components/tables/GlobalTables';

export async function generateMetadata({ params }) {
    const { districtId } = await params;
    return {
        title: `District ${districtId} Analytics`,
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
        const isGood = key === 'totalClubs' ? diff > 0 : diff < 0; 
        
        const arrow = diff > 0 ? '↑' : '↓';
        const absDiff = Math.abs(diff);
        const diffStr = format === 'usd' ? `$${absDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : absDiff.toLocaleString();

        return { text: `${arrow} ${diffStr} (${pct}%)`, type: isGood ? 'positive' : 'negative', baseline: 'since 9 July' };
    };

    const zoneTableData = allZoneTableData.filter(z => z['RI District'].toString() === districtId.toString());
    const arrearsData = allArrearsData.filter(c => c.District.toString() === districtId.toString());
    const officersData = allOfficersData.filter(c => c.District.toString() === districtId.toString());
    const rotaryData = allRotaryData.filter(c => c.District.toString() === districtId.toString());

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Link href={`/zone/${districtData.zone.replace('Zone ', '')}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to {districtData.zone}
                </Link>
                <h2 className="section-title" style={{ margin: 0 }}>District {districtId} Performance</h2>
            </div>
            
            <div className="metrics-grid five-cols">
                <MetricCard title="Total Rotaract Clubs" value={stats.totalClubs} trend={getDelta('totalClubs')} />
                <MetricCard title="Outstanding Dues" value={`$${stats.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} trend={getDelta('outstanding', 'usd')} />
                <MetricCard title="Clubs in Arrears" value={stats.arrearsClubs} trend={getDelta('arrearsClubs')} />
                <MetricCard title="Subject to Termination" value={stats.atRisk} isWarning trend={getDelta('atRisk')} />
                <MetricCard title="Unreported Officers" value={stats.noOfficers} trend={getDelta('noOfficers')} />
            </div>
            
            <h2 className="section-title">Rotary Sponsorship Penetration</h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Rotary Clubs" value={stats.totalRotary?.toLocaleString() || '0'} />
                <MetricCard title="Rotary with Sponsored Rotaract" value={stats.rotaryWithSponsor?.toLocaleString() || '0'} trend={{text: `${penGood}% Penetration`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Sponsored Rotaract" value={stats.rotaryWithoutSponsor?.toLocaleString() || '0'} trend={{text: `${penBad}% Missed Opportunity`, type: 'negative'}} isWarning={true} />
            </section>
            
            <h2 className="section-title">Clubs with Issues in District {districtId}</h2>
            <DistrictTable districtClubs={districtClubs} />

            <h2 className="section-title" style={{ marginTop: '40px' }}>Deep Data Drilldown - District {districtId}</h2>
            <GlobalTables 
                zoneTableData={zoneTableData} 
                arrearsData={arrearsData} 
                officersData={officersData} 
                rotaryData={rotaryData} 
            />
        </div>
    );
}
