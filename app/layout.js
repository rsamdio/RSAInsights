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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body>
        <div className="app-container">
          <header className="header">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit' }}>
              <img src="/rsamdio.webp" alt="RSAMDIO Logo" style={{ height: '40px', width: 'auto', borderRadius: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', lineHeight: '1.2' }}>Insights</h1>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Zones 4, 5, 6 & 7</span>
              </div>
            </Link>
            <Suspense fallback={<div>Loading filters...</div>}>
              <HeaderFilters />
            </Suspense>
          </header>
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
