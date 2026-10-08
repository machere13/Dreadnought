import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('uses a compact six-pixel status mark by default', () => {
  const global = readFileSync(
    resolve('packages/themes/src/default/tokens/global/sizing.tokens.css'),
    'utf8',
  );
  const mark = readFileSync(
    resolve('packages/themes/src/default/tokens/components/DataDisplay/Mark/sizing.tokens.css'),
    'utf8',
  );
  expect(global).toContain('--dreadnought-size-status-mark: 6px');
  expect(mark).toContain('--dreadnought-mark-size: var(--dreadnought-size-status-mark)');
});
