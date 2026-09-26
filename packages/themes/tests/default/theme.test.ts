import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(resolve('packages/themes/src/default', file), 'utf8');
const componentFamilies = { Button: 'Controls', Input: 'Fields', TextArea: 'Fields', Badge: 'DataDisplay' } as const;

describe('default theme', () => {
  it('keeps typography in the library layer and token defaults outside it', () => {
    for (const [component, family] of Object.entries(componentFamilies)) {
      expect(css(`components/${family}/${component}/typography.css`).trimStart()).toMatch(/^@layer dreadnought\s*\{/);
      expect(css(`tokens/components/${family}/${component}/colors.tokens.css`).trimStart()).toMatch(/^:root\s*\{/);
    }
  });

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
    expect(globalTokens.some(([, name]) => name === '--dreadnought-color-action-primary')).toBe(true);
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

  it('maps semantic color roles to component-specific slots', () => {
    const declarations = (source: string) => new Map(
      [...source.matchAll(/(--dreadnought-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
    );
    const global = declarations(css('tokens/global/colors.tokens.css'));
    expect(global.get('--dreadnought-color-action-primary')).toBe('rgb(80 70 229 / 100%)');
    expect(global.get('--dreadnought-color-action-secondary')).toBe('rgb(238 238 253 / 100%)');
    expect(global.get('--dreadnought-color-action-secondary-hover')).toBe('rgb(220 218 250 / 100%)');
    expect(global.get('--dreadnought-color-text-primary')).toBe('rgb(39 34 100 / 100%)');
    expect(global.get('--dreadnought-color-status-error')).toBe('rgb(180 35 24 / 100%)');
    expect(global.has('--dreadnought-color-secondary')).toBe(false);

    const button = declarations(css('tokens/components/Controls/Button/colors.tokens.css'));
    expect(button.get('--dreadnought-button-primary-bg')).toBe('var(--dreadnought-color-action-primary)');
    expect(button.get('--dreadnought-button-secondary-bg')).toBe('var(--dreadnought-color-action-secondary)');
    expect(button.get('--dreadnought-button-secondary-bg-hover')).toBe('var(--dreadnought-color-action-secondary-hover)');
    const input = declarations(css('tokens/components/Fields/Input/colors.tokens.css'));
    expect(input.get('--dreadnought-input-border-invalid')).toBe('var(--dreadnought-color-status-error)');
    const textArea = declarations(css('tokens/components/Fields/TextArea/colors.tokens.css'));
    expect(textArea.get('--dreadnought-text-area-text')).toBe('var(--dreadnought-color-text-primary)');
  });

  it('references only defined global tokens from component tokens', () => {
    const globalFiles = readdirSync(resolve('packages/themes/src/default/tokens/global'));
    const declarations = (files: string[], directory: string) => files.flatMap((file) =>
      [...css(`${directory}/${file}`).matchAll(/(--dreadnought-[\w-]+):\s*([^;]+);/g)],
    );
    const globalNames = new Set(
      declarations(globalFiles, 'tokens/global').map((declaration) => declaration[1]),
    );
    for (const [component, family] of Object.entries(componentFamilies)) {
      const files = readdirSync(resolve(`packages/themes/src/default/tokens/components/${family}/${component}`));
      const componentDeclarations = declarations(files, `tokens/components/${family}/${component}`);
      expect(componentDeclarations.length).toBeGreaterThan(0);
      const suffix = component === 'TextArea' ? 'text-area' : component.toLowerCase();
      const role = component === 'Button' ? 'label-1' : component === 'Badge' ? 'label-2' : 'body-2';
      for (const property of ['font-size', 'font-weight', 'line-height']) {
        const name = `--dreadnought-${property}-${suffix}`;
        expect(componentDeclarations.find(([, token]) => token === name)?.[2].trim()).toBe(`var(--dreadnought-${property}-${role})`);
      }
      for (const [, name, value] of componentDeclarations) {
        expect(value.trim(), `${name} must use a shared numeric token`).not.toMatch(/(?<![\w-])\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|deg|turn)?(?![\w-])/);
        const reference = value.trim().match(/^var\((--dreadnought-[\w-]+)\)$/)?.[1];
        if (reference) expect(globalNames.has(reference), `${name} references an undefined global token`).toBe(true);
      }
    }
  });

  it('exposes theme tokens and typography without global Button rules', () => {
    const entry = css('index.css');
    expect(entry.trim().split(/\r?\n/)).toEqual([
      "@import './tokens/global/index.css';",
      "@import './components/Controls/Button/index.css';",
      "@import './components/Fields/Input/index.css';",
      "@import './components/Fields/TextArea/index.css';",
      "@import './components/DataDisplay/Badge/index.css';",
    ]);
    for (const file of ['colors', 'spacing', 'sizing', 'typography', 'effects', 'motion']) {
      expect(css('tokens/global/index.css')).toContain(`@import './${file}.tokens.css'`);
    }
    for (const [family, component, files] of [
      ['Controls', 'Button', ['colors', 'spacing', 'sizing', 'typography', 'effects', 'motion']],
      ['Fields', 'Input', ['colors', 'spacing', 'sizing', 'effects', 'typography']],
      ['Fields', 'TextArea', ['colors', 'spacing', 'sizing', 'effects', 'typography']],
      ['DataDisplay', 'Badge', ['colors', 'spacing', 'sizing', 'typography']],
    ] as const) {
      const tokenEntry = css(`tokens/components/${family}/${component}/index.css`);
      for (const file of files) expect(tokenEntry).toContain(`@import './${file}.tokens.css'`);
      expect(css(`components/${family}/${component}/index.css`)).toContain(`@import '../../../tokens/components/${family}/${component}/index.css'`);
      expect(css(`components/${family}/${component}/index.css`)).toContain("@import './typography.css'");
    }
    expect(entry).not.toContain("@import './button.css'");
    const globalSpacing = css('tokens/global/spacing.tokens.css');
    const buttonColors = css('tokens/components/Controls/Button/colors.tokens.css');
    const buttonSizing = css('tokens/components/Controls/Button/sizing.tokens.css');
    const buttonTypography = css('tokens/components/Controls/Button/typography.tokens.css');
    const buttonEffects = css('tokens/components/Controls/Button/effects.tokens.css');
    const buttonMotion = css('tokens/components/Controls/Button/motion.tokens.css');
    const typography = css('components/Controls/Button/typography.css');
    expect(buttonColors).toMatch(/--dreadnought-button-primary-bg:\s*var\(--dreadnought-color-action-primary\)/);
    for (const token of [
      'border-style', 'text-decoration', 'shadow', 'cursor', 'disabled-cursor',
    ]) {
      expect(buttonEffects).toContain(`--dreadnought-button-${token}:`);
    }
    expect(buttonSizing).toContain('--dreadnought-button-icon-size: var(--dreadnought-size-inline-graphic)');
    expect(buttonMotion).toContain('--dreadnought-button-spinner-duration: var(--dreadnought-motion-duration-standard)');
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
