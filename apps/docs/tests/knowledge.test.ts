// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { extractGuides, parsePage, validateLink, catalogChunks } from '../scripts/buildKnowledge.mjs';
import { searchKnowledge } from '../src/knowledge/search';
import { validateManifest, type KnowledgeEntry } from '../src/knowledge/types';
import { loadKnowledge } from '../src/knowledge/load';

const entry: KnowledgeEntry = { id: 'catalog:input:password', sourceId: 'catalog:input', sourceKind: 'catalog', title: 'Input · allowPasswordToggle', url: '/components/input/#input-api', text: 'Показать пароль password. allowPasswordToggle: boolean', code: ["import { Input } from '@dreadnought/ui/react';"], keywords: ['password'] };
const identity = { buildId: 'a'.repeat(64), packageVersions: { '@dreadnought/core': '0.1.0' } };
const manifest = { schemaVersion: 1, ...identity, entries: [entry] };

describe('published knowledge boundaries', () => {
  it('publishes and loads adapter-only Radar knowledge at its real API anchor', () => {
    const url = '/components/radarchart/#radarchart-api';
    const pages = new Map([['/components/radarchart/', parsePage('<h2 id="radarchart-api">API</h2>')]]);
    expect(() => validateLink(url, pages)).not.toThrow();
    const chunks = catalogChunks({ entries: [{ id: 'component:radar-chart', name: 'RadarChart', docsUrl: url, description: 'Radar', bindings: [
      { id: 'react-adapter', layer: 2, exportName: 'RadarChartAdapter', importPath: '@dreadnought/react/unstyled', examples: [{ id: 'basic', code: '<RadarChartAdapter />' }] },
    ] }] }, pages);
    expect(chunks.map(chunk => chunk.url)).toEqual([url, url]);
    const radar = { ...entry, id: chunks[0].id, url, title: chunks[0].title, text: chunks[0].text };
    expect(validateManifest({ ...manifest, entries: [radar] }, identity).entries[0].url).toBe(url);
  });
  it('extracts only explicit article sections and keeps whole code separate', () => {
    const document = parsePage(`<nav data-knowledge id="nav">Private nav</nav><main><article>
      <p>Unselected text</p><section data-knowledge aria-labelledby="start"><h2 id="start">Start</h2><p>Public guidance</p>
      <pre><code>const x = 1;\nconsole.log(x);</code></pre><button>Copy</button><script>secret()</script>
      <div data-knowledge-exclude>Catalog duplicate<pre>excluded code</pre></div></section>
      <table><tr><td>API duplicate</td></tr></table></article></main>`);
    const result = extractGuides(document, '/getting-started/');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ url: '/getting-started/#start', text: 'Start Public guidance', code: ['const x = 1;\nconsole.log(x);'] });
  });
  it('rejects external, traversed, unpublished and missing-anchor links', () => {
    const pages = new Map([['/components/input/', parsePage('<h2 id="input-api">API</h2>')]]);
    expect(() => validateLink(entry.url, pages)).not.toThrow();
    for (const url of ['https://example.com/', '//evil.test/', '/components/input/../', '/components/input/#missing', '/theming/', '/components/input/#a#b']) expect(() => validateLink(url, pages)).toThrow();
  });
  it('preserves library properties, defaults and complete examples without dependency noise', () => {
    const pages = new Map([['/components/input/', parsePage('<h2 id="input-api">API</h2>')]]);
    const chunks = catalogChunks({ entries: [{ id: 'input', name: 'Input', description: 'Input field', docsUrl: entry.url, bindings: [{ id: 'ui', exportName: 'Input', importPath: '@dreadnought/ui/react', propertyDescriptions: { allowPasswordToggle: 'Show password' }, defaults: { allowPasswordToggle: false }, contracts: [{ variants: [{ properties: [{ name: 'allowPasswordToggle', type: 'boolean', optional: true, origin: 'library' }, { name: 'about', type: 'string', origin: 'dependency' }] }] }], examples: [{ id: 'password', code: '<Input type="password" allowPasswordToggle />' }] }] }] }, pages);
    expect(chunks.find(chunk => chunk.id.endsWith('property:allowPasswordToggle'))?.text).toContain('Default: false');
    expect(chunks.some(chunk => chunk.id.endsWith('property:about'))).toBe(false);
    expect(chunks.find(chunk => chunk.id.endsWith('example:password'))?.code).toEqual(['<Input type="password" allowPasswordToggle />']);
  });
  it('names compound exports accurately while keeping imports valid', () => {
    const pages = new Map([['/components/layout/', parsePage('<h2 id="layout-api">API</h2>')]]);
    const chunks = catalogChunks({ entries: [{ id: 'layout', name: 'Layout', description: 'Page layout', docsUrl: '/components/layout/#layout-api', bindings: [{ id: 'sidebar', exportName: 'Layout', propertyPath: ['Sidebar'], importPath: '@dreadnought/ui/react', contracts: [{ variants: [{ properties: [{ name: 'collapsed', type: 'boolean', origin: 'library' }] }] }] }] }] }, pages);
    expect(chunks.every(chunk => chunk.title.includes('Layout.Sidebar'))).toBe(true);
    expect(chunks.every(chunk => chunk.code[0] === "import { Layout } from '@dreadnought/ui/react';")).toBe(true);
    expect(searchKnowledge(chunks, 'Layout.Sidebar collapsed')[0].text).toContain('collapsed: boolean');
  });
  it('keeps union branch constraints and positional signatures instead of merging properties', () => {
    const pages = new Map([['/components/button/', parsePage('<h2 id="button-api">API</h2>')]]);
    const prop = (name: string, type: string, optional = false) => ({ name, type, optional, origin: 'library' });
    const chunks = catalogChunks({ entries: [{ id: 'button', name: 'Button', description: 'Action', docsUrl: '/components/button/#button-api', bindings: [{ id: 'ui', exportName: 'Button', importPath: '@dreadnought/ui/react', contracts: [{ variants: [{ properties: [prop('href', 'undefined', true), prop('ref', 'Ref<HTMLButtonElement>', true)] }, { properties: [prop('href', 'string'), prop('ref', 'Ref<HTMLAnchorElement>', true)] }] }] }, { id: 'core', exportName: 'helper', importPath: '@dreadnought/core', contracts: [{ parameters: [{ name: 'current', type: 'string | null' }, { name: 'item', type: 'string' }], returnType: 'string | null', variants: [{ properties: [] }] }] }] }] }, pages);
    const refs = chunks.filter(chunk => chunk.id.endsWith('property:ref'));
    expect(refs).toHaveLength(2);
    expect(refs[0].text).toContain('href?: undefined');
    expect(refs[0].text).not.toContain('HTMLAnchorElement');
    expect(refs[1].text).toContain('href: string');
    expect(refs[1].text).not.toContain('HTMLButtonElement');
    expect(chunks.find(chunk => chunk.id.includes(':signature:'))?.text).toBe('helper(current: string | null, item: string): string | null');
  });
});

