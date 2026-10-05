import {McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {invokeCatalog} from './invoke.mjs';

const nonempty = z.string().trim().min(1);
const listShape = {
  kind: z.enum(['component', 'action', 'behavior', 'domain']).optional(),
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
    description: 'List components, actions, behaviors or domains with kind filter. Standalone core capabilities use layer 1 and framework core. Checks installed versions.',
    inputSchema: z.object(listShape).strict(),
  }, async (args) => invokeCatalog('list', args, config));
  server.registerTool('dreadnought_search', {
    description: 'Search components, standalone actions, behaviors or domains by name or purpose; narrow with kind. Framework core is layer 1. Checks installed versions.',
    inputSchema: z.object({query: nonempty, ...listShape}).strict(),
  }, async (args) => invokeCatalog('search', args, config));
  server.registerTool('dreadnought_get', {
    description: 'Read any catalog entry by name or id; component accepts component, action, behavior and domain names. Overview includes constraints and composition links. API/examples require an explicit binding (core for actions/behaviors/domains). Checks installed versions.',
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
    description: 'Get checked examples for selected entries; components accepts component, action, behavior and domain names. Use layer 1 for standalone core capabilities: examples, constraints and composition links. format contract adds signatures and API branches. Replies are byte-bounded and may be partial.',
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
