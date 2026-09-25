import { NextResponse } from 'next/server';
import { getClubProfile } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Access-Control-Allow-Origin': '*',
};

/**
 * GET /api/v1/clubs/[clubId]/interact
 *
 * REST sub-resource returning the Interact clubs directly sponsored by this Rotaract club.
 */
export async function GET(request, { params }) {
    try {
        const { clubId } = await params;
        const profile = await getClubProfile(clubId);

        if (!profile) {
            return NextResponse.json({
                error: `Club with ID '${clubId}' not found.`
            }, { status: 404, headers: CACHE_HEADERS });
        }

        const interactClubs = profile.sponsoredInteractClubs || [];

        return NextResponse.json({
            clubId: profile.id,
            clubName: profile.name,
            district: profile.district,
            zone: profile.zone,
            sponsoredInteractCount: interactClubs.length,
            sponsoredInteractClubs: interactClubs
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/clubs/[clubId]/interact error:', error);
        return NextResponse.json({ error: 'Failed to retrieve club Interact sponsorships' }, { status: 500 });
    }
}
