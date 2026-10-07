// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setImmediate } from 'node:timers/promises';
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
import { disclosureCode } from '../../../apps/docs/src/components/disclosureCode.ts';

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

// Compiler checks are synchronous; let the worker report results between tests.
afterEach(() => setImmediate());

afterAll(() => {
  for (const directory of temporaryRoots) rmSync(directory, { recursive: true, force: true });
});

describe('public catalog', () => {
  it('publishes Slider as numeric and keyboard behavior composition with checked bindings', () => {
    const entry = catalog.entries.find(entry => entry.id === 'component:slider');
    expect(entry).toMatchObject({ family: 'Fields', composesWith: ['behavior:get-stepped-value', 'behavior:get-navigation-direction'] });
    expect(entry!.bindings.map(binding => binding.exportName)).toEqual(['useSlider', 'SliderAdapter', 'Slider']);
    for (const binding of entry!.bindings) expect(() => checkExamples(context, binding.examples)).not.toThrow();
    expect(entry!.tokens.length).toBeGreaterThan(0);
  });
  it('publishes Switch with checked public examples and shared checkable behavior', () => {
    const entry = catalog.entries.find(entry => entry.id === 'component:switch');
    expect(entry).toMatchObject({ family: 'Fields', composesWith: ['behavior:get-checkable-state'] });
    expect(entry!.bindings.map(binding => binding.exportName)).toEqual(['SwitchAdapter', 'Switch']);
    for (const binding of entry!.bindings) expect(() => checkExamples(context, binding.examples)).not.toThrow();
    expect(entry!.tokens.length).toBeGreaterThan(0);
    const behavior = catalog.entries.find(entry => entry.id === 'behavior:get-checkable-state');
    expect(behavior!.bindings[0].exportName).toBe('getCheckableState');
    expect(() => checkExamples(context, behavior!.bindings[0].examples)).not.toThrow();
  });
  it('publishes Dropdown as a checked Menu and Popover composition without a synthetic core binding', () => {
    const entry = catalog.entries.find(entry => entry.id === 'component:dropdown');
    expect(entry).toMatchObject({ family: 'Navigation', composesWith: ['component:menu', 'component:popover'] });
    expect(entry!.bindings.map(binding => binding.exportName)).toEqual(['DropdownAdapter', 'Dropdown']);
    for (const binding of entry!.bindings) expect(() => checkExamples(context, binding.examples)).not.toThrow();
    expect(entry!.tokens.length).toBeGreaterThan(0);
  });
  it('publishes Drawer aliases and visual-only placement and size', () => {
    const entry = catalog.entries.find(entry => entry.id === 'component:drawer');
    expect(entry).toMatchObject({ family: 'Overlays', composesWith: ['component:modal'] });
    expect(entry!.constraints.join(' ')).not.toContain('showDrawer()');
    expect(entry!.bindings.map(binding => binding.exportName)).toEqual(['getDrawerState', 'DrawerAdapter', 'useDrawer', 'Drawer']);
    for (const binding of entry!.bindings) expect(() => checkExamples(context, binding.examples)).not.toThrow();
    const styled = entry!.bindings.find(binding => binding.id === 'react-ui')!;
    expect(styled.contracts[0].variants[0].properties.map(property => property.name)).toEqual(expect.arrayContaining(['placement', 'size']));
    for (const binding of entry!.bindings.filter(binding => binding.layer === 2)) {
      const names = binding.contracts[0].variants[0].properties.map(property => property.name);
      expect(names).not.toContain('placement');
      expect(names).not.toContain('size');
    }
    expect(entry!.tokens.length).toBeGreaterThan(0);
  });
  it('publishes safe MarkdownPreview and shared history with checked examples', () => {
    const preview = catalog.entries.find(entry => entry.id === 'component:markdown-preview');
    expect(preview).toMatchObject({ family: 'DataDisplay' });
    expect(preview!.bindings.map(binding => binding.layer)).toEqual([2, 3]);
    for (const binding of preview!.bindings) expect(() => checkExamples(context, binding.examples)).not.toThrow();
    const history = catalog.entries.find(entry => entry.id === 'behavior:get-history-state');
    expect(history).toMatchObject({ kind: 'behavior', name: 'getHistoryState' });
    expect(() => checkExamples(context, history!.bindings[0].examples)).not.toThrow();
  });
  it('publishes MarkdownEditor logic, adapter and ready UI with checked examples', () => {
    const entry = catalog.entries.find(entry => entry.id === 'component:markdown-editor');
    expect(entry).toMatchObject({ family: 'Fields', composesWith: ['domain:apply-markdown-command', 'behavior:get-history-state', 'component:markdown-preview', 'action:pick-files'] });
    expect(entry!.bindings.map(binding => binding.id)).toEqual(['react-logic', 'react-adapter', 'react-ui']);
    expect(entry!.bindings.map(binding => binding.layer)).toEqual([2, 2, 3]);
    expect(entry!.tokens.length).toBeGreaterThan(0);
    const ready = entry!.bindings.find(binding => binding.id === 'react-ui')!;
    expect(ready.contracts[0].variants[0].properties.map(property => property.name)).toEqual(expect.arrayContaining(['historyLimit', 'preview', 'defaultPreview', 'onPreviewChange', 'renderPreview', 'uploadImage']));
    for (const binding of entry!.bindings) expect(() => checkExamples(context, binding.examples)).not.toThrow();
  });
  it('publishes the Markdown domain with a checked framework-independent example', () => {
    const entry = catalog.entries.find(entry => entry.id === 'domain:apply-markdown-command');
    expect(entry).toMatchObject({ kind: 'domain', name: 'applyMarkdownCommand', family: 'Markdown' });
    expect(entry!.bindings).toHaveLength(1);
    expect(entry!.bindings[0]).toMatchObject({ layer: 1, framework: null, importPath: '@dreadnought/core' });
    expect(entry!.bindings[0].contracts[0]).toMatchObject({ returnType: 'MarkdownDocument' });
    expect(entry!.bindings[0].contracts[0].parameters.map(parameter => parameter.name)).toEqual(['doc', 'command']);
    expect(() => checkExamples(context, entry!.bindings[0].examples)).not.toThrow();
  });
  it('publishes Tooltip in every layer with checked public examples', () => {
    const entry = catalog.entries.find(entry => entry.id === 'component:tooltip');
    expect(entry?.family).toBe('Overlays');
    expect(entry!.bindings.map(binding => binding.id)).toEqual(['core', 'react-adapter', 'react-logic', 'react-ui']);
    expect(entry!.tokens.length).toBeGreaterThan(0);
    for (const binding of entry!.bindings) expect(() => checkExamples(context, binding.examples)).not.toThrow();
  });
  it('publishes Radar adapter and ready UI without a synthetic component core binding', () => {
    const entry = catalog.entries.find(entry => entry.id === 'component:radar-chart');
    expect(entry).toMatchObject({ family: 'Visualization', composesWith: ['domain:build-radar-layout'] });
    expect(entry!.bindings.map(binding => binding.id)).toEqual(['react-adapter', 'react-ui']);
    expect(entry!.tokens.length).toBeGreaterThan(0);
    expect(entry!.bindings[0]).toMatchObject({ layer: 2, framework: 'react', importPath: '@dreadnought/react/unstyled', exportName: 'RadarChartAdapter' });
    expect(() => checkExamples(context, entry!.bindings[0].examples)).not.toThrow();
    expect(entry!.bindings[1]).toMatchObject({ layer: 3, importPath: '@dreadnought/ui/react', exportName: 'RadarChart' });
    expect(() => checkExamples(context, entry!.bindings[1].examples)).not.toThrow();
  });
  it('publishes the pure Radar domain with a checked core example', () => {
    const entry = catalog.entries.find(entry => entry.id === 'domain:build-radar-layout');
    expect(entry).toMatchObject({ kind: 'domain', name: 'buildRadarLayout', family: 'Charts' });
    expect(entry!.bindings[0]).toMatchObject({ id: 'core', layer: 1, framework: null,
      importPath: '@dreadnought/core', exportName: 'buildRadarLayout' });
    const contract = entry!.bindings[0].contracts[0];
    expect(contract).toMatchObject({ returnType: 'RadarLayout', parameters: [{ name: 'options', optional: false }] });
    expect(contract.variants[0].properties.map(property => [property.name, property.optional]))
      .toEqual([['metrics', false], ['radius', false], ['series', false]]);
    expect(() => checkExamples(context, entry!.bindings[0].examples)).not.toThrow();
  });
  it('publishes the stepped numeric behavior with required bounds and a checked example', () => {
    const entry = catalog.entries.find(entry => entry.name === 'getSteppedValue');
    expect(entry?.kind).toBe('behavior');
    expect(entry?.bindings[0]).toMatchObject({ importPath: '@dreadnought/core', exportName: 'getSteppedValue', framework: null, layer: 1 });
    const parameters = entry!.bindings[0].contracts[0].parameters;
    expect(parameters.map(parameter => parameter.name)).toEqual(['value', 'options']);
    for (const name of ['min', 'max']) expect(parameters[1].variants[0].properties).toContainEqual(expect.objectContaining({ name, optional: false }));
    expect(parameters[1].defaults).toEqual({ step: 1 });
    expect(() => checkExamples(context, entry!.bindings[0].examples)).not.toThrow();
  });
  it('publishes the Combobox keyboard behavior with a checked composition contract', () => {
    const entry = catalog.entries.find(entry => entry.name === 'getComboboxKeyAction');
    expect(entry?.kind).toBe('behavior');
    expect(entry?.bindings[0]).toMatchObject({ importPath: '@dreadnought/core', exportName: 'getComboboxKeyAction', framework: null, layer: 1 });
    const contract = entry!.bindings[0].contracts[0];
    expect(contract.parameters.map(parameter => parameter.name)).toEqual(['key', 'options']);
    expect(contract.parameters[1].variants[0].properties).toContainEqual(expect.objectContaining({ name: 'open', optional: false }));
    expect(contract.parameters[1].defaults).toEqual({ searchable: true, openOnEnter: true });
    expect(() => checkExamples(context, entry!.bindings[0].examples)).not.toThrow();
  });
  it('publishes standalone Disclosure contracts and a type-checked custom composition', () => {
    const examples: { id: string; code: string }[] = [];
    for (const name of ['getDisclosureState', 'getDisclosureOpen']) {
      const entry = catalog.entries.find(entry => entry.name === name);
      expect(entry?.kind).toBe('behavior');
      expect(entry?.docsUrl).toBe('/custom-components/#core-disclosure');
      expect(entry?.bindings).toHaveLength(1);
      expect(entry?.bindings[0]).toMatchObject({ layer: 1, framework: null,
        importPath: '@dreadnought/core', exportName: name });
      expect(entry!.bindings[0].examples.every(example => !example.code.includes('react'))).toBe(true);
      examples.push(...entry!.bindings[0].examples.map(example => ({ ...example, id: `${name}/${example.id}` })));
    }
    const state = catalog.entries.find(entry => entry.name === 'getDisclosureState')!;
    expect(state.composesWith).toEqual(expect.arrayContaining(['behavior:get-disclosure-open', 'component:accordion']));
    expect(state.bindings[0].defaults).toEqual({ open: false, disabled: false });
    for (const name of ['triggerId', 'panelId']) {
      expect(state.bindings[0].contracts[0].variants[0].properties).toContainEqual(expect.objectContaining({ name, optional: false }));
    }
    const transition = catalog.entries.find(entry => entry.name === 'getDisclosureOpen')!;
    expect(transition.composesWith).toContain('behavior:get-disclosure-state');
    const parameters = transition.bindings[0].contracts[0].parameters;
    expect(parameters.slice(0, 2).map(parameter => parameter.name)).toEqual(['currentOpen', 'action']);
    expect(parameters[1].type).toBe('DisclosureAction');
    expect(parameters[1].values).toEqual(expect.arrayContaining(['open', 'close', 'toggle']));
    expect(parameters[2].defaults).toEqual({ disabled: false });
    examples.push({ id: 'disclosure-actions', code:
      "import { getDisclosureOpen } from '@dreadnought/core';\ngetDisclosureOpen(false, 'open');\ngetDisclosureOpen(true, 'close');\ngetDisclosureOpen(false, 'toggle');" });
    expect(parameters[2].variants[0].properties).toContainEqual(expect.objectContaining({ name: 'disabled', optional: true }));
    examples.push({ id: 'own-disclosure', code: disclosureCode });
    expect(() => checkExamples(context, examples)).not.toThrow();
  });
  it('publishes Toolbar across four honest layer bindings with typed composition examples', () => {
    const toolbar = catalog.entries.find(entry => entry.id === 'component:toolbar');
    expect(toolbar?.family).toBe('Controls');
    expect(toolbar?.bindings.map(binding => binding.id)).toEqual(['core', 'react-logic', 'react-adapter', 'react-ui']);
    expect(toolbar?.bindings[0].framework).toBeNull();
    expect(toolbar?.bindings[0].examples[0].code).not.toContain('react');
    const adapter = toolbar?.bindings.find(binding => binding.id === 'react-adapter');
    expect(adapter?.contracts[0].variants[0].properties.find(prop => prop.name === 'navigation')?.values).toEqual(expect.arrayContaining(['roving', 'native']));
    expect(toolbar?.tokens).toContainEqual({ name: '--dreadnought-toolbar-gap', value: 'var(--dreadnought-spacing-x2)' });
  });
  it('publishes standalone actions and behaviors with checked public contracts', () => {
    const capabilities = catalog.entries.filter(entry => entry.kind === 'action' || entry.kind === 'behavior');
    expect(capabilities.map(entry => entry.name).sort()).toEqual(['copy', 'download', 'getCheckableState', 'getComboboxKeyAction', 'getCountdownRemaining', 'getDisclosureOpen', 'getDisclosureState', 'getHistoryState', 'getNavigationDirection', 'getNextEnabledValue', 'getSelectionValue', 'getSteppedValue', 'getTooltipPosition', 'getTypeaheadValue', 'pickFiles', 'readClipboard']);
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
    const keyboard = capabilities.find(entry => entry.name === 'getNavigationDirection');
    expect(keyboard.bindings[0].contracts[0].parameters.map(parameter => parameter.name)).toEqual(['key', 'options']);
    expect(keyboard.bindings[0].contracts[0].parameters[1].variants[0].properties.map(property => property.name).sort()).toEqual(['homeEnd', 'orientation']);
    expect(() => checkExamples(context, keyboard.bindings[0].examples)).not.toThrow();
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
    expect(properties.find((prop) => prop.name === 'type').values).toEqual(expect.arrayContaining(['text', 'password', 'email', 'number']));
    expect(properties.find((prop) => prop.name === 'type').values).not.toContain('checkbox');
  });

  it('extracts theme tokens and only the explicitly listed components', () => {
    const componentEntries = catalog.entries.filter(entry => entry.kind === 'component');
    expect(componentEntries.map((entry) => entry.name)).toEqual(components.map((component) => component.name).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
    expect(componentEntries).toHaveLength(components.length);
    expect(catalog.entries.find((entry) => entry.name === 'Button').tokens).toContainEqual({ name: '--dreadnought-button-primary-bg', value: 'var(--dreadnought-color-action-primary)' });
    expect(componentEntries.filter(entry => entry.bindings.some(binding => binding.layer === 3)).every(entry => entry.tokens.length > 0)).toBe(true);
    expect(componentEntries.filter(entry => !entry.bindings.some(binding => binding.layer === 3)).every(entry => entry.tokens.length === 0)).toBe(true);
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
    stale.find(entry => entry.name === 'RadarChart')!.bindings[0].propertyDescriptions.renamedProp = 'Устаревшее свойство';
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
    expect(() => checkExamples(context, [{ id: 'wrong-prop', code: "import { Input } from '@dreadnought/ui/react'; const input = <Input type='checkbox' />;" }])).toThrow(/not assignable/);
    expect(() => checkExamples(context, [{ id: 'wrong-ref', code: "import { createRef } from 'react'; import { Button } from '@dreadnought/ui/react'; const link = <Button href='/' ref={createRef<HTMLButtonElement>()} />;" }])).toThrow(/not assignable/);
    const invalid = structuredClone(metadata);
    invalid.find(entry => entry.name === 'Button')!.bindings.find(binding => binding.id === 'react-ui')!.defaults.variant = 'removed-variant';
    expect(() => generateCatalog(context, invalid)).toThrow(/not assignable/);
  });

  it('validates positional property defaults against public parameter types', () => {
    const binding = () => structuredClone(metadata.find(entry => entry.name === 'getDisclosureOpen')!);
    for (const [defaults, error] of [
      [{ 2: { disabled: 'yes' } }, /not assignable/],
      [{ 2: { missing: false } }, /Unknown parameter default/],
      [{ 9: { disabled: false } }, /Unknown parameter/],
      [{ 1: { disabled: false } }, /Unknown parameter default/],
      [{ '02': { disabled: false } }, /Invalid parameter index/],
    ] as const) {
      const entry = binding();
      entry.bindings[0].parameterDefaults = defaults;
      const invalid = metadata.map(item => item.id === entry.id ? entry : item);
      expect(() => generateCatalog(context, invalid)).toThrow(error);
    }
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
  it('checks positional defaults against every overload, not only the final one', () => {
    const directory = fixture();
    writeFileSync(path.join(directory, 'src/index.ts'), `
export function pick(kind: 'a', options?: { mode?: 'a'; disabled?: boolean }): void;
export function pick(kind: 'b', options?: { mode?: 'b'; disabled?: boolean }): void;
export function pick(kind: 'a' | 'b', options: { mode?: 'a' | 'b'; disabled?: boolean } = {}) {}`);
    const current = createContext(directory, [{ directory: '.', entrypoints: ['.'] }]);
    const entry = { id: 'behavior:pick', kind: 'behavior', name: 'pick', family: 'Behaviors',
      description: 'Overloaded behavior', docsUrl: '/custom-components/#overloads', bindings: [{
        id: 'core', layer: 1, framework: null, importPath: '@test/core', exportName: 'pick',
        parameterDefaults: { '1': { mode: 'b' } } as Record<string, Record<string, unknown>>,
      }] };
    expect(() => generateCatalog(current, [entry])).toThrow(/not assignable.*overload/i);
    entry.bindings[0].parameterDefaults = { '1': { disabled: false } };
    const generated = generateCatalog(current, [entry]);
    expect(generated.entries[0].bindings[0].contracts.map(contract => contract.parameters[1].defaults))
      .toEqual([{ disabled: false }, { disabled: false }]);
  });
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
