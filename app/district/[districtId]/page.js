import { getDistrictData, getUnifiedIssues } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import DistrictTable from '@/components/tables/DistrictTable';

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

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Link href={`/zone/${districtData.zone.replace('Zone ', '')}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to {districtData.zone}
                </Link>
                <h2 className="section-title" style={{ margin: 0 }}>District {districtId} Performance</h2>
            </div>
            
            <section className="metrics-grid five-cols">
                <MetricCard title="Total Clubs" value={stats.totalClubs.toLocaleString()} />
                <MetricCard title="Outstanding Dues" value={`$${stats.outstanding.toLocaleString()}`} />
                <MetricCard title="Clubs in Arrears" value={stats.arrearsClubs.toLocaleString()} />
                <MetricCard title="Subject to Termination" value={stats.atRisk.toLocaleString()} isWarning={true} />
                <MetricCard title="Unreported Officers" value={stats.noOfficers.toLocaleString()} />
            </section>
            
            <h2 className="section-title">Rotary Sponsorship Penetration</h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Rotary Clubs" value={stats.totalRotary?.toLocaleString() || '0'} />
                <MetricCard title="Rotary with Sponsored Rotaract" value={stats.rotaryWithSponsor?.toLocaleString() || '0'} trend={{text: `${penGood}% Penetration`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Sponsored Rotaract" value={stats.rotaryWithoutSponsor?.toLocaleString() || '0'} trend={{text: `${penBad}% Missed Opportunity`, type: 'negative'}} isWarning={true} />
            </section>
            
            <h2 className="section-title">Clubs with Issues in District {districtId}</h2>
            <DistrictTable districtClubs={districtClubs} />
        </div>
    );
}
