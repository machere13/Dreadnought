import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(resolve('packages/themes/src/default', file), 'utf8');

describe('default theme', () => {
  it('derives every Button token from a defined global token', () => {
    const globalFiles = readdirSync(resolve('packages/themes/src/default/tokens/global'));
    const buttonFiles = readdirSync(resolve('packages/themes/src/default/tokens/components/Button'));
    const declarations = (files: string[], directory: string) => files.flatMap((file) =>
      [...css(`${directory}/${file}`).matchAll(/(--dreadnought-[\w-]+):\s*([^;]+);/g)],
    );
    const globalNames = new Set(
      declarations(globalFiles, 'tokens/global').map((declaration) => declaration[1]),
    );
    const buttonDeclarations = declarations(buttonFiles, 'tokens/components/Button');

    expect(buttonDeclarations.length).toBeGreaterThan(0);
    for (const [, name, value] of buttonDeclarations) {
      const globalReference = value.trim().match(/^var\((--dreadnought-[\w-]+)\)$/)?.[1];
      expect(globalReference, `${name} must reference a global token`).toBeDefined();
      expect(globalNames.has(globalReference!), `${name} references an undefined global token`).toBe(true);
    }
  });

  it('exposes theme tokens and typography without global Button rules', () => {
    const entry = css('index.css');
    for (const file of [
      'tokens/global/colors.tokens.css',
      'tokens/global/spacing.tokens.css',
      'tokens/global/sizing.tokens.css',
      'tokens/global/typography.tokens.css',
      'tokens/global/effects.tokens.css',
      'tokens/global/motion.tokens.css',
      'tokens/components/Button/colors.tokens.css',
      'tokens/components/Button/spacing.tokens.css',
      'tokens/components/Button/sizing.tokens.css',
      'tokens/components/Button/typography.tokens.css',
      'tokens/components/Button/effects.tokens.css',
      'tokens/components/Button/motion.tokens.css',
      'components/Button/typography.css',
    ]) {
      expect(entry).toContain(`@import './${file}'`);
    }
    expect(entry).not.toContain("@import './button.css'");
    const globalSpacing = css('tokens/global/spacing.tokens.css');
    const buttonColors = css('tokens/components/Button/colors.tokens.css');
    const buttonSizing = css('tokens/components/Button/sizing.tokens.css');
    const buttonTypography = css('tokens/components/Button/typography.tokens.css');
    const buttonEffects = css('tokens/components/Button/effects.tokens.css');
    const buttonMotion = css('tokens/components/Button/motion.tokens.css');
    const typography = css('components/Button/typography.css');
    expect(buttonColors).toMatch(/--dreadnought-button-bg:\s*var\(--dreadnought-color-action-primary\)/);
    for (const token of [
      'border-style', 'text-decoration', 'shadow', 'cursor', 'disabled-cursor',
    ]) {
      expect(buttonEffects).toContain(`--dreadnought-button-${token}:`);
    }
    expect(buttonSizing).toContain('--dreadnought-button-icon-size: var(--dreadnought-size-icon)');
    expect(buttonMotion).toContain('--dreadnought-button-spinner-duration: var(--dreadnought-motion-spinner-duration)');
    expect(buttonTypography).toMatch(/--dreadnought-font-letter-spacing-button:\s*var\(--dreadnought-font-letter-spacing-control\)/);
    expect(typography).toMatch(/letter-spacing:\s*var\(--dreadnought-font-letter-spacing-button\)/);
    expect(buttonTypography).toContain('--dreadnought-font-style-button: var(--dreadnought-font-style-control)');
    expect(typography).toContain('font-style: var(--dreadnought-font-style-button)');
    expect(buttonTypography).toContain('--dreadnought-font-text-transform-button: var(--dreadnought-font-text-transform-control)');
    expect(typography).toContain('text-transform: var(--dreadnought-font-text-transform-button)');
    expect(globalSpacing).not.toMatch(/--dreadnought-[\w-]*button:/);
  });
});
