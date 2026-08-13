import { getClubDetails, getTRFContributions, getNewClubs, getAllClubs } from '@/lib/api';
import Link from 'next/link';

import MetricCard from '@/components/ui/MetricCard';

export async function generateMetadata({ params }) {
    const { clubId } = await params;
    const club = await getClubDetails(clubId);
    return {
        title: club ? `Club ${club.name} Insights` : `Club ${clubId} Insights`,
    };
}

export default async function ClubPage({ params }) {
    const { clubId } = await params;
    const club = await getClubDetails(clubId);
    
    if (!club) return <div style={{ padding: '20px' }}>Club {clubId} not found in the issues database.</div>;

    const allTrfData = await getTRFContributions() || [];
    const trfData = allTrfData.find(c => (c['Club No.'] || '').toString() === clubId.toString());

    const allNewClubs = await getNewClubs() || [];
    const newClubData = allNewClubs.find(c => (c['Club ID'] || '').toString() === clubId.toString());

    const allClubsRoster = await getAllClubs() || [];
    const rosterData = allClubsRoster.find(c => (c['Club ID'] || '').toString() === clubId.toString());

    const memberCount = rosterData ? rosterData['Total Reported Members'] : 'Unknown';

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
                <Link href={`/district/${club.district}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to District {club.district}
                </Link>
            </div>
            
            <div className="card" style={{ padding: '40px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    Rotaract Club
                                </div>
                                {newClubData && (
                                    <div style={{ display: 'inline-block', background: '#e6f4ea', color: '#137333', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                        🎉 Newly Chartered ({newClubData['Club Charter Date'] || 'Recent'})
                                    </div>
                                )}
                            </div>
                            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: 'var(--text-main)' }}>{club.name}</h1>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
                                Club ID: <strong>{club.id}</strong> • District: <strong>{club.district}</strong> • {club.zone} • Members: <strong>{memberCount}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="section-title">Club Insights</h2>
                <section className="metrics-grid three-cols" style={{ marginBottom: '20px' }}>
                    <MetricCard 
                        title="Outstanding Dues" 
                        value={`$${club.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                        isWarning={club.outstanding > 0} 
                    />
                    <MetricCard 
                        title="Officer Reporting" 
                        value={club.isNoOfficers ? 'Unreported' : 'Reported'} 
                        isWarning={club.isNoOfficers} 
                        trend={club.isNoOfficers ? {text: 'Action Required', type: 'negative'} : {text: 'Compliant', type: 'positive'}}
                    />
                    <MetricCard 
                        title="Club Base Type" 
                        value={club.base || 'Unknown'} 
                    />
                </section>

                {(club.isAtRisk || club.isNoOfficers) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {club.isAtRisk && (
                            <div style={{ background: '#fffafa', padding: '20px', borderRadius: '8px', border: '1px solid #fdd', color: 'var(--danger)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ fontSize: '32px' }}>🚨</div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>High Risk of Termination</h3>
                                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>This club owes $75 or more in outstanding dues and is subject to immediate termination by RI.</p>
                                </div>
                            </div>
                        )}
                        {club.isNoOfficers && (
                            <div style={{ background: '#fffafa', padding: '20px', borderRadius: '8px', border: '1px solid #fdd', color: 'var(--danger)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ fontSize: '32px' }}>⚠️</div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Missing Club Officers</h3>
                                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>Please ensure the club president updates officer details on MyRotary immediately to maintain active status.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
