import { NextResponse } from 'next/server';
import { getDistricts } from '@/lib/services/analyticsService';
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
        const zone = searchParams.get('zone');
        const country = searchParams.get('country') || '';
        const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by') || 'district';
        const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order') || 'asc';

        const districts = await getDistricts(zone, sortBy, sortOrder, country);
        return NextResponse.json({
            count: districts.length,
            total: districts.length,
            districts
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/districts error:', error);
        return NextResponse.json({ error: 'Failed to retrieve districts' }, { status: 500 });
    }
}, { route: '/api/v1/districts' });
