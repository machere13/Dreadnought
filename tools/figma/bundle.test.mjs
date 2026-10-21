import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { canvasMock } from './test/canvasMock.mjs';

test('built plugin runs the complete UI command offline and returns a real entity report', async () => {
  const root = 'output/figma-plugin/';
  const html = readFileSync(root + 'ui.html', 'utf8');
  const manifest = JSON.parse(readFileSync(root + 'manifest.json', 'utf8'));
  const inventory = JSON.parse(readFileSync(root + 'inventory.json', 'utf8'));
  assert.deepEqual(manifest.networkAccess.allowedDomains, ['none']);
  assert.equal(inventory.totalSets, 82);
  assert.equal(inventory.totalVariants, 717);
  assert.equal(inventory.publicFamilies.length, 42);
  assert.deepEqual(inventory.missing, []);
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script[1]);
  const { api, page, nodes } = canvasMock();
  const messages = [];
  api.showUI = (content) => assert.equal(content, html);
  api.ui = { postMessage: (message) => messages.push(message) };
  runInNewContext(readFileSync(root + 'code.js', 'utf8'), { figma: api, __html__: html });
  await api.ui.onmessage({ type: 'components' });
  const error = messages.find((message) => message.type === 'error');
  assert.equal(error, undefined, error?.error);
  const report = messages.find((message) => message.type === 'done')?.report;
  assert.ok(report);
  assert.equal(report.additions.componentSets.length, inventory.totalSets);
  assert.equal(report.additions.frames.length, inventory.totalSets);
  assert.ok(report.additions.createdNodeIds.every((id) => nodes.has(id)));
  assert.equal(
    page.children.filter((node) => node.type === 'COMPONENT_SET').length,
    inventory.totalSets,
  );
  assert.equal(messages.at(-1).type, 'busy');
  assert.equal(messages.at(-1).value, false);
});
