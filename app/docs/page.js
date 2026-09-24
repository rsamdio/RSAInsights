import Link from 'next/link';

export const metadata = {
    title: 'API Reference & Open Data | Rotaract South Asia Analytics',
    description: 'Interactive REST API documentation and OpenAPI 3.1 specification for Rotaract South Asia Analytics data.',
};

export default function DocsPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                        Rotaract South Asia Analytics REST API
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', maxWidth: '750px', lineHeight: '1.5' }}>
                        Open, high-performance REST endpoints serving verified data for Rotaract Zones 4, 5, 6, and 7.
                        All endpoints are unauthenticated, read-only, and provide standard JSON payloads with CORS enabled.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a
                        href="/openapi.json"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>Download OpenAPI JSON</span>
                    </a>
                    <a
                        href="/docs.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'var(--primary, #0284c7)',
                            border: '1px solid transparent',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#ffffff',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>Open Full Screen ↗</span>
                    </a>
                </div>
            </div>

            <div style={{
                width: '100%',
                height: '800px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                background: '#0f172a'
            }}>
                <iframe
                    src="/docs.html"
                    title="API Reference Documentation"
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block'
                    }}
                />
            </div>
        </div>
    );
}
