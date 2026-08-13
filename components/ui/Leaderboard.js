'use client';
import { motion } from 'framer-motion';

export default function Leaderboard({ title, description, data, isNegative = false, maxItems = 5 }) {
    const displayData = data.slice(0, maxItems);

    return (
        <motion.div 
            className="card"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}
            whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
        >
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                {title}
            </h3>
            {description && (
                <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {description}
                </p>
            )}
            
            {displayData.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No data available
                </div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {displayData.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                <span style={{ 
                                    flexShrink: 0,
                                    width: '24px', height: '24px', 
                                    borderRadius: '50%', 
                                    background: isNegative ? '#fee2e2' : '#e6f0fa', 
                                    color: isNegative ? 'var(--danger)' : 'var(--primary)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontSize: '12px', fontWeight: 'bold' 
                                }}>
                                    {idx + 1}
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'normal', lineHeight: '1.4' }} title={item.label}>
                                    {item.label}
                                </span>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: isNegative ? 'var(--danger)' : 'var(--success)', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
                                {item.value}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}
