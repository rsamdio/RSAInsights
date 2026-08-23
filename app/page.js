import { getDashboardSummary, getArrears, getNoOfficers, getRotaryNoSponsor, getRotaryNoInteract, getZoneSummary, getAllClubs, getTRFContributions, getNewClubs } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import DoughnutChart from '@/components/charts/DoughnutChart';
import BarChart from '@/components/charts/BarChart';
import GlobalTables from '@/components/tables/GlobalTables';
import TopChartsSection from '@/components/sections/TopChartsSection';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
    title: {
        absolute: 'Insights | Rotaract South Asia MDIO',
    },
    description: 'Official analytics, membership demographics, TRF giving, and club performance dashboard for Rotaract Zones 4, 5, 6 & 7 across South Asia by Rotaract South Asia MDIO.',
    alternates: {
        canonical: 'https://insights.rsamdio.org',
    },
    openGraph: {
        title: 'Insights | Rotaract South Asia MDIO',
        description: 'Official analytics, membership demographics, TRF giving, and club performance dashboard for Rotaract Zones 4, 5, 6 & 7 across South Asia.',
        url: 'https://insights.rsamdio.org',
        siteName: 'Rotaract South Asia MDIO Insights',
        images: [
            {
                url: '/rsamdio.webp',
                width: 1200,
                height: 630,
                alt: 'Insights | Rotaract South Asia MDIO',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        site: '@rsa_mdio',
        creator: '@rsa_mdio',
        title: 'Insights | Rotaract South Asia MDIO',
        description: 'Official analytics, membership demographics, TRF giving, and club performance dashboard for Rotaract Zones 4, 5, 6 & 7 across South Asia.',
        images: ['/rsamdio.webp'],
    },
};

export default async function GlobalDashboard({ searchParams }) {
    const { zone, district } = await searchParams;
    const summary = await getDashboardSummary();
    const arrearsData = await getArrears() || [];
    const officersData = await getNoOfficers() || [];
    const rotaryData = await getRotaryNoSponsor() || [];
    const rotaryNoInteractData = await getRotaryNoInteract() || [];
    const zoneTableData = await getZoneSummary() || [];
    const allClubsData = await getAllClubs() || [];
    const trfData = await getTRFContributions() || [];
    
    if (!summary) return <div>Error loading data. Run data generation script first.</div>;
    
    let overall = summary.current.overall;
    let prevOverall = summary.previous?.overall || {};
    let filteredZones = { ...summary.current.zones };
    let filteredZoneTableData = zoneTableData;
    let filteredArrearsData = arrearsData;
    let filteredOfficersData = officersData;
    let filteredRotaryData = rotaryData;
    let filteredRotaryNoInteractData = rotaryNoInteractData;
    let filteredNewClubsData = await getNewClubs() || [];
    let filteredTrfData = trfData;
    let filteredAllClubsData = allClubsData;

    const normalizeZoneName = (val) => val.toString().startsWith('Zone') ? val.toString() : `Zone ${val.toString()}`;
    const selectedDistricts = district ? district.split(',') : [];
    const selectedZones = zone ? zone.split(',') : [];

    // Apply strict filtering if a zone or district is selected
    if (selectedDistricts.length > 0) {
        filteredZoneTableData = filteredZoneTableData.filter(z => selectedDistricts.includes(z['RI District'].toString()));
        filteredArrearsData = filteredArrearsData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredOfficersData = filteredOfficersData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredRotaryData = filteredRotaryData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredRotaryNoInteractData = filteredRotaryNoInteractData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredNewClubsData = filteredNewClubsData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredTrfData = filteredTrfData.filter(c => selectedDistricts.includes(c.District?.toString()));
        filteredAllClubsData = filteredAllClubsData.filter(c => selectedDistricts.includes(c.District?.toString()));
        
        let zoneNames = Array.from(new Set(filteredZoneTableData.map(z => normalizeZoneName(z['RI Zone']))));
        filteredZones = {};
        zoneNames.forEach(zName => {
            if (summary.current.zones[zName]) {
                const zoneData = summary.current.zones[zName];
                const filteredDistrictsForZone = {};
                
                Object.keys(zoneData.districts || {}).forEach(d => {
                    if (selectedDistricts.includes(d)) {
                        filteredDistrictsForZone[d] = zoneData.districts[d];
                    }
                });

                filteredZones[zName] = {
                    ...zoneData,
                    districts: filteredDistrictsForZone
                };
            }
        });
        
        // Recompute overall for these specific districts by summing from filtered zones
        const selectedDistStats = [];
        Object.values(filteredZones).forEach(z => {
            Object.values(z.districts || {}).forEach(d => {
                selectedDistStats.push(d);
            });
        });

        overall = {
            ...overall,
            totalClubs: selectedDistStats.reduce((sum, d) => sum + (d.totalClubs || 0), 0),
            totalMembers: selectedDistStats.reduce((sum, d) => sum + (d.totalMembers || 0), 0),
            outstanding: selectedDistStats.reduce((sum, d) => sum + (d.outstanding || 0), 0),
            arrearsClubs: selectedDistStats.reduce((sum, d) => sum + (d.arrearsClubs || 0), 0),
            atRisk: selectedDistStats.reduce((sum, d) => sum + (d.atRisk || 0), 0),
            noOfficers: selectedDistStats.reduce((sum, d) => sum + (d.noOfficers || 0), 0),
            
            totalRotary: selectedDistStats.reduce((sum, d) => sum + (d.totalRotary || 0), 0),
            rotaryWithSponsor: selectedDistStats.reduce((sum, d) => sum + (d.rotaryWithSponsor || 0), 0),
            rotaryWithoutSponsor: selectedDistStats.reduce((sum, d) => sum + (d.rotaryWithoutSponsor || 0), 0),
            
            arrUniv: selectedDistStats.reduce((sum, d) => sum + (d.arrUniv || 0), 0),
            arrComm: selectedDistStats.reduce((sum, d) => sum + (d.arrComm || 0), 0),
            noOffUniv: selectedDistStats.reduce((sum, d) => sum + (d.noOffUniv || 0), 0),
            noOffComm: selectedDistStats.reduce((sum, d) => sum + (d.noOffComm || 0), 0),

            trfClubs: selectedDistStats.reduce((sum, d) => sum + (d.trfClubs || 0), 0),
            trfContributionsUSD: selectedDistStats.reduce((sum, d) => sum + (d.trfContributionsUSD || 0), 0),
            trfAnnualUSD: selectedDistStats.reduce((sum, d) => sum + (d.trfAnnualUSD || 0), 0),
            trfPolioUSD: selectedDistStats.reduce((sum, d) => sum + (d.trfPolioUSD || 0), 0),
            trfOtherUSD: selectedDistStats.reduce((sum, d) => sum + (d.trfOtherUSD || 0), 0),
            trfEndowmentUSD: selectedDistStats.reduce((sum, d) => sum + (d.trfEndowmentUSD || 0), 0),
            newTotalClubs: selectedDistStats.reduce((sum, d) => sum + (d.newTotalClubs || 0), 0),
            totalUniv: selectedDistStats.reduce((sum, d) => sum + (d.totalUniv || 0), 0),
            totalComm: selectedDistStats.reduce((sum, d) => sum + (d.totalComm || 0), 0),
            membersUniv: selectedDistStats.reduce((sum, d) => sum + (d.membersUniv || 0), 0),
            membersComm: selectedDistStats.reduce((sum, d) => sum + (d.membersComm || 0), 0),

            totalInteractClubs: selectedDistStats.reduce((sum, d) => sum + (d.totalInteractClubs || 0), 0),
            suspendedInteractClubs: selectedDistStats.reduce((sum, d) => sum + (d.suspendedInteractClubs || 0), 0),
            rotaractWithInteract: selectedDistStats.reduce((sum, d) => sum + (d.rotaractWithInteract || 0), 0),
            rotaryWithInteract: selectedDistStats.reduce((sum, d) => sum + (d.rotaryWithInteract || 0), 0),
            rotaryWithoutInteract: selectedDistStats.reduce((sum, d) => sum + (d.rotaryWithoutInteract || 0), 0),
            rotaryWithSuspendedInteract: selectedDistStats.reduce((sum, d) => sum + (d.rotaryWithSuspendedInteract || 0), 0)
        };
        // Compute prevOverall for filtered districts
        const dSet = new Set(selectedDistricts);
        let prevFilteredDistricts = [];
        
        Object.keys(summary.previous.zones).forEach(z => {
            Object.keys(summary.previous.zones[z].districts || {}).forEach(d => {
                if (dSet.has(d)) {
                    prevFilteredDistricts.push(summary.previous.zones[z].districts[d]);
                }
            });
        });
        
        prevOverall = {
            totalClubs: prevFilteredDistricts.reduce((sum, d) => sum + (d.totalClubs || 0), 0),
            totalMembers: prevFilteredDistricts.reduce((sum, d) => sum + (d.totalMembers || 0), 0),
            totalRotary: prevFilteredDistricts.reduce((sum, d) => sum + (d.totalRotary || 0), 0),
            outstanding: prevFilteredDistricts.reduce((sum, d) => sum + (d.outstanding || 0), 0),
            arrearsClubs: prevFilteredDistricts.reduce((sum, d) => sum + (d.arrearsClubs || 0), 0),
            atRisk: prevFilteredDistricts.reduce((sum, d) => sum + (d.atRisk || 0), 0),
            noOfficers: prevFilteredDistricts.reduce((sum, d) => sum + (d.noOfficers || 0), 0),
            totalInteractClubs: prevFilteredDistricts.reduce((sum, d) => sum + (d.totalInteractClubs || 0), 0)
        };
    } else if (selectedZones.length > 0) {
        const formattedZones = selectedZones.map(normalizeZoneName);
        
        filteredZones = {};
        formattedZones.forEach(zName => {
            if (summary.current.zones[zName]) {
                filteredZones[zName] = summary.current.zones[zName];
            }
        });
        
        filteredZoneTableData = filteredZoneTableData.filter(z => formattedZones.includes(normalizeZoneName(z['RI Zone'])));
        filteredArrearsData = filteredArrearsData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredOfficersData = filteredOfficersData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredRotaryData = filteredRotaryData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredRotaryNoInteractData = filteredRotaryNoInteractData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredNewClubsData = filteredNewClubsData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredTrfData = filteredTrfData.filter(c => formattedZones.includes(normalizeZoneName(c['RI Zone'])));
        filteredAllClubsData = filteredAllClubsData.filter(c => c['Zone'] && formattedZones.includes(normalizeZoneName(c['Zone'])));
        
        // Recompute overall for zones
        overall = {
            ...overall,
            totalClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalClubs || 0), 0),
            totalMembers: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalMembers || 0), 0),
            outstanding: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.outstanding || 0), 0),
            arrearsClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.arrearsClubs || 0), 0),
            atRisk: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.atRisk || 0), 0),
            noOfficers: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.noOfficers || 0), 0),
            
            totalRotary: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalRotary || 0), 0),
            rotaryWithSponsor: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaryWithSponsor || 0), 0),
            rotaryWithoutSponsor: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaryWithoutSponsor || 0), 0),
            
            arrUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.arrUniv || 0), 0),
            arrComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.arrComm || 0), 0),
            noOffUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.noOffUniv || 0), 0),
            noOffComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.noOffComm || 0), 0),

            trfClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfClubs || 0), 0),
            trfContributionsUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfContributionsUSD || 0), 0),
            trfAnnualUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfAnnualUSD || 0), 0),
            trfPolioUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfPolioUSD || 0), 0),
            trfOtherUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfOtherUSD || 0), 0),
            trfEndowmentUSD: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.trfEndowmentUSD || 0), 0),
            newTotalClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.newTotalClubs || 0), 0),
            totalUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalUniv || 0), 0),
            totalComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalComm || 0), 0),
            membersUniv: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.membersUniv || 0), 0),
            membersComm: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.membersComm || 0), 0),

            totalInteractClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.totalInteractClubs || 0), 0),
            suspendedInteractClubs: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.suspendedInteractClubs || 0), 0),
            rotaractWithInteract: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaractWithInteract || 0), 0),
            rotaryWithInteract: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaryWithInteract || 0), 0),
            rotaryWithoutInteract: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaryWithoutInteract || 0), 0),
            rotaryWithSuspendedInteract: Object.values(filteredZones).reduce((sum, z) => sum + (z.stats.rotaryWithSuspendedInteract || 0), 0)
        };
        // Compute prevOverall for filtered zones
        let prevFilteredZones = [];
        formattedZones.forEach(zName => {
            if (summary.previous.zones[zName]) {
                prevFilteredZones.push(summary.previous.zones[zName]);
            }
        });
        
        prevOverall = {
            totalClubs: prevFilteredZones.reduce((sum, z) => sum + (z.stats.totalClubs || 0), 0),
            totalMembers: prevFilteredZones.reduce((sum, z) => sum + (z.stats.totalMembers || 0), 0),
            totalRotary: prevFilteredZones.reduce((sum, z) => sum + (z.stats.totalRotary || 0), 0),
            outstanding: prevFilteredZones.reduce((sum, z) => sum + (z.stats.outstanding || 0), 0),
            arrearsClubs: prevFilteredZones.reduce((sum, z) => sum + (z.stats.arrearsClubs || 0), 0),
            atRisk: prevFilteredZones.reduce((sum, z) => sum + (z.stats.atRisk || 0), 0),
            noOfficers: prevFilteredZones.reduce((sum, z) => sum + (z.stats.noOfficers || 0), 0),
            totalInteractClubs: prevFilteredZones.reduce((sum, z) => sum + (z.stats.totalInteractClubs || 0), 0)
        };
    }

    // --- Trend Computation Helpers ---
    const getDelta = (key, format = 'number') => {
        if (!prevOverall[key] && prevOverall[key] !== 0) return null; // No history available for this cut
        const diff = overall[key] - prevOverall[key];
        if (diff === 0) return null;
        
        const pct = prevOverall[key] ? Math.abs((diff / prevOverall[key]) * 100).toFixed(1) : 0;
        const isGood = key === 'totalClubs' || key === 'totalMembers' || key === 'totalRotary' || key === 'totalInteractClubs' ? diff > 0 : diff < 0; // Growth is good, arrears/dues are bad
        
        const arrow = diff > 0 ? '↑' : '↓';
        const absDiff = Math.abs(diff);
        let diffStr = absDiff.toLocaleString();
        if (format === 'inr') {
            diffStr = `₹${Math.round(absDiff).toLocaleString('en-IN')}`;
        } else if (format === 'usd') {
            diffStr = `$${absDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        const textStr = `${arrow} ${diffStr} (${pct}%)`;

        return { text: textStr, type: isGood ? 'positive' : 'negative', baseline: 'vs July 1' };
    };

    // --- Chart Data Preps ---
    const zoneLabels = Object.keys(filteredZones);
    const zoneArrears = zoneLabels.map(z => filteredZones[z]?.stats?.arrearsClubs || 0);
    
    const arrearsByZoneChart = {
        labels: zoneLabels,
        datasets: [{
            data: zoneArrears,
            backgroundColor: ['#1a73e8', '#1e8e3e', '#d93025', '#f9ab00', '#8e24aa', '#00acc1'],
            borderWidth: 0, hoverOffset: 10
        }]
    };

    const atRiskUniv = filteredArrearsData.filter(c => Number(c[' USD Outstanding '] || 0) >= 75 && (c['Club Base'] || '').toLowerCase().includes('university')).length;
    const atRiskComm = filteredArrearsData.filter(c => Number(c[' USD Outstanding '] || 0) >= 75 && (c['Club Base'] || '').toLowerCase().includes('community')).length;

    const arrearsBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Clubs in Arrears',
            data: [overall.arrUniv, overall.arrComm],
            backgroundColor: ['#1a73e8', '#f9ab00'],
            borderRadius: 6
        }]
    };

    const officersBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Clubs missing Officers',
            data: [overall.noOffUniv, overall.noOffComm],
            backgroundColor: ['#d93025', '#8e24aa'],
            borderRadius: 6
        }]
    };
    
    const termBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Subject to Termination',
            data: [atRiskUniv, atRiskComm],
            backgroundColor: ['#d93025', '#c5221f'],
            borderRadius: 6
        }]
    };

    const demographicsBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Total Clubs',
            data: [overall.totalUniv, overall.totalComm],
            backgroundColor: ['#1a73e8', '#1e8e3e'],
            borderRadius: 6
        }]
    };

    const membersBaseChart = {
        labels: ['University', 'Community'],
        datasets: [{
            label: 'Total Members',
            data: [overall.membersUniv, overall.membersComm],
            backgroundColor: ['#1a73e8', '#f9ab00'],
            borderRadius: 6
        }]
    };

    const trfFundChart = {
        labels: ['Annual', 'PolioPlus', 'Endowment', 'Other'],
        datasets: [{
            label: 'TRF Contributions (USD)',
            data: [overall.trfAnnualUSD, overall.trfPolioUSD, overall.trfEndowmentUSD, overall.trfOtherUSD],
            backgroundColor: ['#1a73e8', '#d93025', '#f9ab00', '#8e24aa'],
            borderRadius: 6
        }]
    };

    // --- Rotary Penentration Logic ---
    const penGood = overall.totalRotary ? Math.round((overall.rotaryWithSponsor / overall.totalRotary) * 100) : 0;
    const penBad = overall.totalRotary ? Math.round((overall.rotaryWithoutSponsor / overall.totalRotary) * 100) : 0;

    const avgMembers = overall.totalClubs > 0 ? (overall.totalMembers / overall.totalClubs) : 0;
    const prevAvgMembers = prevOverall?.totalClubs > 0 ? (prevOverall.totalMembers / prevOverall.totalClubs) : 0;
    
    let avgDelta = null;
    if (prevAvgMembers) {
        const diff = avgMembers - prevAvgMembers;
        if (diff !== 0) {
            const pct = Math.abs((diff / prevAvgMembers) * 100).toFixed(1);
            const isGood = diff > 0;
            const arrow = diff > 0 ? '↑' : '↓';
            const absDiff = Math.abs(diff);
            const diffStr = absDiff.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
            const textStr = `${arrow} ${diffStr} (${pct}%)`;
            avgDelta = { text: textStr, type: isGood ? 'positive' : 'negative', baseline: 'vs July 1' };
        }
    }

    const activeInteract = (overall.totalInteractClubs || 0) - (overall.suspendedInteractClubs || 0);
    const activeInteractPct = overall.totalInteractClubs > 0 ? Math.round((activeInteract / overall.totalInteractClubs) * 100) : 0;
    const rotaractSponsorPct = overall.totalClubs > 0 ? ((overall.rotaractWithInteract / overall.totalClubs) * 100).toFixed(1) : 0;

    const homePageSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': 'https://insights.rsamdio.org/#webpage',
        url: 'https://insights.rsamdio.org',
        name: 'Insights | Rotaract South Asia MDIO',
        isPartOf: {
            '@id': 'https://insights.rsamdio.org/#website',
        },
        about: {
            '@id': 'https://insights.rsamdio.org/#dataset',
        },
        description: 'Official analytics platform and club directory for Rotaract Zones 4, 5, 6 & 7.',
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://insights.rsamdio.org',
                },
            ],
        },
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <JsonLd schema={homePageSchema} />
            <h2 className="section-title" style={{ marginTop: 0 }}>
                Executive Summary
            </h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Total Rotaract Clubs" value={overall.totalClubs?.toLocaleString()} trend={getDelta('totalClubs')} />
                <MetricCard title="Total Members" value={overall.totalMembers?.toLocaleString()} trend={getDelta('totalMembers')} />
                <MetricCard title="Average Membership" value={avgMembers.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} trend={avgDelta} />
                <MetricCard title="New Chartered Clubs" value={overall.newTotalClubs?.toLocaleString()} />
                <MetricCard title="Clubs w/ TRF Contribution" value={overall.trfClubs?.toLocaleString()} />
                <MetricCard title="Total TRF Contributions" value={`$${overall.trfContributionsUSD?.toLocaleString()}`} />
            </section>

            <h2 className="section-title">Demographics & Foundation Breakdown</h2>
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={demographicsBaseChart} title="Total Clubs by Base Type" />
                <BarChart data={membersBaseChart} title="Total Members by Base Type" />
                <BarChart data={trfFundChart} title="TRF Contributions by Fund (USD)" />
            </section>

            <h2 className="section-title">Rotary-Rotaract Integration</h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Rotary Clubs" value={overall.totalRotary?.toLocaleString()} trend={getDelta('totalRotary')} />
                <MetricCard title="Rotary with Sponsored Rotaract" value={overall.rotaryWithSponsor.toLocaleString()} trend={{text: `${penGood}% Integration`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Sponsored Rotaract" value={overall.rotaryWithoutSponsor.toLocaleString()} trend={{text: `${penBad}% Missed Opportunity`, type: 'negative'}} isWarning={true} />
            </section>

            <h2 className="section-title">Interact Ecosystem</h2>
            <section className="metrics-grid four-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Interact Clubs" value={overall.totalInteractClubs?.toLocaleString() || '0'} trend={getDelta('totalInteractClubs')} />
                <MetricCard title="Active Interact Clubs" value={activeInteract.toLocaleString()} trend={{text: `${activeInteractPct}% Active Rate`, type: 'positive'}} />
                <MetricCard title="Rotary w/o Interact Club" value={overall.rotaryWithoutInteract?.toLocaleString() || '0'} trend={overall.totalRotary ? {text: `${Math.round(((overall.rotaryWithoutInteract || 0) / overall.totalRotary) * 100)}% Opportunity`, type: 'negative'} : null} isWarning={true} />
                <MetricCard title="Rotaract Sponsoring Interact" value={overall.rotaractWithInteract?.toLocaleString() || '0'} trend={{text: `${rotaractSponsorPct}% of Rotaract Clubs`, type: 'positive'}} />
            </section>

            <h2 className="section-title">Compliance & Risks</h2>
            <section className="metrics-grid five-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Outstanding Dues*" value={`₹${Math.round(overall.outstanding || 0).toLocaleString('en-IN')}`} trend={getDelta('outstanding', 'inr')} />
                <MetricCard title="Clubs in Arrears" value={overall.arrearsClubs?.toLocaleString()} trend={getDelta('arrearsClubs')} />
                <MetricCard title="Subject to Termination" value={overall.atRisk?.toLocaleString()} isWarning={true} trend={getDelta('atRisk')} />
                <MetricCard title="Unreported Officers" value={overall.noOfficers?.toLocaleString()} trend={getDelta('noOfficers')} />
                <MetricCard title="Suspended Interact" value={overall.suspendedInteractClubs?.toLocaleString() || '0'} trend={overall.totalInteractClubs ? {text: `${Math.round(((overall.suspendedInteractClubs || 0) / overall.totalInteractClubs) * 100)}% of Interact`, type: 'negative'} : null} isWarning={true} />
            </section>
            
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={termBaseChart} title="Subject to Termination by Base" />
                <BarChart data={arrearsBaseChart} title="Arrears by Base" />
                <BarChart data={officersBaseChart} title="Missing Officers by Base" />
            </section>

            <TopChartsSection summary={{ zones: filteredZones }} arrearsData={filteredArrearsData} allClubsData={filteredAllClubsData} trfData={filteredTrfData} />

            <section style={{ marginBottom: '40px' }}>
                <Link href="/worldwide" style={{ textDecoration: 'none' }}>
                    <div className="worldwide-banner">
                        <div className="worldwide-banner-content">
                            <h2 className="worldwide-banner-title">
                                <span>🌍</span>
                                <span>Rotaract Worldwide Statistics</span>
                            </h2>
                            <p className="worldwide-banner-subtitle">
                                View the Worldwide Rotaract Leaderboards, global district standings, and historical growth statistics.
                            </p>
                        </div>
                        <div className="worldwide-banner-btn">
                            <span>Explore</span>
                            <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>
                        </div>
                    </div>
                </Link>
            </section>

            <h2 className="section-title">Drill Down by Zone</h2>
            <section style={{ marginBottom: '40px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h2 style={{ margin: '0 0 5px 0' }}>Zones Directory</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, marginBottom: '15px' }}>
                        Click on a zone below to perform a deep-dive analysis into its districts and individual clubs.
                    </p>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {zoneLabels.map(zLabel => {
                            const zStats = filteredZones[zLabel]?.stats;
                            if (!zStats) return null;
                            return (
                                <Link 
                                    key={zLabel} 
                                    href={`/zone/${zLabel.replace('Zone ', '')}`}
                                    className="zone-dir-row"
                                >
                                    <span style={{ fontSize: '18px' }}>{zLabel}</span>
                                    <div className="zone-dir-stats">
                                        <span><strong>{zStats.totalClubs}</strong> Clubs</span>
                                        <span><strong>{zStats.totalMembers}</strong> Members</span>
                                        <span><strong>${zStats.trfContributionsUSD?.toLocaleString()}</strong> TRF</span>
                                        <span style={{ color: zStats.arrearsClubs > 0 ? 'var(--danger)' : 'var(--success)' }}><strong>{zStats.arrearsClubs}</strong> Arrears</span>
                                        <span style={{ color: 'var(--primary)', marginLeft: '10px' }}>Explore →</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            <h2 className="section-title">Deep Data Drilldown</h2>
            <section style={{ marginBottom: '40px' }}>
                <div className="card">
                    <GlobalTables 
                        zoneTableData={filteredZoneTableData} 
                        arrearsData={filteredArrearsData.map(c => ({
                            'RI Zone': c['RI Zone'] || c['Current Zone'] || c.Zone,
                            'District': c.District,
                            'Club Name': c['Club Name'],
                            'Club Base': c['Club Base'],
                            'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                            'Billable Member Count': c['Billable Member Count'] || 0,
                            'Outstanding INR': c['Outstanding INR'] || c.outstanding || c.outstandingINR || 0,
                            'outstanding': c['Outstanding INR'] || c.outstanding || c.outstandingINR || 0,
                            ' USD Outstanding ': c[' USD Outstanding '] || c.outstandingUSD || 0,
                            'NF Cust Number': c['NF Cust Number'] || c['Club ID'] || c.id
                        }))} 
                        officersData={filteredOfficersData.map(c => ({
                            'RI Zone': c['RI Zone'] || c.Zone,
                            'District': c.District,
                            'Rotaract Club Name': c['Rotaract Club Name'] || c['Club Name'],
                            'Club Base': c['Club Base'] || c['Rotaract Club Base'],
                            'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                            'Club Status': c['Club Status'] || 'Active',
                            'Club ID': c['Club ID'] || c['Rotaract Club ID']
                        }))} 
                        rotaryData={filteredRotaryData}
                        rotaryNoInteractData={filteredRotaryNoInteractData}
                        newClubsData={filteredNewClubsData}
                        trfData={filteredTrfData}
                        allClubsData={filteredAllClubsData.map(c => ({
                            'Zone': c['RI Zone'] || c.Zone || c.zone,
                            'District': c.District || c.district,
                            'Club ID': c['Club ID'] || c.id,
                            'Club Name': c['Club Name'] || c.name,
                            'Rotaract Club Base': c['Rotaract Club Base'] || c.base,
                            'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                            'Total Reported Members': c['Total Reported Members'] ?? c.members ?? 0
                        }))}
                    />
                </div>
            </section>
        </div>
    );
}
