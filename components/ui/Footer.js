'use client';

export default function Footer({ lastUpdated = '13 Aug 2026' }) {
    return (
        <footer style={{
            marginTop: '60px',
            padding: '30px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#f8f9fa',
            color: 'var(--text-muted)',
            fontSize: '12px',
            textAlign: 'center',
            lineHeight: '1.6',
            borderRadius: '0 0 12px 12px'
        }}>
            <div style={{ marginBottom: '14px', fontWeight: 600, color: 'var(--text-main)', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>Data Source: Rotary International</span>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <span>Last Updated: {lastUpdated}</span>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <a href="/docs" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>API & Open Data</a>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <a href="/privacy" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>Privacy Policy</a>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <a href="/terms" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>Terms of Service</a>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <a href="/contact" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>Contact</a>
            </div>
            <p style={{ maxWidth: '900px', margin: '0 auto 10px auto', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <strong>* Outstanding Dues Note:</strong> Dues are converted from USD to INR at prevailing monthly exchange rates (₹96/USD for current data, ₹95/USD for 1 July baseline) and rounded to the nearest whole integer at the individual club level. Aggregate district, zone, and global sums are subject to minor variations due to club-level rounding.
            </p>
            <p style={{ maxWidth: '900px', margin: '0 auto 10px auto', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <strong>* Data Exclusion Note:</strong> District 3291 is excluded from all statistics in this dashboard (except World Wide statistics) because its Rotaract is suspended. Consequently, its data is also omitted from associated Rotary and Interact metrics.
            </p>
            <p style={{ maxWidth: '900px', margin: '0 auto' }}>
                <strong>Disclaimer:</strong> The information contained in this dashboard is sourced from RISAO and may contain discrepancies or recent adjustments not yet reflected. RSAMDIO provides this platform strictly for informational purposes to help districts stay informed about their current standing. This dashboard does not constitute an official notice; all formal communications, official invoices, and official notices of termination will be issued exclusively by Rotary International or RISAO.
            </p>
        </footer>
    );
}
