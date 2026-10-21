import assert from 'node:assert/strict';
import { test } from 'node:test';
import { data } from './tokens.mjs';
import {
  targetPage,
  syncTokens,
  repairComponents,
  syncTextStyles,
  exportPreviews,
} from './sync.js';

function mockFigma(opacityScale = 1) {
  let next = 0;
  const collections = [],
    variables = [],
    styles = [];
  const page = { id: '1161:2', name: '1 module', children: [], findAllWithCriteria: () => [] };
  const node = (name, type = 'FRAME', children = []) => ({
    id: String(++next),
    name,
    type,
    children,
    opacity: 1,
    findAllWithCriteria: ({ types }) =>
      children
        .flatMap((child) => [child, ...child.findAllWithCriteria({ types })])
        .filter((child) => types.includes(child.type)),
    setBoundVariable(field, variable) {
      (this.boundVariables ||= {})[field] = { id: variable.id };
      if (field === 'opacity')
        this.opacity = variable.resolveForConsumer(this).value / opacityScale;
    },
  });
  const api = {
    fileKey: 'wpjgUf13LJaogeTFapW8w9',
    root: { children: [page] },
    setCurrentPageAsync: async () => {},
    viewport: { scrollAndZoomIntoView() {} },
    listAvailableFontsAsync: async () =>
      ['Regular', 'SemiBold', 'Bold'].map((style) => ({
        fontName: { family: 'Roboto Flex', style },
      })),
    loadFontAsync: async () => {},
    getLocalTextStylesAsync: async () => styles,
    createTextStyle() {
      const style = { id: String(++next), setBoundVariable() {} };
      styles.push(style);
      return style;
    },
    variables: {
      getLocalVariableCollectionsAsync: async () => collections,
      getLocalVariablesAsync: async () => variables,
      createVariableCollection(name) {
        const collection = {
          id: String(++next),
          name,
          defaultModeId: 'default',
          modes: [{ modeId: 'default', name: 'Mode 1' }],
          renameMode(id, name) {
            this.modes.find((m) => m.modeId === id).name = name;
          },
        };
        collections.push(collection);
        return collection;
      },
      createVariable(name, collection, resolvedType) {
        const variable = {
          id: String(++next),
          name,
          resolvedType,
          variableCollectionId: collection.id,
          codeSyntax: {},
          valuesByMode: {},
          setVariableCodeSyntax(platform, value) {
            this.codeSyntax[platform] = value;
          },
          setValueForMode(mode, value) {
            this.valuesByMode[mode] = value;
          },
          resolveForConsumer(node) {
            const value = this.valuesByMode.default;
            return value?.type === 'VARIABLE_ALIAS'
              ? variables.find((v) => v.id === value.id).resolveForConsumer(node)
              : { value };
          },
        };
        variables.push(variable);
        return variable;
      },
      createVariableAlias: (variable) => ({ type: 'VARIABLE_ALIAS', id: variable.id }),
      setBoundVariableForPaint: (paint, field, variable) => ({
        ...paint,
        boundVariables: { [field]: { id: variable.id } },
      }),
    },
  };
  return { api, page, node, collections, variables, styles };
}

test('exports current default tokens, aliases, relative dimensions and regular typography', () => {
  assert.equal(new Set(data.tokens.map((t) => t.css)).size, data.tokens.length);
  assert.ok(data.tokens.length > 900);
  assert.equal(
    data.tokens.find((t) => t.css === '--dreadnought-font-variation-wide').value,
    'normal',
  );
  assert.equal(data.tokens.find((t) => t.css === '--dreadnought-spacing-x4').value, 16);
  assert.equal(
    data.tokens.find((t) => t.css === '--dreadnought-button-primary-bg').alias,
    '--dreadnought-color-action-primary',
  );
  assert.equal(data.tokens.find((t) => t.css === '--dreadnought-size-inline-graphic').value, '1em');
  assert.equal(data.styles.length, 13);
});

test('updates all tokens and styles in place and preserves other collection modes', async () => {
  const mock = mockFigma();
  const first = await syncTokens(mock.api, data);
  assert.equal(first.createdVariableIds.length, data.tokens.length);
  const opacity = first.byCss.get('--dreadnought-opacity-disabled');
  opacity.valuesByMode.custom = 0.7;
  const second = await syncTokens(mock.api, data);
  assert.deepEqual(second.createdVariableIds, []);
  assert.equal(second.byCss.get('--dreadnought-opacity-disabled').id, opacity.id);
  assert.equal(opacity.valuesByMode.custom, 0.7);
  for (const token of data.tokens) {
    if (token.alias)
      assert.equal(
        second.byCss.get(token.css).valuesByMode.default.id,
        second.byCss.get(token.alias).id,
      );
  }
  const firstStyles = await syncTextStyles(mock.api, data, second.byCss);
  const secondStyles = await syncTextStyles(mock.api, data, second.byCss);
  assert.deepEqual(secondStyles, firstStyles);
  assert.equal(mock.styles.length, 13);
});

