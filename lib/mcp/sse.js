import crypto from 'crypto';

export const SUPPORTED_PROTOCOL_VERSIONS = ['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25', '2026-07-28'];
export const DEFAULT_PROTOCOL_VERSION = '2024-11-05';

export function negotiateProtocolVersion(requestedVersion) {
    if (requestedVersion && SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion)) {
        return requestedVersion;
    }
    return DEFAULT_PROTOCOL_VERSION;
}

export const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Protocol-Version, Accept',
    'Mcp-Protocol-Version': DEFAULT_PROTOCOL_VERSION
};

export const SSE_HEADERS = {
    ...CORS_HEADERS,
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
};

const sessions = global._mcpSseSessions = global._mcpSseSessions || new Map();

/**
 * Sends a JSON-RPC message over an active SSE stream.
 * @param {string} sessionId
 * @param {Object} message
 * @returns {boolean} True if message was successfully enqueued
 */
export function sendSseMessage(sessionId, message) {
    if (!sessionId) return false;
    const session = sessions.get(sessionId);
    if (!session || !session.controller) return false;

    try {
        const payload = `event: message\ndata: ${JSON.stringify(message)}\n\n`;
        session.controller.enqueue(session.encoder.encode(payload));
        return true;
    } catch (err) {
        console.warn(`Failed to push message to SSE session ${sessionId}:`, err);
        sessions.delete(sessionId);
        return false;
    }
}

/**
 * Checks if an SSE session exists and is active.
 * @param {string} sessionId
 * @returns {boolean}
 */
export function hasSseSession(sessionId) {
    return Boolean(sessionId && sessions.has(sessionId));
}

/**
 * Establishes an SSE stream response conforming to the Model Context Protocol (MCP) specification.
 * Sends the initial 'endpoint' event informing the client where to post messages.
 *
 * @param {Request} request Next.js request object
 * @param {string} [endpointPath='/api/mcp'] Path where client should POST JSON-RPC messages
 * @returns {Response}
 */
export function createSseResponse(request, endpointPath = '/api/mcp') {
    const sessionId = crypto.randomUUID();
    const encoder = new TextEncoder();

    // Construct the endpoint URI including the sessionId query parameter
    // Support both relative or absolute URL based on incoming request host
    const host = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host') || 'insights.rsamdio.org';
    const proto = request?.headers?.get('x-forwarded-proto') || 'https';
    const baseUrl = `${proto}://${host}`;
    const targetUrl = new URL(endpointPath, baseUrl);
    targetUrl.searchParams.set('sessionId', sessionId);

    // Provide absolute endpoint URL so both absolute-expecting and relative-expecting clients succeed
    const endpointWithSession = targetUrl.toString();

    let heartbeatTimer = null;

    const stream = new ReadableStream({
        start(controller) {
            // Send initial endpoint event per MCP SSE specification
            controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointWithSession}\n\n`));

            // Register session
            sessions.set(sessionId, {
                controller,
                encoder,
                createdAt: Date.now()
            });

            // Heartbeat every 10 seconds to keep intermediate proxies (Cloudflare, Netlify) from dropping connection
            heartbeatTimer = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': keepalive\n\n'));
                } catch {
                    if (heartbeatTimer) clearInterval(heartbeatTimer);
                    sessions.delete(sessionId);
                }
            }, 10000);
        },
        cancel() {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            sessions.delete(sessionId);
        }
    });

    if (request?.signal) {
        request.signal.addEventListener('abort', () => {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            sessions.delete(sessionId);
        });
    }

    return new Response(stream, { headers: SSE_HEADERS });
}
