'use client';
import { motion } from 'framer-motion';

export default function MetricCard({ title, value, trend, isWarning = false }) {
    return (
        <motion.div 
            className={`card metric-card ${isWarning ? 'warning-card' : ''}`}
            whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.08)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
        </motion.div>
    );
}
