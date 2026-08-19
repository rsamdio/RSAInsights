import Leaderboard from '../ui/Leaderboard';

export default function TopChartsSection({ summary, arrearsData, allClubsData, trfData }) {
    
    // 1. Top Contributing Clubs
    const topTRFClubs = [...(trfData || [])]
        .map(c => {
            const clubName = c['Club Name'] || `Club ${c['Club No.']}`;
            const district = c['District'] ? ` (D-${c['District'].toString().replace(/\.0$/, '')})` : '';
            return {
                label: `${clubName}${district}`,
                valueNum: parseFloat((c['Total Contributions USD'] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0
            };
        })
        .sort((a, b) => b.valueNum - a.valueNum)
        .slice(0, 10)
        .map(c => ({ label: c.label, value: `$${c.valueNum.toLocaleString()}` }));

    // 2. Highest Membership Clubs
    const topMemberClubs = [...(allClubsData || [])]
        .map(c => {
            const clubName = c['Club Name'] || 'Unknown Club';
            const district = c['District'] ? ` (D-${c['District'].toString().replace(/\.0$/, '')})` : '';
            return {
                label: `${clubName}${district}`,
                valueNum: parseInt(c['Total Reported Members']) || 0
            };
        })
        .sort((a, b) => b.valueNum - a.valueNum)
        .slice(0, 5)
        .map(c => ({ label: c.label, value: c.valueNum.toLocaleString() }));

    // 2a. Highest Membership Community-based Clubs
    const topCommunityClubs = [...(allClubsData || [])]
        .filter(c => c['Rotaract Club Base'] === 'Community')
        .map(c => {
            const clubName = c['Club Name'] || 'Unknown Club';
            const district = c['District'] ? ` (D-${c['District'].toString().replace(/\.0$/, '')})` : '';
            return {
                label: `${clubName}${district}`,
                valueNum: parseInt(c['Total Reported Members']) || 0
            };
        })
        .sort((a, b) => b.valueNum - a.valueNum)
        .slice(0, 5)
        .map(c => ({ label: c.label, value: c.valueNum.toLocaleString() }));

    // 2b. Highest Membership University-based Clubs
    const topUniversityClubs = [...(allClubsData || [])]
        .filter(c => c['Rotaract Club Base'] === 'University')
        .map(c => {
            const clubName = c['Club Name'] || 'Unknown Club';
            const district = c['District'] ? ` (D-${c['District'].toString().replace(/\.0$/, '')})` : '';
            return {
                label: `${clubName}${district}`,
                valueNum: parseInt(c['Total Reported Members']) || 0
            };
        })
        .sort((a, b) => b.valueNum - a.valueNum)
        .slice(0, 5)
        .map(c => ({ label: c.label, value: c.valueNum.toLocaleString() }));

    // Combine District stats into a single array for easier mapping
    const distStats = [];
    if (summary && summary.zones) {
        Object.keys(summary.zones).forEach(z => {
            if (!summary.zones[z].districts) return;
            Object.keys(summary.zones[z].districts).forEach(d => {
                const stat = summary.zones[z].districts[d];
                if (stat && stat.totalClubs > 0) {
                    distStats.push({ district: d, ...stat });
                }
            });
        });
    }

    // 3. Top Districts by Total Contribution
    const topDistTRF = [...distStats]
        .filter(s => s.trfContributionsUSD > 0)
        .sort((a, b) => b.trfContributionsUSD - a.trfContributionsUSD)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `$${d.trfContributionsUSD.toLocaleString()}` }));

    // 4. Clubs with Highest Arrears (Negative)
    const topArrearsClubs = [...(arrearsData || [])]
        .map(c => {
            const clubName = c['Club Name'] || 'Unknown Club';
            const district = c['District'] ? ` (D-${c['District'].toString().replace(/\.0$/, '')})` : '';
            return {
                label: `${clubName}${district}`,
                valueNum: parseFloat((c[' USD Outstanding '] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0
            };
        })
        .sort((a, b) => b.valueNum - a.valueNum)
        .slice(0, 5)
        .map(c => ({ label: c.label, value: `$${c.valueNum.toLocaleString()}` }));

    // 5. Districts with Highest % Missing Officers (Negative)
    const topDistMissing = [...distStats]
        .map(s => ({ ...s, missingPct: (s.noOfficers / s.totalClubs) * 100 }))
        .sort((a, b) => b.missingPct - a.missingPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.missingPct.toFixed(1)}%` }));

    // 6. Districts with Highest Number of Clubs
    const topDistTotalClubs = [...distStats]
        .sort((a, b) => b.totalClubs - a.totalClubs)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.totalClubs.toLocaleString() }));

    // 7. Districts with Highest Number of Members
    const topDistTotalMembers = [...distStats]
        .sort((a, b) => b.totalMembers - a.totalMembers)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.totalMembers.toLocaleString() }));

    // 8. Districts with Highest Average Club Membership
    const topDistAvgMembers = [...distStats]
        .map(s => ({ ...s, avg: s.totalMembers / s.totalClubs }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.avg.toFixed(2) }));

    // 9. Districts with Lowest Number of Reported Officers (Negative)
    const lowestDistReported = [...distStats]
        .map(s => ({ ...s, reported: s.totalClubs - s.noOfficers }))
        .sort((a, b) => a.reported - b.reported)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.reported.toLocaleString() }));

    // 10. Districts with Lowest % Clubs with Arrears (Positive)
    const lowestDistArrears = [...distStats]
        .map(s => ({ ...s, arrPct: (s.arrearsClubs / s.totalClubs) * 100 }))
        .sort((a, b) => a.arrPct - b.arrPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.arrPct.toFixed(1)}%` }));

    // 10b. Highest % Clubs in Arrears (Negative)
    const topDistArrearsPct = [...distStats]
        .map(s => ({ ...s, arrPct: (s.arrearsClubs / s.totalClubs) * 100 }))
        .sort((a, b) => b.arrPct - a.arrPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.arrPct.toFixed(1)}%` }));

    // 11. Districts with highest number of New Clubs
    const topDistNewClubs = [...distStats]
        .filter(s => s.newTotalClubs > 0)
        .sort((a, b) => b.newTotalClubs - a.newTotalClubs)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.newTotalClubs.toLocaleString() }));

    // 12. Highest Rotary Sponsorship Penetration (%)
    const topRotaryPenetration = [...distStats]
        .filter(s => s.totalRotary > 0)
        .map(s => ({ ...s, penPct: (s.rotaryWithSponsor / s.totalRotary) * 100 }))
        .sort((a, b) => b.penPct - a.penPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.penPct.toFixed(1)}%` }));

    // 13. Most Missed Opportunities (Absolute number of Rotary w/o Sponsor)
    const topMissedOpportunities = [...distStats]
        .sort((a, b) => b.rotaryWithoutSponsor - a.rotaryWithoutSponsor)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.rotaryWithoutSponsor.toLocaleString() }));

    // 13b. Highest % Missed Rotary Opportunities
    const topMissedPct = [...distStats]
        .filter(s => s.totalRotary > 0)
        .map(s => ({ ...s, missPct: (s.rotaryWithoutSponsor / s.totalRotary) * 100 }))
        .sort((a, b) => b.missPct - a.missPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.missPct.toFixed(1)}%` }));

    // 14. Highest % of Clubs Subject to Termination
    const topDistAtRisk = [...distStats]
        .map(s => ({ ...s, riskPct: (s.atRisk / s.totalClubs) * 100 }))
        .sort((a, b) => b.riskPct - a.riskPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.riskPct.toFixed(1)}%` }));

    // 14b. Most Clubs Subject to Termination (Absolute)
    const topDistAtRiskAbs = [...distStats]
        .filter(s => s.atRisk > 0)
        .sort((a, b) => b.atRisk - a.atRisk)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.atRisk.toLocaleString() }));

    // 15. Highest Total Outstanding Dues (USD)
    const topDistOutstanding = [...distStats]
        .filter(s => s.outstanding > 0)
        .sort((a, b) => b.outstanding - a.outstanding)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `$${d.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` }));

    // 15b. Most Clubs in Arrears (Absolute)
    const topDistArrearsClubsAbs = [...distStats]
        .filter(s => s.arrearsClubs > 0)
        .sort((a, b) => b.arrearsClubs - a.arrearsClubs)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.arrearsClubs.toLocaleString() }));

    // 15c. Most Unreported Officers (Absolute)
    const topDistMissingOfficersAbs = [...distStats]
        .filter(s => s.noOfficers > 0)
        .sort((a, b) => b.noOfficers - a.noOfficers)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.noOfficers.toLocaleString() }));

    // Compute exact compliance from allClubsData
    const distCompliance = {};
    if (allClubsData) {
        allClubsData.forEach(c => {
            const dist = c['District'] ? c['District'].toString().replace(/\.0$/, '') : '';
            if (!dist) return;
            if (!distCompliance[dist]) {
                distCompliance[dist] = { total: 0, compliant: 0, reported: 0, paid: 0 };
            }
            distCompliance[dist].total += 1;
            
            const isPaidBool = (c['Arrears'] !== 'Yes'); // assuming "Yes" means arrears
            const isReportedBool = (c['Officers'] === 'Yes');

            if (isPaidBool) distCompliance[dist].paid += 1;
            if (isReportedBool) distCompliance[dist].reported += 1;
            if (isPaidBool && isReportedBool) distCompliance[dist].compliant += 1;
        });
    }

    const distCompList = Object.keys(distCompliance).map(d => ({
        district: d,
        ...distCompliance[d],
        compPct: (distCompliance[d].compliant / distCompliance[d].total) * 100,
        paidPct: (distCompliance[d].paid / distCompliance[d].total) * 100,
        reportPct: (distCompliance[d].reported / distCompliance[d].total) * 100
    })).filter(d => d.total > 0);

    // 16. Highest % Fully Compliant Clubs
    const topFullyCompliant = [...distCompList]
        .sort((a, b) => b.compPct - a.compPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.compPct.toFixed(1)}%` }));

    // 16b. Most Fully Compliant Clubs (Absolute)
    const topDistCompliantAbs = [...distCompList]
        .filter(s => s.compliant > 0)
        .sort((a, b) => b.compliant - a.compliant)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.compliant.toLocaleString() }));

    // 17. Highest % Clubs Reporting Officers
    const topReportedOfficers = [...distCompList]
        .sort((a, b) => b.reportPct - a.reportPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.reportPct.toFixed(1)}%` }));

    // 17b. Most Clubs Reporting Officers (Absolute)
    const topReportedOfficersAbs = [...distCompList]
        .filter(s => s.reported > 0)
        .sort((a, b) => b.reported - a.reported)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.reported.toLocaleString() }));

    // 18. Highest % Clubs with Paid Dues
    const topPaidDues = [...distCompList]
        .sort((a, b) => b.paidPct - a.paidPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.paidPct.toFixed(1)}%` }));

    // Growth Metrics
    const topDistMembersGrowthAbs = [...distStats]
        .filter(d => (d.membersGrowthAbs || 0) > 0)
        .sort((a, b) => (b.membersGrowthAbs || 0) - (a.membersGrowthAbs || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `+${(d.membersGrowthAbs || 0).toLocaleString()}` }));

    const topDistMembersGrowthPct = [...distStats]
        .filter(d => (d.membersGrowthPct || 0) > 0)
        .sort((a, b) => (b.membersGrowthPct || 0) - (a.membersGrowthPct || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `+${(d.membersGrowthPct || 0).toFixed(1)}%` }));

    const topDistClubsGrowthAbs = [...distStats]
        .filter(d => (d.clubsGrowthAbs || 0) > 0)
        .sort((a, b) => (b.clubsGrowthAbs || 0) - (a.clubsGrowthAbs || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `+${(d.clubsGrowthAbs || 0).toLocaleString()}` }));

    const topDistClubsGrowthPct = [...distStats]
        .filter(d => (d.clubsGrowthPct || 0) > 0)
        .sort((a, b) => (b.clubsGrowthPct || 0) - (a.clubsGrowthPct || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `+${(d.clubsGrowthPct || 0).toFixed(1)}%` }));

    // Interact Ecosystem Leaderboards
    const topDistInteractClubs = [...distStats]
        .filter(s => (s.totalInteractClubs || 0) > 0)
        .sort((a, b) => (b.totalInteractClubs || 0) - (a.totalInteractClubs || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.totalInteractClubs.toLocaleString() }));

    const topDistInteractGrowth = [...distStats]
        .map(s => ({ ...s, growth: (s.totalInteractClubs || 0) - (s.prevInteractClubs || 0) }))
        .filter(s => s.growth > 0)
        .sort((a, b) => b.growth - a.growth)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `+${d.growth.toLocaleString()}` }));

    const topDistInteractGrowthPct = [...distStats]
        .filter(s => (s.prevInteractClubs || 0) > 0)
        .map(s => ({ ...s, growthPct: (((s.totalInteractClubs || 0) - (s.prevInteractClubs || 0)) / s.prevInteractClubs) * 100 }))
        .filter(s => s.growthPct > 0)
        .sort((a, b) => b.growthPct - a.growthPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `+${d.growthPct.toFixed(1)}%` }));

    const topDistInteractHealth = [...distStats]
        .filter(s => (s.totalInteractClubs || 0) > 0)
        .map(s => ({ ...s, healthPct: (((s.totalInteractClubs - (s.suspendedInteractClubs || 0)) / s.totalInteractClubs) * 100) }))
        .sort((a, b) => b.healthPct - a.healthPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.healthPct.toFixed(1)}%` }));

    const topDistRotaractSponsorInteract = [...distStats]
        .filter(s => (s.rotaractWithInteract || 0) > 0)
        .sort((a, b) => (b.rotaractWithInteract || 0) - (a.rotaractWithInteract || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.rotaractWithInteract.toLocaleString() }));

    const topDistRotaractSponsorInteractPct = [...distStats]
        .filter(s => (s.totalClubs || 0) > 0 && (s.rotaractWithInteract || 0) > 0)
        .map(s => ({ ...s, spPct: ((s.rotaractWithInteract || 0) / s.totalClubs) * 100 }))
        .sort((a, b) => b.spPct - a.spPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.spPct.toFixed(1)}%` }));

    const topDistRotaryNoInteract = [...distStats]
        .filter(s => (s.rotaryWithoutInteract || 0) > 0)
        .sort((a, b) => (b.rotaryWithoutInteract || 0) - (a.rotaryWithoutInteract || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.rotaryWithoutInteract.toLocaleString() }));

    const topDistRotaryNoInteractPct = [...distStats]
        .filter(s => (s.totalRotary || 0) > 0 && (s.rotaryWithoutInteract || 0) > 0)
        .map(s => ({ ...s, noIntPct: ((s.rotaryWithoutInteract || 0) / s.totalRotary) * 100 }))
        .sort((a, b) => b.noIntPct - a.noIntPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.noIntPct.toFixed(1)}%` }));

    const topDistSuspendedInteract = [...distStats]
        .filter(s => (s.suspendedInteractClubs || 0) > 0)
        .sort((a, b) => (b.suspendedInteractClubs || 0) - (a.suspendedInteractClubs || 0))
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: d.suspendedInteractClubs.toLocaleString() }));

    const topDistSuspendedInteractPct = [...distStats]
        .filter(s => (s.totalInteractClubs || 0) > 0 && (s.suspendedInteractClubs || 0) > 0)
        .map(s => ({ ...s, suspPct: ((s.suspendedInteractClubs || 0) / s.totalInteractClubs) * 100 }))
        .sort((a, b) => b.suspPct - a.suspPct)
        .slice(0, 5)
        .map(d => ({ label: `District ${d.district}`, value: `${d.suspPct.toFixed(1)}%` }));

    return (
        <div style={{ marginTop: '50px', marginBottom: '50px' }}>
            <h2 className="section-title">Top Charts</h2>
            
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>Growth & Engagement</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard title="Highest Members (Districts)" description="Districts with the largest total Rotaract membership." data={topDistTotalMembers} maxItems={5} />
                <Leaderboard title="Highest Member Growth" description="Districts with the largest increase in members since July 1." data={topDistMembersGrowthAbs} maxItems={5} />
                <Leaderboard title="Highest Member Growth (%)" description="Districts with the largest percentage increase in members since July 1." data={topDistMembersGrowthPct} maxItems={5} />
                <Leaderboard title="Most Clubs" description="Districts with the most active Rotaract clubs." data={topDistTotalClubs} maxItems={5} />
                <Leaderboard title="Highest Club Growth" description="Districts with the largest increase in active clubs since July 1." data={topDistClubsGrowthAbs} maxItems={5} />
                <Leaderboard title="Highest Club Growth (%)" description="Districts with the largest percentage increase in active clubs since July 1." data={topDistClubsGrowthPct} maxItems={5} />
                <Leaderboard title="Most New Clubs" description="Districts with the highest number of new clubs chartered since July 1." data={topDistNewClubs} maxItems={5} />
                <Leaderboard title="Highest Avg. Club Membership" description="Districts with the highest average members per club." data={topDistAvgMembers} maxItems={5} />
                <Leaderboard title="Highest Membership (Clubs)" description="Clubs with the largest total reported membership." data={topMemberClubs} maxItems={5} />
                <Leaderboard title="Largest Community Clubs" description="Community-based clubs with the most members." data={topCommunityClubs} maxItems={5} />
                <Leaderboard title="Largest University Clubs" description="University-based clubs with the most members." data={topUniversityClubs} maxItems={5} />
            </div>

            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>Interact Ecosystem</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard title="Most Interact Clubs" description="Districts with the highest total number of Interact clubs." data={topDistInteractClubs} maxItems={5} />
                <Leaderboard title="Highest Interact Growth" description="Districts with the largest increase in Interact clubs since July 1." data={topDistInteractGrowth} maxItems={5} />
                <Leaderboard title="Highest Interact Growth (%)" description="Districts with the largest percentage increase in Interact clubs since July 1." data={topDistInteractGrowthPct} maxItems={5} />
                <Leaderboard title="Highest Active Interact Rate (%)" description="Districts with the highest percentage of active Interact clubs." data={topDistInteractHealth} maxItems={5} />
                <Leaderboard title="Most Rotaract Sponsoring Interact" description="Districts with the highest number of Rotaract clubs sponsoring Interact." data={topDistRotaractSponsorInteract} maxItems={5} />
                <Leaderboard title="Highest Rotaract Sponsoring Rate (%)" description="Districts with the highest percentage of Rotaract clubs sponsoring Interact." data={topDistRotaractSponsorInteractPct} maxItems={5} />
                <Leaderboard title="Highest % Rotary w/o Interact" description="Districts with the highest percentage of Rotary clubs without an Interact Club." data={topDistRotaryNoInteractPct} isNegative={true} maxItems={5} />
                <Leaderboard title="Most Rotary w/o Interact" description="Districts with the highest number of Rotary clubs without an Interact Club." data={topDistRotaryNoInteract} isNegative={true} maxItems={5} />
            </div>

            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>Rotary-Rotaract Integration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard title="Highest Rotary Penetration (%)" description="Districts with the highest percentage of Rotary clubs that sponsor a Rotaract club." data={topRotaryPenetration} maxItems={5} />
                <Leaderboard title="Highest % Missed Opportunities" description="Districts with the highest percentage of Rotary clubs without a Sponsored Rotaract Club." data={topMissedPct} isNegative={true} maxItems={5} />
                <Leaderboard title="Most Missed Opportunities" description="Districts with the highest total number of Rotary clubs without a Sponsored Rotaract Club." data={topMissedOpportunities} isNegative={true} maxItems={5} />
            </div>

            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '15px' }}>The Rotary Foundation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <Leaderboard title="Highest TRF Contributions (Districts)" description="Districts whose clubs have made the largest combined TRF contributions in USD." data={topDistTRF} maxItems={5} />
                <Leaderboard title="Highest TRF Contributions (Clubs)" description="Clubs that have made the largest total TRF contributions in USD." data={topTRFClubs} maxItems={5} />
            </div>

            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '5px' }}>Compliance & Risks</h3>
            
            <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By The Numbers</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Leaderboard title="Most Compliant Clubs" description="Districts with the highest number of fully compliant clubs." data={topDistCompliantAbs} maxItems={5} />
                <Leaderboard title="Highest Officer Reporting" description="Districts with the highest number of clubs reporting their officers." data={topReportedOfficersAbs} maxItems={5} />
                <Leaderboard title="Most Unreported Officers" description="Districts with the highest number of clubs missing officer data." data={topDistMissingOfficersAbs} isNegative={true} maxItems={5} />
                <Leaderboard title="Most Clubs in Arrears" description="Districts with the highest number of clubs in arrears." data={topDistArrearsClubsAbs} isNegative={true} maxItems={5} />
                <Leaderboard title="Highest Outstanding Dues (Districts)" description="Districts with the largest combined outstanding balances in USD." data={topDistOutstanding} isNegative={true} maxItems={5} />
                <Leaderboard title="Most Clubs Subject to Termination" description="Districts with the highest number of clubs at risk of termination." data={topDistAtRiskAbs} isNegative={true} maxItems={5} />
                <Leaderboard title="Most Suspended Interact Clubs" description="Districts with the highest number of suspended Interact clubs." data={topDistSuspendedInteract} isNegative={true} maxItems={5} />
                <Leaderboard title="Highest Outstanding Dues (Clubs)" description="Individual clubs with the largest outstanding balances in USD." data={topArrearsClubs} isNegative={true} maxItems={5} />
            </div>

            <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By The Percentages</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <Leaderboard title="Most Compliant Clubs (%)" description="Districts with the largest percentage of clubs that have both paid dues and reported officers." data={topFullyCompliant} maxItems={5} />
                <Leaderboard title="Highest % Officer Reporting" description="Districts with the largest percentage of clubs that have reported their officers." data={topReportedOfficers} maxItems={5} />
                <Leaderboard title="Highest % Unreported Officers" description="Districts with the highest percentage of clubs missing officer data." data={topDistMissing} isNegative={true} maxItems={5} />
                <Leaderboard title="Highest % Clubs in Arrears" description="Districts with the highest percentage of clubs in arrears." data={topDistArrearsPct} isNegative={true} maxItems={5} />
                <Leaderboard title="Highest % Subject to Termination" description="Districts with the highest percentage of clubs with Outstanding Dues of $75 or more." data={topDistAtRisk} isNegative={true} maxItems={5} />
                <Leaderboard title="Highest % Suspended Interact" description="Districts with the highest percentage of Interact clubs currently suspended." data={topDistSuspendedInteractPct} isNegative={true} maxItems={5} />
            </div>
        </div>
    );
}
