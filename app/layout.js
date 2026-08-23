import { Suspense } from 'react';
import Link from 'next/link';
import './globals.css';
import HeaderFilters from '@/components/ui/HeaderFilters';
import Footer from '@/components/ui/Footer';

import Script from 'next/script';
import { Inter } from 'next/font/google';
import { getDashboardSummary } from '@/lib/api';
import Analytics from '@/components/ui/Analytics';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
  metadataBase: new URL('https://insights.rsamdio.org'),
  title: {
    template: '%s | Rotaract South Asia MDIO',
    default: 'Insights (Zones 4-7) | Rotaract South Asia MDIO',
  },
  description: 'Official analytics, membership demographics, TRF giving, and club performance dashboard for Rotaract Zones 4, 5, 6 & 7 (India, Sri Lanka, Nepal, Bhutan, Bangladesh, Maldives) by Rotaract South Asia MDIO.',
  keywords: [
    'Rotaract',
    'Rotary International',
    'Rotaract South Asia',
    'RSAMDIO',
    'Zone 4',
    'Zone 5',
    'Zone 6',
    'Zone 7',
    'Rotaract India',
    'Rotaract Sri Lanka',
    'Rotaract Nepal',
    'Rotaract Bangladesh',
    'Rotaract Bhutan',
    'Rotaract Maldives',
    'Rotaract Analytics',
    'Rotaract Dashboard',
    'Rotaract Clubs Directory',
    'Rotaract Membership Statistics',
    'The Rotary Foundation TRF Contributions',
    'Interact Clubs',
    'Rotary Club Sponsorship',
    'Rotaract Arrears Compliance',
  ],
  authors: [{ name: 'Rotaract South Asia MDIO', url: 'https://rsamdio.org' }],
  creator: 'Rotaract South Asia MDIO',
  publisher: 'Rotaract South Asia MDIO',
  category: 'Nonprofit & Community Analytics',
  alternates: {
    canonical: 'https://insights.rsamdio.org',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Insights (Zones 4-7) | Rotaract South Asia MDIO',
    description: 'Official analytics, membership demographics, TRF giving, and club performance dashboard for Rotaract Zones 4, 5, 6 & 7 by Rotaract South Asia MDIO.',
    url: 'https://insights.rsamdio.org',
    siteName: 'Rotaract South Asia MDIO Insights',
    images: [
      {
        url: '/rsamdio.webp',
        width: 1200,
        height: 630,
        alt: 'Rotaract South Asia MDIO Insights Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rsa_mdio',
    creator: '@rsa_mdio',
    title: 'Insights (Zones 4-7) | Rotaract South Asia MDIO',
    description: 'Official analytics, membership demographics, TRF giving, and club performance dashboard for Rotaract Zones 4, 5, 6 & 7 by Rotaract South Asia MDIO.',
    images: ['/rsamdio.webp'],
  },
  other: {
    'geo.region': 'IN;LK;NP;BT;BD;MV',
    'geo.placename': 'South Asia',
    'target-country': 'IN, LK, NP, BT, BD, MV',
  },
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const globalSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://insights.rsamdio.org/#organization',
    name: 'Rotaract South Asia Multi-District Information Organisation',
    alternateName: 'Rotaract South Asia MDIO (RSAMDIO)',
    url: 'https://insights.rsamdio.org',
    sameAs: [
      'https://x.com/rsa_mdio',
      'https://rsamdio.org',
    ],
    logo: 'https://insights.rsamdio.org/rsamdio.webp',
    parentOrganization: {
      '@type': 'Organization',
      name: 'Rotary International',
      url: 'https://www.rotary.org',
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'Sri Lanka' },
      { '@type': 'Country', name: 'Nepal' },
      { '@type': 'Country', name: 'Bangladesh' },
      { '@type': 'Country', name: 'Bhutan' },
      { '@type': 'Country', name: 'Maldives' },
    ],
    knowsAbout: [
      'Rotaract',
      'Rotary International',
      'Community Service',
      'Youth Leadership',
      'The Rotary Foundation',
      'Interact',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://insights.rsamdio.org/#website',
    url: 'https://insights.rsamdio.org',
    name: 'Rotaract South Asia MDIO Insights',
    description: 'Comprehensive analytics, membership metrics, and club performance directory for Rotaract Zones 4, 5, 6 & 7.',
    publisher: {
      '@id': 'https://insights.rsamdio.org/#organization',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': 'https://insights.rsamdio.org/#dataset',
    name: 'Rotaract South Asia Membership, Performance and Compliance Master Dataset',
    description: 'Master directory and performance analytics for 2,820+ Rotaract clubs, 40+ districts, and 4 zones (Zones 4, 5, 6 & 7) across South Asia.',
    url: 'https://insights.rsamdio.org',
    creator: {
      '@id': 'https://insights.rsamdio.org/#organization',
    },
    spatialCoverage: 'South Asia (India, Sri Lanka, Nepal, Bangladesh, Bhutan, Maldives)',
    temporalCoverage: '2026/2027',
  },
];

export default function RootLayout({ children }) {
  const summary = getDashboardSummary();
  const dataAsOf = summary?.dataAsOf || summary?.lastUpdated || '13 Aug 2026';
  let formattedDate = dataAsOf;
  if (dataAsOf && (dataAsOf.includes('T') || dataAsOf.includes('-'))) {
    try {
      const d = new Date(dataAsOf);
      if (!isNaN(d.getTime())) {
        formattedDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
      }
    } catch {}
  }

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <JsonLd schema={globalSchemas} />
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-M9RZK0CBT5" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M9RZK0CBT5');
          `}
        </Script>
      </head>
      <body>
        <Analytics />
        <div className="app-container">
          <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit' }}>
                <img src="/rsamdio.webp" alt="RSAMDIO Logo" style={{ height: '40px', width: 'auto', borderRadius: '4px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', lineHeight: '1.2' }}>Insights</h1>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Zones 4, 5, 6 & 7</span>
                </div>
              </Link>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                <span>Data as of: <strong style={{ color: 'var(--text-main)' }}>{formattedDate}</strong></span>
              </div>
            </div>
            <Suspense fallback={<div>Loading filters...</div>}>
              <HeaderFilters />
            </Suspense>
          </header>
          <main>{children}</main>
          <Footer lastUpdated={formattedDate} />
        </div>
      </body>
    </html>
  );
}
