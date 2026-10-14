// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse, type Rule } from 'postcss';
import { expect, it } from 'vitest';

function stylesheet(path: string) {
  return parse(readFileSync(resolve(path), 'utf8'));
}

function declarations(path: string) {
  const tokens = new Map<string, string>();
  stylesheet(path).walkDecls((declaration) => {
    tokens.set(declaration.prop, declaration.value);
  });
  return tokens;
}

it('maps Table hover, selection and selected hover to distinct existing surface roles', () => {
  const tokens = declarations(
    'packages/themes/src/default/tokens/components/DataDisplay/Table/colors.tokens.css',
  );
  expect(tokens.get('--dreadnought-table-row-bg-hover')).toBe(
    'var(--dreadnought-color-surface-default)',
  );
  expect(tokens.get('--dreadnought-table-row-bg-selected')).toBe(
    'var(--dreadnought-color-surface-selected)',
  );
  expect(tokens.get('--dreadnought-table-row-bg-selected-hover')).toBe(
    'var(--dreadnought-color-surface-selected-hover)',
  );
});

it('keeps selection on hover, including fixed cells, and respects rowHoverable=false', () => {
  const css = stylesheet('packages/ui/src/presentation/DataDisplay/Table/Table.module.css');
  const hover: Rule[] = [];
  css.walkRules((rule) => {
    if (rule.selector.includes(':hover')) hover.push(rule);
  });
  expect(hover).toHaveLength(2);
  for (const rule of hover) {
    expect(rule.selector).toContain("[data-row-hoverable='true']");
    expect(rule.selector).toContain('> *');
  }
  expect(hover[0].selector).toContain(":not([data-selected='true'])");
  expect(hover[1].selector).toContain("[data-selected='true']:hover");
  expect(hover[1].nodes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        prop: 'background',
        value: 'var(--dreadnought-table-row-bg-selected-hover)',
      }),
    ]),
  );
});

it.each([
  ['Input', 'input', '.input[data-invalid]:focus-within:not([data-disabled])'],
  ['TextArea', 'text-area', ".textArea[aria-invalid='true']:focus-visible:not(:disabled)"],
] as const)(
  'gives invalid %s a distinct focus color without changing geometry or adding a second ring',
  (component, name, selector) => {
    const tokens = declarations(
      `packages/themes/src/default/tokens/components/Fields/${component}/colors.tokens.css`,
    );
    expect(tokens.get(`--dreadnought-${name}-border-invalid-focus`)).toBe(
      'var(--dreadnought-color-status-error-focus)',
    );
    const css = stylesheet(
      `packages/ui/src/presentation/Fields/${component}/${component}.module.css`,
    );
    let focus: Rule | undefined;
    css.walkRules((rule) => {
      if (rule.selector === selector) focus = rule;
    });
    expect(focus).toBeTruthy();
    expect(focus!.nodes).toHaveLength(1);
    expect(focus!.nodes[0]).toMatchObject({
      prop: 'border-color',
      value: `var(--dreadnought-${name}-border-invalid-focus)`,
    });
  },
);

it('keeps focus-error color distinct and readable on the field background', () => {
  const tokens = declarations('packages/themes/src/default/tokens/global/colors.tokens.css');
  const color = (name: string) =>
    tokens.get(`--dreadnought-color-${name}`)!.match(/\d+/g)!.slice(0, 3).map(Number);
  const luminance = (rgb: number[]) =>
    rgb
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const focus = color('status-error-focus');
  expect(focus).not.toEqual(color('status-error'));
  expect(
    (luminance(focus) + 0.05) / (luminance(color('surface-default')) + 0.05),
  ).toBeGreaterThanOrEqual(3);
});
