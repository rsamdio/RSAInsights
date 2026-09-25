import { NextResponse } from 'next/server';
import {
    TOOLS_DEFINITIONS,
    MCP_RESOURCES,
    MCP_PROMPTS,
    executeTool,
    readResource,
    getPrompt
} from '@/lib/mcp/tools';

export const dynamic = 'force-dynamic';

const PROTOCOL_VERSION = '2026-07-28';
const SERVER_NAME = 'rotaract-south-asia-analytics';
const SERVER_VERSION = '1.1.0';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Protocol-Version',
    'Cache-Control': 'no-cache, no-transform',
    'Mcp-Protocol-Version': PROTOCOL_VERSION
};

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

export async function GET() {
    return NextResponse.json({
        server: SERVER_NAME,
        version: SERVER_VERSION,
        protocolVersion: PROTOCOL_VERSION,
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
    try {
        let body;
        try {
            body = await request.json();
        } catch (parseErr) {
            return NextResponse.json({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: -32700,
                    message: `Parse error: Invalid JSON payload (${parseErr.message})`
                }
            }, { status: 400, headers: withTiming(CORS_HEADERS, start) });
        }

        // Standard JSON-RPC 2.0 protocol (MCP 2026-07-28 spec)
        if (body.jsonrpc === '2.0') {
            const { id, method, params } = body;
            const responseId = id !== undefined ? id : null;

            // Ping utility method (MCP standard health check)
            if (method === 'ping') {
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: {}
                }, { headers: withTiming(CORS_HEADERS, start) });
            }

            // Notifications (e.g. notifications/initialized, notifications/cancelled)
            if (typeof method === 'string' && method.startsWith('notifications/')) {
                return new NextResponse(null, { status: 204, headers: withTiming(CORS_HEADERS, start) });
            }

            // server/discover: single call returning full capability manifest
            // Used by platform bots (OpenAI, Anthropic, Google) on first connection
            if (method === 'initialize' || method === 'server/discover') {
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: {
                        protocolVersion: PROTOCOL_VERSION,
                        capabilities: {
                            tools: {},
                            resources: {},
                            prompts: {}
                        },
                        serverInfo: {
                            name: SERVER_NAME,
                            version: SERVER_VERSION
                        },
                        // 2026-07-28: include full manifest in discover response
                        tools: TOOLS_DEFINITIONS,
                        resources: MCP_RESOURCES,
                        prompts: MCP_PROMPTS
                    }
                }, { headers: withTiming(STATIC_CACHE_HEADERS, start) });
            }

            // Tools
            if (method === 'tools/list') {
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { tools: TOOLS_DEFINITIONS }
                }, { headers: withTiming(STATIC_CACHE_HEADERS, start) });
            }

            if (method === 'tools/call') {
                const toolName = params?.name;
                const toolArgs = params?.arguments || {};
                const executionResult = await executeTool(toolName, toolArgs);

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: executionResult
                }, { headers: withTiming(CORS_HEADERS, start) });
            }

            // Resources
            if (method === 'resources/list') {
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { resources: MCP_RESOURCES }
                }, { headers: withTiming(STATIC_CACHE_HEADERS, start) });
            }

            if (method === 'resources/read') {
                const uri = params?.uri;
                if (!uri) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: 'Missing required parameter: "uri"' }
                    }, { headers: withTiming(CORS_HEADERS, start) });
                }
                try {
                    const result = await readResource(uri);
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: responseId,
                        result
                    }, { headers: withTiming(CORS_HEADERS, start) });
                } catch (err) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: err.message }
                    }, { headers: withTiming(CORS_HEADERS, start) });
                }
            }

            // Prompts
            if (method === 'prompts/list') {
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: responseId,
                    result: { prompts: MCP_PROMPTS }
                }, { headers: withTiming(STATIC_CACHE_HEADERS, start) });
            }

            if (method === 'prompts/get') {
                const name = params?.name;
                if (!name) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: 'Missing required parameter: "name"' }
                    }, { headers: withTiming(CORS_HEADERS, start) });
                }
                const promptArgs = params?.arguments || {};
                try {
                    const result = await getPrompt(name, promptArgs);
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: responseId,
                        result
                    }, { headers: withTiming(CORS_HEADERS, start) });
                } catch (err) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: responseId,
                        error: { code: -32602, message: err.message }
                    }, { headers: withTiming(CORS_HEADERS, start) });
                }
            }

            return NextResponse.json({
                jsonrpc: '2.0',
                id: responseId,
                error: {
                    code: -32601,
                    message: `Method '${method}' not found`
                }
            }, { status: 404, headers: withTiming(CORS_HEADERS, start) });
        }

        // Lightweight direct invocation: { tool: "search_clubs", args: { ... } }
        const toolName = body.tool || body.name;
        const toolArgs = body.args || body.arguments || {};

        if (!toolName) {
            return NextResponse.json({
                error: 'Missing required field "tool" or "name", or valid JSON-RPC 2.0 payload.'
            }, { status: 400, headers: withTiming(CORS_HEADERS, start) });
        }

        const executionResult = await executeTool(toolName, toolArgs);
        return NextResponse.json(executionResult, { headers: withTiming(CORS_HEADERS, start) });

    } catch (error) {
        console.error('API /api/mcp error:', error);
        return NextResponse.json({
            jsonrpc: '2.0',
            id: null,
            error: {
                code: -32603,
                message: `Failed to process MCP request: ${error.message}`
            }
        }, { status: 500, headers: withTiming(CORS_HEADERS, start) });
    }
}
