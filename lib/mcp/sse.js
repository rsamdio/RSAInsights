import crypto from 'crypto';

export const SUPPORTED_PROTOCOL_VERSIONS = ['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25', '2026-07-28'];
export const DEFAULT_PROTOCOL_VERSION = '2025-11-25';
export const MODERN_PROTOCOL_VERSION = '2026-07-28';

const META_PROTOCOL_VERSION = 'io.modelcontextprotocol/protocolVersion';
const META_CLIENT_CAPABILITIES = 'io.modelcontextprotocol/clientCapabilities';
const META_CLIENT_INFO = 'io.modelcontextprotocol/clientInfo';
const META_SERVER_INFO = 'io.modelcontextprotocol/serverInfo';

export const MCP_META_KEYS = {
    protocolVersion: META_PROTOCOL_VERSION,
    clientCapabilities: META_CLIENT_CAPABILITIES,
    clientInfo: META_CLIENT_INFO,
    serverInfo: META_SERVER_INFO,
};

const sessions = global._mcpSseSessions = global._mcpSseSessions || new Map();
const sessionProtocolVersions = global._mcpSessionProtocolVersions = global._mcpSessionProtocolVersions || new Map();

export function isModernProtocol(version) {
    return version === MODERN_PROTOCOL_VERSION;
}

export function protocolEra(version) {
    if (!version) return null;
    return isModernProtocol(version) ? 'modern' : 'legacy';
}

/**
 * Soft negotiate: accept listed versions, otherwise fall back to default.
 * Prefer negotiateProtocolOrReject when an explicit unsupported version must error.
 */
export function negotiateProtocolVersion(requestedVersion) {
    if (requestedVersion && SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion)) {
        return requestedVersion;
    }
    return DEFAULT_PROTOCOL_VERSION;
}

/**
 * @returns {{ version: string, outcome: 'exact'|'defaulted'|'rejected', requested: string|null, error?: object }}
 */
export function negotiateProtocolOrReject(requestedVersion) {
    const requested = requestedVersion || null;
    if (!requested) {
        return { version: DEFAULT_PROTOCOL_VERSION, outcome: 'defaulted', requested: null };
    }
    if (SUPPORTED_PROTOCOL_VERSIONS.includes(requested)) {
        return { version: requested, outcome: 'exact', requested };
    }
    return {
        version: null,
        outcome: 'rejected',
        requested,
        error: {
            code: -32022,
            message: 'Unsupported protocol version',
            data: {
                supported: [...SUPPORTED_PROTOCOL_VERSIONS],
                requested
            }
        }
    };
}

/**
 * Resolve protocol version sources without conflating wire request and SSE session memory.
 * @returns {{ wire: string|null, session: string|null, source: 'meta'|'header'|'params'|'session'|'none' }}
 */
export function resolveVersionSources(request, body = null, sessionId = null) {
    const params = body?.params || {};
    const meta = params?._meta || body?._meta || {};
    const fromMeta = meta?.[META_PROTOCOL_VERSION];
    if (typeof fromMeta === 'string' && fromMeta) {
        return { wire: fromMeta, session: null, source: 'meta' };
    }

    const fromHeader = request?.headers?.get('mcp-protocol-version')
        || request?.headers?.get('MCP-Protocol-Version');
    if (typeof fromHeader === 'string' && fromHeader.trim()) {
        return { wire: fromHeader.trim(), session: null, source: 'header' };
    }

    if (typeof params?.protocolVersion === 'string' && params.protocolVersion) {
        return { wire: params.protocolVersion, session: null, source: 'params' };
    }

    const fromSession = (sessionId && sessionProtocolVersions.has(sessionId))
        ? sessionProtocolVersions.get(sessionId)
        : null;
    if (fromSession) {
        return { wire: null, session: fromSession, source: 'session' };
    }

    return { wire: null, session: null, source: 'none' };
}

/**
 * Resolve effective client-requested protocol version (wire markers, then SSE session).
 */
export function resolveRequestedVersion(request, body = null, sessionId = null) {
    const sources = resolveVersionSources(request, body, sessionId);
    return sources.wire || sources.session || null;
}

