'use client';
import Leaderboard from '@/components/ui/Leaderboard';

export default function ClubLeaderboardsSection({ allClubsData, trfData, arrearsData }) {
    // 1. Largest Clubs by Members
    const clubsByMembers = [...allClubsData]
        .sort((a, b) => Number(b['Total Reported Members'] || 0) - Number(a['Total Reported Members'] || 0))
        .slice(0, 5)
        .map((club, idx) => ({
            rank: idx + 1,
            label: club['Club Name'] || 'Unknown Club',
            value: Number(club['Total Reported Members'] || 0).toLocaleString(),
            subLabel: `ID: ${club['Club ID'] || 'N/A'}`
        }));

    // 2. Highest TRF Contributors
    const clubsByTrf = [...trfData]
        .sort((a, b) => Number(b['Total Contributions USD'] || 0) - Number(a['Total Contributions USD'] || 0))
        .slice(0, 5)
        .filter(club => Number(club['Total Contributions USD'] || 0) > 0)
        .map((club, idx) => ({
            rank: idx + 1,
            label: club['Club Name'] || 'Unknown Club',
            value: `$${Number(club['Total Contributions USD'] || 0).toLocaleString()}`,
            subLabel: 'Total TRF'
        }));

    // 3. Highest Outstanding Dues
    const clubsByArrears = [...arrearsData]
        .sort((a, b) => Number(b[' USD Outstanding '] || 0) - Number(a[' USD Outstanding '] || 0))
        .slice(0, 5)
        .filter(club => Number(club[' USD Outstanding '] || 0) > 0)
        .map((club, idx) => ({
            rank: idx + 1,
            label: club['Club Name'] || 'Unknown Club',
            value: `$${Number(club[' USD Outstanding '] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subLabel: 'Outstanding'
        }));

    return (
        <section style={{ marginBottom: '40px' }}>
            <h2 className="section-title">Top Charts</h2>
            <div className="charts-grid three-cols">
                {clubsByMembers.length > 0 && (
                    <Leaderboard 
                        title="Largest Clubs (Members)" 
                        data={clubsByMembers} 
                    />
                )}
                {clubsByTrf.length > 0 && (
                    <Leaderboard 
                        title="Highest TRF Contributors" 
                        data={clubsByTrf} 
                    />
                )}
                {clubsByArrears.length > 0 && (
                    <Leaderboard 
                        title="Highest Outstanding Dues" 
                        data={clubsByArrears} 
                        isNegative={true}
                    />
                )}
            </div>
        </section>
    );
}
