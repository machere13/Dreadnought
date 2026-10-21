import { axes } from './context.js';

export const markSpec = {
  name: 'Dreadnought/Mark',
  columns: 2,
  variants: axes({ shape: ['circle', 'square'] }),
  description:
    'Mark размером 6px из текущей темы. Цвет меняется через fill/переменную экземпляра; в Badge по умолчанию наследует цвет текста.',
};
export function renderMark(ctx, node, { shape }) {
  const size = ctx.value('mark-size', node);
  const mark = ctx.shape(node, 'mark-shape', size, size, shape === 'circle');
  ctx.bind(mark, 'width', 'mark-size');
  ctx.bind(mark, 'height', 'mark-size');
  if (shape === 'square') ctx.bind(mark, 'cornerRadius', 'mark-square-radius');
  mark.fills = [ctx.paint('color-text-primary')];
}
export const badgeSpec = {
  name: 'Dreadnought/Badge',
  columns: 3,
  variants: axes({
    appearance: ['solid', 'outline', 'ghosted'],
    adornment: ['none', 'mark', 'icon'],
  }),
  properties: [
    { name: 'Label', type: 'TEXT', value: 'Статус', slot: 'label', field: 'characters' },
  ],
  description:
    'solid / outline / ghosted. adornment: none / mark / icon — взаимоисключающие варианты. Маркер и иконка заменяемые. Это standalone Badge; overlay/count-композиция не включена.',
};

export async function badgeIcon(ctx) {
  const name = 'Dreadnought/Icon/PlusOutlined';
  const existing = ctx.page
    .findAllWithCriteria({ types: ['COMPONENT'] })
    .filter((n) => n.name === name);
  if (existing.length > 1) throw new Error('Дубли иконки ' + name);
  if (existing.length) return existing[0];
  const component = ctx.auto(ctx.page, name, 'HORIZONTAL', 'COMPONENT');
  try {
    ctx.icon(component, 'plus', 'color-text-primary');
    component.x = ctx.sourceX;
    component.y = ctx.sourceY;
    ctx.sourceY += component.height + 80;
    component.description =
      'Исходный Ant Design PlusOutlined. Используется как заменяемый слот, а не отдельная ось вариантов.';
    return component;
  } catch (error) {
    component.remove();
    throw error;
  }
}

export async function renderBadge(ctx, node, { appearance, adornment }, markSet, icon) {
  ctx.padding(node, 'badge-padding-inline', 'badge-padding-block');
  ctx.bind(node, 'itemSpacing', 'badge-gap');
  ctx.bind(node, 'cornerRadius', 'badge-radius');
  ctx.bind(node, 'strokeWeight', `badge-${appearance}-border-width`);
  node.strokeAlign = 'INSIDE';
  node.fills = [ctx.paint(`badge-${appearance}-bg`)];
  node.strokes = appearance === 'outline' ? [ctx.paint('badge-outline-border-color')] : [];
  if (adornment !== 'none') {
    const instance = ctx.track(
      (adornment === 'mark' ? markSet.children[0] : icon).createInstance(),
    );
    instance.name = adornment;
    node.appendChild(instance);
    if (adornment === 'icon') instance.rescale(ctx.value('font-size-badge', node) / instance.width);
    for (const shape of instance.findAllWithCriteria({
      types: ['VECTOR', 'ELLIPSE', 'RECTANGLE'],
    })) {
      ctx.track(shape);
      shape.fills = [ctx.paint(`badge-${appearance}-fg`)];
    }
  }
  await ctx.text(node, 'Статус', 'label', 'label-2', `badge-${appearance}-fg`, 'badge');
}
