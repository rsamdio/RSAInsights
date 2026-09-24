import { NextResponse } from 'next/server';
import { getDistrictDetails } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request, { params }) {
    try {
        const { districtId } = await params;
        const districtDetails = await getDistrictDetails(districtId);

        if (!districtDetails) {
            return NextResponse.json({
                error: `District '${districtId}' not found.`
            }, { status: 404, headers: CACHE_HEADERS });
        }

        return NextResponse.json(districtDetails, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/districts/[districtId] error:', error);
        return NextResponse.json({ error: 'Failed to retrieve district details' }, { status: 500 });
    }
}
