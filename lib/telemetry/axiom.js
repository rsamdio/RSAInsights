/**
 * Axiom Telemetry & Observability Client
 *
 * Provides non-blocking structured event ingestion for:
 * 1. REST API endpoints (/api/v1/*, /api/filters, /api/table-data)
 * 2. MCP JSON-RPC protocol requests (/api/mcp)
 * 3. MCP tool execution dispatcher (lib/mcp/tools.js, scripts/mcp_server.js)
 *
 * Ingestion target: https://api.axiom.co/v1/datasets/{dataset}/ingest
 * Cost: $0.00 / month (Axiom Cloud Free Tier up to 500 GB / month)
 */

import { after } from 'next/server.js';

function getAxiomConfig() {
    const rawToken = process.env.AXIOM_TOKEN || process.env.AXIOM_API_TOKEN || '';
    const token = rawToken.trim().replace(/^["']|["']$/g, '');
    const debugEnv = (process.env.DEBUG_TELEMETRY || '').toLowerCase().trim();
    const isDebug = debugEnv === '1' || debugEnv === 'true';

    return {
        token,
        dataset: (process.env.AXIOM_DATASET || 'rotaract-analytics').trim(),
        orgId: (process.env.AXIOM_ORG_ID || '').trim().replace(/^["']|["']$/g, ''),
        url: (process.env.AXIOM_URL || 'https://api.axiom.co').trim().replace(/\/+$/, ''),
        isEnabled: Boolean(token),
        isDebug,
        environment: process.env.NODE_ENV || 'production',
    };
}

const pendingTasks = new Set();

/**
 * Safely schedules a background telemetry task.
 * Uses Next.js after() when running in a serverless request context so that
 * execution completes without freezing the container, while sending the
 * client response with zero latency penalty. Falls back to fire-and-forget
 * tracking in pendingTasks when running outside a request scope or in runtimes
 * lacking waitUntil support.
 *
 * @param {Function} task Async function to execute
 * @returns {Promise<any>}
 */
export function scheduleTelemetry(task) {
    // Always track in pendingTasks so flushTelemetry can await ingest before
    // serverless freeze. Optionally also register with after() as a keep-alive.
    const promise = Promise.resolve()
        .then(task)
        .catch((err) => {
            const config = getAxiomConfig();
            if (config.isDebug) {
                console.warn('[telemetry:task-error]', err?.message || err);
            }
        })
        .finally(() => {
            pendingTasks.delete(promise);
        });

    pendingTasks.add(promise);

    try {
        if (typeof after === 'function') {
            after(() => promise);
        }
    } catch {
        // Outside request scope or unsupported runtime (e.g. waitUntil missing)
    }

    return promise;
}

/**
 * Flushes all pending telemetry tasks up to the given timeout.
 * Crucial for serverless environments (AWS Lambda / Netlify Functions)
 * where execution freezes immediately once the HTTP response terminates.
 *
 * @param {number} [timeoutMs=800]
 * @returns {Promise<boolean>}
 */
export async function flushTelemetry(timeoutMs = 800) {
    if (pendingTasks.size === 0) return true;
    const tasks = Array.from(pendingTasks);
    try {
        await Promise.race([
            Promise.allSettled(tasks),
            new Promise((resolve) => setTimeout(resolve, timeoutMs))
        ]);
        return true;
    } catch {
        return false;
    }
}

/**
 * Dispatches an array of events to Axiom via HTTP ingestion.
 * Always resolves safely; never throws or crashes caller.
 *
 * @param {Array<Object>|Object} events
 * @returns {Promise<boolean>} True if successfully ingested, false otherwise
 */
export async function sendToAxiom(events) {
    const config = getAxiomConfig();
    if (!config.isEnabled) {
        if (config.isDebug) {
            console.debug('[telemetry:debug]', JSON.stringify(events, null, 2));
        }
        return false;
    }

    const payload = Array.isArray(events) ? events : [events];
    if (payload.length === 0) return false;

    // Attach timestamp and environment to each event if missing
    const enriched = payload.map((evt) => ({
        _time: evt._time || new Date().toISOString(),
        environment: evt.environment || config.environment,
        ...evt,
    }));

    let timeoutId = null;
    try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 5000);

        const headers = {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'rotaract-analytics-telemetry/1.0',
        };

        if (config.orgId) {
            headers['X-Axiom-Org-Id'] = config.orgId;
        }

        const res = await fetch(`${config.url}/v1/datasets/${config.dataset}/ingest`, {
            method: 'POST',
            headers,
            body: JSON.stringify(enriched),
            signal: controller.signal,
        });

        if (!res.ok && config.isDebug) {
            const errBody = await res.text().catch(() => '');
            console.warn(`[telemetry:warn] Axiom ingest HTTP ${res.status}: ${errBody}`);
        }

        return res.ok;
    } catch (err) {
        if (config.isDebug) {
            console.warn(`[telemetry:warn] Axiom ingest failed: ${err.message}`);
        }
        return false;
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}

/**
 * Sanitizes arguments to prevent huge payloads or unwanted leakage.
 * Guaranteed safe from circular references and non-serializable objects.
 */
function sanitizeArgs(args) {
    if (!args || typeof args !== 'object') return {};
    try {
        const clean = {};
        for (const [key, val] of Object.entries(args)) {
            if (typeof val === 'string') {
                clean[key] = val.length > 500 ? `${val.slice(0, 500)}... (truncated)` : val;
            } else if (val === undefined) {
                // omit undefined values
            } else if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
                clean[key] = val;
            } else if (typeof val === 'object') {
                const serialized = JSON.stringify(val);
                clean[key] = serialized && serialized.length > 500
                    ? `${serialized.slice(0, 500)}... (truncated)`
                    : JSON.parse(serialized || '{}');
            } else {
                clean[key] = String(val);
            }
        }
        return clean;
    } catch {
        return { warning: 'Arguments could not be serialized safely' };
    }
}

/**
 * Logs an MCP tool execution (invoked via HTTP, SSE, or stdio CLI).
 *
 * @param {Object} options
 * @param {string} options.tool Tool identifier
 * @param {Object} [options.args] Tool arguments
 * @param {number} options.durationMs Duration in milliseconds
 * @param {boolean} options.success Execution outcome
 * @param {string} [options.error] Error message if failed
 * @param {string} [options.source] Invocation source: 'http' | 'stdio' | 'sse' | 'http-direct'
 * @param {number|string} [options.resultCount] Output item count in returned slice
 * @param {number|null} [options.totalMatches] Total matching items in database universe
 * @param {string} [options.userAgent] Calling client user agent
 * @param {string} [options.ip] Client IP address
 * @param {string} [options.sessionId] SSE session identifier
 * @param {string|number} [options.requestId] JSON-RPC request identifier
 * @returns {Promise<any>}
 */
export function logMcpToolCall({
    tool,
    args = {},
    durationMs = 0,
    success = true,
    error = null,
    source = 'http',
    resultCount = null,
    totalMatches = null,
    userAgent = 'unknown',
    ip = 'unknown',
    sessionId = null,
    requestId = null,
    protocolVersion = null,
    protocolEra = null,
    resultType = null,
}) {
    const event = {
        type: 'mcp_tool',
        tool,
        durationMs: Math.round(durationMs),
        success: Boolean(success),
        error: error ? String(error).slice(0, 500) : null,
        args: sanitizeArgs(args),
        source,
        resultCount: resultCount !== null ? resultCount : undefined,
        totalMatches: totalMatches !== null ? totalMatches : undefined,
        userAgent: (userAgent || 'unknown').slice(0, 200),
        ip: ip || 'unknown',
        sessionId: sessionId || undefined,
        requestId: requestId !== null && requestId !== undefined ? String(requestId) : undefined,
        protocolVersion: protocolVersion || undefined,
        protocolEra: protocolEra || undefined,
        resultType: resultType || undefined,
    };

    return scheduleTelemetry(async () => {
        await sendToAxiom(event);
    });
}

/**
 * Logs an MCP JSON-RPC protocol request (e.g. initialize, tools/list, tools/call).
 *
 * @param {Object} options
 */
export function logMcpRequest({
    method,
    status = 200,
    durationMs = 0,
    userAgent = 'unknown',
    ip = 'unknown',
    sessionId = null,
    protocolVersion = null,
    requestedProtocolVersion = null,
    protocolEra = null,
    negotiationOutcome = null,
    error = null,
    errorCode = null,
    path = null,
    tool = null,
    toolSuccess = null,
    requestId = null,
    clientName = null,
    clientVersion = null,
    resultType = null,
}) {
    const event = {
        type: 'mcp_request',
        method,
        status,
        durationMs: Math.round(durationMs),
        userAgent: (userAgent || 'unknown').slice(0, 200),
        ip: ip || 'unknown',
        sessionId: sessionId || undefined,
        protocolVersion: protocolVersion || undefined,
        requestedProtocolVersion: requestedProtocolVersion || undefined,
        protocolEra: protocolEra || undefined,
        negotiationOutcome: negotiationOutcome || undefined,
        error: error ? String(error).slice(0, 500) : null,
        errorCode: errorCode !== null && errorCode !== undefined ? errorCode : undefined,
        path: path || undefined,
        tool: tool || undefined,
        toolSuccess: toolSuccess === null || toolSuccess === undefined ? undefined : Boolean(toolSuccess),
        requestId: requestId !== null && requestId !== undefined ? String(requestId) : undefined,
        clientName: clientName || undefined,
        clientVersion: clientVersion || undefined,
        resultType: resultType || undefined,
    };

    scheduleTelemetry(async () => {
        await sendToAxiom(event);
    });
}

/**
 * Logs a standard REST API request (/api/v1/*, /api/filters, etc.).
 *
 * @param {Object} options
 */
export function logApiRequest({
    route,
    path = null,
    method = 'GET',
    status = 200,
    durationMs = 0,
    query = {},
    userAgent = 'unknown',
    ip = 'unknown',
    referer = null,
    error = null,
}) {
    const event = {
        type: 'api_request',
        route,
        path: path || route,
        method,
        status,
        durationMs: Math.round(durationMs),
        query: sanitizeArgs(query),
        userAgent: (userAgent || 'unknown').slice(0, 200),
        ip: ip || 'unknown',
        referer: referer ? String(referer).slice(0, 300) : undefined,
        error: error ? String(error).slice(0, 500) : null,
    };

    scheduleTelemetry(async () => {
        await sendToAxiom(event);
    });
}

/**
 * Extracts client IP address from standard proxy headers.
 *
 * @param {Request} request
 * @returns {string}
 */
export function extractClientIp(request) {
    if (!request || !request.headers || typeof request.headers.get !== 'function') return 'unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return (
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('client-ip') ||
        'unknown'
    );
}

/**
 * Higher-order wrapper for Next.js App Router route handlers.
 * Measures latency, extracts metadata, injects X-Response-Time header,
 * and schedules background telemetry via Next.js after().
 *
 * @param {Function} handler Standard route handler (request, context) => Promise<Response>
 * @param {Object} [meta]
 * @param {string} [meta.route] Fallback route name if URL pathname is dynamic
 * @returns {Function}
 */
export function withApiTelemetry(handler, meta = {}) {
    return async function wrappedRoute(request, context) {
        const start = Date.now();
        let url = null;
        try {
            url = request?.url ? new URL(request.url) : null;
        } catch {
            url = null;
        }
        const actualPath = url?.pathname || 'unknown';
        const route = meta.route || actualPath;
        const method = request?.method || 'GET';
        const userAgent = request?.headers?.get('user-agent') || 'unknown';
        const ip = extractClientIp(request);
        const referer = request?.headers?.get('referer') || null;
        const query = url ? Object.fromEntries(url.searchParams.entries()) : {};

        try {
            const response = await handler(request, context);
            const durationMs = Date.now() - start;
            const status = response?.status || 200;
            const error = status >= 400 ? `HTTP ${status}` : null;

            logApiRequest({
                route,
                path: actualPath,
                method,
                status,
                durationMs,
                query,
                userAgent,
                ip,
                referer,
                error,
            });

            // Set response timing header if mutable
            if (response && response.headers && !response.headers.get('X-Response-Time')) {
                try {
                    response.headers.set('X-Response-Time', `${durationMs}ms`);
                } catch {
                    // Headers might be immutable on certain responses
                }
            }

            await flushTelemetry(800);
            return response;
        } catch (error) {
            const durationMs = Date.now() - start;

            logApiRequest({
                route,
                path: actualPath,
                method,
                status: 500,
                durationMs,
                query,
                userAgent,
                ip,
                referer,
                error: error.message,
            });

            await flushTelemetry(800);
            throw error;
        }
    };
}
