import { getWorldwideSummary } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import WorldwideLeaderboardsSection from '@/components/sections/WorldwideLeaderboardsSection';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
    title: 'Worldwide Statistics',
    description: 'Worldwide Rotaract and Interact leaderboards, country rankings, district statistics, and membership growth metrics across 180+ countries and geographic areas.',
    alternates: {
        canonical: 'https://insights.rsamdio.org/worldwide',
    },
    openGraph: {
        title: 'Worldwide Statistics | Insights | Rotaract South Asia MDIO',
        description: 'Worldwide Rotaract and Interact leaderboards, country rankings, and membership growth metrics.',
        url: 'https://insights.rsamdio.org/worldwide',
        siteName: 'Rotaract South Asia MDIO Insights',
        images: [
            {
                url: '/rsamdio.webp',
                width: 1200,
                height: 630,
                alt: 'Worldwide Statistics | Insights | Rotaract South Asia MDIO',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        site: '@rsa_mdio',
        creator: '@rsa_mdio',
        title: 'Worldwide Statistics | Insights | Rotaract South Asia MDIO',
        description: 'Worldwide Rotaract and Interact leaderboards, country rankings, and membership growth metrics.',
        images: ['/rsamdio.webp'],
    },
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
        totalInteractClubs,
        totalInteractDelta,
        totalNewClubs = 0
    } = summary;

    const worldwideSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': 'https://insights.rsamdio.org/worldwide#webpage',
        url: 'https://insights.rsamdio.org/worldwide',
        name: 'Worldwide Statistics | Insights | Rotaract South Asia MDIO',
        description: 'Worldwide Rotaract and Interact leaderboards, country rankings, district statistics, and membership growth metrics.',
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
                    name: 'Worldwide Statistics',
                    item: 'https://insights.rsamdio.org/worldwide',
                },
            ],
        },
        about: {
            '@type': 'Dataset',
            name: 'Worldwide Rotaract & Interact Demographics',
            description: 'Global statistics covering Rotaract & Interact clubs, membership counts, and growth across all Rotary Zones and countries.',
        },
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <JsonLd schema={worldwideSchema} />
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to Home
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>Rotaract Worldwide Statistics</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', margin: 0 }}>Worldwide leaderboards for Rotaract Clubs, Rotaract Memberships, and Interact.</p>
            </div>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                <MetricCard 
                    title="Total Rotaract Clubs" 
                    value={totalClubs.toLocaleString()} 
                    trend={totalClubsDelta}
                />
                <MetricCard 
                    title="Total Members" 
                    value={totalMembers.toLocaleString()} 
                    trend={totalMembersDelta}
                />
                <MetricCard 
                    title="Average Membership" 
                    value={avgMembersPerClub.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} 
                    trend={avgMembersDelta}
                />
                {totalNewClubs > 0 && (
                    <MetricCard 
                        title="New Chartered Clubs" 
                        value={totalNewClubs.toLocaleString()} 
                    />
                )}
                {totalInteractClubs > 0 && (
                    <MetricCard 
                        title="Total Interact Clubs" 
                        value={totalInteractClubs.toLocaleString()} 
                        trend={totalInteractDelta}
                    />
                )}
            </section>

            <WorldwideLeaderboardsSection summary={summary} />
        </div>
    );
}
