import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('shares a pill radius across Badge appearances', () => {
  const css = readFileSync(
    resolve('packages/themes/src/default/tokens/components/DataDisplay/Badge/sizing.tokens.css'),
    'utf8',
  );
  expect(css).toContain('--dreadnought-badge-radius: var(--dreadnought-border-radius-pill)');
});
