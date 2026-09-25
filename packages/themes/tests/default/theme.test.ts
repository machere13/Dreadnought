import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(resolve('packages/themes/src/default', file), 'utf8');

describe('default theme', () => {
  it('exposes theme tokens and typography without global Button rules', () => {
    const entry = css('index.css');
    for (const file of [
      'tokens/global/colors.css',
      'tokens/global/constants.css',
      'tokens/components/Button/tokens.css',
      'typography.css',
    ]) {
      expect(entry).toContain(`@import './${file}'`);
    }
    expect(entry).not.toContain("@import './button.css'");
    const globalConstants = css('tokens/global/constants.css');
    const buttonTokens = css('tokens/components/Button/tokens.css');
    expect(buttonTokens).toMatch(/--dreadnought-button-bg:\s*var\(--dreadnought-color-action-primary\)/);
    for (const token of [
      'border-width', 'border-style', 'border-color', 'text-decoration', 'shadow',
      'cursor', 'disabled-cursor', 'icon-size', 'spinner-size',
      'spinner-border-width', 'spinner-border-style', 'spinner-border-color',
      'spinner-timing', 'spinner-iteration-count', 'spinner-rotation',
    ]) {
      expect(buttonTokens).toContain(`--dreadnought-button-${token}:`);
    }
    expect(buttonTokens).toMatch(/--dreadnought-font-letter-spacing-button:\s*normal/);
    expect(css('typography.css')).toMatch(/letter-spacing:\s*var\(--dreadnought-font-letter-spacing-button\)/);
    expect(buttonTokens).toContain('--dreadnought-font-style-button: normal');
    expect(css('typography.css')).toContain('font-style: var(--dreadnought-font-style-button)');
    expect(buttonTokens).toContain('--dreadnought-font-text-transform-button: none');
    expect(css('typography.css')).toContain('text-transform: var(--dreadnought-font-text-transform-button)');
    expect(globalConstants).not.toMatch(/--dreadnought-[\w-]*button:/);
  });
});
