import Link from 'next/link';

export const metadata = {
    title: '404 - Page Not Found | Rotaract South Asia Analytics',
    description: 'The requested page could not be found on the Rotaract South Asia Analytics Dashboard.'
};

export default function NotFound() {
    return (
        <div style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '50px 30px', width: '100%' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📍</div>
                <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', color: 'var(--text-main)', fontWeight: 800 }}>Page Not Found</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '480px', margin: '0 auto 30px auto' }}>
                    The page or resource you are looking for does not exist or may have been moved.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link 
                        href="/" 
                        style={{ background: 'var(--primary)', color: '#fff', padding: '10px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
                    >
                        ← Back to Dashboard
                    </Link>
                    <Link 
                        href="/worldwide" 
                        style={{ background: '#f1f5f9', color: 'var(--text-main)', padding: '10px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
                    >
                        Worldwide Leaderboards
                    </Link>
                    <Link 
                        href="/docs" 
                        style={{ background: '#f1f5f9', color: 'var(--text-main)', padding: '10px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
                    >
                        API Docs
                    </Link>
                </div>
            </div>
        </div>
    );
}
