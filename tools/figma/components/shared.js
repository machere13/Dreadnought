import { axes, variantName } from './context.js';

export const prop = (name, slot, value, type = 'TEXT') => ({
  name,
  slot,
  value,
  type,
  field: type === 'TEXT' ? 'characters' : 'visible',
});
export const spec = (name, values, render, description, properties = [], columns = 3) => ({
  name: 'Dreadnought/' + name,
  variants: axes(values),
  render,
  description,
  properties,
  columns,
});
export async function resolved(ctx, name, type, value, scopes, expression) {
  let variable = ctx.derived.get(name);
  if (!variable) {
    const collections = await ctx.figma.variables.getLocalVariableCollectionsAsync();
    let collection = collections.find((c) => c.name === 'Dreadnought / Figma resolved');
    if (!collection)
      collection = ctx.figma.variables.createVariableCollection('Dreadnought / Figma resolved');
    variable = (await ctx.figma.variables.getLocalVariablesAsync()).find(
      (v) => v.variableCollectionId === collection.id && v.name === name,
    );
    if (variable && variable.resolvedType !== type) throw new Error('Конфликт переменной ' + name);
    if (!variable) variable = ctx.figma.variables.createVariable(name, collection, type);
    variable.scopes = scopes;
    variable.description = expression + '; computed for Figma. Resync after source changes.';
    variable.setVariableCodeSyntax('WEB', expression);
    variable.setValueForMode(collection.defaultModeId, value);
    ctx.derived.set(name, variable);
  }
  return variable;
}
export function sized(node, width, height = 80, direction = 'VERTICAL', hugHeight = true) {
  node.layoutMode = direction;
  node.resize(width, height);
  node.primaryAxisSizingMode = direction === 'VERTICAL' && hugHeight ? 'AUTO' : 'FIXED';
  node.counterAxisSizingMode = direction === 'HORIZONTAL' && hugHeight ? 'AUTO' : 'FIXED';
  node.counterAxisAlignItems = 'MIN';
}
export function fill(text) {
  text.textAutoResize = 'HEIGHT';
  text.layoutSizingHorizontal = 'FILL';
  return text;
}
export function skin(ctx, node, bg, border, radius, weight) {
  if (bg) node.fills = [ctx.paint(bg)];
  if (border) node.strokes = [ctx.paint(border)];
  if (radius) ctx.bind(node, 'cornerRadius', radius);
  if (weight) ctx.bind(node, 'strokeWeight', weight);
  node.strokeAlign = 'INSIDE';
}
export async function blur(ctx, node) {
  const raw = ctx.value('popup-backdrop-filter', node);
  const match = typeof raw === 'string' && raw.match(/^blur\(([\d.]+)px\)$/);
  if (!match) throw new Error('Неподдерживаемый blur ' + raw);
  if (!ctx.popupEffect) {
    const styles = await ctx.figma.getLocalEffectStylesAsync();
    const named = styles.filter((s) => s.name === 'Dreadnought/Popup/backdrop-blur');
    if (named.length > 1) throw new Error('Дубли стиля blur');
    ctx.popupEffect = named[0] || ctx.figma.createEffectStyle();
    ctx.popupEffect.name = 'Dreadnought/Popup/backdrop-blur';
    ctx.popupEffect.effects = [
      { type: 'BACKGROUND_BLUR', visible: true, radius: Number(match[1]) },
    ];
  }
  await node.setEffectStyleIdAsync(ctx.popupEffect.id);
}
export function use(ctx, parent, name, values = null, overrides = {}) {
  const set = ctx.catalog.get('Dreadnought/' + name);
  if (!set) throw new Error('Не создана зависимость ' + name);
  const main = values ? set.children.find((n) => n.name === variantName(values)) : set.children[0];
  if (!main) throw new Error('Нет варианта ' + name + ': ' + variantName(values));
  const node = ctx.track(main.createInstance());
  parent.appendChild(node);
  const properties = {};
  for (const [name, value] of Object.entries(overrides)) {
    const key = Object.keys(set.componentPropertyDefinitions).find(
      (key) => key === name || key.startsWith(name + '#'),
    );
    if (!key) throw new Error('Нет свойства ' + name + ' в ' + set.name);
    properties[key] = value;
  }
  if (Object.keys(properties).length) node.setProperties(properties);
  return node;
}
export function iconMain(ctx, name) {
  for (const [key, set] of ctx.catalog) {
    if (!key.startsWith('Dreadnought/Icon/Set')) continue;
    const main = set.children.find((node) => node.name === 'icon=' + name);
    if (main) return main;
  }
  throw new Error('Нет компонента иконки ' + name);
}
export function button(ctx, parent, label, variant = 'ghosted', icon = null, state = 'default') {
  const node = use(
    ctx,
    parent,
    'Button/' + variant,
    { size: 'compact', state },
    { Label: label || '', 'Show label': !!label, 'Show icon': !!icon },
  );
  if (icon) {
    const slot = node.findOne((n) => n.name === 'icon' && n.type === 'INSTANCE');
    if (!slot) throw new Error('Нет слота иконки Button');
    slot.swapComponent(iconMain(ctx, icon));
    for (const shape of slot.findAllWithCriteria({ types: ['VECTOR'] }))
      shape.fills = [ctx.paint(`button-${variant}-fg`)];
  }
  return node;
}
export function divider(ctx, parent, color, height = 1) {
  const line = ctx.shape(parent, 'divider', 100, height);
  line.layoutSizingHorizontal = 'FILL';
  line.fills = [ctx.paint(color)];
  return line;
}
export function absolute(node, x, y) {
  node.layoutPositioning = 'ABSOLUTE';
  node.x = x;
  node.y = y;
  return node;
}
export async function mono(ctx, parent, text, name = 'code', color = 'code-block-text') {
  const node = await ctx.text(parent, text, name, 'body-3', color);
  if (!ctx.monoFont) {
    const fonts = await ctx.figma.listAvailableFontsAsync();
    ctx.monoFont = ['Roboto Mono', 'Courier New']
      .map(
        (family) =>
          fonts.find((f) => f.fontName.family === family && f.fontName.style === 'Regular')
            ?.fontName,
      )
      .find(Boolean);
    if (!ctx.monoFont)
      throw new Error(
        'Для кода нужен Roboto Mono или Courier New. Установите шрифт и перезапустите плагин.',
      );
    await ctx.figma.loadFontAsync(ctx.monoFont);
  }
  node.fontName = ctx.monoFont;
  return node;
}
