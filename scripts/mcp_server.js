#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
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
import { flushTelemetry } from '../lib/telemetry/axiom.js';

// Auto-load .env.local or .env for standalone stdio sessions (Cursor, Claude Desktop, Antigravity CLI)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

for (const envFile of ['.env.local', '.env']) {
    const envPath = path.join(projectRoot, envFile);
    if (fs.existsSync(envPath)) {
        if (typeof process.loadEnvFile === 'function') {
            try {
                process.loadEnvFile(envPath);
                break;
            } catch {
                // Fallback to manual parser below
            }
        }
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            for (const line of content.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx > 0) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
            break;
        } catch {
            // Ignore env read failure
        }
    }
}

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
        const result = await executeTool(name, args || {}, {
            source: 'stdio',
            userAgent: 'mcp-stdio-client'
        });
        await flushTelemetry(1500);
        return result;
    } catch (error) {
        await flushTelemetry(1500);
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

server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
        resourceTemplates: []
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
