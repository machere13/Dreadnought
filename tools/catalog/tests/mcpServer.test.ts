// @vitest-environment node
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {spawn, spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createInterface} from 'node:readline';
import {makeCatalog} from './queryFixtures';
import {executeQuery} from '../src/query/executeQuery.mjs';
import {createContext} from '../src/compiler.mjs';
import {generateCatalog} from '../src/generateCatalog.mjs';
import {readMetadata} from '../src/metadata.mjs';
import {components, packages} from '../src/config.mjs';

const serverPath = fileURLToPath(new URL('../src/mcp.mjs', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
vi.setConfig({testTimeout: 120_000, hookTimeout: 120_000});
let projectPath: string;
let catalogPath: string;
beforeAll(() => {
  projectPath = mkdtempSync(path.join(tmpdir(), 'dreadnought mcp client '));
  catalogPath = path.join(projectPath, 'catalog with spaces.json');
  writeFileSync(catalogPath, JSON.stringify(makeCatalog()));
  writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify({name: 'consumer'}));
  const pkg = path.join(projectPath, 'node_modules', '@dreadnought', 'ui');
  mkdirSync(pkg, {recursive: true});
  writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({name: '@dreadnought/ui', version: '0.1.0'}));
});
afterAll(() => rmSync(projectPath, {recursive: true, force: true}));

async function withClient(catalog: string, project: string, use: (client: Client) => Promise<void>) {
  const client = new Client({name: 'catalog-test', version: '1.0.0'});
  const transport = new StdioClientTransport({command: process.execPath,
    args: [serverPath, '--catalog', catalog, '--project', project]});
  try {
    await client.connect(transport);
    await use(client);
  } finally {
    await client.close();
  }
}
function install(name: string, version: string) {
  const dir = path.join(projectPath, 'node_modules', ...name.split('/'));
  mkdirSync(dir, {recursive: true});
  writeFileSync(path.join(dir, 'package.json'), JSON.stringify({name, version}));
}
function replyPayload(reply: any) {
  expect(reply.content).toHaveLength(1);
  expect(reply.content[0].type).toBe('text');
  expect(JSON.parse(reply.content[0].text)).toEqual(reply.structuredContent);
  return reply.structuredContent as any;
}

