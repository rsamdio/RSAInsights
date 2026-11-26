'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/', label: 'Home', match: (path) => path === '/' },
    { href: '/worldwide', label: 'Worldwide', match: (path) => path.startsWith('/worldwide') },
    { href: '/docs', label: 'Docs', match: (path) => path.startsWith('/docs') }
];

export default function HeaderNav() {
    const pathname = usePathname() || '/';

    return (
        <nav className="header-nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
                const active = item.match(pathname);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`header-nav-link${active ? ' is-active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
