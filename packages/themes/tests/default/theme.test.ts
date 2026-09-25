import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(resolve('packages/themes/src/default', file), 'utf8');

describe('default theme', () => {
  it('exposes theme tokens and typography without global Button rules', () => {
    const entry = css('index.css');
    for (const file of ['colors.css', 'constants.css', 'button.tokens.css', 'typography.css']) {
      expect(entry).toContain(`@import './${file}'`);
    }
    expect(entry).not.toContain("@import './button.css'");
    expect(css('button.tokens.css')).toMatch(/--dreadnought-button-bg:\s*var\(--dreadnought-color-action-primary\)/);
    for (const token of [
      'border-width', 'border-style', 'border-color', 'text-decoration', 'shadow',
      'cursor', 'disabled-cursor', 'icon-size', 'spinner-size',
      'spinner-border-width', 'spinner-border-style', 'spinner-border-color',
      'spinner-timing', 'spinner-iteration-count', 'spinner-rotation',
    ]) {
      expect(css('button.tokens.css')).toContain(`--dreadnought-button-${token}:`);
    }
    expect(css('constants.css')).toMatch(/--dreadnought-font-letter-spacing-button:\s*normal/);
    expect(css('typography.css')).toMatch(/letter-spacing:\s*var\(--dreadnought-font-letter-spacing-button\)/);
    expect(css('constants.css')).toContain('--dreadnought-font-style-button: normal');
    expect(css('typography.css')).toContain('font-style: var(--dreadnought-font-style-button)');
    expect(css('constants.css')).toContain('--dreadnought-font-text-transform-button: none');
    expect(css('typography.css')).toContain('text-transform: var(--dreadnought-font-text-transform-button)');
  });
});
