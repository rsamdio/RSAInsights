import { NextResponse } from 'next/server';
import { getZones } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET() {
    try {
        const zones = await getZones();
        return NextResponse.json({
            count: zones.length,
            zones
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/zones error:', error);
        return NextResponse.json({ error: 'Failed to retrieve zones' }, { status: 500 });
    }
}
