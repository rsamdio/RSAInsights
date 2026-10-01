'use client';

import { useState, useMemo } from 'react';
import Leaderboard from '../ui/Leaderboard';

export default function TopChartsSection({ summary, arrearsData, allClubsData, trfData, complianceData }) {
    const [limit, setLimit] = useState(5);

    // 1. Top Contributing Clubs
    const topTRFClubs = useMemo(() => {
        const list = [...(trfData || [])]
            .map(c => {
                const clubName = c['Club Name'] || `Club ${c['Club No.']}`;
                const district = c['District'] ? `D-${c['District'].toString().replace(/\.0$/, '')}` : '';
                const val = parseFloat((c['Total Contributions USD'] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0;
                return {
                    label: clubName,
                    subLabel: district ? <span>{district}</span> : null,
                    val,
                    value: `$${val.toLocaleString()}`,
                    unit: 'USD'
                };
            })
            .filter(c => c.val > 0)
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [trfData]);

    // 2. Highest Membership Clubs
    const topMemberClubs = useMemo(() => {
        const list = [...(allClubsData || [])]
            .map(c => {
                const clubName = c['Club Name'] || 'Unknown Club';
                const district = c['District'] ? `D-${c['District'].toString().replace(/\.0$/, '')}` : '';
                const base = c['Rotaract Club Base'] || '';
                const isUniv = base.toLowerCase().includes('university');
                const val = parseInt(c['Total Reported Members']) || 0;
                return {
                    label: clubName,
                    subLabel: (
                        <>
                            {district && <span>{district}</span>}
                            {district && base && <span>•</span>}
                            {base && (
                                <span style={{ color: isUniv ? '#7c3aed' : '#059669', fontWeight: '600' }}>
                                    {isUniv ? '🏛️ University' : '👥 Community'}
                                </span>
                            )}
                        </>
                    ),
                    val,
                    value: val.toLocaleString(),
                    unit: 'members'
                };
            })
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [allClubsData]);

    // 2a. Highest Membership Community-based Clubs
    const topCommunityClubs = useMemo(() => {
        const list = [...(allClubsData || [])]
            .filter(c => (c['Rotaract Club Base'] || '').toString().toLowerCase().includes('community'))
            .map(c => {
                const clubName = c['Club Name'] || 'Unknown Club';
                const district = c['District'] ? `D-${c['District'].toString().replace(/\.0$/, '')}` : '';
                const val = parseInt(c['Total Reported Members']) || 0;
                return {
                    label: clubName,
                    subLabel: district ? <span>{district}</span> : null,
                    val,
                    value: val.toLocaleString(),
                    unit: 'members'
                };
            })
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [allClubsData]);

    // 2b. Highest Membership University-based Clubs
    const topUniversityClubs = useMemo(() => {
        const list = [...(allClubsData || [])]
            .filter(c => (c['Rotaract Club Base'] || '').toString().toLowerCase().includes('university'))
            .map(c => {
                const clubName = c['Club Name'] || 'Unknown Club';
                const district = c['District'] ? `D-${c['District'].toString().replace(/\.0$/, '')}` : '';
                const val = parseInt(c['Total Reported Members']) || 0;
                return {
                    label: clubName,
                    subLabel: district ? <span>{district}</span> : null,
                    val,
                    value: val.toLocaleString(),
                    unit: 'members'
                };
            })
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [allClubsData]);

    // Combine District stats into a single array for easier mapping
    const distStats = useMemo(() => {
        const list = [];
        if (summary && summary.zones) {
            Object.keys(summary.zones).forEach(z => {
                if (!summary.zones[z].districts) return;
                Object.keys(summary.zones[z].districts).forEach(d => {
                    const stat = summary.zones[z].districts[d];
                    if (stat && stat.totalClubs > 0) {
                        list.push({ district: d, ...stat });
                    }
                });
            });
        }
        return list;
    }, [summary]);

    // 3. Top Districts by Total Contribution
    const topDistTRF = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.trfContributionsUSD > 0)
            .sort((a, b) => b.trfContributionsUSD - a.trfContributionsUSD);
        const maxVal = list.length > 0 ? (list[0].trfContributionsUSD || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `$${d.trfContributionsUSD.toLocaleString()}`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.trfContributionsUSD / maxVal) * 100)))
        }));
    }, [distStats]);

    // 4. Clubs with Highest Arrears (Negative)
    const topArrearsClubs = useMemo(() => {
        const list = [...(arrearsData || [])]
            .map(c => {
                const clubName = c['Club Name'] || 'Unknown Club';
                const district = c['District'] ? `D-${c['District'].toString().replace(/\.0$/, '')}` : '';
                const base = c['Club Base'] || '';
                const isUniv = base.toLowerCase().includes('university');
                const val = parseFloat((c['Outstanding INR'] || c.outstanding || c.outstandingINR || c[' USD Outstanding '] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0;
                return {
                    label: clubName,
                    subLabel: (
                        <>
                            {district && <span>{district}</span>}
                            {district && base && <span>•</span>}
                            {base && (
                                <span style={{ color: isUniv ? '#7c3aed' : '#059669', fontWeight: '600' }}>
                                    {isUniv ? '🏛️ University' : '👥 Community'}
                                </span>
                            )}
                        </>
                    ),
                    val,
                    value: `₹${Math.round(val).toLocaleString('en-IN')}`,
                    unit: 'Dues'
                };
            })
            .filter(c => c.val > 0)
            .sort((a, b) => b.val - a.val);

        const maxVal = list.length > 0 ? (list[0].val || 1) : 1;
        return list.map(c => ({
            ...c,
            progressPct: maxVal > 0 ? Math.max(4, Math.min(100, Math.round((c.val / maxVal) * 100))) : 0
        }));
    }, [arrearsData]);

    // 5. Districts with Highest % Missing Officers (Negative)
    const topDistMissing = useMemo(() => {
        const list = [...distStats]
            .map(s => ({ ...s, missingPct: (s.noOfficers / s.totalClubs) * 100 }))
            .sort((a, b) => b.missingPct - a.missingPct);
        const maxVal = list.length > 0 ? (list[0].missingPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.missingPct.toFixed(1)}%`,
            subLabel: <span>{d.noOfficers} of {d.totalClubs} clubs</span>,
            progressPct: Math.max(4, Math.min(100, Math.round((d.missingPct / maxVal) * 100)))
        }));
    }, [distStats]);

    // 6. Districts with Highest Number of Clubs
    const topDistTotalClubs = useMemo(() => {
        const list = [...distStats]
            .sort((a, b) => b.totalClubs - a.totalClubs);
        const maxVal = list.length > 0 ? (list[0].totalClubs || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.totalClubs.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.totalClubs / maxVal) * 100)))
        }));
    }, [distStats]);

    // 7. Districts with Highest Number of Members
    const topDistTotalMembers = useMemo(() => {
        const list = [...distStats]
            .sort((a, b) => b.totalMembers - a.totalMembers);
        const maxVal = list.length > 0 ? (list[0].totalMembers || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.totalMembers.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.totalMembers / maxVal) * 100)))
        }));
    }, [distStats]);

    // 8. Districts with Highest Average Club Membership
    const topDistAvgMembers = useMemo(() => {
        const list = [...distStats]
            .map(s => ({ ...s, avg: s.totalMembers / s.totalClubs }))
            .sort((a, b) => b.avg - a.avg);
        const maxVal = list.length > 0 ? (list[0].avg || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.avg.toFixed(2),
            progressPct: Math.max(4, Math.min(100, Math.round((d.avg / maxVal) * 100)))
        }));
    }, [distStats]);

    // 10b. Highest % Clubs in Arrears (Negative)
    const topDistArrearsPct = useMemo(() => {
        const list = [...distStats]
            .map(s => ({ ...s, arrPct: (s.arrearsClubs / s.totalClubs) * 100 }))
            .sort((a, b) => b.arrPct - a.arrPct);
        const maxVal = list.length > 0 ? (list[0].arrPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.arrPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.arrPct / maxVal) * 100)))
        }));
    }, [distStats]);

    // 11. Districts with highest number of New Clubs
    const topDistNewClubs = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.newTotalClubs > 0)
            .sort((a, b) => b.newTotalClubs - a.newTotalClubs);
        const maxVal = list.length > 0 ? (list[0].newTotalClubs || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.newTotalClubs.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.newTotalClubs / maxVal) * 100)))
        }));
    }, [distStats]);

    // 12. Highest Rotary Sponsorship Penetration (%)
    const topRotaryPenetration = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.totalRotary > 0)
            .map(s => ({ ...s, penPct: (s.rotaryWithSponsor / s.totalRotary) * 100 }))
            .sort((a, b) => b.penPct - a.penPct);
        const maxVal = list.length > 0 ? (list[0].penPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.penPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.penPct / maxVal) * 100)))
        }));
    }, [distStats]);

    // 13. Most Missed Opportunities (Absolute number of Rotary w/o Sponsor)
    const topMissedOpportunities = useMemo(() => {
        const list = [...distStats]
            .sort((a, b) => b.rotaryWithoutSponsor - a.rotaryWithoutSponsor);
        const maxVal = list.length > 0 ? (list[0].rotaryWithoutSponsor || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.rotaryWithoutSponsor.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.rotaryWithoutSponsor / maxVal) * 100)))
        }));
    }, [distStats]);

    // 13b. Highest % Missed Rotary Opportunities
    const topMissedPct = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.totalRotary > 0)
            .map(s => ({ ...s, missPct: (s.rotaryWithoutSponsor / s.totalRotary) * 100 }))
            .sort((a, b) => b.missPct - a.missPct);
        const maxVal = list.length > 0 ? (list[0].missPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.missPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.missPct / maxVal) * 100)))
        }));
    }, [distStats]);

    // 14. Highest % of Clubs Subject to Termination
    const topDistAtRisk = useMemo(() => {
        const list = [...distStats]
            .map(s => ({ ...s, riskPct: (s.atRisk / s.totalClubs) * 100 }))
            .sort((a, b) => b.riskPct - a.riskPct);
        const maxVal = list.length > 0 ? (list[0].riskPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.riskPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.riskPct / maxVal) * 100)))
        }));
    }, [distStats]);

    // 14b. Most Clubs Subject to Termination (Absolute)
    const topDistAtRiskAbs = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.atRisk > 0)
            .sort((a, b) => b.atRisk - a.atRisk);
        const maxVal = list.length > 0 ? (list[0].atRisk || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.atRisk.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.atRisk / maxVal) * 100)))
        }));
    }, [distStats]);

    // 15. Highest Total Outstanding Dues (INR)
    const topDistOutstanding = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.outstanding > 0)
            .sort((a, b) => b.outstanding - a.outstanding);
        const maxVal = list.length > 0 ? (list[0].outstanding || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `₹${Math.round(d.outstanding).toLocaleString('en-IN')}`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.outstanding / maxVal) * 100)))
        }));
    }, [distStats]);

    // 15b. Most Clubs in Arrears (Absolute)
    const topDistArrearsClubsAbs = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.arrearsClubs > 0)
            .sort((a, b) => b.arrearsClubs - a.arrearsClubs);
        const maxVal = list.length > 0 ? (list[0].arrearsClubs || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.arrearsClubs.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.arrearsClubs / maxVal) * 100)))
        }));
    }, [distStats]);

    // 15c. Most Unreported Officers (Absolute)
    const topDistMissingOfficersAbs = useMemo(() => {
        const list = [...distStats]
            .filter(s => s.noOfficers > 0)
            .sort((a, b) => b.noOfficers - a.noOfficers);
        const maxVal = list.length > 0 ? (list[0].noOfficers || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.noOfficers.toLocaleString(),
            subLabel: <span>{((d.noOfficers / d.totalClubs) * 100).toFixed(1)}% missing</span>,
            progressPct: Math.max(4, Math.min(100, Math.round((d.noOfficers / maxVal) * 100)))
        }));
    }, [distStats]);

    // Compute exact compliance from complianceData (server-provided) or fallback to distStats
    const distCompList = useMemo(() => {
        if (complianceData && complianceData.length > 0) {
            return complianceData;
        }

        // Fallback 1: Derive from distStats if available
        if (distStats && distStats.length > 0) {
            return distStats.map(d => {
                const total = d.totalClubs || 0;
                const reported = d.reportedOfficers !== undefined ? d.reportedOfficers : Math.max(0, total - (d.noOfficers || 0));
                const compliant = d.compliantClubs !== undefined ? d.compliantClubs : 0;
                const paid = d.paidClubs !== undefined ? d.paidClubs : Math.max(0, total - (d.arrearsClubs || 0));
                return {
                    district: d.district,
                    total,
                    compliant,
                    reported,
                    paid,
                    compPct: total > 0 ? (compliant / total) * 100 : 0,
                    reportPct: total > 0 ? (reported / total) * 100 : 0,
                    paidPct: total > 0 ? (paid / total) * 100 : 0
                };
            }).filter(d => d.total > 0);
        }

        // Fallback 2: Compute from allClubsData if provided
        const distCompliance = {};
        if (allClubsData) {
            allClubsData.forEach(c => {
                const dist = c['District'] ? c['District'].toString().replace(/\.0$/, '') : '';
                if (!dist) return;
                if (!distCompliance[dist]) {
                    distCompliance[dist] = { district: dist, total: 0, compliant: 0, reported: 0, paid: 0 };
                }
                distCompliance[dist].total += 1;
                
                const isPaidBool = (c['Arrears'] !== 'Yes');
                const isReportedBool = (c['Officers'] === 'Yes');

                if (isPaidBool) distCompliance[dist].paid += 1;
                if (isReportedBool) distCompliance[dist].reported += 1;
                if (isPaidBool && isReportedBool) distCompliance[dist].compliant += 1;
            });
        }

        return Object.values(distCompliance).map(d => ({
            ...d,
            compPct: d.total > 0 ? (d.compliant / d.total) * 100 : 0,
            paidPct: d.total > 0 ? (d.paid / d.total) * 100 : 0,
            reportPct: d.total > 0 ? (d.reported / d.total) * 100 : 0
        })).filter(d => d.total > 0);
    }, [complianceData, distStats, allClubsData]);

    // 16. Highest % Fully Compliant Clubs
    const topFullyCompliant = useMemo(() => {
        const list = [...distCompList]
            .sort((a, b) => (b.compPct - a.compPct) || (b.compliant - a.compliant));
        const maxVal = list.length > 0 ? (list[0].compPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.compPct.toFixed(1)}%`,
            subLabel: <span>{d.compliant} of {d.total} clubs</span>,
            progressPct: Math.max(4, Math.min(100, Math.round((d.compPct / maxVal) * 100)))
        }));
    }, [distCompList]);

    // 16b. Most Fully Compliant Clubs (Absolute)
    const topDistCompliantAbs = useMemo(() => {
        const list = [...distCompList]
            .filter(s => s.compliant > 0)
            .sort((a, b) => (b.compliant - a.compliant) || (b.compPct - a.compPct));
        const maxVal = list.length > 0 ? (list[0].compliant || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.compliant.toLocaleString(),
            subLabel: <span>{d.compPct.toFixed(1)}% compliant</span>,
            progressPct: Math.max(4, Math.min(100, Math.round((d.compliant / maxVal) * 100)))
        }));
    }, [distCompList]);

    // 17. Highest % Clubs Reporting Officers
    const topReportedOfficers = useMemo(() => {
        const list = [...distCompList]
            .sort((a, b) => (b.reportPct - a.reportPct) || (b.reported - a.reported));
        const maxVal = list.length > 0 ? (list[0].reportPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.reportPct.toFixed(1)}%`,
            subLabel: <span>{d.reported} of {d.total} clubs</span>,
            progressPct: Math.max(4, Math.min(100, Math.round((d.reportPct / maxVal) * 100)))
        }));
    }, [distCompList]);

    // 17b. Most Clubs Reporting Officers (Absolute)
    const topReportedOfficersAbs = useMemo(() => {
        const list = [...distCompList]
            .filter(s => s.reported > 0)
            .sort((a, b) => (b.reported - a.reported) || (b.reportPct - a.reportPct));
        const maxVal = list.length > 0 ? (list[0].reported || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.reported.toLocaleString(),
            subLabel: <span>{d.reportPct.toFixed(1)}% reported</span>,
            progressPct: Math.max(4, Math.min(100, Math.round((d.reported / maxVal) * 100)))
        }));
    }, [distCompList]);

    // Growth Metrics
    const topDistMembersGrowthAbs = useMemo(() => {
        const list = [...distStats]
            .filter(d => (d.membersGrowthAbs || 0) > 0)
            .sort((a, b) => (b.membersGrowthAbs || 0) - (a.membersGrowthAbs || 0));
        const maxVal = list.length > 0 ? (list[0].membersGrowthAbs || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `+${(d.membersGrowthAbs || 0).toLocaleString()}`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.membersGrowthAbs / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistMembersGrowthPct = useMemo(() => {
        const list = [...distStats]
            .filter(d => (d.membersGrowthPct || 0) > 0)
            .sort((a, b) => (b.membersGrowthPct || 0) - (a.membersGrowthPct || 0));
        const maxVal = list.length > 0 ? (list[0].membersGrowthPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `+${(d.membersGrowthPct || 0).toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.membersGrowthPct / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistClubsGrowthAbs = useMemo(() => {
        const list = [...distStats]
            .filter(d => (d.clubsGrowthAbs || 0) > 0)
            .sort((a, b) => (b.clubsGrowthAbs || 0) - (a.clubsGrowthAbs || 0));
        const maxVal = list.length > 0 ? (list[0].clubsGrowthAbs || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `+${(d.clubsGrowthAbs || 0).toLocaleString()}`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.clubsGrowthAbs / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistClubsGrowthPct = useMemo(() => {
        const list = [...distStats]
            .filter(d => (d.clubsGrowthPct || 0) > 0)
            .sort((a, b) => (b.clubsGrowthPct || 0) - (a.clubsGrowthPct || 0));
        const maxVal = list.length > 0 ? (list[0].clubsGrowthPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `+${(d.clubsGrowthPct || 0).toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.clubsGrowthPct / maxVal) * 100)))
        }));
    }, [distStats]);

    // Interact Ecosystem Leaderboards
    const topDistInteractClubs = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.totalInteractClubs || 0) > 0)
            .sort((a, b) => (b.totalInteractClubs || 0) - (a.totalInteractClubs || 0));
        const maxVal = list.length > 0 ? (list[0].totalInteractClubs || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.totalInteractClubs.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.totalInteractClubs / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistInteractGrowth = useMemo(() => {
        const list = [...distStats]
            .map(s => ({ ...s, growth: (s.totalInteractClubs || 0) - (s.prevInteractClubs || 0) }))
            .filter(s => s.growth > 0)
            .sort((a, b) => b.growth - a.growth);
        const maxVal = list.length > 0 ? (list[0].growth || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `+${d.growth.toLocaleString()}`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.growth / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistInteractGrowthPct = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.prevInteractClubs || 0) > 0)
            .map(s => ({ ...s, growthPct: (((s.totalInteractClubs || 0) - (s.prevInteractClubs || 0)) / s.prevInteractClubs) * 100 }))
            .filter(s => s.growthPct > 0)
            .sort((a, b) => b.growthPct - a.growthPct);
        const maxVal = list.length > 0 ? (list[0].growthPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `+${d.growthPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.growthPct / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistInteractHealth = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.totalInteractClubs || 0) > 0)
            .map(s => ({ ...s, healthPct: (((s.totalInteractClubs - (s.suspendedInteractClubs || 0)) / s.totalInteractClubs) * 100) }))
            .sort((a, b) => b.healthPct - a.healthPct);
        const maxVal = list.length > 0 ? (list[0].healthPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.healthPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.healthPct / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistRotaractSponsorInteract = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.rotaractWithInteract || 0) > 0)
            .sort((a, b) => (b.rotaractWithInteract || 0) - (a.rotaractWithInteract || 0));
        const maxVal = list.length > 0 ? (list[0].rotaractWithInteract || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.rotaractWithInteract.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.rotaractWithInteract / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistRotaractSponsorInteractPct = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.totalClubs || 0) > 0 && (s.rotaractWithInteract || 0) > 0)
            .map(s => ({ ...s, spPct: ((s.rotaractWithInteract || 0) / s.totalClubs) * 100 }))
            .sort((a, b) => b.spPct - a.spPct);
        const maxVal = list.length > 0 ? (list[0].spPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.spPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.spPct / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistRotaryNoInteract = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.rotaryWithoutInteract || 0) > 0)
            .sort((a, b) => (b.rotaryWithoutInteract || 0) - (a.rotaryWithoutInteract || 0));
        const maxVal = list.length > 0 ? (list[0].rotaryWithoutInteract || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.rotaryWithoutInteract.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.rotaryWithoutInteract / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistRotaryNoInteractPct = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.totalRotary || 0) > 0 && (s.rotaryWithoutInteract || 0) > 0)
            .map(s => ({ ...s, noIntPct: ((s.rotaryWithoutInteract || 0) / s.totalRotary) * 100 }))
            .sort((a, b) => b.noIntPct - a.noIntPct);
        const maxVal = list.length > 0 ? (list[0].noIntPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.noIntPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.noIntPct / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistSuspendedInteract = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.suspendedInteractClubs || 0) > 0)
            .sort((a, b) => (b.suspendedInteractClubs || 0) - (a.suspendedInteractClubs || 0));
        const maxVal = list.length > 0 ? (list[0].suspendedInteractClubs || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: d.suspendedInteractClubs.toLocaleString(),
            progressPct: Math.max(4, Math.min(100, Math.round((d.suspendedInteractClubs / maxVal) * 100)))
        }));
    }, [distStats]);

    const topDistSuspendedInteractPct = useMemo(() => {
        const list = [...distStats]
            .filter(s => (s.totalInteractClubs || 0) > 0 && (s.suspendedInteractClubs || 0) > 0)
            .map(s => ({ ...s, suspPct: ((s.suspendedInteractClubs || 0) / s.totalInteractClubs) * 100 }))
            .sort((a, b) => b.suspPct - a.suspPct);
        const maxVal = list.length > 0 ? (list[0].suspPct || 1) : 1;
        return list.map(d => ({
            label: `District ${d.district}`,
            value: `${d.suspPct.toFixed(1)}%`,
            progressPct: Math.max(4, Math.min(100, Math.round((d.suspPct / maxVal) * 100)))
        }));
    }, [distStats]);

    return (
        <div style={{ marginTop: '50px', marginBottom: '50px' }}>
            {/* Header with Title and Interactive Depth Selector */}
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
            
            {/* 1. Growth & Engagement */}
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>Growth & Engagement</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Highest Members (Districts)"
                    description="Districts with the largest total Rotaract membership."
                    data={topDistTotalMembers}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistTotalMembers.length)}`}
                />
                <Leaderboard
                    title="Highest Member Growth"
                    description="Districts with the largest increase in members since July 1."
                    data={topDistMembersGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistMembersGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Highest Member Growth (%)"
                    description="Districts with the largest percentage increase in members since July 1."
                    data={topDistMembersGrowthPct}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistMembersGrowthPct.length)}`}
                />
                <Leaderboard
                    title="Most Clubs"
                    description="Districts with the most active Rotaract clubs."
                    data={topDistTotalClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistTotalClubs.length)}`}
                />
                <Leaderboard
                    title="Highest Club Growth"
                    description="Districts with the largest increase in active clubs since July 1."
                    data={topDistClubsGrowthAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistClubsGrowthAbs.length)}`}
                />
                <Leaderboard
                    title="Highest Club Growth (%)"
                    description="Districts with the largest percentage increase in active clubs since July 1."
                    data={topDistClubsGrowthPct}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistClubsGrowthPct.length)}`}
                />
                <Leaderboard
                    title="Most New Clubs"
                    description="Districts with the highest number of new clubs chartered since July 1."
                    data={topDistNewClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistNewClubs.length)}`}
                />
                <Leaderboard
                    title="Highest Avg. Club Membership"
                    description="Districts with the highest average members per club."
                    data={topDistAvgMembers}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistAvgMembers.length)}`}
                />
                <Leaderboard
                    title="Highest Membership (Clubs)"
                    description="Clubs with the largest total reported membership."
                    data={topMemberClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topMemberClubs.length)}`}
                />
                <Leaderboard
                    title="Largest Community Clubs"
                    description="Community-based clubs with the most members."
                    data={topCommunityClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topCommunityClubs.length)}`}
                />
                <Leaderboard
                    title="Largest University Clubs"
                    description="University-based clubs with the most members."
                    data={topUniversityClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topUniversityClubs.length)}`}
                />
            </div>

            {/* 2. Interact Ecosystem */}
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>Interact Ecosystem</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Most Interact Clubs"
                    description="Districts with the highest total number of Interact clubs."
                    data={topDistInteractClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistInteractClubs.length)}`}
                />
                <Leaderboard
                    title="Highest Interact Growth"
                    description="Districts with the largest increase in Interact clubs since July 1."
                    data={topDistInteractGrowth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistInteractGrowth.length)}`}
                />
                <Leaderboard
                    title="Highest Interact Growth (%)"
                    description="Districts with the largest percentage increase in Interact clubs since July 1."
                    data={topDistInteractGrowthPct}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistInteractGrowthPct.length)}`}
                />
                <Leaderboard
                    title="Highest Active Interact Rate (%)"
                    description="Districts with the highest percentage of active Interact clubs."
                    data={topDistInteractHealth}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistInteractHealth.length)}`}
                />
                <Leaderboard
                    title="Most Rotaract Sponsoring Interact"
                    description="Districts with the highest number of Rotaract clubs sponsoring Interact."
                    data={topDistRotaractSponsorInteract}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistRotaractSponsorInteract.length)}`}
                />
                <Leaderboard
                    title="Highest Rotaract Sponsoring Rate (%)"
                    description="Districts with the highest percentage of Rotaract clubs sponsoring Interact."
                    data={topDistRotaractSponsorInteractPct}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistRotaractSponsorInteractPct.length)}`}
                />
                <Leaderboard
                    title="Highest % Rotary w/o Interact"
                    description="Districts with the highest percentage of Rotary clubs without an Interact Club."
                    data={topDistRotaryNoInteractPct}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistRotaryNoInteractPct.length)}`}
                />
                <Leaderboard
                    title="Most Rotary w/o Interact"
                    description="Districts with the highest number of Rotary clubs without an Interact Club."
                    data={topDistRotaryNoInteract}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistRotaryNoInteract.length)}`}
                />
            </div>

            {/* 3. Rotary-Rotaract Integration */}
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>Rotary-Rotaract Integration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Highest Rotary Penetration (%)"
                    description="Districts with the highest percentage of Rotary clubs that sponsor a Rotaract club."
                    data={topRotaryPenetration}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topRotaryPenetration.length)}`}
                />
                <Leaderboard
                    title="Highest % Missed Opportunities"
                    description="Districts with the highest percentage of Rotary clubs without a Sponsored Rotaract Club."
                    data={topMissedPct}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topMissedPct.length)}`}
                />
                <Leaderboard
                    title="Most Missed Opportunities"
                    description="Districts with the highest total number of Rotary clubs without a Sponsored Rotaract Club."
                    data={topMissedOpportunities}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topMissedOpportunities.length)}`}
                />
            </div>

            {/* 4. The Rotary Foundation */}
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>The Rotary Foundation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard
                    title="Highest TRF Contributions (Districts)"
                    description="Districts whose clubs have made the largest combined TRF contributions in USD."
                    data={topDistTRF}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistTRF.length)}`}
                />
                <Leaderboard
                    title="Highest TRF Contributions (Clubs)"
                    description="Clubs that have made the largest total TRF contributions in USD."
                    data={topTRFClubs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topTRFClubs.length)}`}
                />
            </div>

            {/* 5. Compliance & Risks */}
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '5px' }}>Compliance & Risks</h3>
            
            <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                By The Numbers
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Leaderboard
                    title="Most Compliant Clubs"
                    description="Districts with the highest number of fully compliant clubs."
                    data={topDistCompliantAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistCompliantAbs.length)}`}
                />
                <Leaderboard
                    title="Highest Officer Reporting"
                    description="Districts with the highest number of clubs reporting their officers."
                    data={topReportedOfficersAbs}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topReportedOfficersAbs.length)}`}
                />
                <Leaderboard
                    title="Most Unreported Officers"
                    description="Districts with the highest number of clubs missing officer data."
                    data={topDistMissingOfficersAbs}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistMissingOfficersAbs.length)}`}
                />
                <Leaderboard
                    title="Most Clubs in Arrears"
                    description="Districts with the highest number of clubs in arrears."
                    data={topDistArrearsClubsAbs}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistArrearsClubsAbs.length)}`}
                />
                <Leaderboard
                    title="Highest Outstanding Dues (Districts)*"
                    description="Districts with the largest combined outstanding balances in INR."
                    data={topDistOutstanding}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistOutstanding.length)}`}
                />
                <Leaderboard
                    title="Most Clubs Subject to Termination"
                    description="Districts with the highest number of clubs at risk of termination."
                    data={topDistAtRiskAbs}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistAtRiskAbs.length)}`}
                />
                <Leaderboard
                    title="Most Suspended Interact Clubs"
                    description="Districts with the highest number of suspended Interact clubs."
                    data={topDistSuspendedInteract}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistSuspendedInteract.length)}`}
                />
                <Leaderboard
                    title="Highest Outstanding Dues (Clubs)*"
                    description="Individual clubs with the largest outstanding balances in INR."
                    data={topArrearsClubs}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topArrearsClubs.length)}`}
                />
            </div>

            <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                By The Percentages
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <Leaderboard
                    title="Most Compliant Clubs (%)"
                    description="Districts with the largest percentage of clubs that have both paid dues and reported officers."
                    data={topFullyCompliant}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topFullyCompliant.length)}`}
                />
                <Leaderboard
                    title="Highest % Officer Reporting"
                    description="Districts with the largest percentage of clubs that have reported their officers."
                    data={topReportedOfficers}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topReportedOfficers.length)}`}
                />
                <Leaderboard
                    title="Highest % Unreported Officers"
                    description="Districts with the highest percentage of clubs missing officer data."
                    data={topDistMissing}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistMissing.length)}`}
                />
                <Leaderboard
                    title="Highest % Clubs in Arrears"
                    description="Districts with the highest percentage of clubs in arrears."
                    data={topDistArrearsPct}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistArrearsPct.length)}`}
                />
                <Leaderboard
                    title="Highest % Subject to Termination"
                    description="Districts with the highest percentage of clubs with Outstanding Dues of ₹7,200 ($75) or more."
                    data={topDistAtRisk}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistAtRisk.length)}`}
                />
                <Leaderboard
                    title="Highest % Suspended Interact"
                    description="Districts with the highest percentage of Interact clubs currently suspended."
                    data={topDistSuspendedInteractPct}
                    isNegative={true}
                    maxItems={limit}
                    badge={`Top ${Math.min(limit, topDistSuspendedInteractPct.length)}`}
                />
            </div>
        </div>
    );
}
