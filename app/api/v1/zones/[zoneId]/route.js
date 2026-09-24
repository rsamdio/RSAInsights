import { NextResponse } from 'next/server';
import { getZoneDetails } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request, { params }) {
    try {
        const { zoneId } = await params;
        const zoneDetails = await getZoneDetails(zoneId);

        if (!zoneDetails) {
            return NextResponse.json({
                error: `Zone '${zoneId}' not found. Supported zones are 4, 5, 6, 7.`
            }, { status: 404, headers: CACHE_HEADERS });
        }

        return NextResponse.json(zoneDetails, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/zones/[zoneId] error:', error);
        return NextResponse.json({ error: 'Failed to retrieve zone details' }, { status: 500 });
    }
}
