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
    negotiateProtocolVersion
} from '@/lib/mcp/sse';

export const dynamic = 'force-dynamic';

const SERVER_NAME = 'rotaract-south-asia-analytics';
const SERVER_VERSION = '1.1.0';

// Static MCP method responses (tool/resource/prompt listings) are safe to cache briefly.
// They do not change between deployments.
const STATIC_CACHE_HEADERS = {
    ...CORS_HEADERS,
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
};

function withTiming(headers, startMs) {
    return { ...headers, 'X-Response-Time': `${Date.now() - startMs}ms` };
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
    const acceptHeader = request?.headers?.get('accept') || '';
    const url = request?.url ? new URL(request.url) : null;
    const isSse = acceptHeader.includes('text/event-stream') || url?.searchParams?.get('transport') === 'sse';

    // Handle SSE probe and connection
    if (isSse) {
        return createSseResponse(request, '/api/mcp');
    }

    // Direct HTTP JSON discovery manifest
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
    }, { headers: STATIC_CACHE_HEADERS });
}

export async function POST(request) {
    const start = Date.now();
    const url = request?.url ? new URL(request.url) : null;
    const sessionId = url?.searchParams?.get('sessionId') || null;

    function respond(responseObj, status = 200, headers = CORS_HEADERS) {
        if (sessionId) {
            sendSseMessage(sessionId, responseObj);
        }
        return NextResponse.json(responseObj, { status, headers: withTiming(headers, start) });
    }

    try {
        let body;
        try {
            body = await request.json();
        } catch (parseErr) {
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
                return new NextResponse(null, { status: 204, headers: withTiming(CORS_HEADERS, start) });
            }

            // server/discover: single call returning full capability manifest
            // Used by platform bots (OpenAI, Anthropic, Google) on first connection
            if (method === 'initialize' || method === 'server/discover') {
                const requestedVersion = params?.protocolVersion || request.headers.get('mcp-protocol-version');
                const negotiatedVersion = negotiateProtocolVersion(requestedVersion);
                const versionHeaders = {
                    ...STATIC_CACHE_HEADERS,
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
                        },
                        tools: TOOLS_DEFINITIONS,
                        resources: MCP_RESOURCES,
                        prompts: MCP_PROMPTS
                    }
                }, 200, versionHeaders);
            }

            // Tools
            if (method === 'tools/list') {
                return respond({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { tools: TOOLS_DEFINITIONS }
                }, 200, STATIC_CACHE_HEADERS);
            }

            if (method === 'tools/call') {
                const toolName = params?.name;
                const toolArgs = params?.arguments || {};
                const executionResult = await executeTool(toolName, toolArgs);

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
                }, 200, STATIC_CACHE_HEADERS);
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
                }, 200, STATIC_CACHE_HEADERS);
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

        if (!toolName) {
            return respond({
                error: 'Missing required field "tool" or "name", or valid JSON-RPC 2.0 payload.'
            }, 400);
        }

        const executionResult = await executeTool(toolName, toolArgs);
        return respond(executionResult);

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
