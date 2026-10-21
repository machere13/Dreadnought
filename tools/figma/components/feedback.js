import { axes } from './context.js';

const types = ['info', 'success', 'warning', 'error'];
const sizes = ['small', 'default', 'large'];
const contentProperties = [
  { name: 'Title', type: 'TEXT', value: 'Уведомление', slot: 'title', field: 'characters' },
  {
    name: 'Description',
    type: 'TEXT',
    value: 'Подробности уведомления.',
    slot: 'description',
    field: 'characters',
  },
  { name: 'Show description', type: 'BOOLEAN', value: true, slot: 'description', field: 'visible' },
  { name: 'Show icon', type: 'BOOLEAN', value: true, slot: 'icon', field: 'visible' },
  { name: 'Closable', type: 'BOOLEAN', value: true, slot: 'close', field: 'visible' },
];
const labelProperties = [
  { name: 'Label', type: 'TEXT', value: 'Загрузка', slot: 'label', field: 'characters' },
  { name: 'Show label', type: 'BOOLEAN', value: false, slot: 'label', field: 'visible' },
];
export const feedbackSpecs = [
  {
    name: 'Dreadnought/Alert',
    columns: 2,
    variants: axes({ type: types, appearance: ['outlined', 'filled'] }),
    properties: contentProperties.map((p) => ({
      ...p,
      value: p.name === 'Show icon' || p.name === 'Closable' ? false : p.value,
    })),
    reviewProperties: { 'Show icon': true, Closable: true },
    description:
      'info / success / warning / error × outlined / filled. Иконка и закрытие выключены по умолчанию, как в коде; на стенде включены. Текст и видимость редактируются. Без action-слота в этой группе.',
  },
  {
    name: 'Dreadnought/Toast',
    columns: 2,
    variants: axes({ type: types }),
    properties: contentProperties,
    description:
      'Четыре типа Toast. Иконка, описание и закрытие управляются свойствами. Статичный экземпляр: без таймера, action-слота и ToastViewport с шестью положениями.',
  },
  {
    name: 'Dreadnought/Loader',
    columns: 3,
    variants: axes({ size: sizes }),
    properties: labelProperties,
    reviewProperties: { 'Show label': true },
    description:
      'small / default / large. Кольцо из CSS с выделенной верхней четвертью, без анимации и задержки. Подпись выключена по умолчанию; на стенде включена.',
  },
  {
    name: 'Dreadnought/Loader/Overlay',
    columns: 3,
    variants: axes({ loading: ['true', 'false'], size: sizes }),
    properties: [
      {
        name: 'Content',
        type: 'TEXT',
        value: 'Область содержимого',
        slot: 'content-label',
        field: 'characters',
      },
    ],
    description:
      'Loader поверх демонстрационной области children 280×112. loading=true приглушает содержимое и показывает overlay; false оставляет только содержимое. Размер области можно менять в макете.',
  },
];

export async function alertFilledColors(ctx) {
  const collections = await ctx.figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find((c) => c.name === 'Dreadnought / Figma resolved');
  if (!collection) {
    collection = ctx.figma.variables.createVariableCollection('Dreadnought / Figma resolved');
    collection.renameMode(collection.defaultModeId, 'Default');
  }
  const variables = await ctx.figma.variables.getLocalVariablesAsync();
  const colors = new Map();
  for (const type of types) {
    const accent = ctx.value(`alert-${type}-accent`, ctx.page);
    const base = ctx.value('alert-filled-base', ctx.page);
    const alpha = accent.a * 0.14 + base.a * 0.86;
    const mixed = { a: alpha };
    for (const channel of ['r', 'g', 'b'])
      mixed[channel] = alpha
        ? (accent[channel] * accent.a * 0.14 + base[channel] * base.a * 0.86) / alpha
        : 0;
    const name = `Alert/filled-${type}`;
    let variable = variables.find(
      (v) => v.variableCollectionId === collection.id && v.name === name,
    );
    if (variable && variable.resolvedType !== 'COLOR') throw new Error('Конфликт цвета ' + name);
    if (!variable) variable = ctx.figma.variables.createVariable(name, collection, 'COLOR');
    variable.scopes = ['FRAME_FILL', 'SHAPE_FILL'];
    const expression = `color-mix(in srgb, var(--dreadnought-alert-${type}-accent) 14%, var(--dreadnought-alert-filled-base))`;
    variable.description = expression + '; calculated from source, resync after theme changes.';
    variable.setVariableCodeSyntax('WEB', expression);
    variable.setValueForMode(collection.defaultModeId, mixed);
    ctx.derived.set(name, variable);
    colors.set(type, variable);
  }
  return colors;
}