describe('retrieval relevance', () => {
  it('finds exact property names and Russian/English password questions', () => {
    const unrelated = { ...entry, id: 'catalog:button', title: 'Button loading', text: 'Loading action', code: [], keywords: [] };
    for (const query of ['allowPasswordToggle', 'как показать пароль в Input?', 'how to show password in Input']) expect(searchKnowledge([unrelated, entry], query)[0]).toEqual(entry);
  });
  it('refuses unsupported topics even with a recognized component or common word', () => {
    for (const query of ['Input quantum autocomplete', 'Input поддерживает биометрию', 'how to', 'weather forecast']) expect(searchKnowledge([entry], query)).toEqual([]);
  });
  it('matches guide labels, CSS token words and curated Russian feature wording', () => {
    const theme: KnowledgeEntry = { ...entry, id: 'guide:theme', sourceKind: 'guide', sourceId: 'guide:theme', title: 'Общие токены', text: 'Меняйте значение', code: [':root { --dreadnought-spacing-x4: 1.25rem; }'], keywords: ['theme'] };
    const custom: KnowledgeEntry = { ...entry, id: 'guide:custom', sourceKind: 'guide', sourceId: 'guide:custom', title: 'Своя кнопка', text: 'Создание', code: [], keywords: ['custom', 'components'] };
    const sticky: KnowledgeEntry = { ...entry, id: 'catalog:table', title: 'Table sticky', text: 'Закрепление шапки', code: [], keywords: [] };
    for (const query of ['theme spacing', 'как настроить отступы темы']) expect(searchKnowledge([theme, custom, sticky], query)[0]).toEqual(theme);
    for (const query of ['custom component', 'как создать свой компонент']) expect(searchKnowledge([theme, custom, sticky], query)[0]).toEqual(custom);
    expect(searchKnowledge([theme, custom, sticky], 'как закрепить заголовок Table')[0]).toEqual(sticky);
    expect(searchKnowledge([theme, custom, sticky], 'Angular Table')).toEqual([]);
  });
});

describe('index identity and loading', () => {
  it('rejects stale builds, package versions, malformed paths and duplicate ids', () => {
    expect(validateManifest(manifest, identity).entries).toEqual([entry]);
    for (const data of [{ ...manifest, buildId: 'old' }, { ...manifest, packageVersions: { '@dreadnought/core': '0.0.1' } }, { ...manifest, entries: [{ ...entry, url: '//evil.test/' }] }, { ...manifest, entries: [entry, entry] }]) expect(() => validateManifest(data, identity)).toThrow();
  });
  it('evicts failed requests so retry can succeed; rejects a new stale response', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => manifest });
    await expect(loadKnowledge(identity, fetcher)).rejects.toThrow();
    await expect(loadKnowledge(identity, fetcher)).resolves.toEqual(manifest);
    expect(fetcher).toHaveBeenCalledTimes(2);
    await expect(loadKnowledge({ ...identity, buildId: 'b'.repeat(64) }, vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }))).rejects.toThrow();
  });
});
