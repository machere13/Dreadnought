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
  assert.equal(componentSpecs.length, 21);
  assert.equal(
    componentSpecs.reduce((count, spec) => count + spec.variants.length, 0),
    181,
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
  assert.equal(result.componentSets.length, 21);
  assert.equal(result.frames.length, 21);
  assert.ok(result.componentSets.every((set) => set.created));
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  assert.equal(sets.length, 21);
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
  assert.equal(page.children.filter((n) => n.name.endsWith(' / Review')).length, 21);
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

test('upgrading existing controls and feedback only creates missing navigation sets and keeps IDs', async () => {
  const { api, page, byCss, nodes } = await setup();
  const original = await addComponents(api, page, byCss, icons);
  for (const set of original.componentSets.slice(14)) nodes.get(set.id).remove();
  for (const frame of original.frames.slice(14)) nodes.get(frame.id).remove();
  const next = await addComponents(api, page, byCss, icons);
  assert.deepEqual(
    next.componentSets.slice(0, 14).map((set) => set.id),
    original.componentSets.slice(0, 14).map((set) => set.id),
  );
  assert.ok(next.componentSets.slice(0, 14).every((set) => !set.created));
  assert.ok(next.componentSets.slice(14).every((set) => set.created));
  const count = (await api.variables.getLocalVariablesAsync()).length;
  await addComponents(api, page, byCss, icons);
  assert.equal((await api.variables.getLocalVariablesAsync()).length, count);
});

test('navigation preserves source states and builds compositions from real instances', async () => {
  const { api, page, byCss } = await setup();
  await addComponents(api, page, byCss, icons);
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  const get = (name) => sets.find((set) => set.name === 'Dreadnought/' + name);
  const item = get('Accordion/Item');
  for (const node of item.children) {
    const trigger = node.findOne((n) => n.name === 'trigger');
    assert.equal(trigger.minHeight, 44);
    assert.equal(trigger.paddingLeft, 16);
    assert.equal(
      trigger.paddingTop,
      byCss.get('--dreadnought-accordion-trigger-padding-y').resolveForConsumer(trigger).value,
    );
    assert.equal(
      node.findOne((n) => n.name === 'panel').visible,
      node.name.startsWith('open=true'),
    );
    assert.equal(
      node.findOne((n) => n.name === 'down').rotation,
      node.name.startsWith('open=true') ? 180 : 0,
    );
    assert.equal(node.opacity, 1);
    assert.equal(trigger.opacity, node.name.endsWith('state=disabled') ? 0.55 : 1);
    if (node.name.endsWith('state=focused'))
      assert.equal(trigger.findOne((n) => n.name === 'focus-ring').strokeAlign, 'INSIDE');
  }
  for (const node of get('Accordion').children) {
    assert.equal(node.children.length, 3);
    assert.ok(node.children.every((n) => n.type === 'INSTANCE'));
    const mains = await Promise.all(node.children.map((n) => n.getMainComponentAsync()));
    assert.ok(mains.every((n) => n.parent === item));
    const count = node.name.endsWith('none') ? 0 : node.name.endsWith('one') ? 1 : 2;
    assert.equal(mains.filter((n) => n.name.startsWith('open=true')).length, count);
  }
  for (const node of get('Breadcrumb/Item').children) {
    const text = node.findOne((n) => n.name === 'label');
    if (node.name.startsWith('kind=current'))
      assert.equal(
        text.boundVariables.fontWeight.id,
        byCss.get('--dreadnought-font-weight-breadcrumb-current').id,
      );
    if (node.name.endsWith('state=hover')) assert.equal(text.textDecoration, 'UNDERLINE');
    if (node.name.endsWith('state=focused'))
      assert.equal(node.findOne((n) => n.name === 'focus-ring').strokeAlign, 'OUTSIDE');
  }
  for (const node of get('Breadcrumb').children) {
    const count = Number(node.name.slice(-1));
    assert.equal(node.findAllWithCriteria({ types: ['INSTANCE'] }).length, count);
    const separators = node.children.filter((n) => n.name === 'separator');
    assert.equal(separators.length, count - 1);
    assert.ok(separators.every((n) => n.characters === '/'));
  }
  const tab = get('Tabs/Tab');
  const selectedHover = tab.children.find((n) => n.name === 'selected=true, state=hover');
  assert.equal(
    selectedHover.fills[0].boundVariables.color.id,
    byCss.get('--dreadnought-tabs-tab-bg-selected-hover').id,
  );
  assert.equal(get('Tabs/More').children.length, 4);
  assert.ok(get('Tabs/More').children.every((n) => n.findOne((n) => n.name === 'ellipsis')));
  for (const node of get('Tabs').children) {
    const vertical = node.name.startsWith('orientation=vertical');
    assert.equal(node.layoutMode, vertical ? 'HORIZONTAL' : 'VERTICAL');
    const list = node.findOne((n) => n.name === 'list');
    assert.equal(list.layoutMode, vertical ? 'VERTICAL' : 'HORIZONTAL');
    assert.equal(list.children.length, 3);
    const mains = await Promise.all(list.children.map((n) => n.getMainComponentAsync()));
    assert.ok(mains.every((n) => n.parent === tab));
    assert.equal(mains.filter((n) => n.name.startsWith('selected=true')).length, 1);
    assert.ok(mains[Number(node.name.slice(-1)) - 1].name.startsWith('selected=true'));
    assert.equal(node.findOne((n) => n.name === 'panel').paddingTop, vertical ? 0 : 16);
  }
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
      assert.equal(
        set.name === 'Dreadnought/Accordion/Item'
          ? variant.findOne((n) => n.name === 'trigger').opacity
          : variant.opacity,
        0.55,
      );
  }
});
