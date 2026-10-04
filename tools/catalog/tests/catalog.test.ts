// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, readJson } from '../src/compiler.mjs';
import { generateCatalog } from '../src/generateCatalog.mjs';
import { describeContract } from '../src/contracts.mjs';
import { checkExamples } from '../src/examples.mjs';
import { components, packages } from '../src/config.mjs';
import { mergeMetadata, readMetadata } from '../src/metadata.mjs';

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 });
const root = fileURLToPath(new URL('../../../', import.meta.url));
const metadata = readMetadata(root, components);
const temporaryRoots: string[] = [];
let context: ReturnType<typeof createContext>;
let catalog: ReturnType<typeof generateCatalog>;

beforeAll(() => {
  context = createContext(root, packages);
  catalog = generateCatalog(context, metadata);
});

afterAll(() => {
  for (const directory of temporaryRoots) rmSync(directory, { recursive: true, force: true });
});

describe('public catalog', () => {
  it('publishes standalone actions and behaviors with checked public contracts', () => {
    const capabilities = catalog.entries.filter(entry => entry.kind !== 'component');
    expect(capabilities.map(entry => entry.name).sort()).toEqual(['copy', 'download', 'getNextEnabledValue', 'getSelectionValue', 'getTypeaheadValue', 'pickFiles', 'readClipboard']);
    expect(capabilities.every(entry => entry.tokens.length === 0 && entry.bindings.length === 1 && entry.bindings[0].layer === 1)).toBe(true);
    const selection = capabilities.find(entry => entry.name === 'getSelectionValue');
    expect(selection.bindings[0].contracts).toHaveLength(3);
    expect(selection.bindings[0].contracts[0].parameters).toHaveLength(3);
    expect(selection.bindings[0].contracts[0].parameters.slice(0, 2).map(parameter => parameter.name)).toEqual(['current', 'action']);
    expect(selection.composesWith).toContain('behavior:get-next-enabled-value');
    expect(capabilities.find(entry => entry.name === 'readClipboard').bindings[0].contracts[0]).toMatchObject({parameters: [], returnType: 'Promise<string>'});
    const typeahead = capabilities.find(entry => entry.name === 'getTypeaheadValue');
    expect(typeahead.composesWith).toContain('component:menu');
    expect(typeahead.bindings[0].contracts[0].parameters.map(parameter => parameter.name))
      .toEqual(['items', 'currentValue', 'query', 'options']);
    expect(() => checkExamples(context, typeahead.bindings[0].examples)).not.toThrow();
  });

  it('describes a zero-argument action without inventing an options parameter', () => {
    expect(describeContract(context, {importPath: '@dreadnought/core', exportName: 'readClipboard'})[0])
      .toMatchObject({parameters: [], returnType: 'Promise<string>', variants: [{properties: []}]});
  });

  it('exposes options and action branches beyond the first positional argument', () => {
    const selection = describeContract(context, {importPath: '@dreadnought/core', exportName: 'getSelectionValue'})[0];
    expect(selection.parameters[1].variants).toBeDefined();
    expect(selection.parameters[1].variants.flatMap(variant => variant.properties.find(prop => prop.name === 'type')?.values ?? []))
      .toEqual(expect.arrayContaining(['select', 'deselect', 'toggle', 'clear']));
    expect(selection.parameters[2].variants[0].properties.map(prop => prop.name)).toEqual(['disabled', 'disabledValues', 'required']);
    const navigation = describeContract(context, {importPath: '@dreadnought/core', exportName: 'getNextEnabledValue'})[0];
    expect(navigation.parameters[3].variants[0].properties).toContainEqual(expect.objectContaining({name: 'loop', type: 'boolean | undefined', optional: true}));
  });
  it('ships type-checked usage examples for text input, controlled tabs and data tables', () => {
    for (const name of ['Input','Tabs','Table']) {
      const entry = catalog.entries.find(entry => entry.name === name);
      const example = entry.bindings.find(binding => binding.id === 'react-ui').examples.find(example => example.id === 'usage');
      expect(example, name).toBeDefined();
      expect(() => checkExamples(context, [example])).not.toThrow();
    }
  });
  it('keeps the button and anchor contracts distinct, including refs and native props', () => {
    const button = catalog.entries.find((entry) => entry.name === 'Button');
    const variants = button.bindings.find((binding) => binding.id === 'react-ui').contracts[0].variants;
    const action = variants.find((variant) => variant.properties.find((prop) => prop.name === 'href')?.type === 'undefined');
    const link = variants.find((variant) => variant.properties.find((prop) => prop.name === 'href')?.type === 'string');
    expect(variants).toHaveLength(2);
    expect(action.properties.find((prop) => prop.name === 'ref').type).toContain('HTMLButtonElement');
    expect(link.properties.find((prop) => prop.name === 'ref').type).toContain('HTMLAnchorElement');
    expect(link.properties.find((prop) => prop.name === 'href').optional).toBe(false);
    expect(action.properties.find((prop) => prop.name === 'formAction').origin).toBe('dependency');
    expect(link.properties.find((prop) => prop.name === 'type').type).toBe('undefined');
  });

  it('resolves inherited Input props and named literal unions', () => {
    const input = catalog.entries.find((entry) => entry.name === 'Input');
    const properties = input.bindings.find((binding) => binding.id === 'react-ui').contracts[0].variants[0].properties;
    expect(properties.find((prop) => prop.name === 'autoComplete')).toBeDefined();
    expect(properties.find((prop) => prop.name === 'aria-label')).toBeDefined();
    expect(properties.find((prop) => prop.name === 'passwordVisibilityLabels')).toBeDefined();
    expect(properties.find((prop) => prop.name === 'type').values).toEqual(expect.arrayContaining(['text', 'password', 'email']));
    expect(properties.find((prop) => prop.name === 'type').values).not.toContain('number');
  });

  it('extracts theme tokens and only the explicitly listed components', () => {
    const componentEntries = catalog.entries.filter(entry => entry.kind === 'component');
    expect(componentEntries.map((entry) => entry.name)).toEqual(components.map((component) => component.name).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
    expect(componentEntries).toHaveLength(components.length);
    expect(catalog.entries.find((entry) => entry.name === 'Button').tokens).toContainEqual({ name: '--dreadnought-button-primary-bg', value: 'var(--dreadnought-color-action-primary)' });
    expect(componentEntries.every((entry) => entry.tokens.length > 0)).toBe(true);
    expect(catalog.packageVersions['@dreadnought/themes']).toBe(readJson(path.join(root, 'packages/themes/package.json')).version);
  });

  it('produces deterministic JSON without machine-local or internal file paths', () => {
    const serialized = JSON.stringify(catalog);
    expect(JSON.stringify(generateCatalog(context, metadata))).toBe(serialized);
    expect(serialized).not.toMatch(/node_modules|[A-Z]:[\\/]|packages\/|\/src\//);
  });

  it('rejects stale export and prop metadata', () => {
    const renamed = structuredClone(metadata);
    renamed[0].bindings[0].exportName = 'removedExport';
    expect(() => generateCatalog(context, renamed)).toThrow('Missing public export');
    const stale = structuredClone(metadata);
    stale[0].bindings[0].propertyDescriptions.renamedProp = 'Устаревшее свойство';
    expect(() => generateCatalog(context, stale)).toThrow('Unknown property metadata');
  });

  it('rejects duplicate IDs and non-public entrypoints', () => {
    expect(() => generateCatalog(context, [metadata[0], metadata[0]])).toThrow('Duplicate entry id');
    const invalid = structuredClone(metadata);
    invalid[0].bindings[0].importPath = '@dreadnought/core/src/index.ts';
    expect(() => generateCatalog(context, invalid)).toThrow('Not an allowed public entry');
  });

  it('rejects layer metadata attached to the wrong component or duplicated binding', () => {
    expect(() => mergeMetadata(metadata[0], [{ componentId: 'component:input', bindings: [] }])).toThrow('Metadata component mismatch');
    const duplicate = structuredClone(metadata);
    duplicate[0].bindings.push(duplicate[0].bindings[0]);
    expect(() => generateCatalog(context, duplicate)).toThrow('Duplicate binding id');
  });

  it('type-checks examples and default values, instead of trusting their text', () => {
    expect(() => checkExamples(context, [{ id: 'wrong-prop', code: "import { Input } from '@dreadnought/ui/react'; const input = <Input type='number' />;" }])).toThrow(/not assignable/);
    expect(() => checkExamples(context, [{ id: 'wrong-ref', code: "import { createRef } from 'react'; import { Button } from '@dreadnought/ui/react'; const link = <Button href='/' ref={createRef<HTMLButtonElement>()} />;" }])).toThrow(/not assignable/);
    const invalid = structuredClone(metadata);
    invalid[0].bindings[3].defaults.variant = 'removed-variant';
    expect(() => generateCatalog(context, invalid)).toThrow(/not assignable/);
  });

  it('rejects private imports and suppressed example errors', () => {
    expect(() => checkExamples(context, [{ id: 'private', code: "import { getButtonState } from './internal.ts';" }])).toThrow('Non-public import');
    expect(() => checkExamples(context, [{ id: 'unchecked', code: '// @ts-nocheck\nconst x: string = 1;' }])).toThrow('Suppressed type check');
  });

  it('extracts compound public members and positional core signatures without synthetic layers', () => {
    const layout = catalog.entries.find((entry) => entry.name === 'Layout');
    expect(layout.bindings.every((binding) => binding.layer !== 1)).toBe(true);
    const sidebar = layout.bindings.find((binding) => binding.id === 'react-ui-sidebar');
    expect(sidebar.propertyPath).toEqual(['Sidebar']);
    expect(sidebar.contracts[0].variants[0].properties.find((prop) => prop.name === 'collapsed').type).toBe('boolean | undefined');
    const table = catalog.entries.find((entry) => entry.name === 'Table');
    expect(table.bindings.find((binding) => binding.id === 'core').contracts[0].parameters.map((parameter) => parameter.name)).toEqual(['rows', 'sorter', 'order']);
    expect(table.bindings.find((binding) => binding.id === 'react-ui-headercell').contracts[0].variants[0].properties.find((prop) => prop.name === 'scope')).toBeDefined();
    expect(() => describeContract(context, { importPath: '@dreadnought/ui/react', exportName: 'Layout', propertyPath: ['Removed'] })).toThrow('Missing public member');
  });
});

function fixture(version = '1.0.0') {
  const directory = mkdtempSync(path.join(tmpdir(), 'dreadnought-catalog-'));
  temporaryRoots.push(directory);
  mkdirSync(path.join(directory, 'src'));
  writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ name: '@test/core', version, type: 'module', exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } } }));
  writeFileSync(path.join(directory, 'src/index.ts'), 'export function getState(options: { active?: boolean }) { return options; }');
  return directory;
}

