import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { componentSpecs, addComponents } from './components/index.js';
import { iconNames } from './components/foundations.js';
import { data } from './tokens.mjs';
import { icons } from './icons.mjs';
import { syncTokens, syncTextStyles } from './sync.js';
import { canvasMock } from './test/canvasMock.mjs';

test('every public UI family and icon has a named Figma set with a bounded variant matrix', () => {
  const source = readFileSync('packages/ui/src/adapters/react/components/index.ts', 'utf8');
  const families = source
    .trim()
    .split('\n')
    .map((line) => line.split('/').at(-2));
  const covered = new Set(componentSpecs.map((spec) => spec.name.split('/')[1]));
  assert.equal(families.length, 42);
  assert.deepEqual(
    families.filter((name) => !covered.has(name)),
    [],
  );
  assert.equal(componentSpecs.length, 82);
  assert.equal(
    componentSpecs.reduce((sum, spec) => sum + spec.variants.length, 0),
    717,
  );
  for (const spec of componentSpecs) {
    assert.ok(spec.variants.length > 0 && spec.variants.length <= 30, spec.name);
    assert.ok(spec.description.length > 20, spec.name);
  }
  const registry = readFileSync(
    'packages/ui/src/adapters/react/components/DataDisplay/Icon/Icon.tsx',
    'utf8',
  )
    .split('const icons = {')[1]
    .split('} satisfies')[0];
  const publicIcons = [...registry.matchAll(/^\s*(?:'([^']+)'|(\w+)):/gm)].map(
    (match) => match[1] || match[2],
  );
  assert.deepEqual(new Set(iconNames), new Set(publicIcons));
  assert.ok(iconNames.every((name) => typeof icons[name] === 'string'));
  for (const part of ['Header', 'Sidebar', 'Content', 'Footer'])
    assert.ok(componentSpecs.some((s) => s.name === 'Dreadnought/Layout/' + part));
  for (const name of ['Checkbox/Group', 'Radio/Group', 'FormField'])
    assert.ok(componentSpecs.some((s) => s.name === 'Dreadnought/' + name));
});

test('full generation preserves concrete picker, overlay, data, layout and chart structures', async () => {
  const { api, page, nodes } = canvasMock();
  const { byCss } = await syncTokens(api, data);
  await syncTextStyles(api, data, byCss);
  const result = await addComponents(api, page, byCss, icons);
  const sets = new Map(
    page
      .findAllWithCriteria({ types: ['COMPONENT_SET'] })
      .map((s) => [s.name.replace('Dreadnought/', ''), s]),
  );
  const sample = (name, variant) => sets.get(name).children.find((n) => n.name === variant);
  const calendar = sample('DatePicker/Popup', 'mode=single');
  const weeks = calendar.children.filter((n) => /^week-\d/.test(n.name));
  assert.equal(weeks.length, 6);
  assert.ok(weeks.every((week) => week.children.length === 7));
  const labelOfButton = (node) =>
    Object.entries(node.componentProperties).find(([name]) => name.startsWith('Label#'))?.[1];
  assert.equal(labelOfButton(weeks[0].children[0].children[0]), '28');
  assert.equal(labelOfButton(weeks[0].children[3].children[0]), '1');
  assert.equal(labelOfButton(weeks[2].children[2].children[0]), '14');
  const treeSelect = sample('TreeSelect', 'selection=multiple, state=default');
  assert.equal(treeSelect.findOne((n) => n.name === 'selection').layoutWrap, 'WRAP');
  const time = sample('TimePicker/Popup', 'seconds=true, confirm=true');
  assert.deepEqual(
    time.findOne((n) => n.name === 'columns').children.map((n) => n.name),
    ['hours', 'minutes', 'seconds'],
  );
  for (const name of ['Tooltip', 'Popover']) {
    assert.equal(sets.get(name).children.length, 12);
    assert.ok(sets.get(name).children.every((node) => node.findOne((n) => n.name === 'arrow')));
    assert.ok(sets.get(name).children.every((node) => node.effects[0].radius === 24));
    assert.ok(
      sets.get(name).children.every((node) => node.effectStyleId === result.effectStyleIds[0]),
    );
  }
  const modal = sample('Modal', 'footer=true, content=short');
  assert.deepEqual(
    modal.children.map((n) => n.name),
    ['header', 'body', 'footer'],
  );
  assert.ok(modal.children[0].findOne((n) => n.type === 'INSTANCE'));
  const layout = sample('Layout', 'footer=content, collapsed=true');
  assert.equal(layout.children.at(-1).name, 'middle');
  assert.equal(layout.findOne((n) => n.name === 'content-column').children.length, 2);
  assert.ok(sets.get('Table').children.length === 18);
  const editor = sample('MarkdownEditor', 'mode=preview, state=default');
  assert.equal(
    editor.findOne((n) => n.name === 'edit'),
    null,
  );
  assert.ok(editor.findOne((n) => n.name === 'preview'));
  const line = sample('LineChart', 'state=active, view=standard');
  assert.ok(line.findOne((n) => n.name === 'series-a').svgSource.includes('M0 182'));
  assert.ok(line.findOne((n) => n.name === 'active-point'));
  for (const axes of [3, 4, 5, 6]) {
    const radar = sample('RadarChart', `axes=${axes}, state=default`);
    const path = radar.findOne((n) => n.name === 'series-a').svgSource;
    assert.equal((path.match(/ L/g) || []).length, axes - 1);
  }
  assert.ok(result.createdNodeIds.every((id) => nodes.has(id)));
  assert.equal(new Set(result.createdNodeIds).size, result.createdNodeIds.length);
  assert.ok(result.createdNodeIds.length > 1000);
  assert.ok(
    result.frames.every(
      (frame) => nodes.get(frame.id).findAllWithCriteria({ types: ['INSTANCE'] }).length > 0,
    ),
  );
});
