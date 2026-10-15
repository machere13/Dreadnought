// @vitest-environment node
import { expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import path from 'node:path';
import { parseArgs } from '../src/query/parseArgs.mjs';
import { executeQuery } from '../src/query/executeQuery.mjs';

it('lists published core patterns through the same filters used by CLI and MCP', () => {
  const query = parseArgs(['list', '--kind', 'pattern', '--framework', 'core']);
  const result = executeQuery({ ...query, catalogPath: 'tools/catalog/dist/catalog.json' });
  expect(result.result.items).toEqual([
    expect.objectContaining({
      id: 'pattern:collection-navigation',
      kind: 'pattern',
      name: 'getCollectionNavigation',
      bindings: [expect.objectContaining({ importPath: '@dreadnought/core', layer: 1 })],
    }),
  ]);
});

it('publishes the navigation contract and runnable example for a core pattern', () => {
  const result = executeQuery({
    operation: 'get',
    component: 'pattern:collection-navigation',
    catalogPath: 'tools/catalog/dist/catalog.json',
    options: { binding: 'core', section: 'examples' },
  });
  expect(JSON.stringify(result.result)).toContain('ArrowRight');
});

it('accepts the pattern filter through the MCP protocol', async () => {
  const client = new Client({ name: 'patterns-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      'tools/catalog/src/mcp.mjs',
      '--catalog',
      path.resolve('tools/catalog/dist/catalog.json'),
      '--project',
      path.resolve('apps/docs'),
    ],
  });
  try {
    await client.connect(transport);
    const response = await client.callTool({
      name: 'dreadnought_list',
      arguments: { kind: 'pattern', framework: 'core' },
    });
    expect(response.isError).not.toBe(true);
    expect(response.structuredContent).toMatchObject({
      result: { items: [expect.objectContaining({ id: 'pattern:collection-navigation' })] },
    });
  } finally {
    await client.close();
  }
});
