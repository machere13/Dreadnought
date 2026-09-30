// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { prepareCatalogDocs } from '../src/catalog/generateDocData.mjs';

it('projects current catalog properties and keeps compound defaults separate', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'dreadnought-docs-'));
  const binding = (id: string, layer: number, propertyPath: string[], name: string, value: boolean) => ({
    id, layer, propertyPath, defaults: { [name]: value }, propertyDescriptions: { [name]: propertyPath.length ? 'Sidebar option' : 'Root option' },
    examples: [{ code: 'public example' }], contracts: [{ variants: [{ properties: [{ name, type: 'boolean', origin: 'library' }] }] }],
  });
  try {
    const input = path.join(root, 'tools/catalog/dist/catalog.json');
    mkdirSync(path.dirname(input), { recursive: true });
    const catalog = { packageVersions: {}, entries: [{ name: 'Layout', bindings: [binding('react-adapter', 2, [], 'enabled', true), binding('react-ui', 3, [], 'enabled', true), binding('sidebar', 3, ['Sidebar'], 'enabled', false)] }] };
    writeFileSync(input, JSON.stringify(catalog));
    prepareCatalogDocs(root);
    const readRows = () => JSON.parse(readFileSync(path.join(root, 'apps/docs/src/generated/catalog-docs.json'), 'utf8')).components.layout.apiRows;
    expect(readRows()).toEqual([['enabled', 'boolean', 'true', 'Root option'], ['Layout.Sidebar.enabled', 'boolean', 'false', 'Sidebar option']]);
    catalog.entries[0].bindings = [binding('react-adapter', 2, [], 'renamed', true), binding('react-ui', 3, [], 'renamed', true)];
    writeFileSync(input, JSON.stringify(catalog));
    prepareCatalogDocs(root);
    expect(readRows()).toEqual([['renamed', 'boolean', 'true', 'Root option']]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
