import { NextResponse } from 'next/server';
import { getTRFList } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const limit = searchParams.get('limit') || 25;
        const offset = searchParams.get('offset') || 0;

        const result = await getTRFList({
            district,
            zone,
            limit,
            offset
        });

        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/trf error:', error);
        return NextResponse.json({ error: 'Failed to retrieve TRF contributions' }, { status: 500 });
    }
}
