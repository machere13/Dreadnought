import { createOpacityBinder } from '../opacity.js';

export async function componentContext(figma, page, variables, icons) {
  const styles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  const created = [],
    updated = new Set();
  const createdNodes = [];
  const derived = new Map();
  const opacity = createOpacityBinder(figma, { repaired: updated, derived });
  const track = (node) => {
    created.push(node.id);
    createdNodes.push(node);
    return node;
  };
  const token = (name) => {
    const value = variables.get('--dreadnought-' + name);
    if (!value) throw new Error('Нет токена ' + name);
    return value;
  };
  const value = (name, consumer) => token(name).resolveForConsumer(consumer).value;
  const bind = (node, field, name) => node.setBoundVariable(field, token(name));
  const paint = (name) =>
    figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
      'color',
      token(name),
    );
  function auto(parent, name, direction = 'HORIZONTAL', type = 'FRAME') {
    const node = track(type === 'COMPONENT' ? figma.createComponent() : figma.createFrame());
    node.name = name;
    node.layoutMode = direction;
    node.primaryAxisSizingMode = 'AUTO';
    node.counterAxisSizingMode = 'AUTO';
    node.counterAxisAlignItems = 'CENTER';
    node.fills = [];
    node.clipsContent = false;
    node.strokesIncludedInLayout = true;
    parent.appendChild(node);
    return node;
  }
  function padding(node, x, y = x) {
    for (const field of ['paddingLeft', 'paddingRight']) bind(node, field, x);
    for (const field of ['paddingTop', 'paddingBottom']) bind(node, field, y);
  }
  function shape(parent, name, width, height = width, circle = false) {
    const node = track(circle ? figma.createEllipse() : figma.createRectangle());
    node.name = name;
    node.resize(width, height);
    parent.appendChild(node);
    return node;
  }
  async function text(
    parent,
    content,
    name = 'label',
    role = 'body-2',
    color = 'color-text-primary',
    prefix = null,
  ) {
    const node = track(figma.createText());
    node.name = name;
    node.fontName = { family: 'Roboto Flex', style: 'Regular' };
    const style = styles.get('Dreadnought/' + role);
    if (!style) throw new Error('Нет стиля ' + role);
    await node.setTextStyleIdAsync(style.id);
    node.characters = content;
    node.fills = [paint(color)];
    parent.appendChild(node);
    if (prefix) {
      bind(node, 'fontSize', 'font-size-' + prefix);
      bind(node, 'fontWeight', 'font-weight-' + prefix);
      node.lineHeight = { unit: 'PERCENT', value: value('line-height-' + prefix, node) * 100 };
    }
    return node;
  }
  function icon(parent, name, color, size = 16) {
    if (!icons[name]) throw new Error('Нет исходной иконки Ant Design: ' + name);
    const node = track(figma.createNodeFromSvg(icons[name]));
    node.name = name;
    node.resize(size, size);
    parent.appendChild(node);
    for (const vector of node.findAllWithCriteria({ types: ['VECTOR'] })) {
      track(vector);
      vector.fills = [paint(color)];
    }
    return node;
  }
  function focus(indicator, prefix) {
    const offset = value(prefix + '-focus-offset', indicator);
    const ring = shape(
      indicator.parent,
      'focus-ring',
      indicator.width + offset * 2,
      indicator.height + offset * 2,
      prefix === 'radio',
    );
    ring.layoutPositioning = 'ABSOLUTE';
    ring.x = indicator.x - offset;
    ring.y = indicator.y - offset;
    ring.fills = [];
    ring.strokes = [paint(prefix + '-focus')];
    ring.strokeAlign = 'OUTSIDE';
    bind(ring, 'strokeWeight', prefix + '-focus-width');
    if (prefix !== 'radio') bind(ring, 'cornerRadius', prefix + '-radius');
    return ring;
  }
  const originals = page.children.slice();
  const sourceX = Math.max(0, ...originals.map((n) => n.x + n.width)) + 160;
  return {
    figma,
    page,
    styles,
    created,
    createdNodes,
    updated,
    track,
    token,
    value,
    bind,
    paint,
    auto,
    padding,
    shape,
    text,
    icon,
    focus,
    opacity,
    derived,
    sourceX,
    sourceY: 40,
  };
}

export function axes(values) {
  return Object.entries(values).reduce(
    (rows, [axis, options]) =>
      rows.flatMap((row) => options.map((option) => ({ ...row, [axis]: option }))),
    [{}],
  );
}

export function variantName(properties) {
  return Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
}

