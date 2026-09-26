import Link from 'next/link';
import ContactSupportForm from '@/components/ui/ContactSupportForm';

export const metadata = {
    title: 'Contact & Support',
    description: 'Contact and support desk for Rotaract South Asia Analytics, REST API, and Model Context Protocol (MCP) integrations.',
    alternates: {
        canonical: 'https://insights.rsamdio.org/contact',
    },
};

export default function ContactSupportPage() {
    return (
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '20px 0 60px 0' }}>
            {/* Breadcrumb Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <Link href="/" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>Dashboard</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-main)' }}>Contact & Support</span>
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
                    Help Center & Inquiries
                </div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '30px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    Contact & Support Desk
                </h1>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--text-muted)', maxWidth: '720px' }}>
                    Have questions about club records, arrears reconciliation, API endpoints, or Model Context Protocol (MCP) AI connections? Our team is here to assist.
                </p>
            </div>

            {/* Quick Contact Directory Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '22px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📬</div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        General & Support
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Central email desk for general inquiries, platform feedback, and support tickets.
                    </p>
                    <a href="mailto:info@rsamdio.org" style={{ fontSize: '13.5px', color: 'var(--primary, #0f4c81)', fontWeight: 600, textDecoration: 'none' }}>
                        info@rsamdio.org →
                    </a>
                </div>

                <div className="card" style={{ padding: '22px' }}>
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

                <div className="card" style={{ padding: '22px' }}>
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

                <div className="card" style={{ padding: '22px' }}>
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

            {/* Support Form & Guidance Container */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px', marginBottom: '36px' }}>
                {/* Form Card */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
                        Send a Support Inquiry
                    </h2>
                    <p style={{ margin: '0 0 22px 0', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Fill out the form below. Inquiries are reviewed directly by the RSAMDIO analytics desk.
                    </p>
                    <ContactSupportForm />
                </div>

                {/* Guidance & Response Times */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={{ padding: '26px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                            ⏱️ Response Time & SLA
                        </h3>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            Our volunteer analytics and technology teams typically respond within <strong>24 to 48 business hours</strong>. During regional peak reporting periods (e.g., semi-annual dues deadlines on 1 July and 1 January), response times may vary slightly.
                        </p>
                        <div style={{ fontSize: '12.5px', color: '#64748b', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            💡 <strong>Tip for Faster Resolution:</strong> Always include your 4-digit Rotary District number and 7-digit Club ID if asking about a specific club.
                        </div>
                    </div>

                    <div className="card" style={{ padding: '26px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                            🤖 AI & MCP Developer Resources
                        </h3>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            Integrating our MCP server with OpenAI ChatGPT, Claude Desktop, or Cursor? Check our interactive API reference for full request and response schemas:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

            {/* Frequently Asked Questions (FAQ) Section */}
            <div className="card" style={{ padding: '34px' }}>
                <h2 style={{ margin: '0 0 18px 0', fontSize: '21px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Frequently Asked Questions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                            Why is our club listed in arrears if payment has already been sent?
                        </h4>
                        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            Data on this platform is updated periodically based on reconciliation cycles processed by Rotary International and RISAO. If your club made a payment recently, it typically reflects in the master file during the subsequent monthly reconciliation window.
                        </p>
                    </div>

                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                            How can our club update missing or outdated officer information?
                        </h4>
                        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            Officer appointments must be formally submitted through <strong>Rotary Club Central</strong> (My Rotary) by the club president or secretary. Once reported and approved by Rotary International, the updated roster will automatically flow into our periodic data refreshes.
                        </p>
                    </div>

                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                            How do I connect the MCP tool to ChatGPT or Claude Desktop?
                        </h4>
                        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            For ChatGPT: Under Settings &gt; Plugins (or Apps) &gt; Developer mode, click <strong>Create MCP App</strong>, select <em>Server URL</em>, and enter <code>https://insights.rsamdio.org/sse</code> with <em>No authentication</em>. For Claude Desktop or Cursor: Configure <code>npm run mcp</code> using the local stdio transport as outlined in our API documentation.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                            Why is District 3291 excluded from South Asia dashboard metrics?
                        </h4>
                        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            District 3291 is currently excluded from operational South Asia statistics because its Rotaract program is temporarily suspended. Consequently, associated metrics are omitted to prevent statistical distortion, though its historical figures remain visible on the global Worldwide page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
