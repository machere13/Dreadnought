import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';

it.each(['Toast', 'Loader', 'Progress'])(
  'resolves every %s token through the default theme',
  (component) => {
    const root = 'packages/themes/src/default';
    const tokens = (directory: string) =>
      readdirSync(directory)
        .filter((file) => file.endsWith('.tokens.css'))
        .map((file) => readFileSync(`${directory}/${file}`, 'utf8'))
        .join('\n');
    const sources = [
      tokens(`${root}/tokens/global`),
      tokens(`${root}/tokens/components/Feedback/${component}`),
      readFileSync(`${root}/components/Feedback/${component}/typography.css`, 'utf8'),
      readFileSync(
        `packages/ui/src/presentation/Feedback/${component}/${component}.module.css`,
        'utf8',
      ),
    ];
    const declarations = new Set(
      sources.flatMap((source) =>
        [...source.matchAll(/(--dreadnought-[\w-]+)\s*:/g)].map((match) => match[1]),
      ),
    );
    for (const source of sources) {
      for (const [, name] of source.matchAll(/var\((--dreadnought-[\w-]+)\)/g)) {
        expect(declarations.has(name), `Unresolved token ${name}`).toBe(true);
      }
    }
  },
);

it('keeps Progress motion-free', () => {
  const css = readFileSync(
    'packages/ui/src/presentation/Feedback/Progress/Progress.module.css',
    'utf8',
  );
  expect(css).not.toMatch(/animation|transition|!important/);
});
