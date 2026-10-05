import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const themeRoot = 'packages/themes/src/default/tokens';

function declarations(path: string): Map<string, string> {
  const css = readFileSync(resolve(themeRoot, path), 'utf8');
  return new Map(
    [...css.matchAll(/(--dreadnought-[\w-]+):\s*([^;]+);/g)]
      .map(([, name, value]) => [name, value.trim()]),
  );
}

const tokens = new Map([
  ...declarations('global/sizing.tokens.css'),
  ...declarations('global/colors.tokens.css'),
  ...declarations('components/Controls/Button/sizing.tokens.css'),
  ...declarations('components/Controls/Button/colors.tokens.css'),
  ...declarations('components/Fields/Input/colors.tokens.css'),
  ...declarations('components/Fields/TextArea/colors.tokens.css'),
  ...declarations('components/Navigation/Tabs/colors.tokens.css'),
  ...declarations('components/DataDisplay/Badge/colors.tokens.css'),
  ...declarations('components/Surfaces/Card/colors.tokens.css'),
  ...declarations('components/Visualization/RadarChart/colors.tokens.css'),
]);

function color(name: string): number[] {
  const value = tokens.get(`--dreadnought-${name}`);
  if (!value) throw new Error(`Missing color token: ${name}`);
  const reference = value.match(/^var\((--dreadnought-[\w-]+)\)$/);
  if (reference) return color(reference[1].replace('--dreadnought-', ''));
  const channels = value.match(/^rgb\((\d+) (\d+) (\d+) \/ 100%\)$/);
  if (!channels) throw new Error(`Unsupported color: ${name} = ${value}`);
  return channels.slice(1).map(Number);
}

function luminance(channels: number[]): number {
  const linear = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(first: string, second: string): number {
  const values = [luminance(color(first)), luminance(color(second))].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function borderWidth(name: string): number {
  const value = tokens.get(`--dreadnought-${name}`);
  if (!value) throw new Error(`Missing size token: ${name}`);
  const reference = value.match(/^var\((--dreadnought-[\w-]+)\)$/);
  if (reference) return borderWidth(reference[1].replace('--dreadnought-', ''));
  const pixels = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (!pixels) throw new Error(`Unsupported border width: ${name} = ${value}`);
  return Number(pixels[1]);
}

describe('default dark theme contrast', () => {
  it('keeps every Radar series visible on dark and scoped light surfaces', () => {
    expect(contrast('radar-chart-text', 'color-surface-canvas')).toBeGreaterThanOrEqual(4.5);
    for (let index = 1; index <= 6; index++) {
      expect(contrast(`radar-chart-series-${index}-color`, 'color-surface-canvas')).toBeGreaterThanOrEqual(3);
      expect(contrast(`radar-chart-series-${index}-color`, 'color-surface-default')).toBeGreaterThanOrEqual(3);
      expect(contrast(`color-chart-series-${index}-on-light`, 'color-surface-inverse')).toBeGreaterThanOrEqual(3);
    }
  });
  it('separates the canvas from the primary action and keeps its label readable', () => {
    expect(color('button-primary-bg')).toEqual([255, 255, 255]);
    expect(color('button-secondary-bg')).toEqual([70, 70, 70]);
    expect(contrast('color-surface-canvas', 'button-primary-focus-ring')).toBeGreaterThanOrEqual(3);
    expect(contrast('color-surface-inverse', 'button-primary-focus-halo-color')).toBeGreaterThanOrEqual(3);
    expect(contrast('color-surface-canvas', 'button-primary-bg')).toBeGreaterThanOrEqual(3);
    expect(contrast('button-primary-bg', 'button-primary-fg')).toBeGreaterThanOrEqual(4.5);
    expect(borderWidth('button-border-width')).toBeGreaterThan(0);
    expect(contrast('color-surface-canvas', 'button-secondary-border-color')).toBeGreaterThanOrEqual(3);
    expect(contrast('color-surface-canvas', 'button-outlined-border-color')).toBeGreaterThanOrEqual(3);
    expect(contrast('button-secondary-bg', 'button-secondary-fg')).toBeGreaterThanOrEqual(4.5);
  });

  it('uses dark, distinguishable surfaces for fields, tabs and cards', () => {
    for (const name of ['input-bg', 'text-area-bg', 'tabs-list-bg', 'card-bg']) {
      expect(Math.max(...color(name)), name).toBeLessThan(128);
      expect(contrast('color-surface-canvas', name), name).toBeGreaterThanOrEqual(1.2);
    }
    expect(contrast('tabs-list-bg', 'tabs-tab-bg-selected')).toBeGreaterThanOrEqual(1.5);
    expect(contrast('tabs-tab-bg-selected', 'tabs-tab-fg-selected')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('input-bg', 'input-text')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('text-area-bg', 'text-area-text')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('input-bg', 'input-placeholder-text')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('text-area-bg', 'text-area-placeholder-text')).toBeGreaterThanOrEqual(4.5);
  });
});
