import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(resolve('packages/themes/src/default', file), 'utf8');

describe('default theme', () => {
  it('defines palette colors in RGB with explicit percentage alpha', () => {
    const colors = css('tokens/global/colors.tokens.css');
    const declarations = [...colors.matchAll(/--dreadnought-color-[\w-]+:\s*([^;]+);/g)];
    expect(declarations.length).toBeGreaterThan(0);
    for (const [, value] of declarations) {
      const channels = value.trim().match(/^rgb\((\d{1,3}) (\d{1,3}) (\d{1,3}) \/ (\d+(?:\.\d+)?)%\)$/);
      expect(channels, `${value} must use rgb(R G B / A%)`).not.toBeNull();
      for (const channel of channels!.slice(1, 4)) expect(Number(channel)).toBeLessThanOrEqual(255);
      expect(Number(channels![4])).toBeLessThanOrEqual(100);
    }
    const example = readFileSync(resolve('examples/react/src/page.css'), 'utf8');
    expect(example).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

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
    const names = new Set(globalTokens.map(([, name]) => name));
    for (const role of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body-1', 'body-2', 'body-3', 'label-1', 'label-2', 'caption-1', 'caption-2']) {
      for (const property of ['font-size', 'font-weight', 'line-height']) {
        expect(names.has(`--dreadnought-${property}-${role}`), `${role} needs ${property}`).toBe(true);
      }
    }
    expect(names.has('--dreadnought-font-size-x1')).toBe(false);
    expect(names.has('--dreadnought-font-weight-x1')).toBe(false);
    expect(names.has('--dreadnought-line-height-x1')).toBe(false);
    const values = new Map(globalTokens.map(([, name, value]) => [name, value.trim()]));
    expect(values.get('--dreadnought-font-size-label-1')).toBe('1rem');
    expect(values.get('--dreadnought-font-weight-label-1')).toBe('600');
    expect(values.get('--dreadnought-line-height-label-1')).toBe('1.25');
    expect(values.get('--dreadnought-font-size-body-2')).toBe('1rem');
    expect(values.get('--dreadnought-font-weight-body-2')).toBe('400');
    expect(values.get('--dreadnought-line-height-body-2')).toBe('1.5');
    expect(names.has('--dreadnought-font-size-control')).toBe(false);
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
      const suffix = component === 'TextArea' ? 'text-area' : component.toLowerCase();
      const role = component === 'Button' ? 'label-1' : 'body-2';
      for (const property of ['font-size', 'font-weight', 'line-height']) {
        const name = `--dreadnought-${property}-${suffix}`;
        expect(componentDeclarations.find(([, token]) => token === name)?.[2].trim()).toBe(`var(--dreadnought-${property}-${role})`);
      }
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
    expect(buttonTypography).toContain('--dreadnought-font-size-button: var(--dreadnought-font-size-label-1)');
    expect(buttonTypography).toContain('--dreadnought-font-weight-button: var(--dreadnought-font-weight-label-1)');
    expect(buttonTypography).toContain('--dreadnought-line-height-button: var(--dreadnought-line-height-label-1)');
    expect(buttonTypography).toMatch(/--dreadnought-font-letter-spacing-button:\s*normal/);
    expect(typography).toMatch(/letter-spacing:\s*var\(--dreadnought-font-letter-spacing-button\)/);
    expect(buttonTypography).toContain('--dreadnought-font-style-button: normal');
    expect(typography).toContain('font-style: var(--dreadnought-font-style-button)');
    expect(buttonTypography).toContain('--dreadnought-font-text-transform-button: none');
    expect(typography).toContain('text-transform: var(--dreadnought-font-text-transform-button)');
    expect(globalSpacing).not.toMatch(/--dreadnought-[\w-]*button:/);
  });
});
