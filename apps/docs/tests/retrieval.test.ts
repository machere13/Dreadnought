// @vitest-environment node
import { expect, it } from 'vitest';
import { buildContext } from '../src/features/assistant/context.ts';
import { searchKnowledge } from '../src/data/knowledge/search.ts';
import type { KnowledgeEntry } from '../src/data/knowledge/types.ts';

function componentSources(name: string): KnowledgeEntry[] {
  const slug = name.toLowerCase();
  const base: KnowledgeEntry = {
    id: `catalog:component:${slug}:react-ui`,
    sourceId: `catalog:component:${slug}`,
    sourceKind: 'catalog',
    title: `${name} · ${name}`,
    url: `/components/${slug}/#${slug}-api`,
    text: `Готовый React-компонент ${name}.`,
    code: [`import { ${name} } from '@dreadnought/ui/react';`],
    keywords: [name, name, '@dreadnought/ui/react'],
  };
  return [
    {
      ...base,
      id: `guide:/components/${slug}/:notes`,
      sourceId: `guide:/components/${slug}/`,
      sourceKind: 'guide',
      title: `${name}: примечания`,
      text: 'Для контроля без текста задайте aria-label.',
      code: [],
    },
    {
      ...base,
      id: `catalog:component:${slug}:core:example:custom`,
      title: `${name} · custom`,
      text: 'Собственный компонент на core.',
      code: ["import { getButtonState } from '@dreadnought/core';"],
      keywords: [name, 'custom', 'core'],
    },
    {
      ...base,
      id: `${base.id}:contract:1:branch:1:property:disabled`,
      title: `${name} · ${name} · disabled`,
      text: 'disabled: boolean',
    },
    base,
    ...(name === 'Input'
      ? [
          {
            ...base,
            id: `${base.id}:example:number`,
            title: 'Input · Input · number',
            code: ['<Input type="number" />'],
          },
        ]
      : []),
    {
      ...base,
      id: `${base.id}:example:${name === 'Input' ? 'usage' : 'basic'}`,
      title: `${name} · ${name} · ${name === 'Input' ? 'usage' : 'basic'}`,
      code: [`import { ${name} } from '@dreadnought/ui/react';\nconst example = <${name} />;`],
    },
  ];
}

it.each([
  ['Button', 'Как создать кнопку Button?', 'catalog:component:button:react-ui:example:basic'],
  ['Input', 'Как использовать Input?', 'catalog:component:input:react-ui:example:usage'],
  ['Select', 'How to use Select?', 'catalog:component:select:react-ui:example:basic'],
])('finds ready %s usage before notes, individual properties and core', (name, question, id) => {
  const hits = searchKnowledge(componentSources(name), question, 4);
  const context = buildContext(hits);
  expect(hits[0].id).toBe(id);
  expect(context.text).toContain(`import { ${name} } from '@dreadnought/ui/react';`);
  expect(context.text).toContain(`const example = <${name} />;`);
  expect(context.text).not.toContain("from '@dreadnought/core'");
});

it('keeps explicit property, core and custom queries grounded without filling unsupported gaps', () => {
  const entries = componentSources('Button');
  expect(searchKnowledge(entries, 'Button disabled', 1)[0].text).toContain('disabled: boolean');
  for (const question of ['Button core', 'Как создать собственную кнопку?']) {
    expect(searchKnowledge(entries, question, 1)[0].code[0]).toContain("from '@dreadnought/core'");
  }
  expect(searchKnowledge(entries, 'Button quantum autocomplete')).toEqual([]);
});
