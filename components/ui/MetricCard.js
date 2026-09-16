export default function MetricCard({ title, value, trend, isWarning = false, delay = 0 }) {
    return (
        <div 
            className={`card metric-card ${isWarning ? 'warning-card' : ''}`}
            style={delay > 0 ? { animationDelay: `${delay}s` } : undefined}
        >
            <h3>{title}</h3>
            <div className="value">{value}</div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                    <div className={`trend ${trend.type}`} style={{ marginTop: 0 }}>
                        {trend.text}
                    </div>
                    {trend.baseline && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{trend.baseline}</span>}
                </div>
            )}
        </div>
    );
}

