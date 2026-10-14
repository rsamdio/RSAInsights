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
    SSE_HEADERS,
    DEFAULT_PROTOCOL_VERSION,
    SUPPORTED_PROTOCOL_VERSIONS,
    negotiateProtocolVersion
} from '@/lib/mcp/sse';
import { logMcpRequest, extractClientIp, flushTelemetry } from '@/lib/telemetry/axiom';

export const dynamic = 'force-dynamic';

const SERVER_NAME = 'rotaract-south-asia-analytics';
const SERVER_VERSION = '1.1.0';

// MCP streaming and session endpoints must never be cached by CDN proxies
// to ensure SSE connections and session handshakes remain real-time.
const NO_CACHE_HEADERS = {
    ...CORS_HEADERS,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
};

// Static MCP discovery manifest (?format=json) can be safely cached at the edge CDN
const MANIFEST_CACHE_HEADERS = {
    ...CORS_HEADERS,
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    'Netlify-Vary': 'query'
};

function withTiming(headers, startMs) {
    return { ...headers, 'X-Response-Time': `${Date.now() - startMs}ms` };
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

    // If client explicitly requests SSE via header (e.g. ChatGPT Developer Mode, Claude Desktop)
    // or query parameter, establish real-time SSE stream
    if (isEventStream || isExplicitSse) {
        const sseSessionId = crypto.randomUUID();
        logMcpRequest({
            method: 'sse/connect',
            status: 200,
            durationMs: Date.now() - start,
            userAgent,
            ip,
            sessionId: sseSessionId,
            path: '/api/mcp'
        });
        await flushTelemetry(800);
        return createSseResponse(request, '/api/mcp', sseSessionId);
    }

    logMcpRequest({
        method: 'manifest/get',
        status: 200,
        durationMs: Date.now() - start,
        userAgent,
        ip
    });
    await flushTelemetry(800);

    // Default for HTTP: Return JSON capability and tool discovery manifest
    return NextResponse.json({
        server: SERVER_NAME,
        version: SERVER_VERSION,
        protocolVersion: DEFAULT_PROTOCOL_VERSION,
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
    let negotiatedVersion = null;
    let respondMeta = {};

    async function respond(responseObj, status = 200, headers = CORS_HEADERS) {
        if (sessionId) {
            sendSseMessage(sessionId, responseObj);
        }
        const nestedResult = responseObj?.result;
        const toolIsError = Boolean(
            responseObj?.isError
            || nestedResult?.isError
            || respondMeta.toolSuccess === false
        );
        const errorText = (
            responseObj?.error?.message
            || responseObj?.error
            || (responseObj?.isError ? responseObj?.content?.[0]?.text : null)
            || (nestedResult?.isError ? nestedResult?.content?.[0]?.text : null)
            || null
        );
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
            protocolVersion: negotiatedVersion,
            error: errorText,
            tool: respondMeta.tool || undefined,
            toolSuccess,
            requestId: respondMeta.requestId ?? undefined,
        });
        await flushTelemetry(800);
        return NextResponse.json(responseObj, { status, headers: withTiming(headers, start) });
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

        // Standard JSON-RPC 2.0 protocol (MCP specification)
        if (body.jsonrpc === '2.0') {
            const { id, method, params } = body;
            requestMethod = method || 'unknown';
            const responseId = id !== undefined ? id : null;

            // Ping utility method (MCP standard health check)
            if (method === 'ping') {
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
                    sessionId
                });
                await flushTelemetry(800);
                return new NextResponse(null, { status: 204, headers: withTiming(CORS_HEADERS, start) });
            }

            // server/discover: MCP discovery handshake (spec 2026-07-28 and OpenAI Apps SDK scanner)
            // Returns server identity, capabilities, and complete tool/resource/prompt manifest
            if (method === 'server/discover') {
                const requestedVersion = params?.protocolVersion || request.headers.get('mcp-protocol-version');
                negotiatedVersion = negotiateProtocolVersion(requestedVersion);
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
                }, 200, {
                    ...NO_CACHE_HEADERS,
                    'Mcp-Protocol-Version': negotiatedVersion
                });
            }

            // Standard MCP initialize handshake (MCP 2024-11-05 specification)
            if (method === 'initialize') {
                const requestedVersion = params?.protocolVersion || request.headers.get('mcp-protocol-version');
                negotiatedVersion = negotiateProtocolVersion(requestedVersion);
                const versionHeaders = {
                    ...NO_CACHE_HEADERS,
                    'Mcp-Protocol-Version': negotiatedVersion
                };

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
                }, 200, versionHeaders);
            }

            // Tools
            if (method === 'tools/list') {
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { tools: TOOLS_DEFINITIONS }
                }, 200, NO_CACHE_HEADERS);
            }

            if (method === 'tools/call') {
                const toolName = params?.name;
                const toolArgs = params?.arguments || {};
                const executionResult = await executeTool(toolName, toolArgs, {
                    source: sessionId ? 'sse' : 'http',
                    userAgent,
                    ip,
                    sessionId,
                    requestId: responseId
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

            // Resources
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
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: 'Missing required parameter: "uri"' }
                    });
                }
                try {
                    const result = await readResource(uri);
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        result
                    });
                } catch (err) {
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: err.message }
                    });
                }
            }

            // Prompts
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
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: 'Missing required parameter: "name"' }
                    });
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
                    return respond({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: err.message }
                    });
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
            sessionId
        });
        const directStatus = executionResult?.isError ? 400 : 200;
        respondMeta = {
            tool: toolName,
            toolSuccess: !executionResult?.isError,
            requestId: null
        };
        return respond(executionResult, directStatus);

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
