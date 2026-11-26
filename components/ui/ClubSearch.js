'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

function normalizeClubResult(club) {
    const id = String(club.id || club.clubId || club['Club ID'] || '').trim();
    const name = club.name || club.clubName || club['Club Name'] || club['Rotaract Club Name'] || 'Unknown Club';
    const district = String(club.district || club.District || '').replace(/^District\s+/i, '');
    return { id, name, district };
}

export default function ClubSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapRef = useRef(null);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        const onDocClick = (event) => {
            if (!wrapRef.current?.contains(event.target)) {
                setOpen(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    useEffect(() => {
        const trimmed = query.trim();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (abortRef.current) abortRef.current.abort();

        if (trimmed.length < 2) {
            setResults([]);
            setLoading(false);
            setOpen(false);
            setActiveIndex(-1);
            return undefined;
        }

        debounceRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;
            setLoading(true);
            try {
                const res = await fetch(`/api/v1/clubs?q=${encodeURIComponent(trimmed)}&limit=8`, {
                    signal: controller.signal
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const rows = Array.isArray(json.clubs)
                    ? json.clubs
                    : (Array.isArray(json.data) ? json.data : []);
                const mapped = rows.map(normalizeClubResult).filter(c => c.id);
                setResults(mapped);
                setOpen(true);
                setActiveIndex(mapped.length > 0 ? 0 : -1);
            } catch (err) {
                if (err.name === 'AbortError') return;
                setResults([]);
                setOpen(false);
                setActiveIndex(-1);
            } finally {
                setLoading(false);
            }
        }, 220);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    const goToClub = (club) => {
        if (!club?.id) return;
        setQuery('');
        setResults([]);
        setOpen(false);
        setActiveIndex(-1);
        document.documentElement.setAttribute('data-loading', 'true');
        if (typeof window !== 'undefined' && window.triggerNavigationProgress) {
            window.triggerNavigationProgress();
        }
        router.push(`/club/${club.id}`);
    };

    const onKeyDown = (event) => {
        if (!open || results.length === 0) {
            if (event.key === 'Escape') setOpen(false);
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((idx) => (idx + 1) % results.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((idx) => (idx <= 0 ? results.length - 1 : idx - 1));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const target = results[activeIndex] || results[0];
            goToClub(target);
        } else if (event.key === 'Escape') {
            setOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div className="club-search" ref={wrapRef}>
            <label className="visually-hidden" htmlFor="header-club-search">Search clubs</label>
            <input
                id="header-club-search"
                type="search"
                className="club-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    if (results.length > 0) setOpen(true);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search club name or ID"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls="header-club-search-results"
            />
            {open && (
                <ul id="header-club-search-results" className="club-search-results" role="listbox">
                    {loading && results.length === 0 && (
                        <li className="club-search-empty">Searching...</li>
                    )}
                    {!loading && results.length === 0 && (
                        <li className="club-search-empty">No matching clubs</li>
                    )}
                    {results.map((club, idx) => (
                        <li key={club.id} role="option" aria-selected={idx === activeIndex}>
                            <button
                                type="button"
                                className={`club-search-option${idx === activeIndex ? ' is-active' : ''}`}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => goToClub(club)}
                            >
                                <span className="club-search-option-name">{club.name}</span>
                                <span className="club-search-option-meta">
                                    ID {club.id}{club.district ? ` · D-${club.district}` : ''}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
