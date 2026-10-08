import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('uses the shared pill radius for Button variants', () => {
  const sizing = readFileSync(
    resolve('packages/themes/src/default/tokens/components/Controls/Button/sizing.tokens.css'),
    'utf8',
  );
  expect(sizing).toContain('--dreadnought-button-radius: var(--dreadnought-border-radius-pill)');
});
