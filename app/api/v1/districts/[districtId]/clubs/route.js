import { NextResponse } from 'next/server';
import { searchClubs, normalizeDistrictId } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

/**
 * GET /api/v1/districts/[districtId]/clubs
 *
 * REST sub-resource listing all Rotaract clubs belonging to a specific district.
 * Supports standard filtering, sorting, and pagination.
 */
export async function GET(request, { params }) {
    try {
        const { districtId } = await params;
        const normalizedDistrict = normalizeDistrictId(districtId);

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || searchParams.get('query') || '';
        const base = searchParams.get('base') || '';
        const status = searchParams.get('status') || '';
        const country = searchParams.get('country') || '';
        const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by') || 'name';
        const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order') || 'asc';
        const minMembers = searchParams.get('minMembers') || searchParams.get('min_members');
        const isArrears = searchParams.has('isArrears') ? searchParams.get('isArrears') === 'true' : undefined;
        const isNoOfficers = searchParams.has('isNoOfficers') ? searchParams.get('isNoOfficers') === 'true' : undefined;
        const sponsorsInteract = searchParams.has('sponsorsInteract') ? searchParams.get('sponsorsInteract') === 'true' : undefined;
        const limit = searchParams.get('limit') || 50;
        const offset = searchParams.get('offset') || 0;

        const result = await searchClubs({
            q,
            district: normalizedDistrict,
            base,
            status,
            country,
            sponsorsInteract,
            isArrears,
            isNoOfficers,
            minMembers,
            sortBy,
            sortOrder,
            limit,
            offset
        });

        return NextResponse.json({
            district: normalizedDistrict,
            ...result
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/districts/[districtId]/clubs error:', error);
        return NextResponse.json({ error: 'Failed to retrieve district clubs' }, { status: 500 });
    }
}
