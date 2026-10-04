// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getContext, getEntry, selectEntries, validateCatalog, parseArgs } from '../src/query/index.mjs';
import { makeCatalog } from './queryFixtures';

function withBranches() {
  const catalog = makeCatalog();
  const binding = catalog.entries[0].bindings[0];
  binding.examples = [{id: 'link', code: '<Button href="/docs" />'}];
  binding.contracts[0].variants = [
    {properties: [
      {name: 'href', type: 'undefined', optional: true, origin: 'library'},
      {name: 'ref', type: 'Ref<HTMLButtonElement>', optional: true, origin: 'library'},
      {name: 'formAction', type: 'string', optional: true, origin: 'dependency'},
    ]},
    {properties: [
      {name: 'href', type: 'string', optional: false, origin: 'library'},
      {name: 'ref', type: 'Ref<HTMLAnchorElement>', optional: true, origin: 'library'},
    ]},
  ] as any;
  catalog.entries.push({
    ...structuredClone(catalog.entries[0]), id: 'component:layout', name: 'Layout', family: 'Layout',
    bindings: [{...structuredClone(binding), id: 'react-ui-sidebar', exportName: 'Layout', propertyPath: ['Sidebar']} as any],
  });
  return catalog;
}

describe('catalog selection', () => {
  it('filters standalone actions and exposes their parameters in bounded core context', () => {
    const catalog = makeCatalog();
    catalog.entries.push({
      ...structuredClone(catalog.entries[0]), id: 'action:copy', kind: 'action', name: 'copy', family: 'Actions',
      composesWith: ['component:button'],
      bindings: [{...structuredClone(catalog.entries[0].bindings[0]), id: 'core', layer: 1, framework: null,
        importPath: '@dreadnought/core', exportName: 'copy', examples: [{id: 'usage', code: "import { copy } from '@dreadnought/core'; await copy('Hello');"}],
        contracts: [{parameters: [{name: 'text', type: 'string', optional: false}], returnType: 'Promise<void>', variants: [{properties: []}]}]}],
    } as any);
    expect(() => validateCatalog(catalog)).not.toThrow();
    expect(selectEntries(catalog, {kind: 'action'}).items.map(item => item.name)).toEqual(['copy']);
    expect(selectEntries(catalog, {kind: 'component'}).items.map(item => item.name)).toEqual(['Button']);
    expect(() => selectEntries(catalog, {kind: 'unknown'})).toThrow(expect.objectContaining({code: 'INVALID_FILTER'}));
    expect(parseArgs(['search', 'copy', '--kind', 'action']).options.kind).toBe('action');
    expect(getEntry(catalog, 'copy')).toMatchObject({kind: 'action', composesWith: ['component:button']});
    const result = getContext(catalog, {components: ['copy'], layer: 1, format: 'contract', maxBytes: 2048});
    expect(result.items[0]).toMatchObject({kind: 'action', composesWith: ['component:button'],
      contracts: [{parameters: [{name: 'text', type: 'string', optional: false}], returnType: 'Promise<void>'}]});
    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThanOrEqual(2048);
    const usage = getContext(catalog, {components: ['copy'], layer: 1});
    expect(usage.items[0].example?.id).toBe('usage');
    expect(usage.items[0].contracts).toBeUndefined();
  });
  it('returns compact context for explicit components without flattening API branches', () => {
    const catalog = withBranches();
    catalog.entries[0].tokens = [{name: '--button-pad', value: '16px'}] as any;
    const result = getContext(catalog, {components: ['Button'], maxBytes: 4096, format: 'contract'});
    expect(result.items[0]).toMatchObject({binding: {importPath: '@dreadnought/ui/react'}, props: ['href', 'ref']});
    expect(result.items[0].variants[0]).toHaveLength(2);
    expect(result.items[0].variants[0][1]).toContainEqual({name: 'href', type: 'string', required: true});
    expect(JSON.stringify(result)).not.toContain('formAction');
    expect(result.items[0].tokens).toBeUndefined();
    expect(getContext(catalog, {components: ['Button'], includeTokens: true}).items[0].tokens)
      .toEqual(['--button-pad']);
  });

  it('caps context bytes and signals omitted detail', () => {
    const catalog = withBranches();
    catalog.entries[0].bindings[0].examples = [{id: 'long', code: 'x'.repeat(2000)}];
    const result = getContext(catalog, {components: ['Button'], maxBytes: 700, format: 'contract'});
    expect(Buffer.byteLength(JSON.stringify(result), 'utf8')).toBeLessThanOrEqual(700);
    expect(result.truncated).toBe(true);
    expect(result.items[0].example).toBeUndefined();
    catalog.entries[0].description = 'x'.repeat(500);
    expect(() => getContext(catalog, {components: ['Button'], maxBytes: 256, format: 'contract'}))
      .toThrow(expect.objectContaining({code: 'BUDGET_TOO_SMALL'}));
  });

  it('shows the compound example for a component with public compound parts', () => {
    const catalog = withBranches();
    const binding = catalog.entries[1].bindings[0];
    binding.examples = [
      {id: 'basic', code: '<Layout items={[]} />'},
      {id: 'compound', code: '<Layout><Layout.Sidebar>Menu</Layout.Sidebar></Layout>'},
    ];
    binding.propertyPath = undefined;
    catalog.entries[1].bindings.push({...structuredClone(binding), id: 'react-ui-sidebar', propertyPath: ['Sidebar']});
    const result = getContext(catalog, {components: ['Layout'], maxBytes: 4096});
    expect(result.items[0].example).toEqual({id: 'compound', code: '<Layout><Layout.Sidebar>Menu</Layout.Sidebar></Layout>'});
  });

  it('rejects unknown components and unavailable framework bindings', () => {
    const catalog = withBranches();
    expect(() => getContext(catalog, {components: ['Missing']})).toThrow(expect.objectContaining({code: 'UNKNOWN_COMPONENT'}));
    expect(() => getContext(catalog, {components: ['Button'], framework: 'angular'}))
      .toThrow(expect.objectContaining({code: 'UNKNOWN_BINDING'}));
  });

  it('filters layer and framework on the same binding and ranks exact names', () => {
    const catalog = withBranches();
    expect(selectEntries(catalog, {query: 'button'}).items.map((item: any) => item.name)).toEqual(['Button']);
    expect(selectEntries(catalog, {layer: 3, framework: 'angular'}).total).toBe(0);
    expect(selectEntries(catalog, {layer: 3, framework: 'core'}).total).toBe(0);
    expect(selectEntries(catalog, {family: 'Layout'}).items[0].name).toBe('Layout');
    expect(selectEntries(catalog, {query: 'nonexistent'}).total).toBe(0);
    expect(selectEntries(catalog, {limit: 1, offset: 1}).items).toHaveLength(1);
  });

  it('preserves both Button branches when filtering one property', () => {
    const catalog = withBranches();
    const before = structuredClone(catalog);
    const result = getEntry(catalog, 'Button', {binding: 'react-ui', section: 'api', property: 'ref'});
    expect(result.contracts[0].variants.map((variant: any) => variant.properties[0].type))
      .toEqual(['Ref<HTMLButtonElement>', 'Ref<HTMLAnchorElement>']);
    expect(catalog).toEqual(before);
  });

  it('reports filtered inherited props and preserves an absent branch', () => {
    const catalog = withBranches();
    expect(() => getEntry(catalog, 'Button', {binding: 'react-ui', section: 'api', property: 'formAction'}))
      .toThrow(expect.objectContaining({code: 'PROPERTY_FILTERED'}));
    const result = getEntry(catalog, 'Button', {binding: 'react-ui', section: 'api', property: 'formAction', includeInherited: true});
    expect(result.contracts[0].variants.map((variant: any) => variant.propertyPresent)).toEqual([true, false]);
  });

  it('reads examples, tokens and compound exports without inventing bindings', () => {
    const catalog = withBranches();
    expect(getEntry(catalog, 'Layout', {binding: 'react-ui-sidebar', section: 'api'}).binding.propertyPath).toEqual(['Sidebar']);
    expect(getEntry(catalog, 'Button', {binding: 'react-ui', section: 'examples'}).examples).toHaveLength(1);
    expect(getEntry(catalog, 'Button', {section: 'tokens'}).scope).toBe('component');
    expect(() => getEntry(catalog, 'Button', {binding: 'missing', section: 'api'})).toThrow(expect.objectContaining({code: 'UNKNOWN_BINDING'}));
    expect(() => getEntry(catalog, 'Missing')).toThrow(expect.objectContaining({code: 'UNKNOWN_COMPONENT'}));
  });
});