describe('local MCP stdio server', () => {
  it('serves both context formats through real MCP without dropping compatibility', async () => {
    await withClient(catalogPath, projectPath, async client => {
      for (const format of ['usage', 'contract']) {
        const reply = await client.callTool({name:'dreadnought_context',arguments:{components:['Button'],format}});
        expect(reply.isError).toBeUndefined();
        expect(replyPayload(reply)).toMatchObject({compatibility:{status:'compatible'},result:{format}});
      }
    });
  });
  it('keeps stdout empty when startup arguments are invalid', () => {
    const child = spawnSync(process.execPath, [serverPath], {encoding: 'utf8'});
    expect(child.status).toBe(1);
    expect(child.stdout).toBe('');
    expect(child.stderr).toContain('Absolute catalog and project paths are required');
  });
  it('lists five tools and checks the fixed target project', async () => {
    const client = new Client({name: 'catalog-test', version: '1.0.0'});
    const transport = new StdioClientTransport({command: process.execPath,
      args: [serverPath, '--catalog', catalogPath, '--project', projectPath]});
    try {
      await client.connect(transport);
      expect((await client.listTools()).tools.map((tool) => tool.name).sort()).toEqual([
        'dreadnought_check', 'dreadnought_context', 'dreadnought_get', 'dreadnought_list', 'dreadnought_search']);
      const reply = await client.callTool({name: 'dreadnought_check', arguments: {}});
      expect((reply.structuredContent as any).compatibility.status).toBe('compatible');
    } finally {
      await client.close();
    }
  });

  it('emits only JSON-RPC frames on stdout while serving a tool', async () => {
    const child = spawn(process.execPath, [serverPath, '--catalog', catalogPath, '--project', projectPath],
      {stdio: ['pipe', 'pipe', 'ignore']});
    const lines = createInterface({input: child.stdout});
    let checked = false;
    try {
      child.stdin.write(`${JSON.stringify({jsonrpc: '2.0', id: 1, method: 'initialize', params: {
        protocolVersion: '2025-06-18', capabilities: {}, clientInfo: {name: 'stdout-test', version: '1.0.0'},
      }})}\n`);
      for await (const line of lines) {
        const message = JSON.parse(line);
        expect(message.jsonrpc).toBe('2.0');
        if (message.id === 1) {
          expect(message.result.serverInfo.name).toBe('dreadnought-catalog');
          child.stdin.write(`${JSON.stringify({jsonrpc: '2.0', method: 'notifications/initialized'})}\n`);
          child.stdin.write(`${JSON.stringify({jsonrpc: '2.0', id: 2, method: 'tools/call',
            params: {name: 'dreadnought_check', arguments: {}}})}\n`);
        } else if (message.id === 2) {
          expect(message.result.structuredContent.compatibility.status).toBe('compatible');
          checked = true;
          break;
        }
      }
      expect(checked).toBe(true);
    } finally {
      lines.close();
      child.stdin.end();
      child.kill();
    }
  });

  it('exposes list, search and get with payload parity and no injected path', async () => {
    await withClient(catalogPath, projectPath, async (client) => {
      const list = await client.callTool({name: 'dreadnought_list', arguments: {limit: 1}});
      expect(replyPayload(list)).toEqual(executeQuery({operation: 'list', catalogPath, projectPath, options: {limit: 1}}));
      const search = await client.callTool({name: 'dreadnought_search', arguments: {query: 'missing'}});
      expect(replyPayload(search).result.total).toBe(0);
      const get = await client.callTool({name: 'dreadnought_get', arguments: {component: 'Button', binding: 'react-ui', section: 'api'}});
      expect(replyPayload(get).result.binding.importPath).toBe('@dreadnought/ui/react');
      for (const injected of [{projectPath: path.join(projectPath, 'other')}, {catalogPath: path.join(projectPath, 'other.json')}]) {
        expect((await client.callTool({name: 'dreadnought_list', arguments: injected})).isError).toBe(true);
      }
      expect(replyPayload(await client.callTool({name: 'dreadnought_check', arguments: {}})).compatibility.status).toBe('compatible');
    });
  });

  it('rejects invalid filters at the tool boundary', async () => {
    await withClient(catalogPath, projectPath, async (client) => {
      for (const [name, args] of [
        ['dreadnought_list', {limit: 0}],
        ['dreadnought_list', {layer: 1.5}],
        ['dreadnought_get', {component: 'Button', section: 'other'}],
        ['dreadnought_search', {}],
      ] as const) {
        expect((await client.callTool({name, arguments: args})).isError).toBe(true);
      }
    });
  });

  it('checks missing, partial and mismatched installations without caching', async () => {
    await withClient(catalogPath, projectPath, async (client) => {
      const uiManifest = path.join(projectPath, 'node_modules', '@dreadnought', 'ui', 'package.json');
      try {
        rmSync(path.dirname(uiManifest), {recursive: true, force: true});
        const missing = replyPayload(await client.callTool({name: 'dreadnought_check', arguments: {}}));
        expect(missing.compatibility.status).toBe('incompatible');
        expect(missing.compatibility.missing).toContain('@dreadnought/ui');
        const noPackages = replyPayload(await client.callTool({name: 'dreadnought_list', arguments: {}}));
        expect(noPackages.error.code).toBe('NO_PACKAGES');
        install('@dreadnought/core', '0.1.0');
        const partial = replyPayload(await client.callTool({name: 'dreadnought_check', arguments: {}}));
        expect(partial.compatibility.status).toBe('compatible');
        const missingBinding = await client.callTool({name: 'dreadnought_get', arguments: {component: 'Button', binding: 'react-ui', section: 'api'}});
        expect(missingBinding.isError).toBe(true);
        expect(replyPayload(missingBinding).error.code).toBe('MISSING_BINDING_PACKAGE');
        install('@dreadnought/ui', '0.2.0');
        expect(replyPayload(await client.callTool({name: 'dreadnought_check', arguments: {}})).compatibility.mismatches)
          .toEqual([{name: '@dreadnought/ui', expected: '0.1.0', actual: '0.2.0'}]);
        for (const [name, args] of [
          ['dreadnought_list', {}], ['dreadnought_search', {query: 'Button'}],
          ['dreadnought_get', {component: 'Button'}],
        ] as const) {
          const reply = await client.callTool({name, arguments: args});
          expect(reply.isError).toBe(true);
          expect(replyPayload(reply).error.code).toBe('VERSION_MISMATCH');
        }
      } finally {
        rmSync(path.join(projectPath, 'node_modules', '@dreadnought', 'core'), {recursive: true, force: true});
        install('@dreadnought/ui', '0.1.0');
      }
    });
  });

  it('rereads changed and malformed catalog files during one connection', async () => {
    await withClient(catalogPath, projectPath, async (client) => {
      try {
        expect(replyPayload(await client.callTool({name: 'dreadnought_list', arguments: {}})).result.total).toBe(1);
        const modified = makeCatalog();
        modified.entries[0].name = 'RenamedButton';
        writeFileSync(catalogPath, JSON.stringify(modified));
        expect(replyPayload(await client.callTool({name: 'dreadnought_list', arguments: {}})).result.items[0].name).toBe('RenamedButton');
        writeFileSync(catalogPath, '{');
        const invalid = await client.callTool({name: 'dreadnought_list', arguments: {}});
        expect(invalid.isError).toBe(true);
        expect(replyPayload(invalid).error.code).toBe('INVALID_JSON');
        writeFileSync(catalogPath, JSON.stringify(makeCatalog()));
        expect(replyPayload(await client.callTool({name: 'dreadnought_list', arguments: {}})).result.items[0].name).toBe('Button');
      } finally {
        writeFileSync(catalogPath, JSON.stringify(makeCatalog()));
      }
    });
  });
});

