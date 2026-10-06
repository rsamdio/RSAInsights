import { NextResponse } from 'next/server';
import { getArrearsList } from '@/lib/services/analyticsService';
import { withApiTelemetry } from '@/lib/telemetry/axiom';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*',
};

export const GET = withApiTelemetry(async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district') || '';
        const zone = searchParams.get('zone') || '';
        const base = searchParams.get('base') || '';
        const country = searchParams.get('country') || '';
        const atRiskOnly = (searchParams.get('atRiskOnly') || searchParams.get('at_risk_only')) === 'true';
        const minOutstanding = searchParams.get('minOutstanding') || searchParams.get('min_outstanding') || undefined;
        const maxOutstanding = searchParams.get('maxOutstanding') || searchParams.get('max_outstanding') || undefined;
        const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by') || 'outstanding';
        const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order') || 'desc';
        const limit = searchParams.get('limit') || 25;
        const offset = searchParams.get('offset') || 0;

        const result = await getArrearsList({
            district,
            zone,
            base,
            country,
            atRiskOnly,
            minOutstanding,
            maxOutstanding,
            sortBy,
            sortOrder,
            limit,
            offset
        });

        return NextResponse.json(result, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('API /v1/compliance/arrears error:', error);
        return NextResponse.json({ error: 'Failed to retrieve arrears list' }, { status: 500 });
    }
}, { route: '/api/v1/compliance/arrears' });
