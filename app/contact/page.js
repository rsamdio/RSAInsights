import Link from 'next/link';

export const metadata = {
    title: 'Contact Us',
    description: 'Contact information and communication channels for Rotaract South Asia Analytics, REST API, and Model Context Protocol (MCP) integrations.',
    alternates: {
        canonical: 'https://insights.rsamdio.org/contact',
    },
};

export default function ContactPage() {
    return (
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '20px 0 60px 0' }}>
            {/* Breadcrumb Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <Link href="/" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>Dashboard</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-main)' }}>Contact</span>
            </div>

            {/* Page Hero Header */}
            <div style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '16px',
                padding: '36px',
                marginBottom: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'inline-block', background: 'var(--primary-light, #e6f0fa)', color: 'var(--primary, #0f4c81)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
                    Communications & Inquiries
                </div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '30px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    Contact Us
                </h1>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--text-muted)', maxWidth: '720px' }}>
                    Have questions about club records, arrears reconciliation, API endpoints, or Model Context Protocol (MCP) AI connections? Connect with the RSAMDIO team.
                </p>
            </div>

            {/* Contact Directory Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📬</div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        General Inquiries
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Central email desk for general questions, platform feedback, and correspondence.
                    </p>
                    <a href="mailto:info@rsamdio.org" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                        info@rsamdio.org →
                    </a>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        Data & Analytics
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Questions regarding dues baselines, club rosters, or membership statistics.
                    </p>
                    <a href="mailto:info@rsamdio.org?subject=Data%20%26%20Analytics%20Inquiry" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                        info@rsamdio.org →
                    </a>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛠️</div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        Technical & Leadership
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        API / MCP integrations, and communications for DG, DRR, and DRC teams.
                    </p>
                    <a href="mailto:info@rsamdio.org?subject=Technical%20%26%20Leadership%20Inquiry" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                        info@rsamdio.org →
                    </a>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌐</div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        Official MDIO Portal
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        News, initiatives, Chronicles magazine, and leadership directories across South Asia.
                    </p>
                    <a href="https://rsamdio.org" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                        rsamdio.org ↗
                    </a>
                </div>
            </div>

            {/* Guidance & Developer Resources Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
                <div className="card" style={{ padding: '28px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                        ⏱️ Response Time & Guidelines
                    </h3>
                    <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        Our volunteer analytics and technology teams typically respond to email inquiries within <strong>24 to 48 business hours</strong>. During regional peak reporting periods (such as semi-annual dues windows on 1 July and 1 January), response times may vary slightly.
                    </p>
                    <div style={{ fontSize: '12.5px', color: '#64748b', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: '1.5' }}>
                        💡 <strong>Tip for Faster Resolution:</strong> When writing to us, please include your 4-digit Rotary District number and 7-digit Club ID if asking about a specific club roster or dues reconciliation.
                    </div>
                </div>

                <div className="card" style={{ padding: '28px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                        🤖 AI & Developer Resources
                    </h3>
                    <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        Connecting our Model Context Protocol (MCP) server or exploring public REST API endpoints? Access full interactive documentation and schemas:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Link href="/docs" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                            Interactive API Documentation (/docs) →
                        </Link>
                        <a href="/openapi.json" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                            OpenAPI 3.1.0 Specification (/openapi.json) ↗
                        </a>
                        <a href="/.well-known/mcp-server.json" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                            MCP Discovery Manifest (/.well-known/mcp-server.json) ↗
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
