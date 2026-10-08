// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { prepareCatalogDocs } from '../src/catalog/generateDocData.mjs';
import ts from 'typescript';

it('derives nested table properties from public types without rewriting the catalog', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'dreadnought-nested-api-'));
  const input = path.join(root, 'tools/catalog/dist/catalog.json');
  const source = path.join(root, 'public.ts');
  try {
    mkdirSync(path.dirname(input), { recursive: true });
    const contract = { variants: [{ properties: [{ name: 'columns', type: 'TableColumn[]', origin: 'library' }] }] };
    const catalog = JSON.stringify({ packageVersions: {}, entries: [{ kind: 'component', name: 'Table', bindings: [
      { id: 'react-adapter', layer: 2, exportName: 'TableAdapter', examples: [{ code: '<TableAdapter />' }], contracts: [contract] },
      { id: 'react-ui', layer: 3, exportName: 'Table', examples: [{ code: '<Table />' }], contracts: [contract] },
    ] }] });
    writeFileSync(input, catalog);
    const definitions = 'export type TableColumn = { key: string; width?: number; sortOrder?: "ascend" | null };\n' +
      ['TablePagination', 'TableRowSelection', 'TableExpandable', 'TableFilterDropdownProps', 'TableFilterOption', 'TableFilterSlots']
        .map(name => `export type ${name} = {};`).join('\n');
    writeFileSync(source, definitions);
    const generate = () => {
      const program = ts.createProgram([source], { strict: true });
      prepareCatalogDocs(root, { program, checker: program.getTypeChecker(), entries: new Map([['@dreadnought/ui/react', source]]) });
      return JSON.parse(readFileSync(path.join(root, 'apps/docs/src/generated/catalog-docs.json'), 'utf8')).components.table;
    };
    const rows = generate().apiGroups[0].rows;
    expect(rows.slice(0, 2).map((row: string[]) => row.slice(0, 2))).toEqual([['key', 'string'], ['width', 'number']]);
    expect(rows[2][1]).toContain('null');
    expect(rows[2][1]).not.toContain('undefined');
    writeFileSync(source, definitions.replace('width?: number', 'width?: string'));
    expect(generate().apiGroups[0].rows[1][1]).toBe('string');
    expect(readFileSync(input, 'utf8')).toBe(catalog);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('does not project a core function default onto a controlled React prop', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'dreadnought-pagination-docs-'));
  const input = path.join(root, 'tools/catalog/dist/catalog.json');
  const contract = { variants: [{ properties: [
    { name: 'current', type: 'number', origin: 'library' },
    { name: 'defaultCurrent', type: 'number', origin: 'library' },
  ] }] };
  const catalog = { packageVersions: {}, entries: [{ kind: 'component', name: 'Pagination', bindings: [
    { id: 'core', layer: 1, exportName: 'getPaginationState', defaults: { current: 1 }, examples: [{ code: 'getPaginationState({ total: 20 })' }], contracts: [] },
    { id: 'react-adapter', layer: 2, exportName: 'PaginationAdapter', defaults: { defaultCurrent: 1 }, examples: [{ code: '<PaginationAdapter total={20} />' }], contracts: [contract] },
    { id: 'react-ui', layer: 3, exportName: 'Pagination', defaults: { defaultCurrent: 1 }, examples: [{ code: '<Pagination total={20} />' }], contracts: [contract] },
  ] }] };
  try {
    mkdirSync(path.dirname(input), { recursive: true });
    writeFileSync(input, JSON.stringify(catalog));
    prepareCatalogDocs(root);
    const doc = JSON.parse(readFileSync(path.join(root, 'apps/docs/src/generated/catalog-docs.json'), 'utf8')).components.pagination;
    expect(doc.apiRows.map((row: string[]) => [row[0], row[2]])).toEqual([['current', '—'], ['defaultCurrent', '1']]);
    expect(doc.logicCode).toBe('getPaginationState({ total: 20 })');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('keeps a separately exported viewport API distinct from its toast', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'dreadnought-docs-viewport-'));
  const binding = (id: string, layer: number, exportName: string, name: string, origin: string) => ({
    id, layer, exportName, propertyDescriptions: { [name]: name }, defaults: {}, examples: [{ code: 'public example' }],
    contracts: [{ variants: [{ properties: [{ name, type: 'string', origin }, { name: 'title', type: 'string', origin: 'native' }] }] }],
  });
  try {
    const input = path.join(root, 'tools/catalog/dist/catalog.json');
    mkdirSync(path.dirname(input), { recursive: true });
    writeFileSync(input, JSON.stringify({ packageVersions: {}, entries: [{ kind: 'component', name: 'Toast', bindings: [
      binding('react-adapter', 2, 'ToastAdapter', 'title', 'library'),
      binding('react-ui', 3, 'Toast', 'title', 'library'),
      binding('react-ui-viewport', 3, 'ToastViewport', 'placement', 'library'),
    ] }] }));
    prepareCatalogDocs(root);
    const rows = JSON.parse(readFileSync(path.join(root, 'apps/docs/src/generated/catalog-docs.json'), 'utf8')).components.toast.apiRows;
    expect(rows.map((row: string[]) => row[0])).toEqual(['title', 'ToastViewport.placement']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('projects adapter-only API and related core without claiming a ready component', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'dreadnought-docs-l2-'));
  const input = path.join(root, 'tools/catalog/dist/catalog.json');
  const adapter = { id: 'react-adapter', layer: 2, examples: [{ code: 'RadarChartAdapter' }], defaults: {}, propertyDescriptions: { label: 'Название' },
    contracts: [{ variants: [{ properties: [{ name: 'label', type: 'string', origin: 'library' },
      { name: 'children', type: 'undefined', origin: 'library' }] }] }] };
  const catalog = { packageVersions: {}, entries: [
    { id: 'component:radar-chart', kind: 'component', name: 'RadarChart', composesWith: ['domain:build-radar-layout'], bindings: [adapter] },
    { id: 'domain:build-radar-layout', kind: 'domain', bindings: [{ id: 'core', layer: 1, examples: [{ code: 'buildRadarLayout' }] }] },
  ] };
  try {
    mkdirSync(path.dirname(input), { recursive: true }); writeFileSync(input, JSON.stringify(catalog));
    prepareCatalogDocs(root);
    const doc = JSON.parse(readFileSync(path.join(root, 'apps/docs/src/generated/catalog-docs.json'), 'utf8')).components.radarchart;
    expect(doc).toEqual({ adapterCode: 'RadarChartAdapter', logicCode: 'buildRadarLayout', apiRows: [['label', 'string', '—', 'Название']] });
    catalog.entries[0].bindings.push({ ...adapter, id: 'react-ui', layer: 3, examples: [] });
    writeFileSync(input, JSON.stringify(catalog));
    expect(() => prepareCatalogDocs(root)).toThrow('Missing documentation example: RadarChart');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('projects current catalog properties and keeps compound defaults separate', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'dreadnought-docs-'));
  const binding = (id: string, layer: number, propertyPath: string[], name: string, value: boolean) => ({
    id, layer, propertyPath, defaults: { [name]: value }, propertyDescriptions: { [name]: propertyPath.length ? 'Sidebar option' : 'Root option' },
    examples: [{ code: 'public example' }], contracts: [{ variants: [{ properties: [{ name, type: 'boolean', origin: 'library' }] }] }],
  });
  try {
    const input = path.join(root, 'tools/catalog/dist/catalog.json');
    mkdirSync(path.dirname(input), { recursive: true });
    const catalog = { packageVersions: {}, entries: [{ kind: 'component', name: 'Layout', bindings: [binding('react-adapter', 2, [], 'enabled', true), binding('react-ui', 3, [], 'enabled', true), binding('sidebar', 3, ['Sidebar'], 'enabled', false)] }, {kind: 'action', name: 'copy', bindings: []}] };
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