export async function renderNotice(ctx, node, { type, appearance }, prefix, filled) {
  const toast = prefix === 'toast';
  node.resize(toast ? ctx.value('toast-width', node) : 480, 100);
  if (toast) ctx.bind(node, 'width', 'toast-width');
  node.primaryAxisSizingMode = 'FIXED';
  node.counterAxisSizingMode = 'AUTO';
  node.counterAxisAlignItems = 'MIN';
  ctx.padding(
    node,
    toast ? 'toast-padding' : 'alert-padding-inline',
    toast ? 'toast-padding' : 'alert-padding-block',
  );
  ctx.bind(node, 'itemSpacing', prefix + '-gap');
  ctx.bind(node, 'cornerRadius', prefix + '-radius');
  ctx.bind(node, 'strokeWeight', prefix + '-border-width');
  node.strokeAlign = 'INSIDE';
  const accent = toast ? `toast-${type}` : `alert-${type}-accent`;
  node.fills =
    appearance === 'filled'
      ? [
          ctx.figma.variables.setBoundVariableForPaint(
            { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
            'color',
            filled.get(type),
          ),
        ]
      : [ctx.paint(toast ? 'toast-bg' : 'alert-outlined-bg')];
  node.strokes = [
    ctx.paint(toast ? 'toast-border' : appearance === 'filled' ? 'alert-filled-border' : accent),
  ];
  if (toast && ctx.value('toast-icon-size', node) !== '1em')
    throw new Error('Изменился размер иконки Toast; обновите перевод em в px.');
  const graphic = ctx.icon(
    node,
    type,
    accent,
    ctx.value(toast ? 'font-size-toast-description' : 'font-size-alert-title', node),
  );
  graphic.name = 'icon';
  graphic.visible = toast;
  const content = ctx.auto(node, 'content', 'VERTICAL');
  content.layoutSizingHorizontal = 'FILL';
  content.counterAxisAlignItems = 'MIN';
  if (toast) ctx.bind(content, 'itemSpacing', 'toast-gap');
  const title = await ctx.text(
    content,
    'Уведомление',
    'title',
    'label-1',
    prefix + '-fg',
    prefix + '-title',
  );
  const description = await ctx.text(
    content,
    'Подробности уведомления.',
    'description',
    'body-2',
    toast ? 'toast-description-fg' : 'alert-fg',
    prefix + '-description',
  );
  for (const text of [title, description]) {
    text.textAutoResize = 'HEIGHT';
    text.layoutSizingHorizontal = 'FILL';
  }
  const close = ctx.auto(node, 'close');
  close.primaryAxisAlignItems = 'CENTER';
  ctx.bind(close, 'cornerRadius', toast ? 'toast-radius' : 'alert-close-radius');
  if (toast) {
    const size = ctx.value('toast-close-size', close);
    close.resize(size, size);
    ctx.bind(close, 'width', 'toast-close-size');
    ctx.bind(close, 'height', 'toast-close-size');
  } else ctx.padding(close, 'alert-close-padding');
  ctx.icon(
    close,
    'close',
    toast ? 'toast-fg' : 'alert-close-fg',
    ctx.value('font-size-' + prefix + '-description', close),
  );
  close.visible = toast;
}

export async function renderLoader(ctx, node, { size }) {
  node.layoutMode = 'VERTICAL';
  ctx.bind(node, 'itemSpacing', 'loader-gap');
  if (size === 'small' && ctx.value('loader-small-size', node) !== '1em')
    throw new Error('Изменился размер small Loader; обновите перевод em в px.');
  const sizeToken =
    size === 'default'
      ? 'loader-size'
      : size === 'small'
        ? 'font-size-loader'
        : 'loader-large-size';
  const diameter = ctx.value(sizeToken, node);
  const graphic = ctx.auto(node, 'graphic');
  graphic.resize(diameter, diameter);
  ctx.bind(graphic, 'width', sizeToken);
  ctx.bind(graphic, 'height', sizeToken);
  const ring = ctx.shape(graphic, 'track', diameter, diameter, true);
  ring.layoutPositioning = 'ABSOLUTE';
  ring.x = ring.y = 0;
  ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  ctx.bind(ring, 'width', sizeToken);
  ctx.bind(ring, 'height', sizeToken);
  ring.fills = [];
  ring.strokes = [ctx.paint('loader-track')];
  ctx.bind(ring, 'strokeWeight', 'loader-border-width');
  ring.strokeAlign = 'INSIDE';
  const stroke = ctx.value('loader-border-width', node);
  const radius = (diameter - stroke) / 2;
  const center = diameter / 2;
  const offset = radius / Math.sqrt(2);
  const arc = ctx.track(
    ctx.figma.createNodeFromSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}"><path d="M${center - offset} ${center - offset} A${radius} ${radius} 0 0 1 ${center + offset} ${center - offset}" fill="none" stroke="black" stroke-width="${stroke}"/></svg>`,
    ),
  );
  arc.name = 'arc';
  graphic.appendChild(arc);
  arc.layoutPositioning = 'ABSOLUTE';
  arc.resize(diameter, diameter);
  arc.x = arc.y = 0;
  for (const vector of arc.findAllWithCriteria({ types: ['VECTOR'] })) {
    ctx.track(vector);
    vector.strokes = [ctx.paint('loader-fg')];
    ctx.bind(vector, 'strokeWeight', 'loader-border-width');
  }
  const label = await ctx.text(node, 'Загрузка', 'label', 'body-2', 'loader-fg', 'loader');
  label.visible = false;
}

export async function renderLoaderOverlay(ctx, node, { loading, size }, loader) {
  node.resize(280, 112);
  const content = ctx.auto(node, 'content');
  content.layoutSizingHorizontal = content.layoutSizingVertical = 'FILL';
  content.primaryAxisAlignItems = 'CENTER';
  await ctx.text(content, 'Область содержимого', 'content-label');
  if (loading === 'true') await ctx.opacity(content, ctx.token('loader-content-opacity'));
  const overlay = ctx.auto(node, 'overlay', 'VERTICAL');
  overlay.layoutPositioning = 'ABSOLUTE';
  overlay.resize(node.width, node.height);
  overlay.x = overlay.y = 0;
  overlay.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  overlay.primaryAxisAlignItems = 'CENTER';
  overlay.fills = [ctx.paint('loader-overlay-bg')];
  ctx.bind(overlay, 'cornerRadius', 'loader-radius');
  const main = loader.children.find((child) => child.name === 'size=' + size);
  const indicator = ctx.track(main.createInstance());
  indicator.name = 'indicator';
  overlay.appendChild(indicator);
  overlay.visible = loading === 'true';
}
