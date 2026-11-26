import { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import './globals.css';
import Footer from '@/components/ui/Footer';

const HeaderFilters = dynamic(() => import('@/components/ui/HeaderFilters'), {
  loading: () => <div style={{ minHeight: '38px', minWidth: '200px' }} />
});
const HeaderNav = dynamic(() => import('@/components/ui/HeaderNav'), {
  loading: () => <div className="header-nav" aria-hidden="true" />
});
const ClubSearch = dynamic(() => import('@/components/ui/ClubSearch'), {
  loading: () => <div className="club-search" aria-hidden="true" />
});

import Script from 'next/script';
import { Inter } from 'next/font/google';
import { getDashboardSummary, getAllClubs, getArrears, getDataAsOfDate } from '@/lib/api';
import Analytics from '@/components/ui/Analytics';
import NavigationProgress from '@/components/ui/NavigationProgress';
import BackToTop from '@/components/ui/BackToTop';
import JsonLd from '@/components/seo/JsonLd';

if (!global._preloaded) {
  global._preloaded = true;
  try {
    getAllClubs();
    getDashboardSummary();
    getArrears();
  } catch {}
}

export const metadata = {
  metadataBase: new URL('https://insights.rsamdio.org'),
  title: {
    template: '%s | Insights | Rotaract South Asia MDIO',
    default: 'Insights | Rotaract South Asia MDIO',
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
    title: 'Insights | Rotaract South Asia MDIO',
    description: 'Official analytics, membership demographics, TRF giving, and club performance dashboard for Rotaract Zones 4, 5, 6 & 7 by Rotaract South Asia MDIO.',
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

function buildGlobalSchemas(dataAsOfLabel) {
  return [
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
        'https://claude.ai/directory/rsainsights',
        'https://chatgpt.com/plugins/plugin_asdk_app_6ad0c19aaa448191806eefd29e8edec7',
      ],
      logo: {
        '@type': 'ImageObject',
        url: 'https://insights.rsamdio.org/rsamdio.webp',
      },
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
        'Model Context Protocol',
        'South Asia Rotaract analytics',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: 'https://insights.rsamdio.org/contact',
        email: 'info@rsamdio.org',
        availableLanguage: ['English'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://insights.rsamdio.org/#website',
      url: 'https://insights.rsamdio.org',
      name: 'Rotaract South Asia MDIO Insights',
      description: 'Comprehensive analytics, membership metrics, and club performance directory for Rotaract Zones 4, 5, 6 & 7.',
      inLanguage: 'en',
      publisher: {
        '@id': 'https://insights.rsamdio.org/#organization',
      },
      about: {
        '@id': 'https://insights.rsamdio.org/#dataset',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': 'https://insights.rsamdio.org/#dataset',
      name: 'Rotaract South Asia Membership, Performance and Compliance Master Dataset',
      description: 'Master directory and performance analytics for Rotaract clubs, districts, and zones (Zones 4, 5, 6 & 7) across South Asia, plus worldwide Rotaract and Interact benchmarks.',
      url: 'https://insights.rsamdio.org',
      creator: {
        '@id': 'https://insights.rsamdio.org/#organization',
      },
      publisher: {
        '@id': 'https://insights.rsamdio.org/#organization',
      },
      license: 'https://opendatacommons.org/licenses/odbl/1-0/',
      isAccessibleForFree: true,
      spatialCoverage: 'South Asia (India, Sri Lanka, Nepal, Bangladesh, Bhutan, Maldives)',
      temporalCoverage: '2026/2027',
      dateModified: dataAsOfLabel,
      keywords: [
        'Rotaract',
        'Rotary',
        'South Asia',
        'membership analytics',
        'TRF',
        'Interact',
        'club compliance',
      ],
      distribution: [
        {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: 'https://insights.rsamdio.org/openapi.json',
        },
        {
          '@type': 'DataDownload',
          encodingFormat: 'text/plain',
          contentUrl: 'https://insights.rsamdio.org/llms.txt',
        },
        {
          '@type': 'DataDownload',
          encodingFormat: 'text/markdown',
          contentUrl: 'https://insights.rsamdio.org/ai-overview.md',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebAPI',
      '@id': 'https://insights.rsamdio.org/#rest-api',
      name: 'Rotaract South Asia Analytics REST API',
      description: 'Public unauthenticated REST API for Rotaract and Rotary analytics across South Asia Zones 4-7 and worldwide benchmarks.',
      url: 'https://insights.rsamdio.org/docs',
      documentation: 'https://insights.rsamdio.org/openapi.json',
      provider: {
        '@id': 'https://insights.rsamdio.org/#organization',
      },
      isAccessibleForFree: true,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': 'https://insights.rsamdio.org/#mcp-server',
      name: 'Rotaract Insights MCP Server',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Model Context Protocol server exposing 14 analytical tools, 8 resources, and 4 prompts for Rotaract South Asia intelligence inside ChatGPT, Claude, and other MCP clients.',
      url: 'https://insights.rsamdio.org/api/mcp',
      downloadUrl: 'https://insights.rsamdio.org/.well-known/mcp-server.json',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      provider: {
        '@id': 'https://insights.rsamdio.org/#organization',
      },
      isAccessibleForFree: true,
    },
  ];
}

export default function RootLayout({ children }) {
  const dataAsOf = getDataAsOfDate();
  let formattedDate = dataAsOf;
  if (dataAsOf && (dataAsOf.includes('T') || dataAsOf.includes('-'))) {
    try {
      const d = new Date(dataAsOf);
      if (!isNaN(d.getTime())) {
        formattedDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
      }
    } catch {}
  }

  const globalSchemas = buildGlobalSchemas(formattedDate);

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
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <div className="app-container">
          <header className="header">
            <div className="header-brand-cluster">
              <Link href="/" className="header-brand-link">
                <img src="/rsamdio.webp" alt="RSAMDIO Logo" width="40" height="40" className="header-logo" />
                <div className="header-brand-text">
                  <h1>Insights</h1>
                  <span>Zones 4, 5, 6 & 7</span>
                </div>
              </Link>
              <div className="header-data-badge">
                <span className="header-data-dot" aria-hidden="true"></span>
                <span>Data as of: <strong>{formattedDate}</strong></span>
              </div>
              <Suspense fallback={<div className="header-nav" aria-hidden="true" />}>
                <HeaderNav />
              </Suspense>
            </div>
            <div className="header-controls">
              <Suspense fallback={<div className="club-search" aria-hidden="true" />}>
                <ClubSearch />
              </Suspense>
              <Suspense fallback={<div>Loading filters...</div>}>
                <HeaderFilters />
              </Suspense>
            </div>
          </header>
          <main>{children}</main>
          <Footer lastUpdated={formattedDate} />
        </div>
        <BackToTop />
      </body>
    </html>
  );
}
