export default function Leaderboard({ 
    title, 
    description, 
    data = [], 
    isNegative = false, 
    maxItems = 10,
    badge,
    scrollable = false,
    maxHeight = '480px'
}) {
    const displayData = (data || []).slice(0, maxItems);
    const isScrollable = scrollable || displayData.length > 10;

    return (
        <div 
            className="card"
            style={{ 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: 'var(--card-bg)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: description ? '4px' : '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {title}
                </h3>
                {badge && (
                    <span style={{
                        padding: '2px 8px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                    }}>
                        {badge}
                    </span>
                )}
            </div>

            {description && (
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {description}
                </p>
            )}
            
            {displayData.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
                    No data available
                </div>
            ) : (
                <div style={{
                    flex: 1,
                    maxHeight: isScrollable ? maxHeight : undefined,
                    overflowY: isScrollable ? 'auto' : 'visible',
                    paddingRight: isScrollable ? '4px' : 0
                }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {displayData.map((item, idx) => {
                            const rank = idx + 1;
                            let rankBg = isNegative ? '#fee2e2' : '#e6f0fa';
                            let rankColor = isNegative ? 'var(--danger)' : 'var(--primary)';
                            if (!isNegative) {
                                if (rank === 1) { rankBg = '#fef3c7'; rankColor = '#b45309'; }
                                else if (rank === 2) { rankBg = '#f1f5f9'; rankColor = '#475569'; }
                                else if (rank === 3) { rankBg = '#ffedd5'; rankColor = '#c2410c'; }
                            }

                            return (
                                <li 
                                    key={idx} 
                                    style={{ 
                                        position: 'relative',
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'flex-start', 
                                        gap: '12px',
                                        padding: '9px 10px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        background: '#ffffff',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {item.progressPct !== undefined && item.progressPct > 0 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                bottom: 0,
                                                left: 0,
                                                width: `${item.progressPct}%`,
                                                background: 'linear-gradient(90deg, rgba(15, 76, 129, 0.08) 0%, rgba(15, 76, 129, 0.01) 100%)',
                                                pointerEvents: 'none',
                                                borderRadius: '6px 0 0 6px',
                                                zIndex: 0
                                            }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                                        <span style={{ 
                                            flexShrink: 0,
                                            width: '24px', height: '24px', 
                                            borderRadius: '50%', 
                                            background: rankBg, 
                                            color: rankColor, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontSize: '11px', fontWeight: 'bold',
                                            marginTop: '1px'
                                        }}>
                                            {rank}
                                        </span>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ 
                                                fontSize: '13px', 
                                                fontWeight: 600, 
                                                color: 'var(--text-main)', 
                                                lineHeight: '1.35',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'normal'
                                            }} title={item.label}>
                                                {item.label}
                                            </div>
                                            {item.subLabel && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', flexWrap: 'wrap', lineHeight: '1.3' }}>
                                                    {item.subLabel}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0, position: 'relative', zIndex: 1, paddingTop: '2px' }}>
                                        <span style={{ 
                                            fontSize: '13px', 
                                            fontWeight: 700, 
                                            color: item.color || (isNegative ? 'var(--danger)' : 'var(--primary)'), 
                                            whiteSpace: 'nowrap' 
                                        }}>
                                            {item.value}
                                        </span>
                                        {item.unit && (
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                                {item.unit}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
