// @vitest-environment node
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import * as core from '../../../packages/core/src/index.ts';
import { coreReferenceEntries } from '../scripts/catalog/generateDocData.mjs';

it('documents only core bindings and preserves callable contracts and examples', () => {
  const contract = {
    parameters: [{ name: 'text', type: 'string', optional: false }],
    returnType: 'Promise<void>',
    variants: [{ properties: [] }],
    types: {},
  };
  const entries = coreReferenceEntries({ entries: [
    {
      kind: 'action', name: 'copy', family: 'Actions', description: 'Copy text',
      constraints: ['Browser only'],
      bindings: [{
        layer: 1, importPath: '@dreadnought/core', exportName: 'copy',
        examples: [{ id: 'usage', code: "await copy('Hello');" }], contracts: [contract],
      }],
    },
    {
      kind: 'component', name: 'Button', family: 'Controls', description: 'Button state',
      bindings: [
        { layer: 3, importPath: '@dreadnought/ui/react', exportName: 'Button' },
        { layer: 1, importPath: '@dreadnought/core', exportName: 'getButtonState', examples: [], contracts: [] },
      ],
    },
    { kind: 'component', name: 'Card', bindings: [{ layer: 3, exportName: 'Card' }] },
  ] });
  expect(entries.map(({ kind, name }) => [kind, name])).toEqual([
    ['action', 'copy'], ['component', 'getButtonState'],
  ]);
  expect(entries[0]).toMatchObject({
    description: 'Copy text', constraints: ['Browser only'], contracts: [contract],
    examples: [{ id: 'usage', code: "await copy('Hello');" }],
  });
});

it('covers every public runtime export of core without exposing adapter or UI bindings', () => {
  const catalog = JSON.parse(readFileSync('tools/catalog/dist/catalog.json', 'utf8'));
  expect(coreReferenceEntries(catalog).map((entry) => entry.name).sort())
    .toEqual(Object.keys(core).sort());
});
