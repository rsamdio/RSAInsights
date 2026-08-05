import { Suspense } from 'react';
import './globals.css';
import HeaderFilters from '@/components/ui/HeaderFilters';

export const metadata = {
  title: 'Rotaract South Asia Analytics',
  description: 'World Class Analytics Dashboard',
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
            <h1>Rotaract South Asia Analytics</h1>
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
