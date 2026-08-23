'use client';
import { useState, useEffect } from 'react';

export default function Tabs({ tabs }) {
    const [activeTab, setActiveTab] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleTabClick = (index, e) => {
        // Determine direction before updating state
        const isMovingForward = index > activeTab;
        const scrollAlignment = isMovingForward ? 'start' : 'end';
        
        // Add 1-frame delay to let browser paint the tab selection before mounting heavy tables
        setIsTransitioning(true);
        setActiveTab(index);
        
        requestAnimationFrame(() => {
            setIsTransitioning(false);
        });
        
        // Auto-scroll the clicked tab based on direction
        if (e.target) {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: scrollAlignment });
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <div 
                style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginBottom: '20px', 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '10px', 
                    overflowX: 'auto',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                }}
            >
                <style>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={(e) => handleTabClick(index, e)}
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
                            whiteSpace: 'nowrap',
                            flexShrink: 0 // Prevent buttons from squishing
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {isTransitioning ? (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite' }}></div>
                        <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite', animationDelay: '0.1s' }}></div>
                        <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite', animationDelay: '0.2s' }}></div>
                        <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite', animationDelay: '0.3s' }}></div>
                    </div>
                ) : (
                    typeof tabs[activeTab]?.content === 'function' ? tabs[activeTab].content() : tabs[activeTab]?.content
                )}
            </div>
        </div>
    );
}
