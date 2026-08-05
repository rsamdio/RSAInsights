import { getFilterOptions } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
    const options = await getFilterOptions();
    return NextResponse.json(options);
}
