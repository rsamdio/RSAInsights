'use client';
import { useState } from 'react';

export default function Tabs({ tabs }) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === index ? 'var(--primary)' : 'transparent',
                            color: activeTab === index ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {tabs[activeTab].content}
            </div>
        </div>
    );
}
