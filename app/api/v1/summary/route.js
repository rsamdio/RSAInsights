import { NextResponse } from 'next/server';
import { getSummary } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const zone = searchParams.get('zone');

        const summary = await getSummary(zone);
        if (!summary) {
            return NextResponse.json({ error: 'Summary data not found' }, { status: 404, headers: CACHE_HEADERS });
        }

        return NextResponse.json(summary, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/summary error:', error);
        return NextResponse.json({ error: 'Failed to retrieve summary metrics' }, { status: 500 });
    }
}
