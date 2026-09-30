'use client';

import { useState, useMemo } from 'react';
import Leaderboard from '@/components/ui/Leaderboard';

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

        const distByMemberGrowthAbsRaw = [...districtData]
            .filter(d => (d['Members Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Members Growth Abs'] || 0) - (a['Members Growth Abs'] || 0));
        const maxDistMemGrowthAbs = distByMemberGrowthAbsRaw.length > 0 ? (distByMemberGrowthAbsRaw[0]['Members Growth Abs'] || 1) : 1;
        const topDistrictsByMemberGrowthAbs = distByMemberGrowthAbsRaw.map(d => {
            const val = d['Members Growth Abs'] || 0;
            return {
                label: `District ${d['District']}`,
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistMemGrowthAbs) * 100)))
            };
        });

        const distByMemberGrowthPctRaw = [...districtData]
            .filter(d => (d['Members Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Members Growth (%)'] || 0) - (a['Members Growth (%)'] || 0));
        const maxDistMemGrowthPct = distByMemberGrowthPctRaw.length > 0 ? (distByMemberGrowthPctRaw[0]['Members Growth (%)'] || 1) : 1;
        const topDistrictsByMemberGrowth = distByMemberGrowthPctRaw.map(d => {
            const val = d['Members Growth (%)'] || 0;
            return {
                label: `District ${d['District']}`,
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistMemGrowthPct) * 100)))
            };
        });

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

        const distByClubGrowthAbsRaw = [...districtData]
            .filter(d => (d['Clubs Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Clubs Growth Abs'] || 0) - (a['Clubs Growth Abs'] || 0));
        const maxDistClubGrowthAbs = distByClubGrowthAbsRaw.length > 0 ? (distByClubGrowthAbsRaw[0]['Clubs Growth Abs'] || 1) : 1;
        const topDistrictsByClubGrowthAbs = distByClubGrowthAbsRaw.map(d => {
            const val = d['Clubs Growth Abs'] || 0;
            return {
                label: `District ${d['District']}`,
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistClubGrowthAbs) * 100)))
            };
        });

        const distByClubGrowthPctRaw = [...districtData]
            .filter(d => (d['Clubs Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Clubs Growth (%)'] || 0) - (a['Clubs Growth (%)'] || 0));
        const maxDistClubGrowthPct = distByClubGrowthPctRaw.length > 0 ? (distByClubGrowthPctRaw[0]['Clubs Growth (%)'] || 1) : 1;
        const topDistrictsByClubGrowth = distByClubGrowthPctRaw.map(d => {
            const val = d['Clubs Growth (%)'] || 0;
            return {
                label: `District ${d['District']}`,
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistClubGrowthPct) * 100)))
            };
        });

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

        const distByInteractGrowthAbsRaw = [...interactDistrictData]
            .filter(d => (d['Interact Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Interact Growth Abs'] || 0) - (a['Interact Growth Abs'] || 0));
        const maxDistInteractGrowthAbs = distByInteractGrowthAbsRaw.length > 0 ? (distByInteractGrowthAbsRaw[0]['Interact Growth Abs'] || 1) : 1;
        const topDistrictsByInteractGrowth = distByInteractGrowthAbsRaw.map(d => {
            const val = d['Interact Growth Abs'] || 0;
            return {
                label: `District ${d.District}`,
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistInteractGrowthAbs) * 100)))
            };
        });

        const distByInteractGrowthPctRaw = [...interactDistrictData]
            .filter(d => (d['Interact Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Interact Growth (%)'] || 0) - (a['Interact Growth (%)'] || 0));
        const maxDistInteractGrowthPct = distByInteractGrowthPctRaw.length > 0 ? (distByInteractGrowthPctRaw[0]['Interact Growth (%)'] || 1) : 1;
        const topDistrictsByInteractGrowthPct = distByInteractGrowthPctRaw.map(d => {
            const val = d['Interact Growth (%)'] || 0;
            return {
                label: `District ${d.District}`,
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxDistInteractGrowthPct) * 100)))
            };
        });

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

        const countryByMemGrowthAbsRaw = [...validCountries]
            .filter(c => (c['Members Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Members Growth Abs'] || 0) - (a['Members Growth Abs'] || 0));
        const maxCountryMemGrowthAbs = countryByMemGrowthAbsRaw.length > 0 ? (countryByMemGrowthAbsRaw[0]['Members Growth Abs'] || 1) : 1;
        const topCountriesByMemberGrowthAbs = countryByMemGrowthAbsRaw.map(c => {
            const val = c['Members Growth Abs'] || 0;
            return {
                label: c[' '] || c['Country'],
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxCountryMemGrowthAbs) * 100)))
            };
        });

        const countryByMemGrowthPctRaw = [...validCountries]
            .filter(c => (c['Members Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Members Growth (%)'] || 0) - (a['Members Growth (%)'] || 0));
        const maxCountryMemGrowthPct = countryByMemGrowthPctRaw.length > 0 ? (countryByMemGrowthPctRaw[0]['Members Growth (%)'] || 1) : 1;
        const topCountriesByMemberGrowth = countryByMemGrowthPctRaw.map(c => {
            const val = c['Members Growth (%)'] || 0;
            return {
                label: c[' '] || c['Country'],
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxCountryMemGrowthPct) * 100)))
            };
        });

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

        const countryByClubGrowthAbsRaw = [...validCountries]
            .filter(c => (c['Clubs Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Clubs Growth Abs'] || 0) - (a['Clubs Growth Abs'] || 0));
        const maxCountryClubGrowthAbs = countryByClubGrowthAbsRaw.length > 0 ? (countryByClubGrowthAbsRaw[0]['Clubs Growth Abs'] || 1) : 1;
        const topCountriesByClubGrowthAbs = countryByClubGrowthAbsRaw.map(c => {
            const val = c['Clubs Growth Abs'] || 0;
            return {
                label: c[' '] || c['Country'],
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxCountryClubGrowthAbs) * 100)))
            };
        });

        const countryByClubGrowthPctRaw = [...validCountries]
            .filter(c => (c['Clubs Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Clubs Growth (%)'] || 0) - (a['Clubs Growth (%)'] || 0));
        const maxCountryClubGrowthPct = countryByClubGrowthPctRaw.length > 0 ? (countryByClubGrowthPctRaw[0]['Clubs Growth (%)'] || 1) : 1;
        const topCountriesByClubGrowth = countryByClubGrowthPctRaw.map(c => {
            const val = c['Clubs Growth (%)'] || 0;
            return {
                label: c[' '] || c['Country'],
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxCountryClubGrowthPct) * 100)))
            };
        });

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

        const zoneByMemGrowthAbsRaw = [...zoneData]
            .filter(z => (z['Members Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Members Growth Abs'] || 0) - (a['Members Growth Abs'] || 0));
        const maxZoneMemGrowthAbs = zoneByMemGrowthAbsRaw.length > 0 ? (zoneByMemGrowthAbsRaw[0]['Members Growth Abs'] || 1) : 1;
        const topZonesByMemberGrowthAbs = zoneByMemGrowthAbsRaw.map(z => {
            const val = z['Members Growth Abs'] || 0;
            return {
                label: formatZoneLabel(z),
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneMemGrowthAbs) * 100)))
            };
        });

        const zoneByMemGrowthPctRaw = [...zoneData]
            .filter(z => (z['Members Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Members Growth (%)'] || 0) - (a['Members Growth (%)'] || 0));
        const maxZoneMemGrowthPct = zoneByMemGrowthPctRaw.length > 0 ? (zoneByMemGrowthPctRaw[0]['Members Growth (%)'] || 1) : 1;
        const topZonesByMemberGrowth = zoneByMemGrowthPctRaw.map(z => {
            const val = z['Members Growth (%)'] || 0;
            return {
                label: formatZoneLabel(z),
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneMemGrowthPct) * 100)))
            };
        });

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

        const zoneByClubGrowthAbsRaw = [...zoneData]
            .filter(z => (z['Clubs Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Clubs Growth Abs'] || 0) - (a['Clubs Growth Abs'] || 0));
        const maxZoneClubGrowthAbs = zoneByClubGrowthAbsRaw.length > 0 ? (zoneByClubGrowthAbsRaw[0]['Clubs Growth Abs'] || 1) : 1;
        const topZonesByClubGrowthAbs = zoneByClubGrowthAbsRaw.map(z => {
            const val = z['Clubs Growth Abs'] || 0;
            return {
                label: formatZoneLabel(z),
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneClubGrowthAbs) * 100)))
            };
        });

        const zoneByClubGrowthPctRaw = [...zoneData]
            .filter(z => (z['Clubs Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Clubs Growth (%)'] || 0) - (a['Clubs Growth (%)'] || 0));
        const maxZoneClubGrowthPct = zoneByClubGrowthPctRaw.length > 0 ? (zoneByClubGrowthPctRaw[0]['Clubs Growth (%)'] || 1) : 1;
        const topZonesByClubGrowth = zoneByClubGrowthPctRaw.map(z => {
            const val = z['Clubs Growth (%)'] || 0;
            return {
                label: formatZoneLabel(z),
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneClubGrowthPct) * 100)))
            };
        });

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

        const zoneByInteractGrowthAbsRaw = [...interactZoneData]
            .filter(z => (z['Interact Growth Abs'] || 0) > 0)
            .sort((a, b) => (b['Interact Growth Abs'] || 0) - (a['Interact Growth Abs'] || 0));
        const maxZoneInteractGrowthAbs = zoneByInteractGrowthAbsRaw.length > 0 ? (zoneByInteractGrowthAbsRaw[0]['Interact Growth Abs'] || 1) : 1;
        const topZonesByInteractGrowth = zoneByInteractGrowthAbsRaw.map(z => {
            const val = z['Interact Growth Abs'] || 0;
            return {
                label: formatZoneLabel(z),
                value: `+${val.toLocaleString()}`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneInteractGrowthAbs) * 100)))
            };
        });

        const zoneByInteractGrowthPctRaw = [...interactZoneData]
            .filter(z => (z['Interact Growth (%)'] || 0) > 0)
            .sort((a, b) => (b['Interact Growth (%)'] || 0) - (a['Interact Growth (%)'] || 0));
        const maxZoneInteractGrowthPct = zoneByInteractGrowthPctRaw.length > 0 ? (zoneByInteractGrowthPctRaw[0]['Interact Growth (%)'] || 1) : 1;
        const topZonesByInteractGrowthPct = zoneByInteractGrowthPctRaw.map(z => {
            const val = z['Interact Growth (%)'] || 0;
            return {
                label: formatZoneLabel(z),
                value: `+${val.toFixed(1)}%`,
                progressPct: Math.max(4, Math.min(100, Math.round((val / maxZoneInteractGrowthPct) * 100)))
            };
        });

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
                    description="Districts with the largest increase in members."
                    data={sortedData.topDistrictsByMemberGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByMemberGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Districts by Member Growth (%)"
                    description="Districts with the largest percentage increase in members."
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
                    description="Districts with the largest increase in active clubs."
                    data={sortedData.topDistrictsByClubGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByClubGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Districts by Club Growth (%)"
                    description="Districts with the largest percentage increase in active clubs."
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
                    description="Districts with the largest increase in Interact clubs."
                    data={sortedData.topDistrictsByInteractGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topDistrictsByInteractGrowth.length)}`}
                />
                <Leaderboard
                    title="Districts by Interact Club Growth (%)"
                    description="Districts with the largest percentage increase in Interact clubs."
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
                    description="Countries with the largest increase in members."
                    data={sortedData.topCountriesByMemberGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByMemberGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Countries by Member Growth (%)"
                    description="Countries with the largest percentage increase in members."
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
                    description="Countries with the largest increase in active clubs."
                    data={sortedData.topCountriesByClubGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topCountriesByClubGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Countries by Club Growth (%)"
                    description="Countries with the largest percentage increase in active clubs."
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
                    description="Zones with the largest increase in members."
                    data={sortedData.topZonesByMemberGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByMemberGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Zones by Member Growth (%)"
                    description="Zones with the largest percentage increase in members."
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
                    description="Zones with the largest increase in active clubs."
                    data={sortedData.topZonesByClubGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByClubGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Zones by Club Growth (%)"
                    description="Zones with the largest percentage increase in active clubs."
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
                    description="Zones with the largest increase in Interact clubs."
                    data={sortedData.topZonesByInteractGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByInteractGrowth.length)}`}
                />
                <Leaderboard
                    title="Zones by Interact Club Growth (%)"
                    description="Zones with the largest percentage increase in Interact clubs."
                    data={sortedData.topZonesByInteractGrowthPct}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, sortedData.topZonesByInteractGrowthPct.length)}`}
                />
            </div>
        </section>
    );
}
