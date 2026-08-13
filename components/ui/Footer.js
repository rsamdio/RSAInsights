'use client';

export default function Footer() {
    return (
        <footer style={{
            marginTop: '60px',
            padding: '30px 20px',
            borderTop: '1px solid var(--border)',
            backgroundColor: '#f8f9fa',
            color: 'var(--text-muted)',
            fontSize: '12px',
            textAlign: 'center',
            lineHeight: '1.6',
            borderRadius: '0 0 12px 12px'
        }}>
            <p style={{ maxWidth: '900px', margin: '0 auto' }}>
                <strong>Disclaimer:</strong> The information contained in this dashboard is sourced from RISAO and may contain discrepancies or recent adjustments not yet reflected. RSAMDIO provides this platform strictly for informational purposes to help districts stay informed about their current standing. This dashboard does not constitute an official notice; all formal communications, official invoices, and official notices of termination will be issued exclusively by Rotary International or RISAO.
            </p>
        </footer>
    );
}
