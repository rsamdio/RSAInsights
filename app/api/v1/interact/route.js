import { NextResponse } from 'next/server';
import { getInteractAnalytics } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

/**
 * GET /api/v1/interact
 *
 * Returns Interact analytics across South Asia:
 * - 8,921 total Interact clubs
 * - 735 suspended Interact clubs
 * - 137 Interact clubs sponsored directly by 65 Rotaract clubs
 * - District-level and zone-level growth trends
 *
 * Query params:
 *   district, zone
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';

        const result = await getInteractAnalytics({ district, zone });
        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/interact error:', error);
        return NextResponse.json({ error: 'Failed to retrieve Interact analytics' }, { status: 500 });
    }
}
