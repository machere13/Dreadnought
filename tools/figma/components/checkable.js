import { axes } from './context.js';

export const checkableSpecs = ['Checkbox', 'Radio', 'Switch'].map((name) => ({
  name: 'Dreadnought/' + name,
  columns: name === 'Switch' ? 5 : 4,
  variants: axes({
    checked: name === 'Checkbox' ? ['false', 'true', 'mixed'] : ['false', 'true'],
    state:
      name === 'Switch'
        ? ['default', 'focused', 'invalid', 'disabled', 'loading']
        : ['default', 'focused', 'invalid', 'disabled'],
  }),
  properties: [
    {
      name: 'Label',
      type: 'TEXT',
      value: name === 'Checkbox' ? 'Выбрать' : name === 'Radio' ? 'Вариант' : 'Уведомления',
      slot: 'label',
      field: 'characters',
    },
    { name: 'Show label', type: 'BOOLEAN', value: true, slot: 'label', field: 'visible' },
  ],
  description:
    name === 'Switch'
      ? 'checked × state. Loading показан статично, без анимации. Размеры и цвета соответствуют Switch.module.css.'
      : 'checked × state. Геометрия и цвета из текущей темы; без выдуманного hover-оформления. Группы собираются из экземпляров.',
}));

export async function renderCheckable(ctx, node, properties, name) {
  const prefix = name.toLowerCase();
  const selected = properties.checked !== 'false';
  const switched = prefix === 'switch';
  ctx.bind(node, 'itemSpacing', prefix + '-gap');
  const size = ctx.value(switched ? 'switch-thumb-size' : prefix + '-size', node);
  const indicator = ctx.auto(node, 'indicator');
  const border = ctx.value(prefix + '-border-width', indicator);
  const padding = switched ? ctx.value('switch-padding', indicator) : 0;
  indicator.resize(
    switched ? size * 2 + 2 * (padding + border) : size,
    switched ? size + 2 * (padding + border) : size,
  );
  indicator.primaryAxisSizingMode = 'FIXED';
  indicator.counterAxisSizingMode = 'FIXED';
  indicator.primaryAxisAlignItems = switched ? (selected ? 'MAX' : 'MIN') : 'CENTER';
  ctx.bind(indicator, 'strokeWeight', prefix + '-border-width');
  indicator.strokeAlign = 'INSIDE';
  if (prefix === 'radio') indicator.cornerRadius = size / 2;
  else ctx.bind(indicator, 'cornerRadius', prefix + '-radius');
  indicator.fills = [ctx.paint(prefix + (selected ? '-checked-bg' : '-bg'))];
  indicator.strokes = [
    ctx.paint(
      prefix + (properties.state === 'invalid' ? '-invalid' : selected ? '-checked-bg' : '-border'),
    ),
  ];
  if (switched) {
    ctx.padding(indicator, 'switch-padding');
    const thumb = ctx.shape(indicator, 'thumb', size, size, true);
    thumb.fills = [ctx.paint(selected ? 'switch-checked-thumb-bg' : 'switch-thumb-bg')];
    if (properties.state === 'loading') {
      thumb.fills = [];
      thumb.strokes = [ctx.paint('loader-track')];
      ctx.bind(thumb, 'strokeWeight', 'loader-border-width');
      const svg = ctx.track(
        ctx.figma.createNodeFromSvg(
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M1 9a8 8 0 0 1 8-8" fill="none" stroke="black" stroke-width="2"/></svg>',
        ),
      );
      indicator.appendChild(svg);
      svg.name = 'loading-arc';
      svg.layoutPositioning = 'ABSOLUTE';
      svg.resize(size, size);
      svg.x = selected ? indicator.width - padding - border - size : padding + border;
      svg.y = padding + border;
      for (const vector of svg.findAllWithCriteria({ types: ['VECTOR'] })) {
        ctx.track(vector);
        vector.strokes = [ctx.paint(selected ? 'switch-checked-thumb-bg' : 'switch-thumb-bg')];
      }
    }
  } else if (selected) {
    if (prefix === 'radio') {
      const dot = ctx.shape(
        indicator,
        'dot',
        ctx.value('radio-dot-size', indicator),
        undefined,
        true,
      );
      ctx.bind(dot, 'width', 'radio-dot-size');
      ctx.bind(dot, 'height', 'radio-dot-size');
      dot.fills = [ctx.paint('radio-checked-text')];
    } else if (properties.checked === 'mixed') {
      const mark = ctx.shape(
        indicator,
        'mixed-mark',
        (size - border * 2) / 2,
        ctx.value('checkbox-mixed-height', indicator),
      );
      ctx.bind(mark, 'height', 'checkbox-mixed-height');
      mark.fills = [ctx.paint('checkbox-checked-text')];
    } else
      ctx.icon(
        indicator,
        'check',
        'checkbox-checked-text',
        ctx.value('font-size-checkbox', indicator),
      );
  }
  await ctx.text(
    node,
    prefix === 'checkbox' ? 'Выбрать' : prefix === 'radio' ? 'Вариант' : 'Уведомления',
    'label',
    'body-2',
    prefix + '-text',
    prefix,
  );
  if (properties.state === 'focused') ctx.focus(indicator, prefix);
  if (properties.state === 'disabled')
    await ctx.opacity(node, ctx.token(prefix + '-disabled-opacity'));
}
