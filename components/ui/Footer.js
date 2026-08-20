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
            <div style={{ marginBottom: '12px', fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                <span>Data Source: Rotary International</span>
                <span style={{ margin: '0 8px', color: 'var(--border-color)' }}>•</span>
                <span>Last Updated: {lastUpdated}</span>
            </div>
            <p style={{ maxWidth: '900px', margin: '0 auto 10px auto', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <strong>* Outstanding Dues Note:</strong> Dues are converted from USD to INR at prevailing monthly exchange rates (₹96/USD for current data, ₹95/USD for 1 July baseline) and rounded to the nearest whole integer at the individual club level. Aggregate district, zone, and global sums are subject to minor variations due to club-level rounding.
            </p>
            <p style={{ maxWidth: '900px', margin: '0 auto' }}>
                <strong>Disclaimer:</strong> The information contained in this dashboard is sourced from RISAO and may contain discrepancies or recent adjustments not yet reflected. RSAMDIO provides this platform strictly for informational purposes to help districts stay informed about their current standing. This dashboard does not constitute an official notice; all formal communications, official invoices, and official notices of termination will be issued exclusively by Rotary International or RISAO.
            </p>
        </footer>
    );
}
