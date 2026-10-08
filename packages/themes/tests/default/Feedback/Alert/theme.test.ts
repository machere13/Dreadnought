import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = 'packages/themes/src/default';
const tokenRoot = `${themeRoot}/tokens/components/Feedback/Alert`;
const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('default Alert theme', () => {
  it('defines all referenced tokens and imports Alert exactly once', () => {
    const global = readdirSync(resolve(`${themeRoot}/tokens/global`))
      .filter((file) => file.endsWith('.tokens.css'))
      .map((file) => read(`${themeRoot}/tokens/global/${file}`));
    const local = readdirSync(resolve(tokenRoot))
      .filter((file) => file.endsWith('.tokens.css'))
      .map((file) => read(`${tokenRoot}/${file}`));
    const styles = read('packages/ui/src/presentation/Feedback/Alert/Alert.module.css');
    const typography = read(`${themeRoot}/components/Feedback/Alert/typography.css`);
    const sources = [...global, ...local, styles, typography];
    const names = new Set(
      sources.flatMap((source) =>
        [...source.matchAll(/(--dreadnought-[\w-]+)\s*:/g)].map((match) => match[1]),
      ),
    );
    for (const source of sources) {
      for (const [, reference] of source.matchAll(/var\((--dreadnought-[\w-]+)\)/g)) {
        expect(names.has(reference), `undefined ${reference}`).toBe(true);
      }
    }
    expect(
      read(`${themeRoot}/index.css`).match(/components\/Feedback\/Alert\/index\.css/g),
    ).toHaveLength(1);
    expect(read(`${themeRoot}/components/Feedback/Alert/index.css`)).toContain(
      "@import '../../../tokens/components/Feedback/Alert/index.css'",
    );
  });

  it('has all statuses, both variants, and no priority overrides', () => {
    const styles = read('packages/ui/src/presentation/Feedback/Alert/Alert.module.css').replaceAll(
      "'",
      '"',
    );
    for (const type of ['info', 'success', 'warning', 'error']) {
      expect(styles).toContain(`[data-type="${type}"]`);
    }
    for (const variant of ['outlined', 'filled']) {
      expect(styles).toContain(`[data-variant="${variant}"]`);
    }
    expect(styles).not.toContain('!important');
  });

  it('moves the action below the message on a narrow viewport', () => {
    const styles = read('packages/ui/src/presentation/Feedback/Alert/Alert.module.css');
    expect(styles).toMatch(
      /@media\s*\(max-width:\s*30rem\)[\s\S]*?\.actions\s*\{[^}]*grid-column:\s*2\s*\/\s*-1;[^}]*grid-row:\s*3;/,
    );
  });

  it('adds spacing only around slots that are actually rendered', () => {
    const styles = read('packages/ui/src/presentation/Feedback/Alert/Alert.module.css');
    expect(styles).not.toMatch(/column-gap:\s*var\(--dreadnought-alert-gap\)/);
    expect(styles).toMatch(/\.icon\s*\{[^}]*margin-inline-end:\s*var\(--dreadnought-alert-gap\)/);
    expect(styles).toMatch(
      /\.actions\s*\{[^}]*margin-inline-start:\s*var\(--dreadnought-alert-gap\)/,
    );
    expect(styles).toMatch(
      /\.close\s*\{[^}]*margin-inline-start:\s*var\(--dreadnought-alert-gap\)/,
    );
  });
});
