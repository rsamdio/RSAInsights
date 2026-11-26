import Link from 'next/link';

/**
 * @param {{ items: Array<{ label: string, href?: string }> }} props
 */
export default function Breadcrumbs({ items = [] }) {
    if (!items.length) return null;

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumbs-list">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    return (
                        <li key={`${item.label}-${idx}`} className="breadcrumbs-item">
                            {idx > 0 && <span className="breadcrumbs-sep" aria-hidden="true">›</span>}
                            {item.href && !isLast ? (
                                <Link href={item.href} className="breadcrumbs-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="breadcrumbs-current" aria-current={isLast ? 'page' : undefined}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
