import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
    TOOLS_DEFINITIONS,
    MCP_RESOURCES,
    MCP_PROMPTS,
    executeTool,
    readResource,
    getPrompt
} from '@/lib/mcp/tools';
import {
    createSseResponse,
    sendSseMessage,
    CORS_HEADERS,
    DEFAULT_PROTOCOL_VERSION,
    SUPPORTED_PROTOCOL_VERSIONS,
    negotiateProtocolOrReject,
    resolveVersionSources,
    extractClientInfo,
    extractClientCapabilities,
    rememberSessionProtocolVersion,
    isModernProtocol,
    protocolEra,
    shapeMcpResult,
    MCP_META_KEYS,
} from '@/lib/mcp/sse';
import { logMcpRequest, extractClientIp, flushTelemetry } from '@/lib/telemetry/axiom';

export const dynamic = 'force-dynamic';

const SERVER_NAME = 'rotaract-south-asia-analytics';
const SERVER_VERSION = '1.1.0';

const NO_CACHE_HEADERS = {
    ...CORS_HEADERS,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
};

const MANIFEST_CACHE_HEADERS = {
    ...CORS_HEADERS,
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    'Netlify-Vary': 'query'
};

function withTiming(headers, startMs) {
    return { ...headers, 'X-Response-Time': `${Date.now() - startMs}ms` };
}

function versionHeaders(version, base = NO_CACHE_HEADERS) {
    return {
        ...base,
        'Mcp-Protocol-Version': version || DEFAULT_PROTOCOL_VERSION,
    };
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
    const start = Date.now();
    const acceptHeader = request?.headers?.get('accept') || '';
    const isEventStream = acceptHeader.includes('text/event-stream');
    const url = request?.url ? new URL(request.url) : null;
    const isExplicitSse = url?.searchParams?.get('transport') === 'sse';
    const userAgent = request?.headers?.get('user-agent') || 'unknown';
    const ip = extractClientIp(request);

    if (isEventStream || isExplicitSse) {
        const sseSessionId = crypto.randomUUID();
        logMcpRequest({
            method: 'sse/connect',
            status: 200,
            durationMs: Date.now() - start,
            userAgent,
            ip,
            sessionId: sseSessionId,
            path: '/api/mcp',
            protocolVersion: DEFAULT_PROTOCOL_VERSION,
            protocolEra: protocolEra(DEFAULT_PROTOCOL_VERSION),
            negotiationOutcome: 'defaulted',
        });
        await flushTelemetry(800);
        return createSseResponse(request, '/api/mcp', sseSessionId);
    }

    logMcpRequest({
        method: 'manifest/get',
        status: 200,
        durationMs: Date.now() - start,
        userAgent,
        ip,
        path: '/api/mcp',
        protocolVersion: DEFAULT_PROTOCOL_VERSION,
        protocolEra: protocolEra(DEFAULT_PROTOCOL_VERSION),
        negotiationOutcome: 'defaulted',
    });
    await flushTelemetry(800);

    return NextResponse.json({
        server: SERVER_NAME,
        version: SERVER_VERSION,
        protocolVersion: DEFAULT_PROTOCOL_VERSION,
        supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
        capabilities: {
            tools: {},
            resources: {},
            prompts: {}
        },
        tools: TOOLS_DEFINITIONS,
        resources: MCP_RESOURCES,
        prompts: MCP_PROMPTS
    }, { headers: MANIFEST_CACHE_HEADERS });
}

