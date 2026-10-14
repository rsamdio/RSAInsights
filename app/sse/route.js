import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createSseResponse, CORS_HEADERS } from '@/lib/mcp/sse';
import { POST as handleMcpPost } from '@/app/api/mcp/route';
import { logMcpRequest, extractClientIp, flushTelemetry } from '@/lib/telemetry/axiom';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
    const start = Date.now();
    const sseSessionId = crypto.randomUUID();
    logMcpRequest({
        method: 'sse/connect',
        status: 200,
        durationMs: Date.now() - start,
        userAgent: request?.headers?.get('user-agent'),
        ip: extractClientIp(request),
        sessionId: sseSessionId,
        path: '/sse'
    });
    await flushTelemetry(800);
    return createSseResponse(request, '/api/mcp', sseSessionId);
}

export async function POST(request) {
    return handleMcpPost(request);
}
