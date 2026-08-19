import { getFilterOptions } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
    const options = await getFilterOptions();
    return NextResponse.json(options, {
        headers: {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        },
    });
}