test('rejects token type conflicts before creating or updating variables', async () => {
  const mock = mockFigma();
  await syncTokens(mock.api, data);
  const count = mock.variables.length;
  mock.variables[0].resolvedType = 'BOOLEAN';
  await assert.rejects(syncTokens(mock.api, data), /Конфликт типа/);
  assert.equal(mock.variables.length, count);
});

test('refuses another file or a renamed target page', async () => {
  const mock = mockFigma();
  mock.api.fileKey = 'another-file';
  await assert.rejects(targetPage(mock.api), /Diploma/);
  mock.api.fileKey = undefined;
  mock.page.name = 'Presentation';
  await assert.rejects(targetPage(mock.api), /1 module/);
});

for (const scale of [1, 100])
  test(`repairs opacity with native scale ${scale}, icons and review clipping without duplicates`, async () => {
    const mock = mockFigma(scale);
    const { byCss } = await syncTokens(mock.api, data);
    const vector = mock.node('plus', 'VECTOR');
    const icon = mock.node('icon', 'INSTANCE', [vector]);
    const ring = mock.node('focus-ring', 'RECTANGLE');
    ring.resize = function (width, height) {
      this.width = width;
      this.height = height;
    };
    const disabled = mock.node('size=default, state=disabled', 'COMPONENT', [icon, ring]);
    disabled.width = 90;
    disabled.height = 44;
    const loading = mock.node('size=default, state=loading', 'COMPONENT');
    const set = mock.node('Dreadnought/Button/primary', 'COMPONENT_SET', [disabled, loading]);
    const frame = mock.node('example');
    frame.clipsContent = true;
    const review = mock.node('Dreadnought / Button / Review', 'FRAME', [frame]);
    mock.page.children = [set, review];
    mock.page.findAllWithCriteria = () => [set];
    const result = await repairComponents(mock.api, mock.page, byCss);
    assert.equal(disabled.opacity, 0.55);
    assert.equal(loading.opacity, 0.55);
    assert.equal(frame.clipsContent, false);
    assert.equal(
      vector.fills[0].boundVariables.color.id,
      byCss.get('--dreadnought-button-primary-fg').id,
    );
    assert.equal(ring.width, 96);
    assert.equal(ring.x, -3);
    assert.ok(result.repairedNodeIds.includes(vector.id));
    const count = mock.variables.length;
    await repairComponents(mock.api, mock.page, byCss);
    assert.equal(mock.variables.length, count);
    assert.equal(
      mock.collections.filter((c) => c.name === 'Dreadnought / Figma resolved').length,
      scale === 100 ? 1 : 0,
    );
  });

test('export reads only the known review frames on the target page', async () => {
  const mock = mockFigma();
  const exports = [];
  mock.page.children = [
    {
      name: 'Dreadnought / Button / Review',
      type: 'FRAME',
      exportAsync: async () => Uint8Array.of(1, 2),
    },
    {
      name: 'User artwork',
      type: 'FRAME',
      exportAsync: () => {
        throw new Error('Not allowed');
      },
    },
  ];
  await exportPreviews(mock.api, (image) => exports.push(image));
  assert.equal(exports.length, 1);
  assert.deepEqual(exports[0].bytes, [1, 2]);
});

test('recalculates Card padding while preserving the existing source expression and derived variable ID', async () => {
  const mock = mockFigma();
  const { byCss } = await syncTokens(mock.api, data);
  const collection = mock.api.variables.createVariableCollection('Dreadnought / Figma resolved');
  const padding = mock.api.variables.createVariable('Card/padding', collection, 'FLOAT');
  padding.setVariableCodeSyntax('WEB', 'var(--dreadnought-card-padding)');
  padding.setValueForMode('default', 24);
  const area = mock.node('body');
  const card = mock.node('variant=outlined, size=default', 'COMPONENT', [area]);
  const set = mock.node('Dreadnought/Card', 'COMPONENT_SET', [card]);
  mock.page.findAllWithCriteria = () => [set];
  byCss.get('--dreadnought-spacing-x4').setValueForMode('default', 20);
  await repairComponents(mock.api, mock.page, byCss);
  assert.equal(padding.valuesByMode.default, 30);
  assert.equal(area.boundVariables.paddingLeft.id, padding.id);
  assert.equal(byCss.get('--dreadnought-card-padding').resolvedType, 'STRING');
  assert.equal(mock.variables.filter((v) => v.name === 'Card/padding').length, 1);
});
