import { NextResponse } from 'next/server';
import { TOOLS_DEFINITIONS, executeTool } from '@/lib/mcp/tools';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache, no-transform'
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
    return NextResponse.json({
        server: 'rotaract-south-asia-analytics',
        version: '1.0.0',
        protocolVersion: '2024-11-05',
        capabilities: {
            tools: {}
        },
        tools: TOOLS_DEFINITIONS
    }, { headers: CORS_HEADERS });
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Support standard JSON-RPC 2.0 protocol
        if (body.jsonrpc === '2.0') {
            const { id, method, params } = body;

            if (method === 'initialize') {
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id,
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: { tools: {} },
                        serverInfo: {
                            name: 'rotaract-south-asia-analytics',
                            version: '1.0.0'
                        }
                    }
                }, { headers: CORS_HEADERS });
            }

            if (method === 'tools/list') {
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id,
                    result: {
                        tools: TOOLS_DEFINITIONS
                    }
                }, { headers: CORS_HEADERS });
            }

            if (method === 'tools/call') {
                const toolName = params?.name;
                const toolArgs = params?.arguments || {};
                const executionResult = await executeTool(toolName, toolArgs);

                if (executionResult.isError) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id,
                        error: {
                            code: -32603,
                            message: executionResult.content?.[0]?.text || 'Tool execution error'
                        }
                    }, { headers: CORS_HEADERS });
                }

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id,
                    result: executionResult
                }, { headers: CORS_HEADERS });
            }

            return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32601,
                    message: `Method '${method}' not found`
                }
            }, { status: 404, headers: CORS_HEADERS });
        }

        // Support direct lightweight invocation: { tool: "search_clubs", args: { ... } }
        const toolName = body.tool || body.name;
        const toolArgs = body.args || body.arguments || {};

        if (!toolName) {
            return NextResponse.json({
                error: 'Missing required field "tool" or "name", or valid JSON-RPC 2.0 payload.'
            }, { status: 400, headers: CORS_HEADERS });
        }

        const executionResult = await executeTool(toolName, toolArgs);
        return NextResponse.json(executionResult, { headers: CORS_HEADERS });
    } catch (error) {
        console.error('API /api/mcp error:', error);
        return NextResponse.json({
            error: 'Failed to process MCP request',
            details: error.message
        }, { status: 500, headers: CORS_HEADERS });
    }
}
