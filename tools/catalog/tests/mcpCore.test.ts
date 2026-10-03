// @vitest-environment node
import {afterEach, describe, expect, it} from 'vitest';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parseServerArgs} from '../src/mcp/config.mjs';
import {invokeCatalog} from '../src/mcp/invoke.mjs';
import {makeCatalog} from './queryFixtures';

const roots: string[] = [];
function fixture(version = '0.1.0') {
  const projectPath = mkdtempSync(path.join(tmpdir(), 'dreadnought mcp project '));
  roots.push(projectPath);
  const catalogPath = path.join(projectPath, 'catalog with spaces.json');
  writeFileSync(catalogPath, JSON.stringify(makeCatalog()));
  writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify({name: 'consumer'}));
  const pkg = path.join(projectPath, 'node_modules', '@dreadnought', 'ui');
  mkdirSync(pkg, {recursive: true});
  writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({name: '@dreadnought/ui', version}));
  return {catalogPath, projectPath};
}
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, {recursive: true, force: true}); });

describe('MCP startup paths', () => {
  it('accepts absolute paths with spaces in either order', () => {
    const paths = fixture();
    expect(parseServerArgs(['--catalog', paths.catalogPath, '--project', paths.projectPath])).toEqual(paths);
    expect(parseServerArgs(['--project', paths.projectPath, '--catalog', paths.catalogPath])).toEqual(paths);
  });
  it.each([
    ['--catalog', 'relative.json', '--project', 'C:\\project'],
    ['--catalog', '', '--project', 'C:\\project'],
    ['--catalog', 'C:\\catalog', '--catalog', 'C:\\other', '--project', 'C:\\project'],
    ['--catalog', 'C:\\catalog', '--unknown', 'C:\\project'],
    ['--catalog', 'C:\\catalog'],
    ['--project', 'C:\\project'],
  ])('rejects invalid startup flags %j', (...args) => {
    expect(() => parseServerArgs(args)).toThrow(expect.objectContaining({code: 'INVALID_ARGUMENTS'}));
  });
  it.skipIf(process.platform !== 'win32')('rejects Windows root-relative paths but accepts a fully qualified UNC path', () => {
    for (const catalogPath of ['\\catalog.json', '/catalog.json']) {
      expect(() => parseServerArgs(['--catalog', catalogPath, '--project', 'C:\\project']))
        .toThrow(expect.objectContaining({code: 'INVALID_ARGUMENTS'}));
    }
    expect(parseServerArgs(['--catalog', '\\\\server\\share\\catalog.json', '--project', 'C:\\project']))
      .toEqual({catalogPath: '\\\\server\\share\\catalog.json', projectPath: 'C:\\project'});
  });
});

describe('MCP catalog reply', () => {
  it('returns identical structured and text payloads for a checked list', () => {
    const reply = invokeCatalog('list', {limit: 1}, fixture());
    expect(reply.isError).toBeUndefined();
    expect(reply.structuredContent).toMatchObject({operation: 'list', result: {limit: 1, total: 1}});
    expect(reply.content).toHaveLength(1);
    expect(JSON.parse(reply.content[0].text)).toEqual(reply.structuredContent);
  });
  it('returns bounded context through MCP and keeps compatibility checks', () => {
    const config = fixture();
    const reply = invokeCatalog('context', {components: ['Button'], maxBytes: 2048}, config);
    expect(reply.isError).toBeUndefined();
    expect(reply.structuredContent.result.items[0].binding.exportName).toBe('Button');
    expect(Buffer.byteLength(reply.content[0].text, 'utf8')).toBeLessThanOrEqual(2048);
    expect(invokeCatalog('context', {components: ['Button']}, fixture('0.2.0')).structuredContent.error.code)
      .toBe('VERSION_MISMATCH');
  });
  it('distinguishes an incompatible check report from rejected list queries', () => {
    const config = fixture('0.2.0');
    const check = invokeCatalog('check', {}, config);
    expect(check.isError).toBeUndefined();
    expect(check.structuredContent.compatibility.status).toBe('incompatible');
    const list = invokeCatalog('list', {}, config);
    expect(list.isError).toBe(true);
    expect(list.structuredContent.error.code).toBe('VERSION_MISMATCH');
  });
  it('reports malformed JSON without a stack trace', () => {
    const config = fixture();
    writeFileSync(config.catalogPath, '{');
    const reply = invokeCatalog('list', {}, config);
    expect(reply.isError).toBe(true);
    expect(reply.structuredContent.error.code).toBe('INVALID_JSON');
    expect(JSON.stringify(reply)).not.toContain('at loadCatalog');
  });
  it('sanitizes an unexpected exception in both MCP response forms', () => {
    const config = {
      get catalogPath() { throw new Error('sensitive internal detail'); },
      projectPath: fixture().projectPath,
    };
    const reply = invokeCatalog('list', {}, config);
    expect(reply.isError).toBe(true);
    expect(reply.structuredContent).toEqual({responseVersion: 1, operation: 'list', error: {
      code: 'INTERNAL_ERROR', message: 'Unexpected catalog error', details: {},
    }});
    expect(reply.content).toEqual([{type: 'text', text: JSON.stringify(reply.structuredContent)}]);
    expect(JSON.stringify(reply)).not.toContain('sensitive internal detail');
  });
});
