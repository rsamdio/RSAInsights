import { getClubDetails } from '@/lib/api';
import Link from 'next/link';
import MetricCard from '@/components/ui/MetricCard';
import JsonLd from '@/components/seo/JsonLd';

export async function generateMetadata({ params }) {
    const { clubId } = await params;
    const club = await getClubDetails(clubId);
    if (!club) {
        return {
            title: `Club ${clubId} Not Found | Rotaract South Asia`,
            description: `Club ${clubId} could not be located in the Rotaract South Asia master directory.`,
        };
    }
    return {
        title: `Rotaract Club of ${club.name} (${club.id}) | District ${club.district}, ${club.zone}`,
        description: `Comprehensive club profile, membership statistics (${club.members} members), TRF contributions ($${club.trfTotal}), compliance status, and Rotary sponsor details for Rotaract Club of ${club.name} (${club.base} based, ${club.country}).`,
        alternates: {
            canonical: `https://insights.rsamdio.org/club/${club.id}`,
        },
        openGraph: {
            title: `Rotaract Club of ${club.name} (${club.id}) | District ${club.district}`,
            description: `Comprehensive club report and performance metrics for Rotaract Club of ${club.name}, District ${club.district}, ${club.zone}.`,
            url: `https://insights.rsamdio.org/club/${club.id}`,
        },
    };
}

