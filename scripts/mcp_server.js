#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ErrorCode,
    McpError
} from '@modelcontextprotocol/sdk/types.js';
import { TOOLS_DEFINITIONS, executeTool } from '../lib/mcp/tools.js';

const server = new Server(
    {
        name: 'rotaract-south-asia-analytics',
        version: '1.0.0'
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS_DEFINITIONS
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const result = await executeTool(name, args || {});
        return result;
    } catch (error) {
        throw new McpError(
            ErrorCode.InternalError,
            `Error executing tool ${name}: ${error.message}`
        );
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Rotaract South Asia Analytics MCP Server started successfully (stdio transport).');
}

main().catch((err) => {
    console.error('Fatal error running MCP Server:', err);
    process.exit(1);
});
