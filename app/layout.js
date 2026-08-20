import { Suspense } from 'react';
import Link from 'next/link';
import './globals.css';
import HeaderFilters from '@/components/ui/HeaderFilters';
import Footer from '@/components/ui/Footer';

export const metadata = {
  metadataBase: new URL('https://insights.rsamdio.org'),
  title: {
    template: '%s | Rotaract South Asia MDIO',
    default: 'Insights (Zones 4-7) | Rotaract South Asia MDIO',
  },
  description: 'Comprehensive analytics and metrics dashboard for Zone 4 to 7 by Rotaract South Asia MDIO',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Insights (Zones 4-7) | Rotaract South Asia MDIO',
    description: 'Comprehensive analytics and metrics dashboard for Zone 4 to 7 by Rotaract South Asia MDIO',
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
    title: 'Insights (Zones 4-7) | Rotaract South Asia MDIO',
    description: 'Comprehensive analytics and metrics dashboard for Zone 4 to 7 by Rotaract South Asia MDIO',
    images: ['/rsamdio.webp'],
  },
};

import Script from 'next/script';
import { Inter } from 'next/font/google';
import { getDashboardSummary } from '@/lib/api';
import Analytics from '@/components/ui/Analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
