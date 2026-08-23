import { getDashboardSummary, getArrears, getNoOfficers, getRotaryNoSponsor, getRotaryNoInteract, getZoneSummary, getAllClubs, getTRFContributions, getNewClubs, getZoneData } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import DoughnutChart from '@/components/charts/DoughnutChart';
import BarChart from '@/components/charts/BarChart';
import GlobalTables from '@/components/tables/GlobalTables';
import TopChartsSection from '@/components/sections/TopChartsSection';
import JsonLd from '@/components/seo/JsonLd';

export async function generateMetadata({ params }) {
    const { zoneId } = await params;
    const cleanZoneNum = zoneId.toString().replace(/[^0-9]/g, '');
    const fullZoneName = zoneId.toString().startsWith('Zone') ? zoneId : `Zone ${zoneId}`;
    const zoneData = await getZoneData(zoneId);
    const stats = zoneData?.stats || {};
    const totalClubs = stats.totalClubs ? `${stats.totalClubs.toLocaleString()} clubs` : 'Rotaract clubs';
    const totalMembers = stats.totalMembers ? `${stats.totalMembers.toLocaleString()} members` : 'members';

    return {
        title: fullZoneName,
        description: `Comprehensive analytics and performance metrics for Rotaract ${fullZoneName} (${totalClubs}, ${totalMembers}), covering district breakdown, TRF giving, compliance, and Interact sponsorships.`,
        alternates: {
            canonical: `https://insights.rsamdio.org/zone/${cleanZoneNum}`,
        },
        openGraph: {
            title: `${fullZoneName} | Insights | Rotaract South Asia MDIO`,
            description: `Comprehensive analytics and performance metrics for Rotaract ${fullZoneName} (${totalClubs}, ${totalMembers}).`,
            url: `https://insights.rsamdio.org/zone/${cleanZoneNum}`,
            siteName: 'Rotaract South Asia MDIO Insights',
            images: [
                {
                    url: '/rsamdio.webp',
                    width: 1200,
                    height: 630,
                    alt: `${fullZoneName} | Insights | Rotaract South Asia MDIO`,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            site: '@rsa_mdio',
            creator: '@rsa_mdio',
            title: `${fullZoneName} | Insights | Rotaract South Asia MDIO`,
            description: `Comprehensive analytics and performance metrics for Rotaract ${fullZoneName} (${totalClubs}, ${totalMembers}).`,
            images: ['/rsamdio.webp'],
        },
    };
}

export default async function ZonePage({ params, searchParams }) {
    const { zoneId } = await params;
    const { district } = await searchParams;
    const fullZoneName = zoneId.toString().startsWith('Zone') ? zoneId : `Zone ${zoneId}`;

    const zoneData = await getZoneData(zoneId);
    if (!zoneData) return <div style={{ padding: '20px' }}>Zone {zoneId} not found.</div>;

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
    const selectedZones = [fullZoneName]; // Lock to this zone

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
                const zoneDataObj = summary.current.zones[zName];
                const filteredDistrictsForZone = {};
                
                Object.keys(zoneDataObj.districts || {}).forEach(d => {
                    if (selectedDistricts.includes(d)) {
                        filteredDistrictsForZone[d] = zoneDataObj.districts[d];
                    }
                });

                filteredZones[zName] = {
                    ...zoneDataObj,
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
    } else {
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

    const districtLabels = Object.keys(filteredZones[fullZoneName]?.districts || {});

    const activeInteract = (overall.totalInteractClubs || 0) - (overall.suspendedInteractClubs || 0);
    const activeInteractPct = overall.totalInteractClubs > 0 ? Math.round((activeInteract / overall.totalInteractClubs) * 100) : 0;
    const rotaractSponsorPct = overall.totalClubs > 0 ? ((overall.rotaractWithInteract / overall.totalClubs) * 100).toFixed(1) : 0;

    const zoneSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `https://insights.rsamdio.org/zone/${zoneId.toString().replace(/[^0-9]/g, '')}#webpage`,
        url: `https://insights.rsamdio.org/zone/${zoneId.toString().replace(/[^0-9]/g, '')}`,
        name: `${fullZoneName} | Insights | Rotaract South Asia MDIO`,
        description: `Official analytics and directory for Rotaract ${fullZoneName}.`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://insights.rsamdio.org',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: fullZoneName,
                    item: `https://insights.rsamdio.org/zone/${zoneId.toString().replace(/[^0-9]/g, '')}`,
                },
            ],
        },
        about: {
            '@type': 'AdministrativeArea',
            name: fullZoneName,
            description: `Rotary/Rotaract ${fullZoneName} within South Asia.`,
        },
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <JsonLd schema={zoneSchema} />
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
                <h2 className="section-title" style={{ margin: 0 }}>Executive Summary - {fullZoneName}</h2>
            </div>
            
            <section className="metrics-grid three-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Total Rotaract Clubs" value={overall.totalClubs?.toLocaleString()} trend={getDelta('totalClubs')} delay={0.05} />
                <MetricCard title="Total Members" value={overall.totalMembers?.toLocaleString()} trend={getDelta('totalMembers')} delay={0.1} />
                <MetricCard title="Average Membership" value={avgMembers.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} trend={avgDelta} delay={0.15} />
                <MetricCard title="New Chartered Clubs" value={overall.newTotalClubs?.toLocaleString()} delay={0.2} />
                <MetricCard title="Clubs w/ TRF Contribution" value={overall.trfClubs?.toLocaleString()} delay={0.25} />
                <MetricCard title="Total TRF Contributions" value={`$${overall.trfContributionsUSD?.toLocaleString()}`} delay={0.3} />
            </section>

            <h2 className="section-title">Demographics & Foundation Breakdown</h2>
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={demographicsBaseChart} title="Total Clubs by Base Type" />
                <BarChart data={membersBaseChart} title="Total Members by Base Type" />
                <BarChart data={trfFundChart} title="TRF Contributions by Fund (USD)" />
            </section>

            <h2 className="section-title">Rotary-Rotaract Integration</h2>
            <section className="metrics-grid three-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Rotary Clubs" value={overall.totalRotary?.toLocaleString()} trend={getDelta('totalRotary')} delay={0.05} />
                <MetricCard title="Rotary with Sponsored Rotaract" value={overall.rotaryWithSponsor?.toLocaleString() || '0'} trend={{text: `${penGood}% Integration`, type: 'positive'}} delay={0.1} />
                <MetricCard title="Rotary w/o Sponsored Rotaract" value={overall.rotaryWithoutSponsor?.toLocaleString() || '0'} trend={{text: `${penBad}% Missed Opportunity`, type: 'negative'}} isWarning={true} delay={0.15} />
            </section>

            <h2 className="section-title">Interact Ecosystem</h2>
            <section className="metrics-grid four-cols" style={{ marginBottom: '40px' }}>
                <MetricCard title="Total Interact Clubs" value={overall.totalInteractClubs?.toLocaleString() || '0'} trend={getDelta('totalInteractClubs')} delay={0.05} />
                <MetricCard title="Active Interact Clubs" value={activeInteract.toLocaleString()} trend={{text: `${activeInteractPct}% Active Rate`, type: 'positive'}} delay={0.1} />
                <MetricCard title="Rotary w/o Interact Club" value={overall.rotaryWithoutInteract?.toLocaleString() || '0'} trend={overall.totalRotary ? {text: `${Math.round(((overall.rotaryWithoutInteract || 0) / overall.totalRotary) * 100)}% Opportunity`, type: 'negative'} : null} isWarning={true} delay={0.15} />
                <MetricCard title="Rotaract Sponsoring Interact" value={overall.rotaractWithInteract?.toLocaleString() || '0'} trend={{text: `${rotaractSponsorPct}% of Rotaract Clubs`, type: 'positive'}} delay={0.2} />
            </section>

            <h2 className="section-title">Compliance & Risks</h2>
            <section className="metrics-grid five-cols" style={{ marginBottom: '20px' }}>
                <MetricCard title="Outstanding Dues*" value={`₹${Math.round(overall.outstanding || 0).toLocaleString('en-IN')}`} trend={getDelta('outstanding', 'inr')} delay={0.05} />
                <MetricCard title="Clubs in Arrears" value={overall.arrearsClubs?.toLocaleString()} trend={getDelta('arrearsClubs')} delay={0.1} />
                <MetricCard title="Subject to Termination" value={overall.atRisk?.toLocaleString()} isWarning={true} trend={getDelta('atRisk')} delay={0.15} />
                <MetricCard title="Unreported Officers" value={overall.noOfficers?.toLocaleString()} trend={getDelta('noOfficers')} delay={0.2} />
                <MetricCard title="Suspended Interact" value={overall.suspendedInteractClubs?.toLocaleString() || '0'} trend={overall.totalInteractClubs ? {text: `${Math.round(((overall.suspendedInteractClubs || 0) / overall.totalInteractClubs) * 100)}% of Interact`, type: 'negative'} : null} isWarning={true} delay={0.25} />
            </section>
            
            <section className="charts-grid three-cols" style={{ marginBottom: '40px' }}>
                <BarChart data={termBaseChart} title="Subject to Termination by Base" />
                <BarChart data={arrearsBaseChart} title="Arrears by Base" />
                <BarChart data={officersBaseChart} title="Missing Officers by Base" />
            </section>

            <TopChartsSection summary={{ zones: filteredZones }} arrearsData={filteredArrearsData} allClubsData={filteredAllClubsData} trfData={filteredTrfData} />

            <h2 className="section-title">Districts in {fullZoneName}</h2>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {districtLabels.length > 0 ? districtLabels.map(dist => {
                        const dStats = filteredZones[fullZoneName].districts[dist];
                        return (
                            <Link 
                                key={dist} 
                                href={`/district/${dist}`}
                                className="zone-dir-row"
                            >
                                <span style={{ fontSize: '18px' }}>District {dist}</span>
                                <div className="zone-dir-stats">
                                    <span><strong>{dStats.totalClubs}</strong> Clubs</span>
                                    <span><strong>{dStats.totalMembers}</strong> Members</span>
                                    <span><strong>${dStats.trfContributionsUSD?.toLocaleString() || '0'}</strong> TRF</span>
                                    <span style={{ color: dStats.arrearsClubs > 0 ? 'var(--danger)' : 'var(--success)' }}><strong>{dStats.arrearsClubs}</strong> Arrears</span>
                                    <span style={{ color: 'var(--primary)', marginLeft: '10px' }}>Explore →</span>
                                </div>
                            </Link>
                        );
                    }) : <p style={{ color: 'var(--text-muted)' }}>No districts found matching filters.</p>}
                </div>
            </div>

            <h2 className="section-title" style={{ marginTop: '40px' }}>Deep Data Drilldown - {fullZoneName}</h2>
            <section style={{ marginBottom: '40px' }}>
                <div className="card">
                    <GlobalTables 
                        zoneTableData={filteredZoneTableData.map(z => ({
                            'RI District': z['RI District'],
                            'RI Zone': z['RI Zone'],
                            'Total Clubs': z['Total Clubs'],
                            'Total Reported Members': z['Total Reported Members'] || z['Members'],
                            'Members': z['Members'] || z['Total Reported Members'],
                            'Avg Membership': z['Avg Membership'],
                            'Total Rotary Clubs': z['Total Rotary Clubs'],
                            'Rotary without Rotaract Club': z['Rotary without Rotaract Club'],
                            'TotalInteractClubs': z['TotalInteractClubs'],
                            'Rotary without Interact Club': z['Rotary without Interact Club'],
                            'Total Outstanding (INR)': z['Total Outstanding (INR)'] || z['TotalINR'],
                            'TotalINR': z['TotalINR'] || z['Total Outstanding (INR)'],
                            '% Clubs Arrears': z['% Clubs Arrears'],
                            'No Officer Total': z['No Officer Total'],
                            'Total Contributions USD': z['Total Contributions USD'],
                            'NewTotalClubs': z['NewTotalClubs']
                        }))}
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
