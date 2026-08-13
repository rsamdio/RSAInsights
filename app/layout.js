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
  description: 'World Class Analytics Dashboard',
  robots: {
    index: false,
    follow: false,
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
