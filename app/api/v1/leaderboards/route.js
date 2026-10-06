import { NextResponse } from 'next/server';
import { getLeaderboards } from '@/lib/services/analyticsService';
import { withApiTelemetry } from '@/lib/telemetry/axiom';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

export const GET = withApiTelemetry(async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'all';
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const country = searchParams.get('country') || '';
        const base = searchParams.get('base') || '';
        const scope = searchParams.get('scope') || 'south_asia';
        const limit = searchParams.get('limit') || 10;
        const offset = searchParams.get('offset') || 0;

        const result = await getLeaderboards({
            category,
            district,
            zone,
            country,
            base,
            scope,
            limit,
            offset
        });

        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/leaderboards error:', error);
        return NextResponse.json({ error: 'Failed to retrieve leaderboards' }, { status: 500 });
    }
}, { route: '/api/v1/leaderboards' });
