// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalog, loadCatalog } from '../src/query/index.mjs';
import { makeCatalog } from './queryFixtures';

describe('catalog query validation', () => {
  it('accepts a valid catalog', () => {
    const data = makeCatalog();
    expect(validateCatalog(data)).toBe(data);
  });

  it('accepts the generated catalog used by the site', () => {
    const file = fileURLToPath(new URL('../dist/catalog.json', import.meta.url));
    expect(loadCatalog(file).entries).toHaveLength(14);
  });

  it.each([
    ['unsupported schema', (data: ReturnType<typeof makeCatalog>) => { data.schemaVersion = 2; }, 'UNSUPPORTED_SCHEMA'],
    ['duplicate entry', (data: ReturnType<typeof makeCatalog>) => { data.entries.push(structuredClone(data.entries[0])); }, 'INVALID_CATALOG'],
    ['duplicate binding', (data: ReturnType<typeof makeCatalog>) => { data.entries[0].bindings.push(structuredClone(data.entries[0].bindings[0])); }, 'INVALID_CATALOG'],
    ['non-array properties', (data: ReturnType<typeof makeCatalog>) => { (data.entries[0].bindings[0].contracts[0].variants[0] as any).properties = {}; }, 'INVALID_CATALOG'],
    ['non-string code', (data: ReturnType<typeof makeCatalog>) => { (data.entries[0].bindings[0].examples as any).push({id: 'bad', code: 42}); }, 'INVALID_CATALOG'],
    ['unknown package', (data: ReturnType<typeof makeCatalog>) => { (data.entries[0].bindings[0] as any).importPath = '@unknown/ui'; }, 'INVALID_CATALOG'],
    ['private import', (data: ReturnType<typeof makeCatalog>) => { data.entries[0].bindings[0].importPath = '@dreadnought/ui/src/Button.tsx'; }, 'INVALID_CATALOG'],
    ['bad token', (data: ReturnType<typeof makeCatalog>) => { (data.entries[0].tokens as any).push({name: 'x', value: 3}); }, 'INVALID_CATALOG'],
  ] as const)('rejects %s', (_name, change, code) => {
    const data = makeCatalog();
    change(data);
    expect(() => validateCatalog(data)).toThrow(expect.objectContaining({code}));
  });

  it('classifies file and JSON errors', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dreadnought-catalog-'));
    try {
      expect(() => loadCatalog(path.join(dir, 'absent.json'))).toThrow(expect.objectContaining({code: 'CATALOG_READ_FAILED'}));
      const file = path.join(dir, 'catalog.json');
      writeFileSync(file, '{bad');
      expect(() => loadCatalog(file)).toThrow(expect.objectContaining({code: 'INVALID_JSON'}));
    } finally {
      rmSync(dir, {recursive: true, force: true});
    }
  });
});
