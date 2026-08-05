import { getZoneData } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';

export default async function ZonePage({ params }) {
    const { zoneId } = await params;
    const zoneData = await getZoneData(zoneId);
    
    if (!zoneData) return <div style={{ padding: '20px' }}>Zone {zoneId} not found.</div>;
    
    const stats = zoneData.stats;
    const districtLabels = Object.keys(zoneData.districts);

    const penGood = stats.totalRotary ? Math.round((stats.rotaryWithSponsor / stats.totalRotary) * 100) : 0;
    const penBad = stats.totalRotary ? Math.round((stats.rotaryWithoutSponsor / stats.totalRotary) * 100) : 0;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>← Back to Global</Link>
                <h2 className="section-title" style={{ margin: 0 }}>{zoneData.name} Performance</h2>
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
            
            <h2 className="section-title">Districts in {zoneData.name}</h2>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {districtLabels.map(dist => (
                        <Link 
                            key={dist} 
                            href={`/district/${dist}`}
                            style={{
                                display: 'flex', justifyContent: 'space-between', padding: '15px', 
                                border: '1px solid var(--border-color)', borderRadius: '8px',
                                textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600,
                                background: '#fafafa', transition: 'all 0.2s'
                            }}
                        >
                            <span>District {dist}</span>
                            <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)' }}>
                                <span>{zoneData.districts[dist].arrearsClubs} Arrears</span>
                                <span>{zoneData.districts[dist].noOfficers} No Officers</span>
                                <span style={{ color: 'var(--primary)' }}>Deep Dive →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
