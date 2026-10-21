import { axes } from './context.js';
import { instance, outline } from './navigation.js';

const states = ['default', 'hover', 'focused', 'disabled'];
const configurations = ['plain', 'grouped', 'closed', 'open', 'overflow'];
export const menuSpecs = [
  {
    name: 'Dreadnought/Menu/Item',
    columns: 4,
    variants: axes({ kind: ['item', 'selected', 'submenu-closed', 'submenu-open'], state: states }),
    properties: [
      { name: 'Label', type: 'TEXT', value: 'Действие', slot: 'label', field: 'characters' },
    ],
    description:
      'Пункт, выбранный пункт, закрытое / открытое подменю × default / hover / focused / disabled. В Menu hover перекрывает selected-фон по специфичности CSS. Без выдуманных checkmark-иконок.',
  },
  {
    name: 'Dreadnought/Menu',
    columns: 3,
    variants: axes({ content: configurations }),
    description:
      'Обычное меню, группа с разделителем, закрытое / открытое подменю и список скрытых вкладок. Пункты — экземпляры Menu/Item. Статичный макет шириной 240px; без исполнения команд и клавиатурной логики.',
  },
  {
    name: 'Dreadnought/Dropdown',
    columns: 3,
    variants: axes({ content: configurations }),
    description:
      'Пять конфигураций из настоящего вложенного Menu. Внешняя поверхность Popover с полупрозрачным фоном и background blur из темы; внутреннее меню без своего фона и бордера, как в Dropdown.module.css. Без стрелки — стандартный arrow=false.',
  },
  {
    name: 'Dreadnought/Tabs/Overflow',
    columns: 2,
    variants: axes({ open: ['false', 'true'] }),
    description:
      'Две видимые вкладки, кнопка More и Dropdown со скрытыми вкладками. Вложенные экземпляры из ранее созданных наборов; закрытый / открытый статичный макет. BottomRight, без стрелки. Не измеряет контейнер и не рассчитывает overflow автоматически.',
  },
];

export async function renderMenuItem(ctx, node, { kind, state }) {
  node.resize(232, 44);
  node.primaryAxisSizingMode = 'FIXED';
  node.counterAxisSizingMode = 'AUTO';
  node.clipsContent = true;
  ctx.bind(node, 'minHeight', 'menu-item-min-height');
  ctx.bind(node, 'itemSpacing', 'menu-gap');
  ctx.bind(node, 'cornerRadius', 'menu-item-radius');
  ctx.padding(node, 'menu-item-padding-x', 'menu-item-padding-y');
  node.fills =
    state === 'hover'
      ? [ctx.paint('menu-item-bg-hover')]
      : kind === 'selected'
        ? [ctx.paint('menu-item-bg-selected')]
        : [];
  const label = await ctx.text(node, 'Действие', 'label', 'body-2', 'menu-fg', 'menu-item');
  label.textAutoResize = 'TRUNCATE';
  label.maxLines = 1;
  label.layoutSizingHorizontal = 'FILL';
  if (kind.startsWith('submenu-')) {
    const size = ctx.value('font-size-menu-item', node);
    const indicator = ctx.auto(node, 'indicator');
    indicator.resize(size, size);
    const icon = ctx.icon(indicator, 'down', 'menu-fg', size);
    icon.layoutPositioning = 'ABSOLUTE';
    icon.rotation = kind === 'submenu-open' ? 0 : 90;
    icon.x = 0;
    icon.y = kind === 'submenu-open' ? 0 : size;
  }
  if (state === 'focused') outline(ctx, node, 'menu', 'menu-item-radius');
  if (state === 'disabled') await ctx.opacity(node, ctx.token('menu-disabled-opacity'));
}

