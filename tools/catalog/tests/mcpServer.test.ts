// @vitest-environment node
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {makeCatalog} from './queryFixtures';

const serverPath = fileURLToPath(new URL('../src/mcp.mjs', import.meta.url));
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

describe('local MCP stdio server', () => {
  it('keeps stdout empty when startup arguments are invalid', () => {
    const child = spawnSync(process.execPath, [serverPath], {encoding: 'utf8'});
    expect(child.status).toBe(1);
    expect(child.stdout).toBe('');
    expect(child.stderr).toContain('Absolute catalog and project paths are required');
  });
  it('lists four tools and checks the fixed target project', async () => {
    const client = new Client({name: 'catalog-test', version: '1.0.0'});
    const transport = new StdioClientTransport({command: process.execPath,
      args: [serverPath, '--catalog', catalogPath, '--project', projectPath]});
    try {
      await client.connect(transport);
      expect((await client.listTools()).tools.map((tool) => tool.name).sort()).toEqual([
        'dreadnought_check', 'dreadnought_get', 'dreadnought_list', 'dreadnought_search']);
      const reply = await client.callTool({name: 'dreadnought_check', arguments: {}});
      expect((reply.structuredContent as any).compatibility.status).toBe('compatible');
    } finally {
      await client.close();
    }
  });
});