export function extractClientInfo(body = null) {
    const params = body?.params || {};
    const meta = params?._meta || body?._meta || {};
    const info = params?.clientInfo || meta?.[META_CLIENT_INFO] || null;
    if (!info || typeof info !== 'object') {
        return { clientName: null, clientVersion: null };
    }
    return {
        clientName: typeof info.name === 'string' ? info.name.slice(0, 120) : null,
        clientVersion: typeof info.version === 'string' ? info.version.slice(0, 60) : null,
    };
}

export function extractClientCapabilities(body = null) {
    const params = body?.params || {};
    const meta = params?._meta || body?._meta || {};
    if (meta?.[META_CLIENT_CAPABILITIES] && typeof meta[META_CLIENT_CAPABILITIES] === 'object') {
        return meta[META_CLIENT_CAPABILITIES];
    }
    if (params?.capabilities && typeof params.capabilities === 'object') {
        return params.capabilities;
    }
    return null;
}

export function rememberSessionProtocolVersion(sessionId, version) {
    if (!sessionId || !version) return;
    sessionProtocolVersions.set(sessionId, version);
    const session = sessions.get(sessionId);
    if (session) {
        session.protocolVersion = version;
    }
}

export function getSessionProtocolVersion(sessionId) {
    if (!sessionId) return null;
    return sessionProtocolVersions.get(sessionId) || null;
}

/**
 * Shape a successful JSON-RPC result for the negotiated protocol era.
 * Does not modify error envelopes.
 */
export function shapeMcpResult(result, {
    version,
    method = null,
    serverName = 'rotaract-south-asia-analytics',
    serverVersion = '1.1.0',
} = {}) {
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
        return result;
    }

    const shaped = { ...result };

    if (isModernProtocol(version)) {
        if (!shaped.resultType) {
            shaped.resultType = 'complete';
        }
        const existingMeta = shaped._meta && typeof shaped._meta === 'object' ? { ...shaped._meta } : {};
        if (!existingMeta[META_SERVER_INFO]) {
            existingMeta[META_SERVER_INFO] = {
                name: serverName,
                version: serverVersion,
            };
        }
        shaped._meta = existingMeta;

        const cacheableMethods = new Set([
            'tools/list',
            'prompts/list',
            'resources/list',
            'resources/read',
            'server/discover',
        ]);
        if (cacheableMethods.has(method)) {
            if (shaped.ttlMs === undefined) shaped.ttlMs = 300000;
            if (shaped.cacheScope === undefined) shaped.cacheScope = 'public';
        }
    }

    return shaped;
}

export const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Method, Mcp-Name, Accept, X-API-Key',
    'Mcp-Protocol-Version': DEFAULT_PROTOCOL_VERSION
};

export const SSE_HEADERS = {
    ...CORS_HEADERS,
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
};

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
        sessionProtocolVersions.delete(sessionId);
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
 * @param {Request} request
 * @param {string} [endpointPath='/api/mcp']
 * @param {string|null} [existingSessionId=null] Pre-allocated session id (for telemetry before stream starts)
 * @returns {Response}
 */
export function createSseResponse(request, endpointPath = '/api/mcp', existingSessionId = null) {
    const sessionId = existingSessionId || crypto.randomUUID();
    const encoder = new TextEncoder();

    const host = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host') || 'insights.rsamdio.org';
    const proto = request?.headers?.get('x-forwarded-proto') || 'https';
    const baseUrl = `${proto}://${host}`;
    const targetUrl = new URL(endpointPath, baseUrl);
    targetUrl.searchParams.set('sessionId', sessionId);

    const endpointWithSession = targetUrl.toString();

    let heartbeatTimer = null;

    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointWithSession}\n\n`));

            sessions.set(sessionId, {
                controller,
                encoder,
                createdAt: Date.now(),
                protocolVersion: null,
            });

            heartbeatTimer = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': keepalive\n\n'));
                } catch {
                    if (heartbeatTimer) clearInterval(heartbeatTimer);
                    sessions.delete(sessionId);
                    sessionProtocolVersions.delete(sessionId);
                }
            }, 10000);
        },
        cancel() {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            sessions.delete(sessionId);
            sessionProtocolVersions.delete(sessionId);
        }
    });

    if (request?.signal) {
        request.signal.addEventListener('abort', () => {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            sessions.delete(sessionId);
            sessionProtocolVersions.delete(sessionId);
        });
    }

    return new Response(stream, { headers: SSE_HEADERS });
}
