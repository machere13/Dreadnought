// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCatalog } from './queryFixtures';

const cliPath = fileURLToPath(new URL('../src/query.mjs', import.meta.url));
let root: string;
let catalogPath: string;
function run(...args: string[]) {
  const child = spawnSync(process.execPath, [cliPath, ...args], {cwd: root, encoding: 'utf8'});
  expect(child.error).toBeUndefined();
  return {status: child.status, payload: JSON.parse(child.stdout), lines: child.stdout.trim().split(/\r?\n/)};
}
beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), 'dreadnought cli space '));
  catalogPath = path.join(root, 'catalog with spaces.json');
  writeFileSync(catalogPath, JSON.stringify(makeCatalog()));
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({name: 'consumer'}));
  const pkg = path.join(root, 'node_modules', '@dreadnought', 'ui');
  mkdirSync(pkg, {recursive: true});
  writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({name: '@dreadnought/ui', version: '0.1.0'}));
});
afterAll(() => rmSync(root, {recursive: true, force: true}));

describe('JSON catalog CLI', () => {
  it('returns one JSON result from an external working directory and a path with spaces', () => {
    const result = run('list', '--catalog', catalogPath, '--limit', '1');
    expect(result).toMatchObject({status: 0, payload: {responseVersion: 1, operation: 'list',
      compatibility: {status: 'unchecked'}, result: {limit: 1, total: 1}}});
    expect(result.lines).toHaveLength(1);
    expect(run('search', 'missing', '--catalog', catalogPath).payload.result.total).toBe(0);
  });

  it('supports get and checked project reports', () => {
    expect(run('get', 'Button', '--catalog', catalogPath, '--binding', 'react-ui', '--section', 'api', '--project', root).payload.result.binding.importPath)
      .toBe('@dreadnought/ui/react');
    expect(run('check', '--catalog', catalogPath, '--project', root).payload.compatibility.status).toBe('compatible');
  });

  it.each([
    ['--limit', '0'], ['--limit', '1.5'], ['--offset', '-1'], ['--unknown', 'x'],
  ])('rejects invalid %s %s', (flag, value) => {
    const result = run('list', '--catalog', catalogPath, flag, value);
    expect(result.status).toBe(1);
    expect(result.payload.error.code).toBe('INVALID_ARGUMENTS');
    expect(result.lines).toHaveLength(1);
  });

  it('rejects duplicate flags, missing values and unexpected positional arguments', () => {
    for (const args of [
      ['list', '--catalog', catalogPath, '--limit', '1', '--limit', '2'],
      ['list', '--catalog'],
      ['list', '--catalog', catalogPath, 'extra'],
    ]) {
      expect(run(...args).payload.error.code).toBe('INVALID_ARGUMENTS');
    }
  });

  it('returns an incompatible check report with nonzero exit', () => {
    const pkg = path.join(root, 'node_modules', '@dreadnought', 'ui', 'package.json');
    writeFileSync(pkg, JSON.stringify({name: '@dreadnought/ui', version: '0.2.0'}));
    const result = run('check', '--catalog', catalogPath, '--project', root);
    expect(result.status).toBe(1);
    expect(result.payload.compatibility.mismatches).toEqual([{name: '@dreadnought/ui', expected: '0.1.0', actual: '0.2.0'}]);
    writeFileSync(pkg, JSON.stringify({name: '@dreadnought/ui', version: '0.1.0'}));
  });

  it('classifies malformed catalog entries without exposing an internal error', () => {
    const badPath = path.join(root, 'malformed.json');
    const bad = makeCatalog();
    (bad.entries as any)[0] = null;
    writeFileSync(badPath, JSON.stringify(bad));
    const result = run('list', '--catalog', badPath);
    expect(result.status).toBe(1);
    expect(result.payload.error.code).toBe('INVALID_CATALOG');
    expect(result.lines).toHaveLength(1);
  });
});
