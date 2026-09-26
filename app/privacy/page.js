import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for the Rotaract South Asia Analytics Dashboard, REST API, and Model Context Protocol (MCP) server.',
    alternates: {
        canonical: 'https://insights.rsamdio.org/privacy',
    },
};

export default function PrivacyPolicyPage() {
    const lastUpdated = 'September 2026';

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px 0 60px 0' }}>
            {/* Breadcrumb Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <Link href="/" style={{ color: 'var(--primary, #0f4c81)', textDecoration: 'none' }}>Dashboard</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-main)' }}>Privacy Policy</span>
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
                    Data Governance & Trust
                </div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '30px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    Privacy Policy
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                    Last Updated: {lastUpdated} • Rotaract South Asia Multi-District Information Organisation (RSAMDIO)
                </p>
            </div>

            {/* Policy Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. Overview & Scope */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        1. Overview and Scope
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        Rotaract South Asia Multi-District Information Organisation (RSAMDIO) operates the <strong>Insights Analytics Dashboard</strong> (<code>insights.rsamdio.org</code>), the public REST API (<code>/api/v1/*</code>), and the Model Context Protocol (MCP) server.
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                        This Privacy Policy explains how information is handled when you browse the analytics portal, download datasets, query our public REST APIs, or interface with our analytical AI tools through platforms such as ChatGPT, Claude Desktop, Cursor, or custom agentic workflows.
                    </p>
                </div>

                {/* 2. Public Organizational Data */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        2. Nature of Data Displayed
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        The data published on this platform comprises public institutional records relating to Rotaract and Rotary clubs, districts, and zones across South Asia (RI Zones 4, 5, 6, and 7):
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Club Rosters:</strong> Club names, charter numbers, district alignments, community or university classifications, and sponsor Rotary clubs.</li>
                        <li><strong>Leadership Directories:</strong> Official public contact designations for District Governors (DG), District Rotaract Representatives (DRR), and District Rotaract Committee Chairs (DRCC).</li>
                        <li><strong>Compliance Indicators:</strong> Aggregate membership numbers, financial arrears status, and annual officer reporting status as compiled by Rotary International and RISAO.</li>
                        <li><strong>The Rotary Foundation (TRF):</strong> Club-level voluntary contribution figures designated to the Annual Fund, PolioPlus, and other Rotary initiatives.</li>
                    </ul>
                    <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)', background: 'var(--bg-gradient, #f8f9fa)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--primary, #0f4c81)' }}>
                        <strong>Note:</strong> We do not publish sensitive private personal data such as member phone numbers, personal home addresses, credit card details, or national identity identifiers.
                    </p>
                </div>

                {/* 3. Accountless Architecture */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        3. Zero Account Collection
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        RSAMDIO Insights is an open community analytics platform:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>No User Accounts:</strong> You are not required to create an account, register an email address, or provide passwords to use the web application or the public API.</li>
                        <li><strong>No Financial Transactions:</strong> No billing, payment processing, or subscription credentials are ever requested or collected on this domain.</li>
                        <li><strong>Open Access:</strong> All REST endpoints and MCP tools are publicly accessible without authentication keys.</li>
                    </ul>
                </div>

                {/* 4. AI & MCP Processing */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        4. Model Context Protocol (MCP) and AI Integrations
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        When you connect our MCP server to AI clients (such as OpenAI ChatGPT, Anthropic Claude, or Cursor IDE):
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>In-Memory Tool Execution:</strong> Incoming analytical queries (e.g., searching for club statistics or auditing district compliance) are processed in volatile memory.</li>
                        <li><strong>No Prompt Storage:</strong> We do not log, retain, or train proprietary models on your personal prompts, user queries, or conversation histories.</li>
                        <li><strong>Ephemeral Streaming:</strong> Server-Sent Events (SSE) connections utilize transient, randomized session identifiers that expire immediately upon session termination.</li>
                    </ul>
                </div>

                {/* 5. Telemetry & Analytics */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        5. Web Analytics and Cookies
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        We use standard web telemetry to monitor platform health, usage trends, and popular dashboard drilldowns:
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Google Analytics:</strong> We use Google Analytics (gtag.js) to aggregate anonymous metrics such as page visits, browser types, country of origin, and referral domains.</li>
                        <li><strong>No Cross-Site Ad Tracking:</strong> We do not serve advertisements, use advertising trackers, or sell analytics data to third-party data brokers.</li>
                        <li><strong>Opt-Out:</strong> You may disable cookies in your web browser or use privacy extensions (such as uBlock Origin or Privacy Badger) without impacting your ability to use the dashboard.</li>
                    </ul>
                </div>

                {/* 6. Security & Infrastructure */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        6. Data Security and Infrastructure
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        All communications with <code>insights.rsamdio.org</code> are secured using industry-standard protocols:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>TLS/HTTPS Encryption:</strong> All web, API, and SSE streams require modern TLS 1.3 encryption in transit.</li>
                        <li><strong>Edge CDN Protection:</strong> Platform traffic is routed through Cloudflare and Netlify edge infrastructure with DDoS protection and strict Content Security Policies.</li>
                        <li><strong>Read-Only Repository:</strong> Public user inputs cannot modify underlying master analytical records.</li>
                    </ul>
                </div>

                {/* 7. Contact Information */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        7. Questions and Data Inquiries
                    </h2>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                        If you have questions regarding this Privacy Policy, or if you represent a district leadership team seeking clarification on published analytics, please reach out to our team:
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
                        <a href="mailto:info@rsamdio.org" style={{
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
                            Email: info@rsamdio.org
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
