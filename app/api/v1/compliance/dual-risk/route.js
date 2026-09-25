import { NextResponse } from 'next/server';
import { getDualRiskList } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

/**
 * GET /api/v1/compliance/dual-risk
 *
 * Returns clubs that have BOTH outstanding financial arrears AND missing officer reports.
 * These 761 clubs represent the highest aggregate compliance risk in South Asia.
 *
 * Query params:
 *   district, zone, base, country, minOutstanding, sortBy (outstanding|name|district), sortOrder, limit, offset
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const base = searchParams.get('base') || '';
        const country = searchParams.get('country') || '';
        const minOutstanding = searchParams.get('minOutstanding') || searchParams.get('min_outstanding') || undefined;
        const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by') || 'outstanding';
        const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order') || 'desc';
        const limit = searchParams.get('limit') || 25;
        const offset = searchParams.get('offset') || 0;

        const result = await getDualRiskList({
            district,
            zone,
            base,
            country,
            sortBy,
            sortOrder,
            minOutstanding,
            limit,
            offset
        });

        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/compliance/dual-risk error:', error);
        return NextResponse.json({ error: 'Failed to retrieve dual-risk compliance list' }, { status: 500 });
    }
}
