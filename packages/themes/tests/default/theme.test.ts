import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(resolve('packages/themes/src/default', file), 'utf8');

describe('default theme', () => {
  it('exposes theme tokens and typography while preserving the old Button until migration', () => {
    const entry = css('index.css');
    for (const file of ['colors.css', 'constants.css', 'button.tokens.css', 'typography.css']) {
      expect(entry).toContain(`@import './${file}'`);
    }
    expect(entry).toContain("@import './button.css'");
    expect(css('button.tokens.css')).toMatch(/--dreadnought-button-bg:\s*var\(--dreadnought-color-action-primary\)/);
    expect(css('constants.css')).toMatch(/--dreadnought-font-letter-spacing-button:\s*normal/);
    expect(css('typography.css')).toMatch(/letter-spacing:\s*var\(--dreadnought-font-letter-spacing-button\)/);
  });
});
