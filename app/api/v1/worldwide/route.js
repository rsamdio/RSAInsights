import { NextResponse } from 'next/server';
import { getWorldwideStats } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET() {
    try {
        const stats = await getWorldwideStats();
        if (!stats) {
            return NextResponse.json({ error: 'Worldwide statistics not found' }, { status: 404, headers: CACHE_HEADERS });
        }

        return NextResponse.json(stats, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/worldwide error:', error);
        return NextResponse.json({ error: 'Failed to retrieve worldwide statistics' }, { status: 500 });
    }
}
