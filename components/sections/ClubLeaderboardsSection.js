'use client';

import { useState, useMemo } from 'react';
import Leaderboard from '@/components/ui/Leaderboard';

export default function ClubLeaderboardsSection({ allClubsData = [], trfData = [], arrearsData = [] }) {
    const [limit, setLimit] = useState(5);

    // 1. Largest Clubs by Members
    const clubsByMembers = useMemo(() => {
        const list = [...(allClubsData || [])]
            .map(club => {
                const base = club['Rotaract Club Base'] || '';
                const isUniv = base.toLowerCase().includes('university');
                const val = Number(club['Total Reported Members'] || 0);
                return {
                    label: club['Club Name'] || 'Unknown Club',
                    val,
                    value: val.toLocaleString(),
                    unit: 'members',
                    subLabel: (
                        <>
                            <span>ID: {club['Club ID'] || 'N/A'}</span>
                            {base && <span>•</span>}
                            {base && (
                                <span style={{ color: isUniv ? '#7c3aed' : '#059669', fontWeight: '600' }}>
                                    {isUniv ? '🏛️ University' : '👥 Community'}
                                </span>
                            )}
                        </>
                    )
                };
            })
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [allClubsData]);

    // 2. Highest TRF Contributors
    const clubsByTrf = useMemo(() => {
        const list = [...(trfData || [])]
            .map(club => {
                const val = parseFloat((club['Total Contributions USD'] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0;
                return {
                    label: club['Club Name'] || `Club ${club['Club No.'] || 'N/A'}`,
                    val,
                    value: `$${val.toLocaleString()}`,
                    unit: 'USD',
                    subLabel: club['Club No.'] ? <span>ID: {club['Club No.']}</span> : null
                };
            })
            .filter(club => club.val > 0)
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [trfData]);

    // 3. Highest Outstanding Dues
    const clubsByArrears = useMemo(() => {
        const list = [...(arrearsData || [])]
            .map(club => {
                const base = club['Club Base'] || '';
                const isUniv = base.toLowerCase().includes('university');
                const val = parseFloat((club['Outstanding INR'] || club.outstanding || club.outstandingINR || club[' USD Outstanding '] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0;
                return {
                    label: club['Club Name'] || 'Unknown Club',
                    val,
                    value: `₹${Math.round(val).toLocaleString('en-IN')}`,
                    unit: 'Dues',
                    subLabel: (
                        <>
                            <span>ID: {club['Club ID'] || 'N/A'}</span>
                            {base && <span>•</span>}
                            {base && (
                                <span style={{ color: isUniv ? '#7c3aed' : '#059669', fontWeight: '600' }}>
                                    {isUniv ? '🏛️ University' : '👥 Community'}
                                </span>
                            )}
                        </>
                    )
                };
            })
            .filter(club => club.val > 0)
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [arrearsData]);

    const hasAnyData = clubsByMembers.length > 0 || clubsByTrf.length > 0 || clubsByArrears.length > 0;
    if (!hasAnyData) return null;

    return (
        <section style={{ marginBottom: '40px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <h2 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                    Top Charts
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                        Leaderboard Depth:
                    </span>
                    <div style={{
                        display: 'inline-flex',
                        background: '#e2e8f0',
                        borderRadius: '8px',
                        padding: '3px',
                        gap: '2px'
                    }}>
                        {[5, 10, 20, 50].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setLimit(num)}
                                style={{
                                    padding: '6px 14px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: limit === num ? 'var(--primary)' : 'transparent',
                                    color: limit === num ? '#ffffff' : 'var(--text-muted)',
                                    boxShadow: limit === num ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                Top {num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="charts-grid three-cols">
                {clubsByMembers.length > 0 && (
                    <Leaderboard 
                        title="Largest Clubs (Members)" 
                        description="Clubs in this district with the highest reported membership."
                        data={clubsByMembers} 
                        maxItems={limit}
                        badge={`Top ${Math.min(limit, clubsByMembers.length)}`}
                    />
                )}
                {clubsByTrf.length > 0 && (
                    <Leaderboard 
                        title="Highest TRF Contributors" 
                        description="Clubs in this district leading in Annual Fund and PolioPlus giving."
                        data={clubsByTrf} 
                        maxItems={limit}
                        badge={`Top ${Math.min(limit, clubsByTrf.length)}`}
                    />
                )}
                {clubsByArrears.length > 0 && (
                    <Leaderboard 
                        title="Highest Outstanding Dues*" 
                        description="Clubs in this district with the largest unpaid RI per-capita dues."
                        data={clubsByArrears} 
                        isNegative={true}
                        maxItems={limit}
                        badge={`Top ${Math.min(limit, clubsByArrears.length)}`}
                    />
                )}
            </div>
        </section>
    );
}
