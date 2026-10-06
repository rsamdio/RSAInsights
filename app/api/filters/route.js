import { getFilterOptions } from '@/lib/api';
import { NextResponse } from 'next/server';
import { withApiTelemetry } from '@/lib/telemetry/axiom';

export const GET = withApiTelemetry(async function GET() {
    const options = await getFilterOptions();
    return NextResponse.json(options, {
        headers: {
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
    });
}, { route: '/api/filters' });
