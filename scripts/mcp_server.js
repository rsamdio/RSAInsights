#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    ErrorCode,
    McpError
} from '@modelcontextprotocol/sdk/types.js';
import {
    TOOLS_DEFINITIONS,
    MCP_RESOURCES,
    MCP_PROMPTS,
    executeTool,
    readResource,
    getPrompt
} from '../lib/mcp/tools.js';

const server = new Server(
    {
        name: 'rotaract-south-asia-analytics',
        version: '1.1.0'
    },
    {
        capabilities: {
            tools: {},
            resources: {},
            prompts: {}
        }
    }
);

// Tools handlers
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

// Resources handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: MCP_RESOURCES
    };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    try {
        const result = await readResource(uri);
        return result;
    } catch (error) {
        throw new McpError(
            ErrorCode.InvalidRequest,
            `Error reading resource ${uri}: ${error.message}`
        );
    }
});

// Prompts handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: MCP_PROMPTS
    };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const result = await getPrompt(name, args || {});
        return result;
    } catch (error) {
        throw new McpError(
            ErrorCode.InvalidRequest,
            `Error getting prompt ${name}: ${error.message}`
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
