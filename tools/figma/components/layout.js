import { spec, prop, sized, skin, fill, use, button, divider } from './shared.js';
import { outline } from './navigation.js';

async function paginationButton(ctx, node, { selected, state }) {
  const size = ctx.value('pagination-size', node);
  sized(node, size, size, 'HORIZONTAL', false);
  node.counterAxisAlignItems = node.primaryAxisAlignItems = 'CENTER';
  ctx.bind(node, 'paddingLeft', 'pagination-padding');
  ctx.bind(node, 'paddingRight', 'pagination-padding');
  skin(
    ctx,
    node,
    selected === 'true'
      ? state === 'hover'
        ? 'pagination-selected-hover-bg'
        : 'pagination-selected-bg'
      : state === 'hover'
        ? 'pagination-hover-bg'
        : 'pagination-bg',
    null,
    'pagination-radius',
  );
  await ctx.text(
    node,
    '1',
    'label',
    'body-2',
    state === 'disabled'
      ? 'pagination-disabled-fg'
      : selected === 'true'
        ? 'pagination-selected-fg'
        : 'pagination-fg',
  );
  if (state === 'focused') {
    const ring = ctx.shape(node, 'focus-ring', size + 6, size + 6);
    ring.layoutPositioning = 'ABSOLUTE';
    ring.x = ring.y = -3;
    ring.fills = [];
    ring.strokes = [ctx.paint('pagination-focus')];
    ring.strokeAlign = 'OUTSIDE';
    ctx.bind(ring, 'strokeWeight', 'pagination-focus-width');
    ctx.bind(ring, 'cornerRadius', 'pagination-radius');
  }
}
async function pagination(ctx, node, { page, simple, controls }) {
  ctx.bind(node, 'itemSpacing', 'pagination-gap');
  const current = page === 'first' ? 1 : page === 'last' ? 10 : 5;
  const add = (label, selected = false, disabled = false) =>
    use(
      ctx,
      node,
      'Pagination/Button',
      { selected: String(selected), state: disabled ? 'disabled' : 'default' },
      { Label: label },
    );
  add('‹', false, current === 1);
  if (simple === 'true') await ctx.text(node, current + ' / 10', 'summary');
  else
    for (const value of current === 1
      ? [1, 2, 3, '…', 10]
      : current === 10
        ? [1, '…', 8, 9, 10]
        : [1, '…', 4, 5, 6, '…', 10]) {
      if (value === '…') await ctx.text(node, '…', 'ellipsis');
      else add(String(value), value === current);
    }
  add('›', false, current === 10);
  if (controls === 'true') {
    const size = use(
      ctx,
      node,
      'Select/outlined',
      { controlSize: 'compact', selection: 'single', state: 'default' },
      { Value: '10 / стр.' },
    );
    size.resize(ctx.value('pagination-size-changer-width', node), 32);
    const jumper = use(
      ctx,
      node,
      'Input',
      { variant: 'outlined', size: 'compact', state: 'default' },
      { Value: String(current) },
    );
    jumper.resize(ctx.value('pagination-quick-jumper-width', node), 32);
  }
}
function toolbar(ctx, node, { orientation }) {
  node.layoutMode = orientation === 'vertical' ? 'VERTICAL' : 'HORIZONTAL';
  ctx.padding(node, 'toolbar-padding');
  ctx.bind(node, 'itemSpacing', 'toolbar-gap');
  skin(ctx, node, 'toolbar-bg', 'toolbar-border-color', 'toolbar-radius', 'toolbar-border-width');
  for (const name of ['bold', 'italic', 'link', 'undo']) button(ctx, node, '', 'ghosted', name);
}
function choiceGroup(ctx, node, { orientation, disabled }, name) {
  node.layoutMode = orientation === 'vertical' ? 'VERTICAL' : 'HORIZONTAL';
  ctx.bind(node, 'itemSpacing', name.toLowerCase() + '-group-gap');
  node.counterAxisAlignItems = 'MIN';
  for (const [index, label] of ['Первый', 'Второй', 'Третий'].entries())
    use(
      ctx,
      node,
      name,
      {
        checked: index === 0 ? 'true' : 'false',
        state: disabled === 'true' ? 'disabled' : 'default',
      },
      { Label: label },
    );
}
async function layoutPart(ctx, node, { collapsed }, part) {
  const sidebar = part === 'Sidebar';
  const prefix = 'layout-' + part.toLowerCase();
  sized(
    node,
    sidebar
      ? ctx.value(
          collapsed === 'true' ? 'layout-sidebar-collapsed-width' : 'layout-sidebar-width',
          node,
        )
      : 480,
    sidebar ? 320 : 80,
    'VERTICAL',
    sidebar ? false : true,
  );
  node.fills = [ctx.paint(part === 'Content' ? 'layout-bg' : prefix + '-bg')];
  if (sidebar) {
    const triggerArea = ctx.auto(node, 'trigger-area');
    ctx.padding(triggerArea, 'layout-trigger-inset');
    const trigger = ctx.auto(triggerArea, 'trigger');
    trigger.resize(
      ctx.value('layout-sidebar-collapsed-width', node) -
        2 * ctx.value('layout-trigger-inset', node),
      ctx.value('layout-trigger-min-height', node),
    );
    trigger.primaryAxisAlignItems = 'CENTER';
    ctx.bind(trigger, 'cornerRadius', 'layout-trigger-radius');
    trigger.fills = [ctx.paint('layout-trigger-bg')];
    ctx.icon(trigger, 'menu', 'layout-trigger-fg');
    if (collapsed !== 'true') {
      const body = ctx.auto(node, 'body', 'VERTICAL');
      body.layoutSizingHorizontal = 'FILL';
      ctx.padding(body, 'layout-sidebar-body-padding');
      const menu = use(ctx, body, 'Menu', { content: 'plain' });
      menu.layoutSizingHorizontal = 'FILL';
    }
  } else {
    ctx.padding(node, prefix + '-padding');
    if (part === 'Header') ctx.bind(node, 'minHeight', 'layout-header-min-height');
    fill(
      await ctx.text(
        node,
        part === 'Header' ? 'Dreadnought' : part === 'Footer' ? 'Подвал' : 'Содержимое страницы',
        'content',
        part === 'Header' ? 'h4' : 'body-2',
        part === 'Footer' ? 'layout-footer-fg' : 'layout-fg',
      ),
    );
  }
  if (part === 'Header' || part === 'Footer' || sidebar) {
    node.strokes = [ctx.paint('layout-divider')];
    node.strokeWeight = 0;
    ctx.bind(
      node,
      sidebar ? 'strokeRightWeight' : part === 'Header' ? 'strokeBottomWeight' : 'strokeTopWeight',
      'layout-divider-width',
    );
  }
}
function layout(ctx, node, { footer, collapsed }) {
  sized(node, 960, 560, 'VERTICAL', false);
  node.fills = [ctx.paint('layout-bg')];
  const header = use(ctx, node, 'Layout/Header', { state: 'default' });
  header.layoutSizingHorizontal = 'FILL';
  const middle = ctx.auto(node, 'middle');
  middle.layoutSizingHorizontal = middle.layoutSizingVertical = 'FILL';
  middle.counterAxisAlignItems = 'MIN';
  const aside = use(ctx, middle, 'Layout/Sidebar', { collapsed });
  aside.layoutSizingVertical = 'FILL';
  const column = ctx.auto(middle, 'content-column', 'VERTICAL');
  column.layoutSizingHorizontal = column.layoutSizingVertical = 'FILL';
  const content = use(ctx, column, 'Layout/Content', { state: 'default' });
  content.layoutSizingHorizontal = content.layoutSizingVertical = 'FILL';
  const bottom = use(ctx, footer === 'content' ? column : node, 'Layout/Footer', {
    state: 'default',
  });
  bottom.layoutSizingHorizontal = 'FILL';
}
export const layoutSpecs = [
  spec(
    'Pagination/Button',
    { selected: ['false', 'true'], state: ['default', 'hover', 'focused', 'disabled'] },
    paginationButton,
    'Кнопка страницы с текущим состоянием. Disabled меняет цвет, не opacity.',
    [prop('Label', 'label', '1')],
    4,
  ),
  spec(
    'Pagination',
    { page: ['first', 'middle', 'last'], simple: ['false', 'true'], controls: ['false', 'true'] },
    pagination,
    'Полная / простая пагинация, границы, Select размера страницы и Input перехода. Статичный пример десяти страниц.',
  ),
  spec(
    'Toolbar',
    { orientation: ['horizontal', 'vertical'] },
    toolbar,
    'Toolbar из настоящих icon-only Button с иконками редактора. Клавиатурная навигация в макете не исполняется.',
    [],
    2,
  ),
  ...['Checkbox', 'Radio'].map((name) =>
    spec(
      name + '/Group',
      { orientation: ['horizontal', 'vertical'], disabled: ['false', 'true'] },
      (ctx, n, p) => choiceGroup(ctx, n, p, name),
      'Группа настоящих ' +
        name +
        '; параметры value/name в React, выбранные состояния — статичные примеры.',
      [],
      2,
    ),
  ),
  ...['Header', 'Content', 'Footer'].map((part) =>
    spec(
      'Layout/' + part,
      { state: ['default'] },
      (ctx, n, p) => layoutPart(ctx, n, p, part),
      'Layout ' + part + '. Отступы и фон из темы. Размер можно менять в макете.',
      [
        prop(
          'Content',
          'content',
          part === 'Header' ? 'Dreadnought' : part === 'Footer' ? 'Подвал' : 'Содержимое страницы',
        ),
      ],
      1,
    ),
  ),
  spec(
    'Layout/Sidebar',
    { collapsed: ['false', 'true'] },
    (ctx, n, p) => layoutPart(ctx, n, p, 'Sidebar'),
    'Sidebar в раскрытом и свёрнутом desktop-состояниях; Menu — настоящий вложенный экземпляр.',
    [],
    2,
  ),
  spec(
    'Layout',
    { footer: ['full', 'content'], collapsed: ['false', 'true'] },
    layout,
    'Каркас header / sidebar / content / footer. Footer на всю ширину или только под content. Настоящие вложенные компоненты; viewport 960×560.',
    [],
    2,
  ),
];