export async function renderMenu(ctx, node, { content }, items) {
  node.layoutMode = 'VERTICAL';
  node.resize(240, 160);
  node.primaryAxisSizingMode = 'AUTO';
  node.counterAxisSizingMode = 'FIXED';
  node.counterAxisAlignItems = 'MIN';
  ctx.padding(node, 'menu-padding');
  ctx.bind(node, 'itemSpacing', 'menu-gap');
  ctx.bind(node, 'cornerRadius', 'menu-radius');
  ctx.bind(node, 'strokeWeight', 'menu-border-width');
  node.strokeAlign = 'INSIDE';
  node.fills = [ctx.paint('menu-bg')];
  node.strokes = [ctx.paint('menu-border')];
  function add(parent, kind, label, state = 'default') {
    const row = instance(ctx, parent, items, { kind, state }, label);
    row.layoutSizingHorizontal = 'FILL';
    return row;
  }
  if (content === 'overflow') {
    for (const label of ['История', 'Участники', 'Доступ']) add(node, 'item', label);
    return;
  }
  if (content === 'closed' || content === 'open') {
    add(node, 'item', 'Обзор');
    add(node, 'submenu-' + content, 'Настройки');
    if (content === 'open') {
      const submenu = ctx.auto(node, 'submenu', 'VERTICAL');
      submenu.layoutSizingHorizontal = 'FILL';
      ctx.bind(submenu, 'paddingLeft', 'menu-indent');
      ctx.bind(submenu, 'itemSpacing', 'menu-gap');
      add(submenu, 'selected', 'Профиль');
      add(submenu, 'item', 'Уведомления');
    }
    add(node, 'item', 'Недоступно', 'disabled');
    return;
  }
  let parent = node;
  if (content === 'grouped') {
    parent = ctx.auto(node, 'group', 'VERTICAL');
    parent.layoutSizingHorizontal = 'FILL';
    parent.counterAxisAlignItems = 'MIN';
    ctx.bind(parent, 'itemSpacing', 'menu-gap');
    const caption = ctx.auto(parent, 'group-label');
    caption.layoutSizingHorizontal = 'FILL';
    ctx.padding(caption, 'menu-item-padding-x', 'menu-item-padding-y');
    await ctx.text(caption, 'Действия', 'group-title', 'body-2', 'menu-group-fg');
  }
  add(parent, 'item', 'Открыть');
  add(parent, 'selected', 'Сохранить');
  add(parent, 'item', 'Скопировать');
  if (content === 'grouped') {
    const divider = ctx.auto(node, 'divider', 'VERTICAL');
    divider.layoutSizingHorizontal = 'FILL';
    ctx.bind(divider, 'paddingTop', 'menu-gap');
    ctx.bind(divider, 'paddingBottom', 'menu-gap');
    const line = ctx.shape(divider, 'line', 232, ctx.value('menu-border-width', node));
    line.layoutSizingHorizontal = 'FILL';
    ctx.bind(line, 'height', 'menu-border-width');
    line.fills = [ctx.paint('menu-border')];
  }
  add(node, 'item', 'Недоступно', 'disabled');
}

export function renderDropdown(ctx, node, { content }, menu) {
  node.layoutMode = 'VERTICAL';
  node.resize(240, 160);
  node.primaryAxisSizingMode = 'AUTO';
  node.counterAxisSizingMode = 'FIXED';
  ctx.bind(node, 'maxWidth', 'popover-max-width');
  ctx.bind(node, 'cornerRadius', 'popover-radius');
  ctx.bind(node, 'strokeWeight', 'popover-border-width');
  ctx.bind(node, 'itemSpacing', 'popover-gap');
  node.strokeAlign = 'INSIDE';
  node.fills = [ctx.paint('popover-bg')];
  node.strokes = [ctx.paint('popover-border')];
  const filter = ctx.value('popup-backdrop-filter', node);
  const blur = typeof filter === 'string' && filter.match(/^blur\(([\d.]+)px\)$/);
  if (!blur) throw new Error('Неподдерживаемый blur: ' + filter);
  node.effects = [{ type: 'BACKGROUND_BLUR', radius: Number(blur[1]), visible: true }];
  const inner = instance(ctx, node, menu, { content });
  inner.name = 'menu';
  inner.layoutSizingHorizontal = 'FILL';
  inner.fills = [];
  inner.strokes = [];
  inner.strokeWeight = 0;
}

export function renderTabsOverflow(ctx, node, { open }, tab, more, dropdown) {
  node.layoutMode = 'VERTICAL';
  node.counterAxisAlignItems = 'MAX';
  ctx.bind(node, 'itemSpacing', 'popover-gap');
  const list = ctx.auto(node, 'list');
  ctx.padding(list, 'tabs-list-padding');
  ctx.bind(list, 'itemSpacing', 'tabs-list-gap');
  ctx.bind(list, 'cornerRadius', 'tabs-list-radius');
  list.fills = [ctx.paint('tabs-list-bg')];
  instance(ctx, list, tab, { selected: 'true', state: 'default' }, 'Обзор');
  instance(ctx, list, tab, { selected: 'false', state: 'default' }, 'Настройки');
  instance(ctx, list, more, { state: 'default' });
  const anchor = ctx.auto(node, 'popup-anchor', 'VERTICAL');
  ctx.bind(anchor, 'paddingRight', 'tabs-list-padding');
  anchor.visible = open === 'true';
  const popup = instance(ctx, anchor, dropdown, { content: 'overflow' });
  popup.name = 'popup';
  popup.visible = open === 'true';
}
