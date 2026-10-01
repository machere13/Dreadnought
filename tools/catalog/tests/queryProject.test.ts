// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkProject, requireBindingPackage } from '../src/query/index.mjs';
import { makeCatalog } from './queryFixtures';

const roots: string[] = [];
function project() {
  const root = mkdtempSync(path.join(tmpdir(), 'dreadnought-project-'));
  roots.push(root);
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({name: 'consumer', dependencies: {'@dreadnought/core': '^9.0.0'}}));
  return root;
}
function install(root: string, name: string, version: string, extra = {}) {
  const directory = path.join(root, 'node_modules', ...name.split('/'));
  mkdirSync(directory, {recursive: true});
  writeFileSync(path.join(directory, 'package.json'), JSON.stringify({name, version, ...extra}));
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, {recursive: true, force: true});
});

describe('target project compatibility', () => {
  it('reads installed versions rather than dependency ranges or tool packages', () => {
    const root = project();
    install(root, '@dreadnought/core', '0.1.0', {exports: {'.': './index.js'}});
    const report = checkProject(makeCatalog(), root);
    expect(report).toMatchObject({status: 'compatible', installed: {'@dreadnought/core': '0.1.0'}, mismatches: []});
    expect(report.missing).toContain('@dreadnought/ui');
    expect(() => requireBindingPackage(report, {importPath: '@dreadnought/ui/react'}))
      .toThrow(expect.objectContaining({code: 'MISSING_BINDING_PACKAGE'}));
  });

  it('marks mismatched and absent packages incompatible', () => {
    const root = project();
    expect(checkProject(makeCatalog(), root).status).toBe('incompatible');
    install(root, '@dreadnought/core', '0.2.0');
    expect(checkProject(makeCatalog(), root).mismatches).toEqual([{name: '@dreadnought/core', expected: '0.1.0', actual: '0.2.0'}]);
  });

  it('follows pnpm-like links to a real manifest without importing package code', () => {
    const root = project();
    const target = path.join(root, '.pnpm', 'core', 'node_modules', '@dreadnought', 'core');
    mkdirSync(target, {recursive: true});
    writeFileSync(path.join(target, 'package.json'), JSON.stringify({name: '@dreadnought/core', version: '0.1.0', exports: {'.': './broken.js'}}));
    const link = path.join(root, 'node_modules', '@dreadnought', 'core');
    mkdirSync(path.dirname(link), {recursive: true});
    symlinkSync(target, link, 'junction');
    expect(checkProject(makeCatalog(), root).installed['@dreadnought/core']).toBe('0.1.0');
  });

  it('rejects unsupported PnP resolution and an invalid project path', () => {
    const root = project();
    writeFileSync(path.join(root, '.pnp.cjs'), '');
    expect(() => checkProject(makeCatalog(), root)).toThrow(expect.objectContaining({code: 'UNSUPPORTED_RESOLUTION'}));
    expect(() => checkProject(makeCatalog(), path.join(root, 'missing'))).toThrow(expect.objectContaining({code: 'PROJECT_READ_FAILED'}));
  });

  it('can find a dependency installed in a parent workspace node_modules', () => {
    const workspace = project();
    const child = path.join(workspace, 'apps', 'website');
    mkdirSync(child, {recursive: true});
    writeFileSync(path.join(child, 'package.json'), JSON.stringify({name: 'website'}));
    install(workspace, '@dreadnought/core', '0.1.0');
    expect(checkProject(makeCatalog(), child).installed['@dreadnought/core']).toBe('0.1.0');
  });
});
