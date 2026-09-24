import { NextResponse } from 'next/server';
import { searchClubs } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || searchParams.get('query') || '';
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const base = searchParams.get('base') || '';
        const country = searchParams.get('country') || '';
        const status = searchParams.get('status') || '';
        const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by') || '';
        const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order') || '';
        const minMembers = searchParams.get('minMembers') || searchParams.get('min_members') || undefined;
        const maxMembers = searchParams.get('maxMembers') || searchParams.get('max_members') || undefined;
        const minOutstanding = searchParams.get('minOutstanding') || searchParams.get('min_outstanding') || undefined;

        const isArrearsParam = searchParams.get('isArrears') ?? searchParams.get('is_arrears');
        const isAtRiskParam = searchParams.get('isAtRisk') ?? searchParams.get('is_at_risk');
        const isNoOfficersParam = searchParams.get('isNoOfficers') ?? searchParams.get('is_no_officers');
        const isNewClubParam = searchParams.get('isNewClub') ?? searchParams.get('is_new_club');
        const sponsorsInteractParam = searchParams.get('sponsorsInteract') ?? searchParams.get('sponsors_interact');
        const limit = searchParams.get('limit') || 25;
        const offset = searchParams.get('offset') || 0;

        const isArrears = isArrearsParam !== null ? isArrearsParam === 'true' : undefined;
        const isAtRisk = isAtRiskParam !== null ? isAtRiskParam === 'true' : undefined;
        const isNoOfficers = isNoOfficersParam !== null ? isNoOfficersParam === 'true' : undefined;
        const isNewClub = isNewClubParam !== null ? isNewClubParam === 'true' : undefined;
        const sponsorsInteract = sponsorsInteractParam !== null ? sponsorsInteractParam === 'true' : undefined;

        const result = await searchClubs({
            q,
            district,
            zone,
            base,
            country,
            status,
            sortBy,
            sortOrder,
            minMembers,
            maxMembers,
            minOutstanding,
            isArrears,
            isAtRisk,
            isNoOfficers,
            isNewClub,
            sponsorsInteract,
            limit,
            offset
        });

        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/clubs error:', error);
        return NextResponse.json({ error: 'Failed to search clubs' }, { status: 500 });
    }
}
