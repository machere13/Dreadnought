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
  assert.equal(componentSpecs.length, 10);
  assert.equal(
    componentSpecs.reduce((count, spec) => count + spec.variants.length, 0),
    120,
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
  assert.equal(result.componentSets.length, 10);
  assert.equal(result.frames.length, 10);
  assert.ok(result.componentSets.every((set) => set.created));
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  assert.equal(sets.length, 10);
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
  assert.equal(page.children.filter((n) => n.name.endsWith(' / Review')).length, 10);
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
