'use client';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    
    useEffect(() => {
        // Clear navigation state when pathname or searchParams change (navigation complete)
        setIsNavigating(false);
        // Also ensure data-loading attribute is removed in case HeaderFilters set it
        document.documentElement.removeAttribute('data-loading');
        
        const handleAnchorClick = (e) => {
            const target = e.currentTarget;
            
            // Only trigger on local links that change the URL
            if (
                target.href &&
                target.href.startsWith(window.location.origin) &&
                target.target !== '_blank' &&
                !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey &&
                // Don't trigger if it's the exact same URL (including hash/search)
                target.href !== window.location.href
            ) {
                setIsNavigating(true);
            }
        };

        const anchors = document.querySelectorAll('a[href]');
        anchors.forEach(a => a.addEventListener('click', handleAnchorClick));
        
        return () => {
            anchors.forEach(a => a.removeEventListener('click', handleAnchorClick));
        };
    }, [pathname, searchParams]);

    // Expose a global method so HeaderFilters can trigger it programmatically
    useEffect(() => {
        window.triggerNavigationProgress = () => setIsNavigating(true);
        return () => { delete window.triggerNavigationProgress; };
    }, []);

    if (!isNavigating) return null;

    return (
        <div className="nav-progress-container">
            <div className="nav-progress-bar"></div>
        </div>
    );
}
