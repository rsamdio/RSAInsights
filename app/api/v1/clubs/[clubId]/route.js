import { NextResponse } from 'next/server';
import { getClubProfile } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request, { params }) {
    try {
        const { clubId } = await params;
        const profile = await getClubProfile(clubId);

        if (!profile) {
            return NextResponse.json({
                error: `Club with ID '${clubId}' not found.`
            }, { status: 404, headers: CACHE_HEADERS });
        }

        return NextResponse.json(profile, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/clubs/[clubId] error:', error);
        return NextResponse.json({ error: 'Failed to retrieve club profile' }, { status: 500 });
    }
}