export async function POST(request) {
    const start = Date.now();
    const url = request?.url ? new URL(request.url) : null;
    const sessionId = url?.searchParams?.get('sessionId') || null;
    const userAgent = request?.headers?.get('user-agent') || 'unknown';
    const ip = extractClientIp(request);
    let requestMethod = 'unknown';
    let negotiatedVersion = DEFAULT_PROTOCOL_VERSION;
    let requestedProtocolVersion = null;
    let negotiationOutcome = 'defaulted';
    let clientName = null;
    let clientVersion = null;
    let respondMeta = {};
    let loggedResultType = null;

    async function respond(responseObj, status = 200, headers = CORS_HEADERS) {
        let payload = responseObj;

        if (payload?.result && typeof payload.result === 'object' && !payload.error) {
            payload = {
                ...payload,
                result: shapeMcpResult(payload.result, {
                    version: negotiatedVersion,
                    method: requestMethod,
                    serverName: SERVER_NAME,
                    serverVersion: SERVER_VERSION,
                }),
            };
            loggedResultType = payload.result?.resultType || null;
        }

        if (sessionId) {
            sendSseMessage(sessionId, payload);
        }

        const nestedResult = payload?.result;
        const toolIsError = Boolean(
            payload?.isError
            || nestedResult?.isError
            || respondMeta.toolSuccess === false
        );
        const errorText = (
            payload?.error?.message
            || (typeof payload?.error === 'string' ? payload.error : null)
            || (payload?.isError ? payload?.content?.[0]?.text : null)
            || (nestedResult?.isError ? nestedResult?.content?.[0]?.text : null)
            || null
        );
        const errorCode = payload?.error?.code ?? respondMeta.errorCode ?? null;
        const toolSuccess = respondMeta.tool !== undefined
            ? (respondMeta.toolSuccess !== undefined ? Boolean(respondMeta.toolSuccess) : !toolIsError)
            : undefined;

        logMcpRequest({
            method: requestMethod,
            status,
            durationMs: Date.now() - start,
            userAgent,
            ip,
            sessionId,
            protocolVersion: negotiatedVersion || undefined,
            requestedProtocolVersion,
            protocolEra: protocolEra(negotiatedVersion) || undefined,
            negotiationOutcome,
            error: errorText,
            errorCode,
            path: '/api/mcp',
            tool: respondMeta.tool || undefined,
            toolSuccess,
            requestId: respondMeta.requestId ?? undefined,
            clientName,
            clientVersion,
            resultType: loggedResultType,
        });
        await flushTelemetry(800);
        return NextResponse.json(payload, {
            status,
            headers: withTiming(versionHeaders(negotiatedVersion, headers), start),
        });
    }

    try {
        let body;
        try {
            body = await request.json();
        } catch (parseErr) {
            requestMethod = 'jsonrpc/parse-error';
            return respond({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: -32700,
                    message: `Parse error: Invalid JSON payload (${parseErr.message})`
                }
            }, 400);
        }

        const clientInfo = extractClientInfo(body);
        clientName = clientInfo.clientName;
        clientVersion = clientInfo.clientVersion;

        // Wire markers only count as "requested"; SSE session is a fallback, not a client ask.
        const versionSources = resolveVersionSources(request, body, sessionId);
        requestedProtocolVersion = versionSources.wire;
        const versionToNegotiate = versionSources.wire || versionSources.session || null;
        const negotiation = negotiateProtocolOrReject(versionToNegotiate);
        negotiationOutcome = negotiation.outcome;

        if (negotiation.outcome === 'rejected') {
            negotiatedVersion = null;
            requestMethod = body?.method || 'protocol/negotiate';
            respondMeta = {
                requestId: body?.id !== undefined ? body.id : null,
                errorCode: -32022,
            };
            return respond({
                jsonrpc: '2.0',
                id: body?.id !== undefined ? body.id : null,
                error: negotiation.error,
            }, 400);
        }

        negotiatedVersion = negotiation.version;
        if (sessionId) {
            rememberSessionProtocolVersion(sessionId, negotiatedVersion);
        }

        const modern = isModernProtocol(negotiatedVersion);
        const clientCapabilities = extractClientCapabilities(body);
        const paramsMeta = body?.params?._meta || body?._meta || {};
        const declaredModernMeta = Boolean(paramsMeta?.[MCP_META_KEYS.protocolVersion]);

        // Standard JSON-RPC 2.0 protocol
        if (body.jsonrpc === '2.0') {
            const { id, method, params } = body;
            requestMethod = method || 'unknown';
            const responseId = id !== undefined ? id : null;
            respondMeta = { requestId: responseId };

            // True modern requests (version in _meta) must declare clientCapabilities
            // Header-only modern after legacy initialize remains dual-era compatible.
            if (
                modern
                && declaredModernMeta
                && method
                && method !== 'server/discover'
                && !String(method).startsWith('notifications/')
                && !clientCapabilities
            ) {
                respondMeta.errorCode = -32021;
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    error: {
                        code: -32021,
                        message: 'Missing required client capability metadata',
                        data: {
                            requiredCapabilities: [MCP_META_KEYS.clientCapabilities],
                        },
                    },
                }, 400);
            }

            // Ping: legacy only. Modern clients get method-not-found.
            if (method === 'ping') {
                if (modern) {
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: {
                            code: -32601,
                            message: "Method 'ping' not found"
                        }
                    }, 404);
                }
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: {}
                });
            }

            // Notifications (e.g. notifications/initialized, notifications/cancelled)
            if (typeof method === 'string' && method.startsWith('notifications/')) {
                logMcpRequest({
                    method,
                    status: 204,
                    durationMs: Date.now() - start,
                    userAgent,
                    ip,
                    sessionId,
                    protocolVersion: negotiatedVersion,
                    requestedProtocolVersion,
                    protocolEra: protocolEra(negotiatedVersion),
                    negotiationOutcome,
                    path: '/api/mcp',
                    requestId: responseId,
                    clientName,
                    clientVersion,
                });
                await flushTelemetry(800);
                return new NextResponse(null, {
                    status: 204,
                    headers: withTiming(versionHeaders(negotiatedVersion, CORS_HEADERS), start),
                });
            }

            if (method === 'server/discover') {
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: {
                        protocolVersion: negotiatedVersion,
                        supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
                        capabilities: {
                            tools: {},
                            resources: {},
                            prompts: {}
                        },
                        serverInfo: {
                            name: SERVER_NAME,
                            version: SERVER_VERSION
                        },
                        tools: TOOLS_DEFINITIONS,
                        resources: MCP_RESOURCES,
                        prompts: MCP_PROMPTS
                    }
                }, 200, NO_CACHE_HEADERS);
            }

            // Legacy initialize handshake (still answered for dual-era / OpenAI)
            if (method === 'initialize') {
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: {
                        protocolVersion: negotiatedVersion,
                        capabilities: {
                            tools: {},
                            resources: {},
                            prompts: {}
                        },
                        serverInfo: {
                            name: SERVER_NAME,
                            version: SERVER_VERSION
                        }
                    }
                }, 200, NO_CACHE_HEADERS);
            }

            if (method === 'tools/list') {
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { tools: TOOLS_DEFINITIONS }
                }, 200, NO_CACHE_HEADERS);
            }

            if (method === 'tools/call') {
                const toolName = params?.name;
                if (!toolName) {
                    respondMeta.errorCode = -32602;
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: 'Missing required parameter: "name" (tool name)' }
                    }, 400);
                }
                const toolArgs = params?.arguments || {};
                const executionResult = await executeTool(toolName, toolArgs, {
                    source: sessionId ? 'sse' : 'http',
                    userAgent,
                    ip,
                    sessionId,
                    requestId: responseId,
                    protocolVersion: negotiatedVersion,
                    protocolEra: protocolEra(negotiatedVersion),
                    resultType: modern ? 'complete' : null,
                });

                respondMeta = {
                    tool: toolName,
                    toolSuccess: !executionResult?.isError,
                    requestId: responseId
                };
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: executionResult
                });
            }

            if (method === 'resources/list') {
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { resources: MCP_RESOURCES }
                }, 200, NO_CACHE_HEADERS);
            }

            if (method === 'resources/read') {
                const uri = params?.uri;
                if (!uri) {
                    respondMeta.errorCode = -32602;
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: 'Missing required parameter: "uri"' }
                    }, 400);
                }
                try {
                    const result = await readResource(uri);
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        result
                    });
                } catch (err) {
                    respondMeta.errorCode = -32602;
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: err.message }
                    }, 400);
                }
            }

            if (method === 'prompts/list') {
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { prompts: MCP_PROMPTS }
                }, 200, NO_CACHE_HEADERS);
            }

            if (method === 'prompts/get') {
                const name = params?.name;
                if (!name) {
                    respondMeta.errorCode = -32602;
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: 'Missing required parameter: "name"' }
                    }, 400);
                }
                const promptArgs = params?.arguments || {};
                try {
                    const result = await getPrompt(name, promptArgs);
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        result
                    });
                } catch (err) {
                    respondMeta.errorCode = -32602;
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: err.message }
                    }, 400);
                }
            }

            return respond({
                jsonrpc: '2.0',
                id: responseId,
                error: {
                    code: -32601,
                    message: `Method '${method}' not found`
                }
            }, 404);
        }

        // Lightweight direct invocation: { tool: "search_clubs", args: { ... } }
        const toolName = body.tool || body.name;
        const toolArgs = body.args || body.arguments || {};
        requestMethod = `direct/${toolName || 'unknown'}`;

        if (!toolName) {
            return respond({
                error: 'Missing required field "tool" or "name", or valid JSON-RPC 2.0 payload.'
            }, 400);
        }

        const executionResult = await executeTool(toolName, toolArgs, {
            source: 'http-direct',
            userAgent,
            ip,
            sessionId,
            protocolVersion: negotiatedVersion,
            protocolEra: protocolEra(negotiatedVersion),
            resultType: modern ? 'complete' : null,
        });

        // Direct invoke is not JSON-RPC; for modern clients wrap into a JSON-RPC-like result
        // only when they sent modern protocol markers. Otherwise keep classic tool payload.
        if (modern) {
            respondMeta = {
                tool: toolName,
                toolSuccess: !executionResult?.isError,
                requestId: null
            };
            return respond({
                jsonrpc: '2.0',
                id: null,
                result: executionResult,
            }, executionResult?.isError ? 400 : 200);
        }

        const directStatus = executionResult?.isError ? 400 : 200;
        respondMeta = {
            tool: toolName,
            toolSuccess: !executionResult?.isError,
            requestId: null
        };

        // Classic direct response still goes through respond() for telemetry; skip result shaping
        // by passing a non-jsonrpc object without .result
        if (sessionId) {
            sendSseMessage(sessionId, executionResult);
        }
        logMcpRequest({
            method: requestMethod,
            status: directStatus,
            durationMs: Date.now() - start,
            userAgent,
            ip,
            sessionId,
            protocolVersion: negotiatedVersion,
            requestedProtocolVersion,
            protocolEra: protocolEra(negotiatedVersion),
            negotiationOutcome,
            error: executionResult?.isError ? executionResult?.content?.[0]?.text : null,
            path: '/api/mcp',
            tool: toolName,
            toolSuccess: !executionResult?.isError,
            clientName,
            clientVersion,
        });
        await flushTelemetry(800);
        return NextResponse.json(executionResult, {
            status: directStatus,
            headers: withTiming(versionHeaders(negotiatedVersion), start),
        });

    } catch (error) {
        console.error('API /api/mcp error:', error);
        return respond({
            jsonrpc: '2.0',
            id: null,
            error: {
                code: -32603,
                message: `Failed to process MCP request: ${error.message}`
            }
        }, 500);
    }
}
