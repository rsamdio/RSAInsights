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
                <div className={`trend ${trend.type}`}>
                    {trend.text}
                </div>
            )}
        </motion.div>
    );
}
