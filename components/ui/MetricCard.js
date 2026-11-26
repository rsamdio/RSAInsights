import Link from 'next/link';

export default function MetricCard({ title, value, trend, comparison, isWarning = false, delay = 0, href = null }) {
    const hasComparison = comparison
        && ((comparison.resolved || 0) > 0 || (comparison.terminated || 0) > 0);

    const body = (
        <>
            <h3>{title}</h3>
            <div className="value">{value}</div>
            {hasComparison ? (
                <div className="metric-comparison" aria-label="Resolution vs July baseline">
                    <span className="metric-comparison-arrow">↓</span>
                    <span className="metric-comparison-resolved">
                        {(comparison.resolved || 0).toLocaleString()} resolved
                    </span>
                    <span className="metric-comparison-sep">,</span>
                    <span className="metric-comparison-terminated">
                        {(comparison.terminated || 0).toLocaleString()} terminated
                    </span>
                    <span className="metric-comparison-baseline">
                        {' '}{comparison.baseline || 'vs July'}
                    </span>
                </div>
            ) : trend ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                    <div className={`trend ${trend.type}`} style={{ marginTop: 0 }}>
                        {trend.text}
                    </div>
                    {trend.baseline && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{trend.baseline}</span>}
                </div>
            ) : null}
            {href ? (
                <div className="metric-card-link-hint">View table →</div>
            ) : null}
        </>
    );

    const className = `card metric-card ${isWarning ? 'warning-card' : ''}${href ? ' metric-card-link' : ''}`;
    const style = delay > 0 ? { animationDelay: `${delay}s` } : undefined;

    if (href) {
        return (
            <Link href={href} className={className} style={style}>
                {body}
            </Link>
        );
    }

    return (
        <div className={className} style={style}>
            {body}
        </div>
    );
}
