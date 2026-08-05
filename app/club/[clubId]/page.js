import { getClubDetails } from '@/lib/api';
import Link from 'next/link';

export async function generateMetadata({ params }) {
    const { clubId } = await params;
    const club = await getClubDetails(clubId);
    return {
        title: club ? `Club ${club.name} Report` : `Club ${clubId} Report`,
    };
}

export default async function ClubPage({ params }) {
    const { clubId } = await params;
    const club = await getClubDetails(clubId);
    
    if (!club) return <div style={{ padding: '20px' }}>Club {clubId} not found in the issues database.</div>;

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
                            <div style={{ display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                Rotaract Club
                            </div>
                            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: 'var(--text-main)' }}>{club.name}</h1>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
                                Club ID: <strong>{club.id}</strong> • District: <strong>{club.district}</strong> • {club.zone}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div>
                        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '15px' }}>Arrears & Financial Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Outstanding Dues</div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: club.outstanding > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                    ${club.outstanding.toLocaleString()}
                                </div>
                            </div>
                            {club.isAtRisk && (
                                <div style={{ background: '#fffafa', padding: '15px', borderRadius: '8px', border: '1px solid #fdd', color: 'var(--danger)' }}>
                                    <strong>🚨 High Risk of Termination</strong>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>This club owes $75 or more and is subject to immediate termination by RI.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '15px' }}>Administrative Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Officer Reporting</div>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: club.isNoOfficers ? 'var(--danger)' : 'var(--success)' }}>
                                    {club.isNoOfficers ? '❌ Unreported Officers' : '✅ Officers Reported'}
                                </div>
                            </div>
                            <div style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Base Type</div>
                                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                                    {club.base || 'Not Specified'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
