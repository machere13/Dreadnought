import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = 'packages/themes/src/default';
const tokenRoot = `${themeRoot}/tokens/components/Navigation/Accordion`;
const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('default Accordion theme', () => {
  it('defines every referenced token and imports the component once', () => {
    const global = readdirSync(resolve(`${themeRoot}/tokens/global`))
      .filter((file) => file.endsWith('.tokens.css'))
      .map((file) => read(`${themeRoot}/tokens/global/${file}`));
    const local = readdirSync(resolve(tokenRoot))
      .filter((file) => file.endsWith('.tokens.css'))
      .map((file) => read(`${tokenRoot}/${file}`));
    const styles = read('packages/ui/src/presentation/Navigation/Accordion/Accordion.module.css');
    const typography = read(`${themeRoot}/components/Navigation/Accordion/typography.css`);
    const sources = [...global, ...local, styles, typography];
    const names = new Set(sources.flatMap((source) =>
      [...source.matchAll(/(--dreadnought-[\w-]+)\s*:/g)].map((match) => match[1]),
    ));
    for (const source of sources) {
      for (const [, reference] of source.matchAll(/var\((--dreadnought-[\w-]+)\)/g)) {
        expect(names.has(reference), `undefined ${reference}`).toBe(true);
      }
    }
    const entry = read(`${themeRoot}/index.css`);
    expect(entry.match(/@import '\.\/components\/Navigation\/Accordion\/index\.css';/g)).toHaveLength(1);
    expect(read(`${themeRoot}/components/Navigation/Accordion/index.css`))
      .toContain("@import '../../../tokens/components/Navigation/Accordion/index.css'");
  });

  it('keeps hidden panels hidden even when normal panel styling sets display', () => {
    const styles = read('packages/ui/src/presentation/Navigation/Accordion/Accordion.module.css');
    expect(styles).toMatch(/\.panel\[hidden\]\s*\{\s*display:\s*none;/);
    expect(styles).not.toContain('!important');
  });
});
