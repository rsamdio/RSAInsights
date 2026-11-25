'use client';

import { useState, useMemo } from 'react';
import Leaderboard from '@/components/ui/Leaderboard';

function buildSignedGrowthBoard(rows, getVal, getLabel, { asPercent = false } = {}) {
    // Include gains and declines in one ranked list (no > 0 filter).
    const list = [...(rows || [])]
        .map(row => ({ label: getLabel(row), val: Number(getVal(row)) || 0 }))
        .sort((a, b) => b.val - a.val);
    const maxAbs = list.reduce((max, row) => Math.max(max, Math.abs(row.val)), 0) || 1;
    return list.map(row => {
        const sign = row.val > 0 ? '+' : '';
        return {
            label: row.label,
            value: asPercent
                ? `${sign}${row.val.toFixed(1)}%`
                : `${sign}${row.val.toLocaleString()}`,
            progressPct: row.val === 0
                ? 0
                : Math.max(4, Math.min(100, Math.round((Math.abs(row.val) / maxAbs) * 100))),
            color: row.val < 0 ? 'var(--danger)' : undefined
        };
    });
}

export default function WorldwideLeaderboardsSection({ summary = {} }) {
    const [limit, setLimit] = useState(10);

    const {
        countryData = [],
        districtData = [],
        zoneData = [],
        interactDistrictData = [],
        interactZoneData = [],
        newClubsDistrictData = [],
        newClubsCountryData = [],
        newClubsZoneData = [],
        topClubsWorldwide = [],
        topCommunityClubsWorldwide = [],
        topUniversityClubsWorldwide = []
    } = summary;

    // Helper for club mapping
    const mapClubItem = (club, maxM, showBase = true) => {
        const isUniv = (club.base || '').toLowerCase().includes('university');
        return {
            label: club.clubName,
            subLabel: (
                <>
                    <span>D-{club.district}</span>
                    <span>•</span>
                    <span>{club.country}</span>
                    {showBase && (
                        <>
                            <span>•</span>
                            <span style={{ color: isUniv ? '#7c3aed' : '#059669', fontWeight: '600' }}>
                                {isUniv ? '🏛️ University' : '👥 Community'}
                            </span>
                        </>
                    )}
                </>
            ),
            value: Number(club.members || 0).toLocaleString(),
            unit: 'members',
            progressPct: maxM > 0 ? Math.max(6, Math.min(100, Math.round(((club.members || 0) / maxM) * 100))) : 0
        };
    };

    // Helper for average members calculation
    const getAvg = (item) => {
        const clubs = parseInt(item['Total Active Rotaract Clubs']) || 0;
        const members = parseInt(item['Total Reported Members']) || 0;
        return clubs > 0 ? (members / clubs) : 0;
    };

    // Precompute all sorted lists once
    const sortedData = useMemo(() => {
        // --- 1. Clubs ---
        const maxOverall = topClubsWorldwide.length > 0 ? (topClubsWorldwide[0].members || 1) : 1;
        const maxCommunity = topCommunityClubsWorldwide.length > 0 ? (topCommunityClubsWorldwide[0].members || 1) : 1;
        const maxUniversity = topUniversityClubsWorldwide.length > 0 ? (topUniversityClubsWorldwide[0].members || 1) : 1;

        const clubsOverall = topClubsWorldwide.map(c => mapClubItem(c, maxOverall, true));
        const clubsCommunity = topCommunityClubsWorldwide.map(c => mapClubItem(c, maxCommunity, false));
        const clubsUniversity = topUniversityClubsWorldwide.map(c => mapClubItem(c, maxUniversity, false));

        // --- 2. Districts ---
        const distByMembersRaw = [...districtData]
            .sort((a, b) => (parseInt(b['Total Reported Members']) || 0) - (parseInt(a['Total Reported Members']) || 0));
        const maxDistMembers = distByMembersRaw.length > 0 ? (parseInt(distByMembersRaw[0]['Total Reported Members']) || 1) : 1;
        const topDistrictsByMembers = distByMembersRaw.map(d => {
            const val = parseInt(d['Total Reported Members']) || 0;
            return {
                label: `District ${d['District']}`,
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistMembers) * 100)))
            };
        });

        const distByAvgRaw = [...districtData]
            .filter(d => (parseInt(d['Total Active Rotaract Clubs']) || 0) > 0)
            .sort((a, b) => getAvg(b) - getAvg(a));
        const maxDistAvg = distByAvgRaw.length > 0 ? getAvg(distByAvgRaw[0]) : 1;
        const topDistrictsByAvg = distByAvgRaw.map(d => {
            const val = getAvg(d);
            return {
                label: `District ${d['District']}`,
                value: val.toFixed(3),
                progressPct: maxDistAvg > 0 ? Math.max(4, Math.min(100, Math.round((val / maxDistAvg) * 100))) : 0
            };
        });

        const topDistrictsByMemberGrowthAbs = buildSignedGrowthBoard(
            districtData,
            d => d['Members Growth Abs'],
            d => `District ${d['District']}`
        );
        const topDistrictsByMemberGrowth = buildSignedGrowthBoard(
            districtData,
            d => d['Members Growth (%)'],
            d => `District ${d['District']}`,
            { asPercent: true }
        );

        const distByClubsRaw = [...districtData]
            .sort((a, b) => (parseInt(b['Total Active Rotaract Clubs']) || 0) - (parseInt(a['Total Active Rotaract Clubs']) || 0));
        const maxDistClubs = distByClubsRaw.length > 0 ? (parseInt(distByClubsRaw[0]['Total Active Rotaract Clubs']) || 1) : 1;
        const topDistrictsByClubs = distByClubsRaw.map(d => {
            const val = parseInt(d['Total Active Rotaract Clubs']) || 0;
            return {
                label: `District ${d['District']}`,
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistClubs) * 100)))
            };
        });

        const topDistrictsByClubGrowthAbs = buildSignedGrowthBoard(
            districtData,
            d => d['Clubs Growth Abs'],
            d => `District ${d['District']}`
        );
        const topDistrictsByClubGrowth = buildSignedGrowthBoard(
            districtData,
            d => d['Clubs Growth (%)'],
            d => `District ${d['District']}`,
            { asPercent: true }
        );

        const distByNewClubsRaw = [...newClubsDistrictData]
            .filter(d => (d.newClubs || 0) > 0)
            .sort((a, b) => (b.newClubs || 0) - (a.newClubs || 0));
        const maxDistNewClubs = distByNewClubsRaw.length > 0 ? (distByNewClubsRaw[0].newClubs || 1) : 1;
        const topDistrictsByNewClubs = distByNewClubsRaw.map(d => {
            const val = d.newClubs || 0;
            return {
                label: `District ${d.District}`,
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistNewClubs) * 100)))
            };
        });

        const distByInteractRaw = [...interactDistrictData]
            .sort((a, b) => (parseInt(b['Total Interact Clubs'] || b['Total Active Interact Clubs']) || 0) - (parseInt(a['Total Interact Clubs'] || a['Total Active Interact Clubs']) || 0));
        const maxDistInteract = distByInteractRaw.length > 0 ? (parseInt(distByInteractRaw[0]['Total Interact Clubs'] || distByInteractRaw[0]['Total Active Interact Clubs']) || 1) : 1;
        const topDistrictsByInteractClubs = distByInteractRaw.map(d => {
            const val = parseInt(d['Total Interact Clubs'] || d['Total Active Interact Clubs']) || 0;
            return {
                label: `District ${d.District}`,
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistInteract) * 100)))
            };
        });

        const topDistrictsByInteractGrowth = buildSignedGrowthBoard(
            interactDistrictData,
            d => d['Interact Growth Abs'],
            d => `District ${d.District}`
        );
        const topDistrictsByInteractGrowthPct = buildSignedGrowthBoard(
            interactDistrictData,
            d => d['Interact Growth (%)'],
            d => `District ${d.District}`,
            { asPercent: true }
        );

        // --- 3. Countries ---
        const validCountries = countryData.filter(c => (c[' '] || c['Country'] || '').trim() !== '');

        const countryByMembersRaw = [...validCountries]
            .sort((a, b) => (parseInt(b['Total Reported Members']) || 0) - (parseInt(a['Total Reported Members']) || 0));
        const maxCountryMembers = countryByMembersRaw.length > 0 ? (parseInt(countryByMembersRaw[0]['Total Reported Members']) || 1) : 1;
        const topCountriesByMembers = countryByMembersRaw.map(c => {
            const val = parseInt(c['Total Reported Members']) || 0;
            return {
                label: c[' '] || c['Country'],
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxCountryMembers) * 100)))
            };
        });

        const countryByAvgRaw = [...validCountries]
            .filter(c => (parseInt(c['Total Active Rotaract Clubs']) || 0) > 0)
            .sort((a, b) => getAvg(b) - getAvg(a));
        const maxCountryAvg = countryByAvgRaw.length > 0 ? getAvg(countryByAvgRaw[0]) : 1;
        const topCountriesByAvg = countryByAvgRaw.map(c => {
            const val = getAvg(c);
            return {
                label: c[' '] || c['Country'],
                value: val.toFixed(3),
                progressPct: maxCountryAvg > 0 ? Math.max(4, Math.min(100, Math.round((val / maxCountryAvg) * 100))) : 0
            };
        });

        const topCountriesByMemberGrowthAbs = buildSignedGrowthBoard(
            validCountries,
            c => c['Members Growth Abs'],
            c => c[' '] || c['Country']
        );
        const topCountriesByMemberGrowth = buildSignedGrowthBoard(
            validCountries,
            c => c['Members Growth (%)'],
            c => c[' '] || c['Country'],
            { asPercent: true }
        );

        const countryByClubsRaw = [...validCountries]
            .sort((a, b) => (parseInt(b['Total Active Rotaract Clubs']) || 0) - (parseInt(a['Total Active Rotaract Clubs']) || 0));
        const maxCountryClubs = countryByClubsRaw.length > 0 ? (parseInt(countryByClubsRaw[0]['Total Active Rotaract Clubs']) || 1) : 1;
        const topCountriesByClubs = countryByClubsRaw.map(c => {
            const val = parseInt(c['Total Active Rotaract Clubs']) || 0;
            return {
                label: c[' '] || c['Country'],
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxCountryClubs) * 100)))
            };
        });

        const topCountriesByClubGrowthAbs = buildSignedGrowthBoard(
            validCountries,
            c => c['Clubs Growth Abs'],
            c => c[' '] || c['Country']
        );
        const topCountriesByClubGrowth = buildSignedGrowthBoard(
            validCountries,
            c => c['Clubs Growth (%)'],
            c => c[' '] || c['Country'],
            { asPercent: true }
        );

        const countryByNewClubsRaw = [...newClubsCountryData]
            .filter(c => (c.newClubs || 0) > 0)
            .sort((a, b) => (b.newClubs || 0) - (a.newClubs || 0));
        const maxCountryNewClubs = countryByNewClubsRaw.length > 0 ? (countryByNewClubsRaw[0].newClubs || 1) : 1;
        const topCountriesByNewClubs = countryByNewClubsRaw.map(c => {
            const val = c.newClubs || 0;
            return {
                label: c.Country,
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxCountryNewClubs) * 100)))
            };
        });

        // --- 4. Zones ---
        const formatZoneLabel = (z) => {
            const raw = (z['Zone'] || z.Zone || '').toString();
            return raw.startsWith('Zone') ? raw : `Zone ${raw}`;
        };

        const zoneByMembersRaw = [...zoneData]
            .sort((a, b) => (parseInt(b['Total Reported Members']) || 0) - (parseInt(a['Total Reported Members']) || 0));
        const maxZoneMembers = zoneByMembersRaw.length > 0 ? (parseInt(zoneByMembersRaw[0]['Total Reported Members']) || 1) : 1;
        const topZonesByMembers = zoneByMembersRaw.map(z => {
            const val = parseInt(z['Total Reported Members']) || 0;
            return {
                label: formatZoneLabel(z),
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneMembers) * 100)))
            };
        });

        const zoneByAvgRaw = [...zoneData]
            .filter(z => (parseInt(z['Total Active Rotaract Clubs']) || 0) > 0)
            .sort((a, b) => getAvg(b) - getAvg(a));
        const maxZoneAvg = zoneByAvgRaw.length > 0 ? getAvg(zoneByAvgRaw[0]) : 1;
        const topZonesByAvg = zoneByAvgRaw.map(z => {
            const val = getAvg(z);
            return {
                label: formatZoneLabel(z),
                value: val.toFixed(3),
                progressPct: maxZoneAvg > 0 ? Math.max(4, Math.min(100, Math.round((val / maxZoneAvg) * 100))) : 0
            };
        });

        const topZonesByMemberGrowthAbs = buildSignedGrowthBoard(
            zoneData,
            z => z['Members Growth Abs'],
            formatZoneLabel
        );
        const topZonesByMemberGrowth = buildSignedGrowthBoard(
            zoneData,
            z => z['Members Growth (%)'],
            formatZoneLabel,
            { asPercent: true }
        );

        const zoneByClubsRaw = [...zoneData]
            .sort((a, b) => (parseInt(b['Total Active Rotaract Clubs']) || 0) - (parseInt(a['Total Active Rotaract Clubs']) || 0));
        const maxZoneClubs = zoneByClubsRaw.length > 0 ? (parseInt(zoneByClubsRaw[0]['Total Active Rotaract Clubs']) || 1) : 1;
        const topZonesByClubs = zoneByClubsRaw.map(z => {
            const val = parseInt(z['Total Active Rotaract Clubs']) || 0;
            return {
                label: formatZoneLabel(z),
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneClubs) * 100)))
            };
        });

        const topZonesByClubGrowthAbs = buildSignedGrowthBoard(
            zoneData,
            z => z['Clubs Growth Abs'],
            formatZoneLabel
        );
        const topZonesByClubGrowth = buildSignedGrowthBoard(
            zoneData,
            z => z['Clubs Growth (%)'],
            formatZoneLabel,
            { asPercent: true }
        );

        const zoneByNewClubsRaw = [...newClubsZoneData]
            .filter(z => (z.newClubs || 0) > 0)
            .sort((a, b) => (b.newClubs || 0) - (a.newClubs || 0));
        const maxZoneNewClubs = zoneByNewClubsRaw.length > 0 ? (zoneByNewClubsRaw[0].newClubs || 1) : 1;
        const topZonesByNewClubs = zoneByNewClubsRaw.map(z => {
            const val = z.newClubs || 0;
            return {
                label: formatZoneLabel(z),
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneNewClubs) * 100)))
            };
        });

        const zoneByInteractRaw = [...interactZoneData]
            .sort((a, b) => (parseInt(b['Total Interact Clubs'] || b['Total Active Interact Clubs']) || 0) - (parseInt(a['Total Interact Clubs'] || a['Total Active Interact Clubs']) || 0));
        const maxZoneInteract = zoneByInteractRaw.length > 0 ? (parseInt(zoneByInteractRaw[0]['Total Interact Clubs'] || zoneByInteractRaw[0]['Total Active Interact Clubs']) || 1) : 1;
        const topZonesByInteractClubs = zoneByInteractRaw.map(z => {
            const val = parseInt(z['Total Interact Clubs'] || z['Total Active Interact Clubs']) || 0;
            return {
                label: formatZoneLabel(z),
                value: val.toLocaleString(),
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneInteract) * 100)))
            };
        });

        const topZonesByInteractGrowth = buildSignedGrowthBoard(
            interactZoneData,
            z => z['Interact Growth Abs'],
            formatZoneLabel
        );
        const topZonesByInteractGrowthPct = buildSignedGrowthBoard(
            interactZoneData,
            z => z['Interact Growth (%)'],
            formatZoneLabel,
            { asPercent: true }
        );

        return {
            clubsOverall,
            clubsCommunity,
            clubsUniversity,
            topDistrictsByMembers,
            topDistrictsByAvg,
            topDistrictsByMemberGrowthAbs,
            topDistrictsByMemberGrowth,
            topDistrictsByClubs,
            topDistrictsByClubGrowthAbs,
            topDistrictsByClubGrowth,
            topDistrictsByNewClubs,
            topDistrictsByInteractClubs,
            topDistrictsByInteractGrowth,
            topDistrictsByInteractGrowthPct,
            topCountriesByMembers,
            topCountriesByAvg,
            topCountriesByMemberGrowthAbs,
            topCountriesByMemberGrowth,
            topCountriesByClubs,
            topCountriesByClubGrowthAbs,
            topCountriesByClubGrowth,
            topCountriesByNewClubs,
            topZonesByMembers,
            topZonesByAvg,
            topZonesByMemberGrowthAbs,
            topZonesByMemberGrowth,
            topZonesByClubs,
            topZonesByClubGrowthAbs,
            topZonesByClubGrowth,
            topZonesByNewClubs,
            topZonesByInteractClubs,
            topZonesByInteractGrowth,
            topZonesByInteractGrowthPct
        };
    }, [
        topClubsWorldwide,
        topCommunityClubsWorldwide,
        topUniversityClubsWorldwide,
        districtData,
        countryData,
        zoneData,
        interactDistrictData,
        interactZoneData,
        newClubsDistrictData,
        newClubsCountryData,
        newClubsZoneData
    ]);

    return (
        <section style={{ marginBottom: '50px' }}>
            {/* Master Header with Universal Depth Selector */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <h2 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                    Worldwide Leaderboards
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
                        {[5, 10, 20, 50, 100].map((num) => (
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

            {/* Section 1: By Club */}
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: 'var(--text-main)', fontWeight: '700' }}>
                By Club
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Overall Membership"
                    description="Clubs with the largest total reported membership."
                    data={sortedData.clubsOverall}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.clubsOverall.length)}`}
                />
                <Leaderboard
                    title="Community-Based Clubs"
                    description="Community-based clubs with the most members."
                    data={sortedData.clubsCommunity}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.clubsCommunity.length)}`}
                />
                <Leaderboard
                    title="University-Based Clubs"
                    description="University-based clubs with the most members."
                    data={sortedData.clubsUniversity}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.clubsUniversity.length)}`}
                />
            </div>

            {/* Section 2: By District */}
            <h3 style={{ margin: '32px 0 16px 0', fontSize: '20px', color: 'var(--text-main)', fontWeight: '700' }}>
                By District
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Districts by Members"
                    description="Districts with the largest total Rotaract membership."
                    data={sortedData.topDistrictsByMembers}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByMembers.length)}`}
                />
                <Leaderboard
                    title="Districts by Avg. Members"
                    description="Districts with the highest average members per club."
                    data={sortedData.topDistrictsByAvg}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByAvg.length)}`}
                />
                <Leaderboard
                    title="Districts by Member Growth"
                    description="Districts ranked by net member change (gains and declines)."
                    data={sortedData.topDistrictsByMemberGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByMemberGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Districts by Member Growth (%)"
                    description="Districts ranked by percentage member change (gains and declines)."
                    data={sortedData.topDistrictsByMemberGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByMemberGrowth.length)}`}
                />
                <Leaderboard
                    title="Districts by Clubs"
                    description="Districts with the most active Rotaract clubs."
                    data={sortedData.topDistrictsByClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByClubs.length)}`}
                />
                <Leaderboard
                    title="Districts by Club Growth"
                    description="Districts ranked by net club-count change (gains and declines)."
                    data={sortedData.topDistrictsByClubGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByClubGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Districts by Club Growth (%)"
                    description="Districts ranked by percentage club-count change (gains and declines)."
                    data={sortedData.topDistrictsByClubGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByClubGrowth.length)}`}
                />
                <Leaderboard
                    title="Districts by New Clubs"
                    description="Districts with the most newly chartered Rotaract clubs."
                    data={sortedData.topDistrictsByNewClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByNewClubs.length)}`}
                />
                <Leaderboard
                    title="Districts by Interact Clubs"
                    description="Districts with the most Interact clubs worldwide."
                    data={sortedData.topDistrictsByInteractClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByInteractClubs.length)}`}
                />
                <Leaderboard
                    title="Districts by Interact Club Growth"
                    description="Districts ranked by net Interact club change (gains and declines)."
                    data={sortedData.topDistrictsByInteractGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByInteractGrowth.length)}`}
                />
                <Leaderboard
                    title="Districts by Interact Club Growth (%)"
                    description="Districts ranked by percentage Interact club change (gains and declines)."
                    data={sortedData.topDistrictsByInteractGrowthPct}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByInteractGrowthPct.length)}`}
                />
            </div>

            {/* Section 3: By Country */}
            <h3 style={{ margin: '32px 0 16px 0', fontSize: '20px', color: 'var(--text-main)', fontWeight: '700' }}>
                By Country
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Countries by Members"
                    description="Countries with the largest total Rotaract membership."
                    data={sortedData.topCountriesByMembers}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByMembers.length)}`}
                />
                <Leaderboard
                    title="Countries by Avg. Members"
                    description="Countries with the highest average members per club."
                    data={sortedData.topCountriesByAvg}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByAvg.length)}`}
                />
                <Leaderboard
                    title="Countries by Member Growth"
                    description="Countries ranked by net member change (gains and declines)."
                    data={sortedData.topCountriesByMemberGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByMemberGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Countries by Member Growth (%)"
                    description="Countries ranked by percentage member change (gains and declines)."
                    data={sortedData.topCountriesByMemberGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByMemberGrowth.length)}`}
                />
                <Leaderboard
                    title="Countries by Clubs"
                    description="Countries with the most active Rotaract clubs."
                    data={sortedData.topCountriesByClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByClubs.length)}`}
                />
                <Leaderboard
                    title="Countries by Club Growth"
                    description="Countries ranked by net club-count change (gains and declines)."
                    data={sortedData.topCountriesByClubGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByClubGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Countries by Club Growth (%)"
                    description="Countries ranked by percentage club-count change (gains and declines)."
                    data={sortedData.topCountriesByClubGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByClubGrowth.length)}`}
                />
                <Leaderboard
                    title="Countries by New Clubs"
                    description="Countries with the most newly chartered Rotaract clubs."
                    data={sortedData.topCountriesByNewClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByNewClubs.length)}`}
                />
            </div>

            {/* Section 4: By Zone */}
            <h3 style={{ margin: '32px 0 16px 0', fontSize: '20px', color: 'var(--text-main)', fontWeight: '700' }}>
                By Zone
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Zones by Members"
                    description="Zones with the largest total Rotaract membership."
                    data={sortedData.topZonesByMembers}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByMembers.length)}`}
                />
                <Leaderboard
                    title="Zones by Avg. Members"
                    description="Zones with the highest average members per club."
                    data={sortedData.topZonesByAvg}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByAvg.length)}`}
                />
                <Leaderboard
                    title="Zones by Member Growth"
                    description="Zones ranked by net member change (gains and declines)."
                    data={sortedData.topZonesByMemberGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByMemberGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Zones by Member Growth (%)"
                    description="Zones ranked by percentage member change (gains and declines)."
                    data={sortedData.topZonesByMemberGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByMemberGrowth.length)}`}
                />
                <Leaderboard
                    title="Zones by Clubs"
                    description="Zones with the most active Rotaract clubs."
                    data={sortedData.topZonesByClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByClubs.length)}`}
                />
                <Leaderboard
                    title="Zones by Club Growth"
                    description="Zones ranked by net club-count change (gains and declines)."
                    data={sortedData.topZonesByClubGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByClubGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Zones by Club Growth (%)"
                    description="Zones ranked by percentage club-count change (gains and declines)."
                    data={sortedData.topZonesByClubGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByClubGrowth.length)}`}
                />
                <Leaderboard
                    title="Zones by New Clubs"
                    description="Zones with the most newly chartered Rotaract clubs."
                    data={sortedData.topZonesByNewClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByNewClubs.length)}`}
                />
                <Leaderboard
                    title="Zones by Interact Clubs"
                    description="Zones with the most Interact clubs worldwide."
                    data={sortedData.topZonesByInteractClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByInteractClubs.length)}`}
                />
                <Leaderboard
                    title="Zones by Interact Club Growth"
                    description="Zones ranked by net Interact club change (gains and declines)."
                    data={sortedData.topZonesByInteractGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByInteractGrowth.length)}`}
                />
                <Leaderboard
                    title="Zones by Interact Club Growth (%)"
                    description="Zones ranked by percentage Interact club change (gains and declines)."
                    data={sortedData.topZonesByInteractGrowthPct}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByInteractGrowthPct.length)}`}
                />
            </div>
        </section>
    );
}
