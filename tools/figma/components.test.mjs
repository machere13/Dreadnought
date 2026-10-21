import assert from 'node:assert/strict';
import { test } from 'node:test';
import { data } from './tokens.mjs';
import { icons } from './icons.mjs';
import { syncTokens, syncTextStyles } from './sync.js';
import { addComponents, componentSpecs } from './components/index.js';
import { componentContext, ensureSet } from './components/context.js';
import { canvasMock } from './test/canvasMock.mjs';

async function setup(opacityScale = 1) {
  const mock = canvasMock(opacityScale);
  const { byCss } = await syncTokens(mock.api, data);
  await syncTextStyles(mock.api, data, byCss);
  return { ...mock, byCss };
}

test('variant inventory matches source states and has no oversized sets', () => {
  assert.equal(componentSpecs.length, 14);
  assert.equal(
    componentSpecs.reduce((count, spec) => count + spec.variants.length, 0),
    141,
  );
  for (const spec of componentSpecs) assert.ok(spec.variants.length <= 30);
  for (const [name, svg] of Object.entries(icons)) {
    assert.match(svg, /viewBox=/, name);
    assert.match(svg, /<path /, name);
    assert.doesNotMatch(svg, /<script/);
  }
});

test('creates real component sets, correct disabled opacity, popup blur and review instances', async () => {
  const { api, page, byCss, nodes } = await setup();
  const result = await addComponents(api, page, byCss, icons);
  assert.equal(result.componentSets.length, 14);
  assert.equal(result.frames.length, 14);
  assert.ok(result.componentSets.every((set) => set.created));
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  assert.equal(sets.length, 14);
  const checkbox = sets.find((s) => s.name === 'Dreadnought/Checkbox');
  assert.equal(checkbox.children.length, 12);
  assert.equal(
    checkbox.children.find((n) => n.name === 'checked=true, state=disabled').opacity,
    0.55,
  );
  const mixed = checkbox.children.find((n) => n.name === 'checked=mixed, state=default');
  assert.equal(mixed.findOne((n) => n.name === 'mixed-mark').height, 2);
  const select = sets.find((s) => s.name === 'Dreadnought/Select/outlined');
  for (const main of select.children) {
    if (!main.name.includes('selection=empty'))
      assert.ok(
        main.children.findIndex((n) => n.name === 'clear') <
          main.children.findIndex((n) => n.name === 'indicator'),
      );
  }
  const popup = sets.find((s) => s.name === 'Dreadnought/Select/Popup');
  assert.ok(
    popup.children.every(
      (n) => n.effects[0].type === 'BACKGROUND_BLUR' && n.effects[0].radius === 24,
    ),
  );
  const mark = sets.find((s) => s.name === 'Dreadnought/Mark');
  assert.ok(mark.children.every((n) => n.width === 6 && n.height === 6));
  const badge = sets.find((s) => s.name === 'Dreadnought/Badge');
  assert.ok(
    Object.values(badge.componentPropertyDefinitions).some((p) => p.type === 'INSTANCE_SWAP'),
  );
  for (const frame of result.frames)
    assert.ok(nodes.get(frame.id).findAllWithCriteria({ types: ['INSTANCE'] }).length > 0);
  assert.ok(result.createdNodeIds.every((id) => nodes.has(id)));
});

test('second run preserves component IDs and user text; missing reviews are recreated as instances', async () => {
  const { api, page, byCss, nodes } = await setup();
  const first = await addComponents(api, page, byCss, icons);
  const checkbox = page
    .findAllWithCriteria({ types: ['COMPONENT_SET'] })
    .find((s) => s.name === 'Dreadnought/Checkbox');
  checkbox.children[0].findOne((n) => n.type === 'TEXT').characters = 'Мой текст';
  nodes.get(first.frames[0].id).remove();
  const second = await addComponents(api, page, byCss, icons);
  assert.deepEqual(
    second.componentSets.map((s) => s.id),
    first.componentSets.map((s) => s.id),
  );
  assert.ok(second.componentSets.every((s) => !s.created));
  assert.equal(checkbox.children[0].findOne((n) => n.type === 'TEXT').characters, 'Мой текст');
  assert.equal(page.children.filter((n) => n.name.endsWith(' / Review')).length, 14);
});

test('failed construction removes only nodes made by that construction', async () => {
  const { api, page, byCss, nodes } = await setup();
  const userFrame = api.createFrame();
  userFrame.name = 'User work';
  page.appendChild(userFrame);
  const ctx = await componentContext(api, page, byCss, icons);
  const before = [...nodes.keys()];
  await assert.rejects(
    ensureSet(ctx, { name: 'Failing', variants: [{ state: 'default' }], columns: 1 }, async () => {
      throw new Error('Failure');
    }),
    /Failure/,
  );
  assert.deepEqual([...nodes.keys()], before);
  assert.equal(page.children[0], userFrame);
});

