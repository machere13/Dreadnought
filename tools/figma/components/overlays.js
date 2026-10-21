import { spec, prop, sized, skin, fill, use, button, blur, absolute } from './shared.js';

const placements = [
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
  'left',
  'leftTop',
  'leftBottom',
  'right',
  'rightTop',
  'rightBottom',
];
function arrow(ctx, node, prefix, placement) {
  const size = ctx.value(prefix + '-arrow-size', node),
    extent = size / Math.sqrt(2);
  const horizontal = /^(top|bottom)/.test(placement);
  const side = placement.match(/^(top|bottom|left|right)/)[1];
  const position = horizontal
    ? /Left$/.test(placement)
      ? 16
      : /Right$/.test(placement)
        ? node.width - 16
        : node.width / 2
    : /Top$/.test(placement)
      ? 16
      : /Bottom$/.test(placement)
        ? node.height - 16
        : node.height / 2;
  const paths = {
    top: `M0 0 L${extent} ${extent} L${extent * 2} 0`,
    bottom: `M0 ${extent} L${extent} 0 L${extent * 2} ${extent}`,
    left: `M0 0 L${extent} ${extent} L0 ${extent * 2}`,
    right: `M${extent} 0 L0 ${extent} L${extent} ${extent * 2}`,
  };
  const w = horizontal ? extent * 2 : extent,
    h = horizontal ? extent : extent * 2;
  const graphic = ctx.track(
    ctx.figma.createNodeFromSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${paths[side]} Z"/><path d="${paths[side]}" fill="none" stroke="black" stroke-width="1"/></svg>`,
    ),
  );
  node.appendChild(graphic);
  graphic.name = 'arrow';
  graphic.resize(w, h);
  absolute(
    graphic,
    horizontal ? position - extent : side === 'left' ? node.width : -extent,
    horizontal ? (side === 'top' ? node.height : -extent) : position - extent,
  );
  const vectors = graphic.findAllWithCriteria({ types: ['VECTOR'] });
  vectors.forEach((v, index) => {
    ctx.track(v);
    if (index === 0) v.fills = [ctx.paint(prefix + '-bg')];
    else {
      v.fills = [];
      v.strokes = [ctx.paint(prefix + '-border')];
      ctx.bind(v, 'strokeWeight', prefix + '-border-width');
    }
  });
}
async function popup(ctx, node, { placement }, prefix) {
  sized(node, prefix === 'tooltip' ? 220 : 320);
  ctx.padding(node, prefix + '-padding-inline', prefix + '-padding-block');
  skin(ctx, node, prefix + '-bg', prefix + '-border', prefix + '-radius', prefix + '-border-width');
  await blur(ctx, node);
  const text = fill(
    await ctx.text(
      node,
      prefix === 'tooltip' ? 'Подсказка к действию' : 'Содержимое всплывающей панели.',
      'content',
      prefix === 'tooltip' ? 'body-3' : 'body-2',
      prefix + '-text',
    ),
  );
  ctx.bind(text, 'fontSize', prefix + '-font-size');
  ctx.bind(text, 'fontWeight', prefix + '-font-weight');
  text.lineHeight = { unit: 'PERCENT', value: ctx.value(prefix + '-line-height', node) * 100 };
  arrow(ctx, node, prefix, placement);
}
async function modalPanel(ctx, node, { footer, content }, prefix = 'modal') {
  const floating = prefix === 'floating-panel';
  sized(node, ctx.value(floating ? 'floating-panel-width' : 'modal-width', node));
  ctx.padding(node, prefix + '-padding');
  ctx.bind(node, 'itemSpacing', floating ? 'floating-panel-gap' : 'spacing-x4');
  skin(
    ctx,
    node,
    floating ? 'floating-panel-background' : 'modal-bg',
    floating ? 'floating-panel-border-color' : 'modal-border',
    floating ? 'floating-panel-border-radius' : 'modal-radius',
    prefix + '-border-width',
  );
  const header = ctx.auto(node, 'header');
  header.layoutSizingHorizontal = 'FILL';
  ctx.bind(header, 'itemSpacing', 'spacing-x2');
  fill(await ctx.text(header, 'Название', 'title', 'h6'));
  const close = button(ctx, header, '', 'ghosted', 'close');
  close.name = 'close';
  const body = ctx.auto(node, 'body', 'VERTICAL');
  body.layoutSizingHorizontal = 'FILL';
  fill(
    await ctx.text(
      body,
      content === 'long' ? 'Содержимое окна.\n'.repeat(9).trim() : 'Содержимое окна.',
      'content',
    ),
  );
  const actions = ctx.auto(node, 'footer');
  actions.layoutSizingHorizontal = 'FILL';
  actions.primaryAxisAlignItems = floating ? 'MIN' : 'MAX';
  ctx.bind(actions, 'itemSpacing', 'spacing-x2');
  button(ctx, actions, 'Отмена', 'secondary');
  button(ctx, actions, 'Подтвердить', 'primary');
  actions.visible = footer === 'true';
}
function modalViewport(ctx, node) {
  sized(node, 960, 640, 'HORIZONTAL', false);
  node.fills = [ctx.paint('modal-backdrop')];
  const panel = use(ctx, node, 'Modal', { footer: 'true', content: 'short' });
  absolute(panel, (960 - panel.width) / 2, (640 - panel.height) / 2);
}
async function drawer(ctx, node, { placement }) {
  sized(node, 960, 640, 'HORIZONTAL', false);
  node.fills = [ctx.paint('drawer-backdrop')];
  const horizontal = placement === 'left' || placement === 'right';
  const size = ctx.value('drawer-size', node);
  const panel = ctx.auto(node, 'drawer', 'VERTICAL');
  sized(panel, horizontal ? size : 960, horizontal ? 640 : size, 'VERTICAL', false);
  absolute(panel, placement === 'right' ? 960 - size : 0, placement === 'bottom' ? 640 - size : 0);
  ctx.padding(panel, 'drawer-padding');
  skin(ctx, panel, 'drawer-bg', 'drawer-border', 'drawer-radius', 'drawer-border-width');
  ctx.bind(panel, 'itemSpacing', 'spacing-x4');
  await ctx.text(panel, 'Содержимое Drawer', 'title', 'h6');
  fill(await ctx.text(panel, 'Произвольное содержимое боковой области.', 'content'));
}
function floating(ctx, node, { placement, open }) {
  sized(node, 960, 640, 'HORIZONTAL', false);
  const right = placement.endsWith('right'),
    top = placement.startsWith('top');
  const offset = ctx.value('floating-panel-offset', node);
  const launch = button(ctx, node, 'Помощь', 'primary');
  absolute(
    launch,
    right ? 960 - offset - launch.width : offset,
    top ? offset : 640 - offset - launch.height,
  );
  const panel = use(ctx, node, 'FloatingPanel/Panel', { footer: 'true', content: 'short' });
  panel.visible = open === 'true';
  absolute(
    panel,
    right ? 960 - offset - panel.width : offset,
    top
      ? offset + launch.height + ctx.value('floating-panel-gap', node)
      : launch.y - ctx.value('floating-panel-gap', node) - panel.height,
  );
}
function toastViewport(ctx, node, { placement }) {
  sized(node, 960, 640, 'HORIZONTAL', false);
  node.fills = [ctx.paint('color-surface-canvas')];
  const stack = ctx.auto(node, 'toast-viewport', 'VERTICAL');
  sized(stack, ctx.value('toast-width', node));
  ctx.bind(stack, 'itemSpacing', 'toast-gap');
  for (const type of ['info', 'success', 'warning']) {
    const toast = use(
      ctx,
      stack,
      'Toast',
      { type },
      { Title: 'Уведомление', Description: 'Сообщение пользователю' },
    );
    toast.layoutSizingHorizontal = 'FILL';
  }
  const inset = ctx.value('toast-inset', node);
  absolute(
    stack,
    placement.endsWith('start')
      ? inset
      : placement.endsWith('end')
        ? 960 - inset - stack.width
        : (960 - stack.width) / 2,
    placement.startsWith('top') ? inset : 640 - inset - stack.height,
  );
}
export const overlaySpecs = [
  ...['Tooltip', 'Popover'].map((name) =>
    spec(
      name,
      { placement: placements },
      (ctx, n, p) => popup(ctx, n, p, name.toLowerCase()),
      name +
        ': все 12 placement, отдельно управляемая стрелка. Цвет, типографика и background blur из темы; hover-delay, autoAdjustOverflow и события не исполняются.',
      [
        prop(
          'Content',
          'content',
          name === 'Tooltip' ? 'Подсказка к действию' : 'Содержимое всплывающей панели.',
        ),
        prop('Arrow', 'arrow', true, 'BOOLEAN'),
      ],
      3,
    ),
  ),
  spec(
    'Modal',
    { footer: ['false', 'true'], content: ['short', 'long'] },
    modalPanel,
    'Шапка с title/close, body, footer. Высота по содержимому без верхнего пустого зазора; backdrop отдельным примером. Focus trap и scroll-lock остаются в React.',
    [
      prop('Title', 'title', 'Название'),
      prop('Content', 'content', 'Содержимое окна.'),
      prop('Closable', 'close', true, 'BOOLEAN'),
    ],
    2,
  ),
  spec(
    'Modal/Viewport',
    { state: ['open'] },
    modalViewport,
    'Пример модального окна по центру viewport 960×640 с полупрозрачным backdrop.',
    [],
    1,
  ),
  spec(
    'Drawer',
    { placement: ['right', 'left', 'top', 'bottom'] },
    drawer,
    'Четыре положения Drawer в viewport 960×640. Ширина / высота панели из темы, содержимое — пример потребителя; встроенная шапка не выдумывается.',
    [prop('Content', 'content', 'Произвольное содержимое боковой области.')],
    2,
  ),
  spec(
    'FloatingPanel/Panel',
    { footer: ['false', 'true'], content: ['short', 'long'] },
    (ctx, n, p) => modalPanel(ctx, n, p, 'floating-panel'),
    'Секционная плавающая панель: header/body/footer. Отдельная композиция с launcher и placement.',
    [
      prop('Title', 'title', 'Название'),
      prop('Content', 'content', 'Содержимое окна.'),
      prop('Closable', 'close', true, 'BOOLEAN'),
    ],
    2,
  ),
  spec(
    'FloatingPanel',
    {
      placement: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      open: ['false', 'true'],
    },
    floating,
    'Launcher + настоящий экземпляр панели в четырёх углах viewport 960×640. Статичные открытые/закрытые состояния.',
    [],
    2,
  ),
  spec(
    'Toast/Viewport',
    { placement: ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] },
    toastViewport,
    'Шесть положений ToastViewport с тремя настоящими Toast. Inset, ширина и gap из темы; viewport 960×640. Таймеры и анимация не исполняются.',
    [],
    2,
  ),
];
