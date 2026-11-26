'use client';

import { useEffect, useRef, useState } from 'react';

export default function Tabs({ tabs, initialTabKey = null, onTabChange = null }) {
    const resolveIndex = (key) => {
        if (!key) return 0;
        const idx = tabs.findIndex((tab) => tab.id === key || tab.key === key);
        return idx >= 0 ? idx : 0;
    };

    const [activeTab, setActiveTab] = useState(() => resolveIndex(initialTabKey));
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const stripRef = useRef(null);

    useEffect(() => {
        setActiveTab(resolveIndex(initialTabKey));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTabKey, tabs.length]);

    const updateOverflow = () => {
        const el = stripRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
    };

    useEffect(() => {
        const el = stripRef.current;
        if (!el) return undefined;
        updateOverflow();
        el.addEventListener('scroll', updateOverflow, { passive: true });
        window.addEventListener('resize', updateOverflow);
        return () => {
            el.removeEventListener('scroll', updateOverflow);
            window.removeEventListener('resize', updateOverflow);
        };
    }, [tabs.length]);

    const handleTabClick = (index, e) => {
        const isMovingForward = index > activeTab;
        const scrollAlignment = isMovingForward ? 'start' : 'end';

        setIsTransitioning(true);
        setActiveTab(index);
        if (typeof onTabChange === 'function') {
            onTabChange(tabs[index]?.id || tabs[index]?.key || null, index);
        }

        requestAnimationFrame(() => {
            setIsTransitioning(false);
            updateOverflow();
        });

        if (e.target) {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: scrollAlignment });
        }
    };

    const scrollStrip = (direction) => {
        const el = stripRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * Math.max(160, el.clientWidth * 0.6), behavior: 'smooth' });
    };

    return (
        <div style={{ width: '100%' }}>
            <div className="tabs-strip-wrap">
                {canScrollLeft && (
                    <button
                        type="button"
                        className="tabs-chevron tabs-chevron-left"
                        aria-label="Scroll tabs left"
                        onClick={() => scrollStrip(-1)}
                    >
                        ‹
                    </button>
                )}
                <div
                    ref={stripRef}
                    className={`tabs-strip${canScrollLeft ? ' fade-left' : ''}${canScrollRight ? ' fade-right' : ''}`}
                >
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id || tab.key || index}
                            type="button"
                            onClick={(e) => handleTabClick(index, e)}
                            className={`tabs-strip-btn${activeTab === index ? ' is-active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {canScrollRight && (
                    <button
                        type="button"
                        className="tabs-chevron tabs-chevron-right"
                        aria-label="Scroll tabs right"
                        onClick={() => scrollStrip(1)}
                    >
                        ›
                    </button>
                )}
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
