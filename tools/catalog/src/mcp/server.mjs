import {McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {invokeCatalog} from './invoke.mjs';

const nonempty = z.string().trim().min(1);
const listShape = {
  family: nonempty.optional(),
  layer: z.number().int().min(1).max(3).optional(),
  framework: nonempty.optional(),
  limit: z.number().int().min(1).max(50).optional(),
  offset: z.number().int().nonnegative().optional(),
};

export function createCatalogMcpServer(config) {
  const server = new McpServer({name: 'dreadnought-catalog', version: '0.1.0'}, {capabilities: {tools: {}}});
  server.registerTool('dreadnought_check', {
    description: 'Check installed versions of Dreadnought packages against this local catalog',
    inputSchema: z.object({}).strict(),
  }, async () => invokeCatalog('check', {}, config));
  server.registerTool('dreadnought_list', {
    description: 'List bindings in the local catalog after checking installed versions; framework core is layer 1',
    inputSchema: z.object(listShape).strict(),
  }, async (args) => invokeCatalog('list', args, config));
  server.registerTool('dreadnought_search', {
    description: 'Search local catalog bindings after checking installed versions; framework core is layer 1',
    inputSchema: z.object({query: nonempty, ...listShape}).strict(),
  }, async (args) => invokeCatalog('search', args, config));
  server.registerTool('dreadnought_get', {
    description: 'Read a component section from the local catalog after checking installed versions; API and examples require an explicit binding',
    inputSchema: z.object({
      component: nonempty,
      binding: nonempty.optional(),
      section: z.enum(['overview', 'api', 'examples', 'tokens']).optional(),
      property: nonempty.optional(),
      example: nonempty.optional(),
      includeInherited: z.boolean().optional(),
    }).strict(),
  }, async (args) => invokeCatalog('get', args, config));
  server.registerTool('dreadnought_context', {
    description: 'Get checked usage examples and partial primitive prop hints for selected components in one request. format contract adds library API branches; get reads exact or inherited details.',
    inputSchema: z.object({
      components: z.array(nonempty).min(1).max(10),
      layer: z.number().int().min(1).max(3).optional(),
      framework: nonempty.optional(),
      maxBytes: z.number().int().min(1024).max(32768).optional(),
      includeTokens: z.boolean().optional(),
      format: z.enum(['usage', 'contract']).optional(),
    }).strict(),
  }, async (args) => invokeCatalog('context', args, config));
  return server;
}
