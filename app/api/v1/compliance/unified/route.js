import { NextResponse } from 'next/server';
import { getUnifiedIssuesList } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

/**
 * GET /api/v1/compliance/unified
 *
 * Returns the unified compliance issues roster (1,330 clubs with financial arrears,
 * missing officer reporting, or both).
 *
 * Query params:
 *   district, zone, base, country, issueType (all|both|arrears|no_officers|at_risk),
 *   minOutstanding, maxOutstanding, sortBy (outstanding|name|district), sortOrder, limit, offset
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const base = searchParams.get('base') || '';
        const country = searchParams.get('country') || '';
        const issueType = searchParams.get('issueType') || searchParams.get('issue_type') || 'all';
        const minOutstanding = searchParams.get('minOutstanding') || searchParams.get('min_outstanding') || undefined;
        const maxOutstanding = searchParams.get('maxOutstanding') || searchParams.get('max_outstanding') || undefined;
        const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by') || 'outstanding';
        const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order') || 'desc';
        const limit = searchParams.get('limit') || 25;
        const offset = searchParams.get('offset') || 0;

        const result = await getUnifiedIssuesList({
            district,
            zone,
            base,
            country,
            issueType,
            minOutstanding,
            maxOutstanding,
            sortBy,
            sortOrder,
            limit,
            offset
        });

        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/compliance/unified error:', error);
        return NextResponse.json({ error: 'Failed to retrieve unified compliance list' }, { status: 500 });
    }
}
