'use client';

import { useEffect, useState } from 'react';

/**
 * Sticky in-page jump links with active section highlighting.
 * @param {{ items: Array<{ id: string, label: string }> }} props
 */
export default function SectionJumpBar({ items = [] }) {
    const [activeId, setActiveId] = useState(items[0]?.id || '');

    useEffect(() => {
        if (!items.length || typeof window === 'undefined') return undefined;

        const headerOffset = 120;
        const elements = items
            .map((item) => document.getElementById(item.id))
            .filter(Boolean);

        if (!elements.length) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) {
                    setActiveId(visible[0].target.id);
                }
            },
            {
                rootMargin: `-${headerOffset}px 0px -55% 0px`,
                threshold: [0.1, 0.25, 0.5]
            }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [items]);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const headerOffset = 110;
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
        setActiveId(id);
        if (typeof history !== 'undefined' && history.replaceState) {
            history.replaceState(null, '', `#${id}`);
        }
    };

    if (!items.length) return null;

    return (
        <nav className="section-jump-bar" aria-label="Page sections">
            <div className="section-jump-bar-inner">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`section-jump-link${activeId === item.id ? ' is-active' : ''}`}
                        onClick={() => scrollTo(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