export default async function ClubPage({ params }) {
    const { clubId } = await params;
    const club = await getClubDetails(clubId);
    
    if (!club) {
        return (
            <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div className="card" style={{ padding: '50px 30px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
                    <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Club Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
                        Club ID <strong>{clubId}</strong> could not be located in the master directory for Zones 4, 5, 6 & 7.
                    </p>
                    <Link 
                        href="/" 
                        style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}
                    >
                        ← Back to Global Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const zoneNumber = club.zone ? club.zone.replace(/[^0-9]/g, '') : '';
    const isCompliant = !club.isArrears && !club.isNoOfficers;

    const clubSchema = {
        '@context': 'https://schema.org',
        '@type': 'NGO',
        '@id': `https://insights.rsamdio.org/club/${club.id}#organization`,
        name: `Rotaract Club of ${club.name}`,
        identifier: String(club.id),
        url: `https://insights.rsamdio.org/club/${club.id}`,
        description: `Rotaract Club of ${club.name}, ${club.base} based club in District ${club.district}, ${club.zone} (${club.country}).`,
        parentOrganization: {
            '@type': 'Organization',
            name: `Rotary District ${club.district}`,
            parentOrganization: {
                '@type': 'Organization',
                name: 'Rotary International',
            },
        },
        sponsor: club.sponsorClubs && club.sponsorClubs !== 'None Reported' ? {
            '@type': 'Organization',
            name: club.sponsorClubs,
        } : undefined,
        address: {
            '@type': 'PostalAddress',
            addressCountry: club.country,
        },
        member: {
            '@type': 'QuantitativeValue',
            value: club.members,
            unitText: 'Members',
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://insights.rsamdio.org',
            },
            ...(zoneNumber ? [{
                '@type': 'ListItem',
                position: 2,
                name: club.zone,
                item: `https://insights.rsamdio.org/zone/${zoneNumber}`,
            }] : []),
            {
                '@type': 'ListItem',
                position: zoneNumber ? 3 : 2,
                name: `District ${club.district}`,
                item: `https://insights.rsamdio.org/district/${club.district}`,
            },
            {
                '@type': 'ListItem',
                position: zoneNumber ? 4 : 3,
                name: club.name,
                item: `https://insights.rsamdio.org/club/${club.id}`,
            },
        ],
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1000px', margin: '0 auto' }}>
            <JsonLd schema={[clubSchema, breadcrumbSchema]} />
            {/* Breadcrumb Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
                <Link href={`/district/${club.district}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                    ← Back to District {club.district}
                </Link>
                {zoneNumber && (
                    <>
                        <span style={{ color: 'var(--border-color)' }}>|</span>
                        <Link href={`/zone/${zoneNumber}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                            Explore {club.zone}
                        </Link>
                    </>
                )}
            </div>
            
            {/* Hero Dossier Card */}
            <div className="card" style={{ padding: '35px', marginBottom: '30px' }}>
                {/* Header Profile Section */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '25px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            Rotaract Club
                        </span>
                        <span style={{ background: '#f1f3f4', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                            {club.base === 'University' ? '🏛️ University Based' : '👥 Community Based'}
                        </span>
                        <span style={{ background: club.status === 'Active' ? '#e6f4ea' : '#fce8e6', color: club.status === 'Active' ? 'var(--success)' : 'var(--danger)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                            ● {club.status}
                        </span>
                        {club.isNewClub && (
                            <span style={{ background: '#fef7e0', color: '#b06000', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                                🎉 Chartered {club.charterDate || 'Recently'}
                            </span>
                        )}
                        {isCompliant ? (
                            <span style={{ background: '#e6f4ea', color: 'var(--success)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                                🛡️ Good Standing
                            </span>
                        ) : (
                            <span style={{ background: '#fce8e6', color: 'var(--danger)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                                ⚠️ Issues Identified
                            </span>
                        )}
                    </div>

                    <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: 'var(--text-main)', fontWeight: 800, lineHeight: '1.2' }}>
                        {club.name}
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
                        Club ID: <strong>{club.id}</strong> • District: <strong>{club.district}</strong> • {club.zone} • {club.country}
                    </p>
                </div>

                {/* KPI Metrics Grid */}
                <h2 className="section-title" style={{ margin: '0 0 20px 0' }}>Key Metrics & Compliance</h2>
                <section className="metrics-grid four-cols" style={{ marginBottom: '30px' }}>
                    <MetricCard 
                        title="Reported Members" 
                        value={club.members.toLocaleString()} 
                        trend={club.members > 0 ? { text: 'Active Roster', type: 'positive' } : { text: 'Zero Reported', type: 'negative' }}
                    />
                    <MetricCard 
                        title="Total TRF Giving" 
                        value={`$${club.trfTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                        trend={club.trfTotal > 0 ? { text: 'TRF Contributor', type: 'positive' } : { text: 'No Donations', type: 'neutral' }}
                    />
                    <MetricCard 
                        title="Outstanding Dues" 
                        value={`₹${Math.round(club.outstanding || 0).toLocaleString('en-IN')}`} 
                        isWarning={club.outstanding > 0} 
                        trend={club.outstanding === 0 ? { text: 'Compliant (₹0)', type: 'positive' } : (club.isAtRisk ? { text: 'High Risk (≥ ₹7,200)', type: 'negative' } : { text: 'Arrears Pending', type: 'negative' })}
                    />
                    <MetricCard 
                        title="Officer Reporting" 
                        value={club.isNoOfficers ? 'Unreported' : 'Reported'} 
                        isWarning={club.isNoOfficers} 
                        trend={club.isNoOfficers ? { text: 'Action Required', type: 'negative' } : { text: 'Compliant', type: 'positive' }}
                    />
                </section>

                {/* Club Information & Sponsorship Card */}
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📋</span> Club Information & Sponsorship
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                                Sponsor Clubs
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                                {club.sponsorClubs || 'None Reported'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                                Leadership Term Reported
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                                {club.termReported || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                                Rotaract Club Base
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                                {club.base === 'University' ? '🏛️ University Based' : '👥 Community Based'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* The Rotary Foundation (TRF) Impact Breakdown */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>💙</span> The Rotary Foundation (TRF) Giving
                        </h3>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Current Rotary Year Contributions
                        </span>
                    </div>

                    {club.trfTotal > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', textAlign: 'center' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Annual Fund</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>${club.trfAnnual.toLocaleString()}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>PolioPlus Fund</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#e67c73' }}>${club.trfPolio.toLocaleString()}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Other Funds</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>${club.trfOther.toLocaleString()}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Endowment Fund</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>${club.trfEndowment.toLocaleString()}</div>
                            </div>
                            <div style={{ background: '#e6f0fa', padding: '16px', borderRadius: '8px', border: '1px solid #c8e1f9' }}>
                                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>Total Contribution</div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>${club.trfTotal.toLocaleString()}</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                            No TRF financial contributions recorded for this club in the current rotary year.
                        </div>
                    )}
                </div>

                {/* Health & Compliance Action Center */}
                {(club.isAtRisk || club.isNoOfficers || club.isArrears) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {club.isAtRisk && (
                            <div style={{ background: '#fffafa', padding: '20px', borderRadius: '8px', border: '1px solid #fdd', color: 'var(--danger)', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '28px', lineHeight: 1 }}>🚨</div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700 }}>High Risk of Termination by Rotary International</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                        This club owes <strong>₹{Math.round(club.outstanding || 0).toLocaleString('en-IN')}</strong> in outstanding dues (meeting or exceeding the <strong>₹7,200 ($75.00 USD)</strong> termination threshold). Immediate settlement of dues via Rotary Club Central / District leadership is required to prevent club de-chartering.
                                    </p>
                                </div>
                            </div>
                        )}
                        {club.isArrears && !club.isAtRisk && (
                            <div style={{ background: '#fffcf0', padding: '20px', borderRadius: '8px', border: '1px solid #fde68a', color: '#b45309', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '28px', lineHeight: 1 }}>💳</div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700 }}>Pending Dues in Arrears</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                        This club has an outstanding balance of <strong>₹{Math.round(club.outstanding || 0).toLocaleString('en-IN')}</strong>. Please ensure timely payment to remain in good standing.
                                    </p>
                                </div>
                            </div>
                        )}
                        {club.isNoOfficers && (
                            <div style={{ background: '#fffafa', padding: '20px', borderRadius: '8px', border: '1px solid #fdd', color: 'var(--danger)', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '28px', lineHeight: 1 }}>⚠️</div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700 }}>Missing Club Officer Reporting</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                        Current Club officers have not been reported on MyRotary. The Club President, with the help of the District Rotaract Representative (DRR) or the Sponsor Club(s), must update officer details on MyRotary immediately to maintain active communication with RI.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ fontSize: '28px', lineHeight: 1 }}>🛡️</div>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: 'var(--success)' }}>100% Compliant & in Good Standing</h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#166534', lineHeight: '1.4' }}>
                                Club officer reporting is up to date and there are zero outstanding dues recorded for this club.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