test('feedback uses source sizes, mixed colors, visibility defaults and nested Loader instances', async () => {
  const { api, page, byCss } = await setup();
  const result = await addComponents(api, page, byCss, icons);
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  const get = (name) => sets.find((set) => set.name === 'Dreadnought/' + name);
  const alert = get('Alert');
  const variables = await api.variables.getLocalVariablesAsync();
  for (const node of alert.children) {
    const type = node.name.match(/type=(\w+)/)[1];
    assert.equal(node.findOne((n) => n.name === 'icon').visible, false);
    assert.equal(node.findOne((n) => n.name === 'close').visible, false);
    const color = variables.find((v) => v.id === node.fills[0].boundVariables.color.id);
    if (node.name.endsWith('appearance=filled')) {
      const accent = byCss.get(`--dreadnought-alert-${type}-accent`).resolveForConsumer(node).value;
      const base = byCss.get('--dreadnought-alert-filled-base').resolveForConsumer(node).value;
      const actual = color.resolveForConsumer(node).value;
      for (const channel of ['r', 'g', 'b'])
        assert.ok(
          Math.abs(actual[channel] - (accent[channel] * 0.14 + base[channel] * 0.86)) < 0.00001,
        );
      assert.ok(result.derivedVariableIds.includes(color.id));
    }
    assert.equal(
      node.findOne((n) => n.name === 'title').boundVariables.fontSize.id,
      byCss.get('--dreadnought-font-size-alert-title').id,
    );
  }
  for (const node of get('Toast').children) {
    assert.equal(node.width, 384);
    assert.equal(node.findOne((n) => n.name === 'icon').visible, true);
    assert.equal(node.findOne((n) => n.name === 'close').width, 32);
    assert.equal(node.fills[0].boundVariables.color.id, byCss.get('--dreadnought-toast-bg').id);
  }
  const loader = get('Loader');
  assert.deepEqual(
    loader.children.map((n) => n.findOne((n) => n.name === 'graphic').width),
    [16, 32, 48],
  );
  for (const node of loader.children) {
    assert.equal(node.findOne((n) => n.name === 'label').visible, false);
    assert.equal(node.findOne((n) => n.name === 'track').strokeWeight, 2);
    assert.ok(node.findOne((n) => n.name === 'arc').findOne((n) => n.type === 'VECTOR'));
  }
  for (const node of get('Loader/Overlay').children) {
    const loading = node.name.startsWith('loading=true');
    assert.equal(node.findOne((n) => n.name === 'overlay').visible, loading);
    assert.equal(node.findOne((n) => n.name === 'content').opacity, loading ? 0.55 : 1);
    const indicator = node.findOne((n) => n.name === 'indicator');
    assert.equal(indicator.type, 'INSTANCE');
    assert.equal((await indicator.getMainComponentAsync()).parent, loader);
  }
});

test('upgrading an existing first group only creates missing feedback sets and keeps IDs', async () => {
  const { api, page, byCss, nodes } = await setup();
  const original = await addComponents(api, page, byCss, icons);
  for (const set of original.componentSets.slice(10)) nodes.get(set.id).remove();
  for (const frame of original.frames.slice(10)) nodes.get(frame.id).remove();
  const next = await addComponents(api, page, byCss, icons);
  assert.deepEqual(
    next.componentSets.slice(0, 10).map((set) => set.id),
    original.componentSets.slice(0, 10).map((set) => set.id),
  );
  assert.ok(next.componentSets.slice(0, 10).every((set) => !set.created));
  assert.ok(next.componentSets.slice(10).every((set) => set.created));
  const count = (await api.variables.getLocalVariablesAsync()).length;
  await addComponents(api, page, byCss, icons);
  assert.equal((await api.variables.getLocalVariablesAsync()).length, count);
});

test('existing incompatible sets are not deleted or replaced', async () => {
  const { api, page, byCss } = await setup();
  const ctx = await componentContext(api, page, byCss, icons);
  const existing = api.combineAsVariants([api.createComponent()], page);
  existing.name = componentSpecs[0].name;
  await assert.rejects(
    ensureSet(ctx, componentSpecs[0], () => {}),
    /сохранён без изменений/,
  );
  assert.ok(page.children.includes(existing));
});

test('new component disabled states remain visible with percentage opacity variables', async () => {
  const { api, page, byCss } = await setup(100);
  const first = await addComponents(api, page, byCss, icons);
  const count = (await api.variables.getLocalVariablesAsync()).length;
  const second = await addComponents(api, page, byCss, icons);
  assert.equal((await api.variables.getLocalVariablesAsync()).length, count);
  assert.ok(first.derivedVariableIds.length > 0);
  assert.ok(second.componentSets.every((set) => !set.created));
  for (const set of page.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
    for (const variant of set.children.filter((node) => /state=disabled(,|$)/.test(node.name)))
      assert.equal(variant.opacity, 0.55);
  }
});
