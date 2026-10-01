import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | Rotaract Insights',
    description: 'Privacy Policy for Rotaract Insights, the South Asia Analytics Dashboard, public REST API, and Model Context Protocol (MCP) server for ChatGPT and AI platforms.',
    alternates: {
        canonical: 'https://insights.rsamdio.org/privacy',
    },
};

export default function PrivacyPolicyPage() {
    const lastUpdated = 'October 2026';

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
                    Data Governance, Trust & Compliance
                </div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '30px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    Rotaract Insights Privacy Policy
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
                        Rotaract South Asia Multi-District Information Organisation (RSAMDIO) operates <strong>Rotaract Insights</strong>, encompassing the analytical web dashboard (<code>insights.rsamdio.org</code>), the public REST API (<code>/api/v1/*</code>), and the Model Context Protocol (MCP) server for OpenAI ChatGPT, Codex, and AI assistants.
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                        This Privacy Policy describes how information is collected, processed, retained, and safeguarded when you access our dashboard, download public datasets, query our REST APIs, or interact with the Rotaract Insights plugin through ChatGPT or agentic workflows.
                    </p>
                </div>

                {/* 2. Categories of Personal Data Collected */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        2. Categories of Personal Data Collected
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        We adhere strictly to the principle of <strong>data minimization</strong>. The categories of data handled differ depending on how you interface with our services:
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li>
                            <strong>ChatGPT Plugin and MCP Server:</strong> Zero end-user personal data is collected. The plugin accepts strictly analytical filter parameters (such as district numbers, club names, zone identifiers, or country names) necessary to fulfill your informational query. We do not require, request, or collect user account details, email addresses, names, or passwords.
                        </li>
                        <li>
                            <strong>Prohibition of Restricted Data:</strong> We do not collect, solicit, or process any Restricted Data as defined by platform safety policies, including:
                            <ul style={{ marginTop: '6px' }}>
                                <li>Payment Card Information (PCI DSS) or banking credentials.</li>
                                <li>Protected Health Information (PHI).</li>
                                <li>Government-issued identifiers (such as Social Security numbers, Aadhaar, or passport numbers).</li>
                                <li>User account passwords, API keys, or multi-factor authentication tokens.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>No Sensitive Personal Data:</strong> We do not collect or process special categories of sensitive personal data (such as biometric data, health records, religious beliefs, or political opinions).
                        </li>
                        <li>
                            <strong>Web Portal Telemetry:</strong> For visitors accessing the web dashboard, anonymous telemetry (aggregate page views, browser type, referring domain, and anonymized IP addresses) is gathered via Google Analytics to assess platform performance.
                        </li>
                    </ul>
                </div>

                {/* 3. Purposes of Use */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        3. Purposes of Use
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        Any technical or query data received is used solely for the following legitimate purposes:
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Fulfilling User Queries:</strong> Executing read-only analytical computations, searches, and leaderboard rankings requested interactively by the user.</li>
                        <li><strong>Platform Maintenance & Security:</strong> Monitoring service availability, preventing denial-of-service (DDoS) attacks, enforcing rate limits, and debugging server errors.</li>
                        <li><strong>Aggregate Reporting:</strong> Gauging aggregate community interest across regional zones and districts to optimize server caching and dataset updates.</li>
                    </ul>
                    <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)', background: 'var(--bg-gradient, #f8f9fa)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--primary, #0f4c81)' }}>
                        <strong>Zero Commercial Exploitation:</strong> We never monetize, sell, license, or reuse user queries or analytics data for advertising, commercial marketing, or automated profiling.
                    </p>
                </div>

                {/* 4. Categories of Recipients and Third Parties */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        4. Categories of Recipients and Third-Party Sharing
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        We do not sell, rent, trade, or transfer any user data to third parties. Information is only processed through essential, trusted infrastructure partners necessary to deliver the service:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Cloudflare:</strong> Edge network proxy providing SSL/TLS termination, DDoS mitigation, and content delivery caching.</li>
                        <li><strong>Netlify:</strong> Cloud hosting infrastructure that hosts the Next.js application runtime and API serverless functions.</li>
                        <li><strong>OpenAI Platform:</strong> When you invoke the Rotaract Insights plugin via ChatGPT or Codex, communication between OpenAI and our MCP server is governed by OpenAI's terms and privacy policies. No external third parties receive your queries.</li>
                        <li><strong>Google Analytics:</strong> Provides aggregate, anonymized website traffic statistics for the browser interface (subject to Google's standard privacy safeguards with IP anonymization enabled).</li>
                    </ul>
                </div>

                {/* 5. Data Retention Timelines */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        5. Data Retention Timelines
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        We enforce strict data expiration and retention schedules:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li>
                            <strong>Plugin and MCP Query Data (Zero Retention):</strong> Query parameters sent to the MCP server are processed entirely in-memory and discarded immediately upon generation of the response. We do not persist, log, or store chat messages, prompt texts, or query histories to any database or permanent storage.
                        </li>
                        <li>
                            <strong>Server Operational Access Logs (14-30 Days):</strong> Standard HTTP access logs (containing anonymized IP addresses, endpoint paths, response codes, and timestamps) are kept in secure, access-controlled infrastructure for diagnostic and security auditing for a maximum rolling window of 14 to 30 days, after which they are automatically purged.
                        </li>
                        <li>
                            <strong>Web Analytics Data (14 Months):</strong> Anonymized Google Analytics traffic metrics are retained for 14 months under standard Google Analytics data retention policies, with IP masking enabled.
                        </li>
                    </ul>
                </div>

                {/* 6. User Controls and Rights */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        6. User Controls and Privacy Rights
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        You retain full control over how you interact with Rotaract Insights:
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Plugin Control:</strong> You can install, enable, disable, or remove the Rotaract Insights plugin at any time directly through the OpenAI ChatGPT Plugin and App settings.</li>
                        <li><strong>Cookie & Telemetry Opt-Out:</strong> You can block cookies or disable JavaScript tracking in your browser or through privacy extensions (such as uBlock Origin or Privacy Badger) without losing access to the web dashboard.</li>
                        <li><strong>Accountless Access:</strong> Because our services require no registration or user accounts, there are no personal user profiles, tracking histories, or stored credentials associated with your identity.</li>
                        <li><strong>Data Protection Inquiries:</strong> Under applicable data protection regulations (such as GDPR, CCPA, and the Digital Personal Data Protection Act), you have the right to inquire about our data practices or request information by contacting our privacy team.</li>
                    </ul>
                </div>

                {/* 7. Public Institutional Data Displayed */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        7. Nature of Public Institutional Records Displayed
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        The data published by Rotaract Insights consists of institutional, non-confidential public service records relating to Rotaract and Rotary clubs across South Asia (RI Zones 4, 5, 6, and 7):
                    </p>
                    <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>Club Rosters:</strong> Official club names, charter IDs, district alignments, community or university classifications, and sponsoring Rotary clubs.</li>
                        <li><strong>Leadership Directories:</strong> Official public contact designations for District Governors (DG), District Rotaract Representatives (DRR), and District Rotaract Committee Chairs (DRCC).</li>
                        <li><strong>Compliance Indicators:</strong> Aggregate membership headcounts, semi-annual dues arrears balances, and officer reporting status as compiled by Rotary International.</li>
                        <li><strong>The Rotary Foundation (TRF):</strong> Voluntary club-level giving records to the Annual Fund and PolioPlus.</li>
                    </ul>
                    <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-muted)', background: 'var(--bg-gradient, #f8f9fa)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--primary, #0f4c81)' }}>
                        <strong>Notice:</strong> Individual Rotaract member personal data (such as personal phone numbers, home addresses, government identification, or personal emails) is never collected, processed, or displayed.
                    </p>
                </div>

                {/* 8. Data Security and Infrastructure */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        8. Data Security and Infrastructure Safeguards
                    </h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                        All communications with <code>insights.rsamdio.org</code> are secured using modern technical standards:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        <li><strong>TLS 1.3 Encryption:</strong> All web, API, and SSE streams require modern TLS encryption in transit.</li>
                        <li><strong>Read-Only Architecture:</strong> All MCP tools and public endpoints are strictly read-only (<code>readOnlyHint: true</code>, <code>x-openai-isConsequential: false</code>). No user queries can modify master records.</li>
                        <li><strong>Edge CDN Protection:</strong> Distributed edge security with DDoS mitigation, automatic threat blocking, and strict Content Security Policies.</li>
                    </ul>
                </div>

                {/* 9. Contact Information */}
                <div className="card" style={{ padding: '30px' }}>
                    <h2 style={{ margin: '0 0 14px 0', fontSize: '19px', fontWeight: 700, color: 'var(--text-main)' }}>
                        9. Contact Information and Privacy Inquiries
                    </h2>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                        If you have questions, feedback, or compliance inquiries regarding this Privacy Policy or our analytical tools, please contact our team:
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
                            Contact Desk →
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