describe('catalog source of truth', () => {
  it('reads current source when stale dist files exist', () => {
    const directory = fixture();
    mkdirSync(path.join(directory, 'dist'));
    writeFileSync(path.join(directory, 'dist/index.d.ts'), 'export declare function getState(options: { stale?: boolean }): void;');
    const current = createContext(directory, [{ directory: '.', entrypoints: ['.'] }]);
    const contracts = describeContract(current, { importPath: '@test/core', exportName: 'getState' });
    expect(contracts[0].variants[0].properties.map((prop) => prop.name)).toEqual(['active']);
    // Renaming the actual prop changes the extracted contract on the next build.
    writeFileSync(path.join(directory, 'src/index.ts'), 'export function getState(options: { renamed?: boolean }) { return options; }');
    const changed = createContext(directory, [{ directory: '.', entrypoints: ['.'] }]);
    expect(describeContract(changed, { importPath: '@test/core', exportName: 'getState' })[0].variants[0].properties.map((prop) => prop.name)).toEqual(['renamed']);
  });

  it('rejects incompatible package versions and removed package exports', () => {
    const directory = fixture();
    const other = fixture('2.0.0');
    const manifest = readJson(path.join(other, 'package.json'));
    writeFileSync(path.join(other, 'package.json'), JSON.stringify({ ...manifest, name: '@test/ui' }));
    expect(() => createContext(directory, [{ directory: '.', entrypoints: ['.'] }, { directory: other, entrypoints: ['.'] }])).toThrow('Package versions must match');
    const original = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'));
    writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ ...original, exports: {} }));
    expect(() => createContext(directory, [{ directory: '.', entrypoints: ['.'] }])).toThrow('Missing public types export');
    writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ ...original, exports: { '.': { types: './dist/index.d.ts' } } }));
    expect(() => createContext(directory, [{ directory: '.', entrypoints: ['.'] }])).toThrow('Missing public runtime export');
  });
});
