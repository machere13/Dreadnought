import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(resolve('packages/themes/src/default', file), 'utf8');

describe('default theme', () => {
  it('uses scales only for numeric values and names shared roles explicitly', () => {
    const globalFiles = readdirSync(resolve('packages/themes/src/default/tokens/global'));
    const globalTokens = globalFiles.flatMap((file) =>
      [...css(`tokens/global/${file}`).matchAll(/(--dreadnought-[\w-]+):\s*([^;]+);/g)],
    );

    expect(globalTokens.some(([, name]) => name === '--dreadnought-spacing-x1')).toBe(true);
    expect(globalTokens.some(([, name]) => name === '--dreadnought-border-radius-x1')).toBe(true);
    expect(globalTokens.some(([, name]) => name === '--dreadnought-color-primary')).toBe(true);
    expect(globalTokens.some(([, name]) => name === '--dreadnought-opacity-disabled')).toBe(true);
    expect(globalTokens.some(([, name]) => name === '--dreadnought-font-family-ui')).toBe(true);
    expect(globalTokens.some(([, name]) => name === '--dreadnought-size-control-min-height')).toBe(true);
    for (const [, name, value] of globalTokens) {
      expect(name).not.toMatch(/button|input|text-area|spinner|icon/);
      if (/-x[1-9]\d*$/.test(name)) {
        expect(value.trim(), `${name} must contain a numeric scale value`).toMatch(/^-?\d*\.?\d+(?:px|rem|em|s|ms|%)?$/);
      }
    }
  });

  it('references only defined global tokens from component tokens', () => {
    const globalFiles = readdirSync(resolve('packages/themes/src/default/tokens/global'));
    const declarations = (files: string[], directory: string) => files.flatMap((file) =>
      [...css(`${directory}/${file}`).matchAll(/(--dreadnought-[\w-]+):\s*([^;]+);/g)],
    );
    const globalNames = new Set(
      declarations(globalFiles, 'tokens/global').map((declaration) => declaration[1]),
    );
    for (const component of ['Button', 'Input', 'TextArea']) {
      const files = readdirSync(resolve(`packages/themes/src/default/tokens/components/${component}`));
      const componentDeclarations = declarations(files, `tokens/components/${component}`);
      expect(componentDeclarations.length).toBeGreaterThan(0);
      for (const [, name, value] of componentDeclarations) {
        const reference = value.trim().match(/^var\((--dreadnought-[\w-]+)\)$/)?.[1];
        if (reference) expect(globalNames.has(reference), `${name} references an undefined global token`).toBe(true);
      }
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
      'tokens/components/Button/colors.tokens.css',
      'tokens/components/Button/spacing.tokens.css',
      'tokens/components/Button/sizing.tokens.css',
      'tokens/components/Button/typography.tokens.css',
      'tokens/components/Button/effects.tokens.css',
      'tokens/components/Button/motion.tokens.css',
      'components/Button/typography.css',
      'tokens/components/Input/colors.tokens.css',
      'tokens/components/Input/spacing.tokens.css',
      'tokens/components/Input/sizing.tokens.css',
      'tokens/components/Input/effects.tokens.css',
      'tokens/components/Input/typography.tokens.css',
      'components/Input/typography.css',
      'tokens/components/TextArea/colors.tokens.css',
      'tokens/components/TextArea/spacing.tokens.css',
      'tokens/components/TextArea/sizing.tokens.css',
      'tokens/components/TextArea/effects.tokens.css',
      'tokens/components/TextArea/typography.tokens.css',
      'components/TextArea/typography.css',
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
    expect(buttonColors).toMatch(/--dreadnought-button-bg:\s*var\(--dreadnought-color-primary\)/);
    for (const token of [
      'border-style', 'text-decoration', 'shadow', 'cursor', 'disabled-cursor',
    ]) {
      expect(buttonEffects).toContain(`--dreadnought-button-${token}:`);
    }
    expect(buttonSizing).toContain('--dreadnought-button-icon-size: 1em');
    expect(buttonMotion).toContain('--dreadnought-button-spinner-duration: 0.75s');
    expect(buttonTypography).toMatch(/--dreadnought-font-letter-spacing-button:\s*normal/);
    expect(typography).toMatch(/letter-spacing:\s*var\(--dreadnought-font-letter-spacing-button\)/);
    expect(buttonTypography).toContain('--dreadnought-font-style-button: normal');
    expect(typography).toContain('font-style: var(--dreadnought-font-style-button)');
    expect(buttonTypography).toContain('--dreadnought-font-text-transform-button: none');
    expect(typography).toContain('text-transform: var(--dreadnought-font-text-transform-button)');
    expect(globalSpacing).not.toMatch(/--dreadnought-[\w-]*button:/);
  });
});