export async function ensureSet(ctx, spec, render) {
  if (spec.variants.length > 30) throw new Error('Разделите матрицу вариантов: ' + spec.name);
  const expected = spec.variants.map(variantName);
  const existing = ctx.page
    .findAllWithCriteria({ types: ['COMPONENT_SET'] })
    .filter((s) => s.name === spec.name);
  if (existing.length > 1) throw new Error('Дубли набора: ' + spec.name);
  if (existing.length) {
    const actual = existing[0].children.map((n) => n.name);
    if (actual.length !== expected.length || expected.some((name) => !actual.includes(name)))
      throw new Error('Набор имеет другую структуру; сохранён без изменений: ' + spec.name);
    return { set: existing[0], created: false };
  }
  const staging = ctx.auto(ctx.page, 'Building ' + spec.name, 'VERTICAL');
  let set;
  try {
    const variants = [];
    for (const properties of spec.variants) {
      const node = ctx.auto(staging, variantName(properties), 'HORIZONTAL', 'COMPONENT');
      await render(node, properties);
      variants.push(node);
    }
    set = ctx.track(ctx.figma.combineAsVariants(variants, ctx.page));
    set.name = spec.name;
    set.description = spec.description;
    set.fills = [ctx.paint('color-surface-canvas')];
    const cellWidth = Math.max(...variants.map((n) => n.width)) + 64;
    const cellHeight = Math.max(...variants.map((n) => n.height)) + 48;
    variants.forEach((node, index) => {
      node.x = 32 + (index % spec.columns) * cellWidth;
      node.y = 32 + Math.floor(index / spec.columns) * cellHeight;
    });
    set.resizeWithoutConstraints(
      Math.max(...variants.map((n) => n.x + n.width)) + 32,
      Math.max(...variants.map((n) => n.y + n.height)) + 32,
    );
    set.x = ctx.sourceX;
    set.y = ctx.sourceY;
    ctx.sourceY += set.height + 120;
    if (spec.properties)
      for (const property of spec.properties) {
        const key = set.addComponentProperty(property.name, property.type, property.value);
        for (const variant of variants) {
          const node = variant.findOne(
            (n) => n.name === property.slot && (property.type !== 'TEXT' || n.type === 'TEXT'),
          );
          if (node)
            node.componentPropertyReferences = {
              ...node.componentPropertyReferences,
              [property.field]: key,
            };
        }
      }
    staging.remove();
    return { set, created: true };
  } catch (error) {
    if (set && !set.removed) set.remove();
    if (!staging.removed) staging.remove();
    throw error;
  }
}

export async function reviewBoard(ctx, spec, set, x, y) {
  const name = spec.name.replace('Dreadnought/', 'Dreadnought / ') + ' / Review';
  const existing = ctx.page.children.filter((n) => n.type === 'FRAME' && n.name === name);
  if (existing.length > 1) throw new Error('Дубли стенда: ' + name);
  if (existing.length) return existing[0];
  const root = ctx.auto(ctx.page, name, 'VERTICAL');
  try {
    const cellWidth = Math.max(200, ...set.children.map((n) => n.width + 24));
    const width = cellWidth * spec.columns + (spec.columns - 1) * 24 + 80;
    root.resize(width, 160);
    root.counterAxisSizingMode = 'FIXED';
    root.primaryAxisSizingMode = 'AUTO';
    root.counterAxisAlignItems = 'MIN';
    root.itemSpacing = 32;
    root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = 40;
    root.fills = [ctx.paint('color-surface-canvas')];
    root.x = x;
    root.y = y;
    await ctx.text(root, spec.name.replace('Dreadnought/', ''), 'title', 'h3');
    const description = await ctx.text(
      root,
      spec.description,
      'description',
      'body-3',
      'color-text-placeholder',
    );
    description.textAutoResize = 'HEIGHT';
    description.resize(width - 80, description.height);
    for (let index = 0; index < set.children.length; index += spec.columns) {
      const row = ctx.auto(root, 'Samples', 'HORIZONTAL');
      row.itemSpacing = 24;
      row.counterAxisAlignItems = 'MIN';
      for (const main of set.children.slice(index, index + spec.columns)) {
        const cell = ctx.auto(row, main.name, 'VERTICAL');
        cell.counterAxisAlignItems = 'MIN';
        cell.itemSpacing = 16;
        cell.resize(cellWidth, 80);
        cell.counterAxisSizingMode = 'FIXED';
        cell.primaryAxisSizingMode = 'AUTO';
        const caption = await ctx.text(
          cell,
          main.name,
          'variant',
          'caption-2',
          'color-text-placeholder',
        );
        caption.textAutoResize = 'HEIGHT';
        caption.resize(cellWidth, caption.height);
        const instance = ctx.track(main.createInstance());
        cell.appendChild(instance);
        const clearKey = Object.keys(set.componentPropertyDefinitions).find((key) =>
          key.startsWith('Show clear#'),
        );
        if (clearKey && !main.name.includes('selection=empty'))
          instance.setProperties({ [clearKey]: true });
        for (const [name, value] of Object.entries(spec.reviewProperties || {})) {
          const key = Object.keys(set.componentPropertyDefinitions).find((key) =>
            key.startsWith(name + '#'),
          );
          if (!key) throw new Error('Нет свойства стенда ' + name);
          instance.setProperties({ [key]: value });
        }
      }
    }
    return root;
  } catch (error) {
    root.remove();
    throw error;
  }
}
