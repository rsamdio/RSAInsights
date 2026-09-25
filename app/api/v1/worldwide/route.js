import { NextResponse } from 'next/server';
import { getWorldwideStats } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const country = searchParams.get('country') || '';
        const zone = searchParams.get('zone') || '';
        const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by') || '';
        const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order') || 'desc';
        const minMembers = searchParams.get('minMembers') || searchParams.get('min_members') || undefined;
        const limit = searchParams.get('limit') || undefined;

        const stats = await getWorldwideStats({
            type,
            country,
            zone,
            sortBy,
            sortOrder,
            minMembers,
            limit
        });

        if (!stats) {
            return NextResponse.json({ error: 'Worldwide statistics not found' }, { status: 404, headers: CACHE_HEADERS });
        }

        return NextResponse.json(stats, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/worldwide error:', error);
        return NextResponse.json({ error: 'Failed to retrieve worldwide statistics' }, { status: 500 });
    }
}
