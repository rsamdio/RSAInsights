export default function Loading() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '20px' }}>
            {/* Top Metrics Skeleton */}
            <div className="metrics-grid">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="card skeleton-pulse" style={{ height: '120px', border: 'none' }}></div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="charts-grid">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="card skeleton-pulse" style={{ height: '350px', border: 'none' }}></div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="card skeleton-pulse" style={{ height: '500px', border: 'none', marginTop: '20px' }}></div>
        </div>
    );
}
