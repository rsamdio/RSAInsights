import { NextResponse } from 'next/server';
import { CORS_HEADERS } from '@/lib/mcp/sse';
import { GET as handleMcpGet, POST as handleMcpPost } from '@/app/api/mcp/route';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
    return handleMcpGet(request);
}

export async function POST(request) {
    return handleMcpPost(request);
}
