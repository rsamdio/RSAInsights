import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service and Data Usage Agreement for the Rotaract South Asia Analytics Dashboard, REST API, and Model Context Protocol (MCP) server.',
    alternates: {
        canonical: 'https://insights.rsamdio.org/terms',
    },
};

export default function TermsOfServicePage() {
    const lastUpdated = 'September 2026';

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px 0 60px 0' }}>
            {/* Breadcrumb Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <Link href="/" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>Dashboard</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-main)' }}>Terms of Service</span>
            </div>

            {/* Page Header */}
            <div style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '16px',
                padding: '36px',
                marginBottom: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'inline-block', background: 'var(--primary-light, #e6f0fa)', color: 'var(--primary, #0f4c81)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
                    Usage Agreement
                </div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '30px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    Terms of Service
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                    Last Updated: {lastUpdated} • Rotaract South Asia Multi-District Information Organisation (RSAMDIO)
                </p>
            </div>

            {/* Terms Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. Acceptance */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        1. Acceptance of Terms
                    </h2>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        By accessing or using the <strong>Rotaract South Asia Insights Dashboard</strong> (<code>insights.rsamdio.org</code>), our public REST API endpoints (<code>/api/v1/*</code>), our Model Context Protocol (MCP) server, or any associated data feeds, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, please do not use the services.
                    </p>
                </div>

                {/* 2. Platform Purpose & Non-Official Notice Disclaimer */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        2. Informational Purpose & Formal Notice Disclaimer
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        The information contained in this dashboard is sourced from Rotary International (RI) and the Rotary International South Asia Office (RISAO). RSAMDIO provides this platform strictly for informational, educational, and district planning purposes to help leadership teams stay informed about current standings.
                    </p>
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
                        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: '#92400e', fontWeight: 500 }}>
                            <strong>Official Notice Disclaimer:</strong> This dashboard does not constitute a formal legal notice, official invoice, or binding regulatory decision. All formal communications, official invoices, and official notices of club termination or suspension are issued exclusively by Rotary International and RISAO.
                        </p>
                    </div>
                </div>

                {/* 3. Permitted & Acceptable Use */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        3. Permitted and Acceptable Use
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        You are permitted and encouraged to use the portal for the following activities:
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Leadership & District Operations:</strong> Reviewing club health, monitoring membership trends, tracking dues reconciliation, and celebrating TRF giving achievements.</li>
                        <li><strong>Research & Education:</strong> Academic study, youth development analysis, and community impact evaluations.</li>
                        <li><strong>AI & Automation:</strong> Interfacing autonomous AI assistants (via MCP or REST) to query membership statistics, leadership rosters, and compliance summaries for authorized district research.</li>
                    </ul>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--danger, #d93025)' }}>
                        Prohibited Activities:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li>Engaging in denial of service (DoS) attacks or sending automated requests at frequencies that degrade performance for other users.</li>
                        <li>Attempting to bypass security headers, inject malicious payloads, or disrupt underlying edge hosting infrastructure.</li>
                        <li>Misrepresenting unofficial calculations or preliminary data as official Rotary International sanctions.</li>
                    </ul>
                </div>

                {/* 4. Open Data License */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        4. Open Data Licensing (ODbL)
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        Master datasets and public API outputs are provided under the <strong>Open Data Commons Open Database License (ODbL)</strong>:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Attribution:</strong> You must credit <em>Rotaract South Asia MDIO (RSAMDIO)</em> and <em>Rotary International</em> when republishing or producing derivative works.</li>
                        <li><strong>Share-Alike:</strong> Any derivative database or enhanced dataset made publicly available must also be offered under the ODbL license.</li>
                    </ul>
                </div>

                {/* 5. Currency Calculations & Rounding Disclaimers */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        5. Currency Conversions and Numerical Calculations
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        Dues figures are converted from US Dollars (USD) to Indian Rupees (INR) at prevailing monthly exchange rates (for example, ₹96/USD for current periods and ₹95/USD for 1 July baselines) and rounded to the nearest whole integer at the individual club level.
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                        Aggregate district, zone, and global sums are subject to minor variations due to club-level whole-integer rounding and exchange rate fluctuation cycles. District 3291 is excluded from operational South Asia statistics because its Rotaract operations are currently suspended.
                    </p>
                </div>

                {/* 6. Limitation of Liability */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        6. Disclaimer of Warranties and Limitation of Liability
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        The service, datasets, REST APIs, and MCP endpoints are provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis without warranties of any kind, either express or implied, including but not limited to uptime guarantees, completeness, or fitness for a particular purpose.
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                        In no event shall RSAMDIO, its officers, developers, or Rotary International be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform, including any decisions made based on published metrics.
                    </p>
                </div>

                {/* 7. Modifications & Inquiries */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        7. Modifications and Inquiries
                    </h2>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                        RSAMDIO reserves the right to modify these Terms of Service at any time. Continued use of the platform following the posting of modifications constitutes acceptance of the revised terms.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Link href="/contact" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--primary, #0f4c81)',
                            color: '#ffffff',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            textDecoration: 'none'
                        }}>
                            Contact Us →
                        </Link>
                        <Link href="/privacy" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--primary-light, #e6f0fa)',
                            color: 'var(--primary, #0f4c81)',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            textDecoration: 'none'
                        }}>
                            View Privacy Policy →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
