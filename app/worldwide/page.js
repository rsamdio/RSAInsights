import { getWorldwideSummary } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Leaderboard from '@/components/ui/Leaderboard';
import Link from 'next/link';

export const metadata = {
    title: 'Rotaract Worldwide Statistics',
    description: 'Worldwide Rotaract Leaderboards and Statistics',
};

export default function WorldwidePage() {
    const summary = getWorldwideSummary();
    
    if (!summary) return <div style={{ padding: '20px' }}>Worldwide data not found. Please regenerate data.</div>;

    const { 
        totalClubs, 
        totalClubsDelta, 
        totalMembers, 
        totalMembersDelta,
        avgMembersPerClub,
        avgMembersDelta,
        countryData, 
        districtData, 
        zoneData 
    } = summary;

    // Process Top 10s for Leaderboards
    const topDistrictsByMembers = [...districtData]
        .sort((a, b) => (b['Total Reported Members'] || 0) - (a['Total Reported Members'] || 0))
        .map(d => ({ label: `District ${d['District']}`, valueNum: parseInt(d['Total Reported Members']) || 0 }))
        .map(d => ({ label: d.label, value: d.valueNum.toLocaleString() }));
        
    const topDistrictsByClubs = [...districtData]
        .sort((a, b) => (b['Total Active Rotaract Clubs'] || 0) - (a['Total Active Rotaract Clubs'] || 0))
        .map(d => ({ label: `District ${d['District']}`, valueNum: parseInt(d['Total Active Rotaract Clubs']) || 0 }))
        .map(d => ({ label: d.label, value: d.valueNum.toLocaleString() }));
        
    const topCountriesByMembers = [...countryData]
        .filter(c => (c[' '] || '').trim() !== '')
        .sort((a, b) => (b['Total Reported Members'] || 0) - (a['Total Reported Members'] || 0))
        .map(c => ({ label: c[' '], valueNum: parseInt(c['Total Reported Members']) || 0 }))
        .map(c => ({ label: c.label, value: c.valueNum.toLocaleString() }));

    const topZonesByMembers = [...zoneData]
        .sort((a, b) => (b['Total Reported Members'] || 0) - (a['Total Reported Members'] || 0))
        .map(z => ({ label: z['Zone'].toString().startsWith('Zone') ? z['Zone'] : `Zone ${z['Zone']}`, valueNum: parseInt(z['Total Reported Members']) || 0 }))
        .map(z => ({ label: z.label, value: z.valueNum.toLocaleString() }));

    const topZonesByClubs = [...zoneData]
        .sort((a, b) => (b['Total Active Rotaract Clubs'] || 0) - (a['Total Active Rotaract Clubs'] || 0))
        .map(z => ({ label: z['Zone'].toString().startsWith('Zone') ? z['Zone'] : `Zone ${z['Zone']}`, valueNum: parseInt(z['Total Active Rotaract Clubs']) || 0 }))
        .map(z => ({ label: z.label, value: z.valueNum.toLocaleString() }));

    const topCountriesByClubs = [...countryData]
        .filter(c => (c[' '] || '').trim() !== '')
        .sort((a, b) => (b['Total Active Rotaract Clubs'] || 0) - (a['Total Active Rotaract Clubs'] || 0))
        .map(c => ({ label: c[' '], valueNum: parseInt(c['Total Active Rotaract Clubs']) || 0 }))
        .map(c => ({ label: c.label, value: c.valueNum.toLocaleString() }));

    const getAvg = (item) => {
        const clubs = parseInt(item['Total Active Rotaract Clubs']) || 0;
        const members = parseInt(item['Total Reported Members']) || 0;
        return clubs > 0 ? (members / clubs) : 0;
    };

    const topDistrictsByAvg = [...districtData]
        .filter(d => (parseInt(d['Total Active Rotaract Clubs']) || 0) > 0)
        .sort((a, b) => getAvg(b) - getAvg(a))
        .map(d => ({ label: `District ${d['District']}`, valueNum: getAvg(d) }))
        .map(d => ({ label: d.label, value: d.valueNum.toFixed(3) }));

    const topCountriesByAvg = [...countryData]
        .filter(c => (c[' '] || '').trim() !== '' && (parseInt(c['Total Active Rotaract Clubs']) || 0) > 0)
        .sort((a, b) => getAvg(b) - getAvg(a))
        .map(c => ({ label: c[' '], valueNum: getAvg(c) }))
        .map(c => ({ label: c.label, value: c.valueNum.toFixed(3) }));

    const topZonesByAvg = [...zoneData]
        .filter(z => (parseInt(z['Total Active Rotaract Clubs']) || 0) > 0)
        .sort((a, b) => getAvg(b) - getAvg(a))
        .map(z => ({ label: z['Zone'].toString().startsWith('Zone') ? z['Zone'] : `Zone ${z['Zone']}`, valueNum: getAvg(z) }))
        .map(z => ({ label: z.label, value: z.valueNum.toFixed(3) }));

    const topDistrictsByMemberGrowth = [...districtData]
        .filter(d => (d['Members Growth (%)'] || 0) > 0)
        .sort((a, b) => (b['Members Growth (%)'] || 0) - (a['Members Growth (%)'] || 0))
        .map(d => ({ label: `District ${d['District']}`, valueNum: d['Members Growth (%)'] || 0 }))
        .map(d => ({ label: d.label, value: `${d.valueNum.toFixed(1)}%` }));

    const topDistrictsByMemberGrowthAbs = [...districtData]
        .filter(d => (d['Members Growth Abs'] || 0) > 0)
        .sort((a, b) => (b['Members Growth Abs'] || 0) - (a['Members Growth Abs'] || 0))
        .map(d => ({ label: `District ${d['District']}`, valueNum: d['Members Growth Abs'] || 0 }))
        .map(d => ({ label: d.label, value: d.valueNum.toLocaleString() }));

    const topDistrictsByClubGrowth = [...districtData]
        .filter(d => (d['Clubs Growth (%)'] || 0) > 0)
        .sort((a, b) => (b['Clubs Growth (%)'] || 0) - (a['Clubs Growth (%)'] || 0))
        .map(d => ({ label: `District ${d['District']}`, valueNum: d['Clubs Growth (%)'] || 0 }))
        .map(d => ({ label: d.label, value: `${d.valueNum.toFixed(1)}%` }));

    const topDistrictsByClubGrowthAbs = [...districtData]
        .filter(d => (d['Clubs Growth Abs'] || 0) > 0)
        .sort((a, b) => (b['Clubs Growth Abs'] || 0) - (a['Clubs Growth Abs'] || 0))
        .map(d => ({ label: `District ${d['District']}`, valueNum: d['Clubs Growth Abs'] || 0 }))
        .map(d => ({ label: d.label, value: d.valueNum.toLocaleString() }));

    const topCountriesByMemberGrowth = [...countryData]
        .filter(c => (c[' '] || '').trim() !== '' && (c['Members Growth (%)'] || 0) > 0)
        .sort((a, b) => (b['Members Growth (%)'] || 0) - (a['Members Growth (%)'] || 0))
        .map(c => ({ label: c[' '], valueNum: c['Members Growth (%)'] || 0 }))
        .map(c => ({ label: c.label, value: `${c.valueNum.toFixed(1)}%` }));

    const topCountriesByMemberGrowthAbs = [...countryData]
        .filter(c => (c[' '] || '').trim() !== '' && (c['Members Growth Abs'] || 0) > 0)
        .sort((a, b) => (b['Members Growth Abs'] || 0) - (a['Members Growth Abs'] || 0))
        .map(c => ({ label: c[' '], valueNum: c['Members Growth Abs'] || 0 }))
        .map(c => ({ label: c.label, value: c.valueNum.toLocaleString() }));

    const topCountriesByClubGrowth = [...countryData]
        .filter(c => (c[' '] || '').trim() !== '' && (c['Clubs Growth (%)'] || 0) > 0)
        .sort((a, b) => (b['Clubs Growth (%)'] || 0) - (a['Clubs Growth (%)'] || 0))
        .map(c => ({ label: c[' '], valueNum: c['Clubs Growth (%)'] || 0 }))
        .map(c => ({ label: c.label, value: `${c.valueNum.toFixed(1)}%` }));

    const topCountriesByClubGrowthAbs = [...countryData]
        .filter(c => (c[' '] || '').trim() !== '' && (c['Clubs Growth Abs'] || 0) > 0)
        .sort((a, b) => (b['Clubs Growth Abs'] || 0) - (a['Clubs Growth Abs'] || 0))
        .map(c => ({ label: c[' '], valueNum: c['Clubs Growth Abs'] || 0 }))
        .map(c => ({ label: c.label, value: c.valueNum.toLocaleString() }));

    const topZonesByMemberGrowth = [...zoneData]
        .filter(z => (z['Members Growth (%)'] || 0) > 0)
        .sort((a, b) => (b['Members Growth (%)'] || 0) - (a['Members Growth (%)'] || 0))
        .map(z => ({ label: z['Zone'].toString().startsWith('Zone') ? z['Zone'] : `Zone ${z['Zone']}`, valueNum: z['Members Growth (%)'] || 0 }))
        .map(z => ({ label: z.label, value: `${z.valueNum.toFixed(1)}%` }));

    const topZonesByMemberGrowthAbs = [...zoneData]
        .filter(z => (z['Members Growth Abs'] || 0) > 0)
        .sort((a, b) => (b['Members Growth Abs'] || 0) - (a['Members Growth Abs'] || 0))
        .map(z => ({ label: z['Zone'].toString().startsWith('Zone') ? z['Zone'] : `Zone ${z['Zone']}`, valueNum: z['Members Growth Abs'] || 0 }))
        .map(z => ({ label: z.label, value: z.valueNum.toLocaleString() }));

    const topZonesByClubGrowth = [...zoneData]
        .filter(z => (z['Clubs Growth (%)'] || 0) > 0)
        .sort((a, b) => (b['Clubs Growth (%)'] || 0) - (a['Clubs Growth (%)'] || 0))
        .map(z => ({ label: z['Zone'].toString().startsWith('Zone') ? z['Zone'] : `Zone ${z['Zone']}`, valueNum: z['Clubs Growth (%)'] || 0 }))
        .map(z => ({ label: z.label, value: `${z.valueNum.toFixed(1)}%` }));

    const topZonesByClubGrowthAbs = [...zoneData]
        .filter(z => (z['Clubs Growth Abs'] || 0) > 0)
        .sort((a, b) => (b['Clubs Growth Abs'] || 0) - (a['Clubs Growth Abs'] || 0))
        .map(z => ({ label: z['Zone'].toString().startsWith('Zone') ? z['Zone'] : `Zone ${z['Zone']}`, valueNum: z['Clubs Growth Abs'] || 0 }))
        .map(z => ({ label: z.label, value: z.valueNum.toLocaleString() }));

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to Home
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>Rotaract Worldwide Statistics</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', margin: 0 }}>Worldwide leaderboards for Clubs and Memberships.</p>
            </div>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                <MetricCard 
                    title="Total Worldwide Rotaract Clubs" 
                    value={totalClubs.toLocaleString()} 
                    trend={totalClubsDelta}
                />
                <MetricCard 
                    title="Total Worldwide Members" 
                    value={totalMembers.toLocaleString()} 
                    trend={totalMembersDelta}
                />
                <MetricCard 
                    title="Average Members Per Club" 
                    value={avgMembersPerClub.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} 
                    trend={avgMembersDelta}
                />
            </section>

            <h2 className="section-title">Worldwide Leaderboards</h2>

            <h3 style={{ margin: '10px 0 15px 0', fontSize: '20px', color: 'var(--text-main)' }}>By District</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard title="Districts by Members" description="Districts with the largest total Rotaract membership worldwide." data={topDistrictsByMembers} maxItems={10} />
                <Leaderboard title="Districts by Avg. Members" description="Districts with the highest average members per club." data={topDistrictsByAvg} maxItems={10} />
                <Leaderboard title="Districts by Member Growth" description="Districts with the largest increase in members." data={topDistrictsByMemberGrowthAbs} maxItems={10} />
                <Leaderboard title="Districts by Member Growth (%)" description="Districts with the largest percentage increase in members." data={topDistrictsByMemberGrowth} maxItems={10} />
                <Leaderboard title="Districts by Clubs" description="Districts with the most active Rotaract clubs worldwide." data={topDistrictsByClubs} maxItems={10} />
                <Leaderboard title="Districts by Club Growth" description="Districts with the largest increase in active clubs." data={topDistrictsByClubGrowthAbs} maxItems={10} />
                <Leaderboard title="Districts by Club Growth (%)" description="Districts with the largest percentage increase in active clubs." data={topDistrictsByClubGrowth} maxItems={10} />
            </div>

            <h3 style={{ margin: '10px 0 15px 0', fontSize: '20px', color: 'var(--text-main)' }}>By Country</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard title="Countries by Members" description="Countries with the largest total Rotaract membership." data={topCountriesByMembers} maxItems={10} />
                <Leaderboard title="Countries by Avg. Members" description="Countries with the highest average members per club." data={topCountriesByAvg} maxItems={10} />
                <Leaderboard title="Countries by Member Growth" description="Countries with the largest increase in members." data={topCountriesByMemberGrowthAbs} maxItems={10} />
                <Leaderboard title="Countries by Member Growth (%)" description="Countries with the largest percentage increase in members." data={topCountriesByMemberGrowth} maxItems={10} />
                <Leaderboard title="Countries by Clubs" description="Countries with the most active Rotaract clubs." data={topCountriesByClubs} maxItems={10} />
                <Leaderboard title="Countries by Club Growth" description="Countries with the largest increase in active clubs." data={topCountriesByClubGrowthAbs} maxItems={10} />
                <Leaderboard title="Countries by Club Growth (%)" description="Countries with the largest percentage increase in active clubs." data={topCountriesByClubGrowth} maxItems={10} />
            </div>
            
            <h3 style={{ margin: '10px 0 15px 0', fontSize: '20px', color: 'var(--text-main)' }}>By Zone</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard title="Zones by Members" description="Zones with the largest total Rotaract membership." data={topZonesByMembers} maxItems={10} />
                <Leaderboard title="Zones by Avg. Members" description="Zones with the highest average members per club." data={topZonesByAvg} maxItems={10} />
                <Leaderboard title="Zones by Member Growth" description="Zones with the largest increase in members." data={topZonesByMemberGrowthAbs} maxItems={10} />
                <Leaderboard title="Zones by Member Growth (%)" description="Zones with the largest percentage increase in members." data={topZonesByMemberGrowth} maxItems={10} />
                <Leaderboard title="Zones by Clubs" description="Zones with the most active Rotaract clubs." data={topZonesByClubs} maxItems={10} />
                <Leaderboard title="Zones by Club Growth" description="Zones with the largest increase in active clubs." data={topZonesByClubGrowthAbs} maxItems={10} />
                <Leaderboard title="Zones by Club Growth (%)" description="Zones with the largest percentage increase in active clubs." data={topZonesByClubGrowth} maxItems={10} />
            </div>
        </div>
    );
}
