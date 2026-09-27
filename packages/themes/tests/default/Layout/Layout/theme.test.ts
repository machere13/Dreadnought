import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = 'packages/themes/src/default';
const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('default Layout theme', () => {
  it('defines every CSS variable referenced by the ready Layout', () => {
    const componentRoot = `${themeRoot}/tokens/components/Layout/Layout`;
    const sources = [
      ...readdirSync(resolve(`${themeRoot}/tokens/global`)).filter((name) => name.endsWith('.tokens.css')).map((name) => read(`${themeRoot}/tokens/global/${name}`)),
      ...readdirSync(resolve(componentRoot)).filter((name) => name.endsWith('.tokens.css')).map((name) => read(`${componentRoot}/${name}`)),
      read('packages/ui/src/presentation/Layout/Layout/Layout.module.css'),
      read(`${themeRoot}/components/Layout/Layout/typography.css`),
    ];
    const declared = new Set(sources.flatMap((source) => [...source.matchAll(/(--dreadnought-[\w-]+)\s*:/g)].map((match) => match[1])));
    for (const source of sources) {
      for (const [, name] of source.matchAll(/var\((--dreadnought-[\w-]+)\)/g)) {
        expect(declared.has(name), `undefined ${name}`).toBe(true);
      }
    }
    expect(read(`${themeRoot}/index.css`).match(/components\/Layout\/Layout\/index\.css/g)).toHaveLength(1);
  });

  it('maps component tokens to global roles and preserves hidden Sidebar bodies', () => {
    const root = `${themeRoot}/tokens/components/Layout/Layout`;
    for (const name of ['colors', 'spacing', 'sizing', 'typography']) {
      const contents = read(`${root}/${name}.tokens.css`);
      for (const [, value] of contents.matchAll(/--dreadnought-layout-[\w-]+:\s*([^;]+);/g)) {
        expect(value.trim()).toMatch(/^var\(--dreadnought-(?:color|spacing|size|font|line|border)-[\w-]+\)$/);
      }
    }
    const styles = read('packages/ui/src/presentation/Layout/Layout/Layout.module.css');
    expect(styles).not.toContain('!important');
    expect(styles).not.toMatch(/\.body\s*\{[^}]*display\s*:/s);
  });
});
