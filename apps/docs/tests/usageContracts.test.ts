// @vitest-environment node
import { expect, it } from 'vitest';
import { catalogChunks, parsePage } from '../scripts/buildKnowledge.mjs';
import { buildContext } from '../src/assistant/context.ts';
import { searchKnowledge } from '../src/data/knowledge/search.ts';

const prop = (name: string, optional = true) => ({ name, optional, type: 'string' });

it.each([
  {
    name: 'Input',
    variants: [{ properties: [prop('type'), prop('name'), prop('required')] }],
    defaults: {},
    expected: ['Contract 1, branch 1: required props: none.', 'Defaults: not specified in catalog.'],
  },
  {
    name: 'Select',
    variants: [
      { properties: [prop('options', false), prop('searchable')] },
      { properties: [prop('options', false), prop('multiple', false), prop('searchable')] },
    ],
    defaults: { multiple: false, searchable: false },
    expected: [
      'Contract 1, branch 1: required props: options.',
      'Contract 1, branch 2: required props: options, multiple.',
      'Defaults: {"multiple":false,"searchable":false}',
    ],
  },
  {
    name: 'Button',
    variants: [
      { properties: [prop('href'), prop('variant')] },
      { properties: [prop('href', false), prop('variant')] },
    ],
    defaults: { variant: 'primary', size: 'default' },
    expected: [
      'Contract 1, branch 1: required props: none.',
      'Contract 1, branch 2: required props: href.',
      'Defaults: {"variant":"primary","size":"default"}',
    ],
  },
])('delivers $name required props and defaults beside a complete usage example', ({
  name, variants, defaults, expected,
}) => {
  const slug = name.toLowerCase();
  const pages = new Map([[`/components/${slug}/`, parsePage(`<h2 id="${slug}-api">API</h2>`)]]);
  const chunks = catalogChunks({ entries: [{
    id: `component:${slug}`, name, docsUrl: `/components/${slug}/#${slug}-api`,
    bindings: [{
      id: 'react-ui', layer: 3, exportName: name, importPath: '@dreadnought/ui/react',
      description: 'Готовый компонент.', defaults, contracts: [{ variants }],
      examples: [{ id: 'basic', code: `import { ${name} } from '@dreadnought/ui/react';\nconst example = <${name} />;` }],
    }],
  }] }, pages);
  const context = buildContext(searchKnowledge(chunks, `How to use ${name}?`, 1));
  for (const text of expected) expect(context.text).toContain(text);
  expect(context.text).toContain('Other declared props are optional in that branch.');
  expect(context.text).toContain(`const example = <${name} />;`);
  expect(context.sources[0].apiSummary).toContain('Обязательные пропсы');
  expect(context.sources[0].apiSummary).toContain('По умолчанию');
  if (name === 'Input') expect(context.sources[0].apiSummary).toContain('Обязательные пропсы: нет.');
  if (name === 'Button') {
    expect(context.sources[0].apiSummary).toContain('variant: "primary"\nsize: "default"');
    expect(context.sources[0].apiSummary).toContain('Вариант API 1.2');
    expect(context.sources[0].apiSummary).toContain('href');
  }
  const property = name === 'Input' ? 'required' : name === 'Select' ? 'searchable' : 'variant';
  expect(searchKnowledge(chunks, `${name} ${property}`, 1)[0].apiSummary)
    .toBe(context.sources[0].apiSummary);
});

it('does not interpret an absent API contract as having no required props', () => {
  const pages = new Map([['/components/input/', parsePage('<h2 id="input-api">API</h2>')]]);
  const chunks = catalogChunks({ entries: [{
    id: 'component:input', name: 'Input', docsUrl: '/components/input/#input-api',
    bindings: [{
      id: 'react-ui', layer: 3, exportName: 'Input', importPath: '@dreadnought/ui/react',
      examples: [{ id: 'basic', code: '<Input />' }],
    }],
  }] }, pages);
  const context = buildContext(searchKnowledge(chunks, 'Input', 1));
  expect(context.text).toContain('Required props: not specified in catalog.');
  expect(context.text).not.toContain('required props: none');
  expect(context.sources[0].apiSummary).toContain('Обязательные пропсы: не указаны в каталоге.');
});
