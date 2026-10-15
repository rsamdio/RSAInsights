import { NextResponse } from 'next/server';
import { getInteractAnalytics } from '@/lib/services/analyticsService';
import { withApiTelemetry } from '@/lib/telemetry/axiom';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

/**
 * GET /api/v1/interact
 *
 * Returns Interact analytics across South Asia (Zones 4-7):
 * - Live totals from dashboard summary (read response overview fields)
 * - District-level and zone-level growth trends
 * - Rotaract-sponsored Interact clubs when present
 *
 * Query params:
 *   district, zone, country, base
 */
export const GET = withApiTelemetry(async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const country = searchParams.get('country') || '';
        const base = searchParams.get('base') || '';

        const result = await getInteractAnalytics({ district, zone, country, base });
        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/interact error:', error);
        return NextResponse.json({ error: 'Failed to retrieve Interact analytics' }, { status: 500 });
    }
}, { route: '/api/v1/interact' });
