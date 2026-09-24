import { NextResponse } from 'next/server';
import { getRotaryOpportunityList } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || searchParams.get('opportunity_type') || searchParams.get('opportunityType') || 'no_rotaract';
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const limit = searchParams.get('limit') || 25;
        const offset = searchParams.get('offset') || 0;

        const result = await getRotaryOpportunityList({
            type,
            district,
            zone,
            limit,
            offset
        });

        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/opportunities/rotary error:', error);
        return NextResponse.json({ error: 'Failed to retrieve rotary opportunities' }, { status: 500 });
    }
}