describe('generated catalog over MCP', () => {
  let generatedCatalogPath: string;
  beforeAll(() => {
    const catalog = generateCatalog(createContext(repoRoot, packages), readMetadata(repoRoot, components));
    generatedCatalogPath = path.join(projectPath, 'generated.json');
    writeFileSync(generatedCatalogPath, JSON.stringify(catalog));
  });
  it('preserves ref variants, compound exports, examples and component tokens', async () => {
    await withClient(generatedCatalogPath, projectPath, async (client) => {
      const api = replyPayload(await client.callTool({name: 'dreadnought_get', arguments: {
        component: 'Button', binding: 'react-ui', section: 'api', property: 'ref', includeInherited: true}}));
      const refs = api.result.contracts[0].variants.map((variant: any) => variant.properties[0].type);
      expect(refs).toEqual(expect.arrayContaining([expect.stringContaining('HTMLButtonElement'), expect.stringContaining('HTMLAnchorElement')]));
      const sidebar = replyPayload(await client.callTool({name: 'dreadnought_get', arguments: {
        component: 'Layout', binding: 'react-ui-sidebar', section: 'api'}}));
      expect(sidebar.result.binding.propertyPath).toEqual(['Sidebar']);
      expect(replyPayload(await client.callTool({name: 'dreadnought_get', arguments: {
        component: 'Button', binding: 'react-ui', section: 'examples'}})).result.examples.length).toBeGreaterThan(0);
      expect(replyPayload(await client.callTool({name: 'dreadnought_get', arguments: {
        component: 'Button', section: 'tokens'}})).result.tokens.length).toBeGreaterThan(0);
      expect(replyPayload(await client.callTool({name: 'dreadnought_list', arguments: {framework: 'angular'}})).result.total).toBe(0);
    });
  });
});
