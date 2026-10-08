import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = 'packages/themes/src/default';
const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('default Breadcrumb theme', () => {
  it('imports one component entry and defines every referenced token', () => {
    const root = `${themeRoot}/tokens/components/Navigation/Breadcrumb`;
    const sources = [
      ...readdirSync(resolve(`${themeRoot}/tokens/global`))
        .filter((file) => file.endsWith('.tokens.css'))
        .map((file) => read(`${themeRoot}/tokens/global/${file}`)),
      ...readdirSync(resolve(root))
        .filter((file) => file.endsWith('.tokens.css'))
        .map((file) => read(`${root}/${file}`)),
      read('packages/ui/src/presentation/Navigation/Breadcrumb/Breadcrumb.module.css'),
      read(`${themeRoot}/components/Navigation/Breadcrumb/typography.css`),
    ];
    const declared = new Set(
      sources.flatMap((source) =>
        [...source.matchAll(/(--dreadnought-[\w-]+)\s*:/g)].map((match) => match[1]),
      ),
    );
    for (const source of sources) {
      for (const [, name] of source.matchAll(/var\((--dreadnought-[\w-]+)\)/g)) {
        expect(declared.has(name), `undefined ${name}`).toBe(true);
      }
    }
    expect(
      read(`${themeRoot}/index.css`).match(/components\/Navigation\/Breadcrumb\/index\.css/g),
    ).toHaveLength(1);
  });

  it('keeps separators decorative and does not use priority overrides', () => {
    const styles = read('packages/ui/src/presentation/Navigation/Breadcrumb/Breadcrumb.module.css');
    expect(styles).toMatch(/\.item\s*\+\s*\.item::before/);
    expect(styles).toContain('content: var(--dreadnought-breadcrumb-separator-content)');
    expect(styles).not.toContain('!important');
  });
});
