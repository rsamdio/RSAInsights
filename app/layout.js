import { Suspense } from 'react';
import './globals.css';
import HeaderFilters from '@/components/ui/HeaderFilters';

export const metadata = {
  metadataBase: new URL('https://45678.rsamdio.org'),
  title: {
    template: '%s | Rotaract South Asia MDIO',
    default: 'Rotaract South Asia Analysis | Rotaract South Asia MDIO',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src="/rsamdio.webp" alt="RSAMDIO Logo" style={{ height: '40px', width: 'auto', borderRadius: '4px' }} />
              <h1>Rotaract South Asia Analytics</h1>
            </div>
            <Suspense fallback={<div>Loading filters...</div>}>
              <HeaderFilters />
            </Suspense>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
