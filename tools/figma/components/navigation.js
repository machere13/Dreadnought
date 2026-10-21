import { axes, variantName } from './context.js';

const states = ['default', 'hover', 'focused', 'disabled'];
const labelProperty = {
  name: 'Label',
  type: 'TEXT',
  value: 'Раздел',
  slot: 'label',
  field: 'characters',
};
export const navigationSpecs = [
  {
    name: 'Dreadnought/Accordion/Item',
    columns: 4,
    variants: axes({ open: ['false', 'true'], state: states }),
    properties: [
      labelProperty,
      {
        name: 'Content',
        type: 'TEXT',
        value: 'Содержимое раздела.',
        slot: 'content',
        field: 'characters',
      },
    ],
    description:
      'Открытый / закрытый пункт × default / hover / focused / disabled. Disabled приглушает только trigger, не открытую панель. Текст и содержимое редактируются.',
  },
  {
    name: 'Dreadnought/Accordion',
    columns: 3,
    variants: axes({ expanded: ['none', 'one', 'two'] }),
    description:
      'Три пункта из экземпляров Accordion/Item: все закрыты, открыт один или два. Это статичные конфигурации, а не реализация клавиатурного поведения или режима multiple.',
  },
  {
    name: 'Dreadnought/Breadcrumb/Item',
    columns: 3,
    variants: [
      ...axes({ kind: ['link', 'current-link'], state: ['default', 'hover', 'focused'] }),
      { kind: 'text', state: 'default' },
      { kind: 'current', state: 'default' },
    ],
    properties: [labelProperty],
    description:
      'Ссылка, текущая ссылка, обычный текст и текущий текст. Hover подчёркивает ссылку; focus показывает контур. Текущий пункт имеет отдельный вес шрифта.',
  },
  {
    name: 'Dreadnought/Breadcrumb',
    columns: 3,
    variants: axes({ depth: ['1', '2', '3'] }),
    description:
      'Один, два или три пункта из экземпляров Breadcrumb/Item. Последний — текущий. Разделитель и интервалы из темы. Ссылки статичны; автоматического переноса строк в этой композиции нет.',
  },
  {
    name: 'Dreadnought/Tabs/Tab',
    columns: 4,
    variants: axes({ selected: ['false', 'true'], state: states }),
    properties: [labelProperty],
    description:
      'selected × default / hover / focused / disabled. У selected + hover собственный цвет фона, как в CSS. Подпись редактируется.',
  },
  {
    name: 'Dreadnought/Tabs/More',
    columns: 4,
    variants: axes({ state: states }),
    description:
      'Кнопка переполнения с исходной Ant Design EllipsisOutlined. Состояния как у Tabs/Tab, но без selected. Dropdown добавляется отдельной композицией; автоматически не открывается.',
  },
  {
    name: 'Dreadnought/Tabs',
    columns: 3,
    variants: axes({ orientation: ['horizontal', 'vertical'], selected: ['1', '2', '3'] }),
    properties: [
      {
        name: 'Content',
        type: 'TEXT',
        value: 'Содержимое выбранной вкладки.',
        slot: 'content',
        field: 'characters',
      },
    ],
    description:
      'Три настоящих экземпляра Tabs/Tab и панель: horizontal / vertical × выбранная вкладка. Подписи меняются в свойствах вложенных экземпляров. Без автоматического overflow, Dropdown и клавиатурной логики.',
  },
];

export function outline(ctx, node, prefix, radius = null, align = 'INSIDE') {
  const ring = ctx.shape(node, 'focus-ring', node.width, node.height);
  ring.layoutPositioning = 'ABSOLUTE';
  ring.x = ring.y = 0;
  ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  ring.fills = [];
  ring.strokes = [ctx.paint(prefix + '-focus-ring')];
  ring.strokeAlign = align;
  ctx.bind(ring, 'strokeWeight', prefix + '-focus-width');
  if (radius) ctx.bind(ring, 'cornerRadius', radius);
}

export function instance(ctx, parent, set, properties, label) {
  const main = set.children.find((n) => n.name === variantName(properties));
  if (!main) throw new Error('Нет варианта ' + set.name + ': ' + variantName(properties));
  const node = ctx.track(main.createInstance());
  parent.appendChild(node);
  if (label) {
    const key = Object.keys(set.componentPropertyDefinitions).find((key) =>
      key.startsWith('Label#'),
    );
    node.setProperties({ [key]: label });
  }
  return node;
}

export async function renderAccordionItem(ctx, node, { open, state }) {
  node.layoutMode = 'VERTICAL';
  node.resize(384, 100);
  node.primaryAxisSizingMode = 'AUTO';
  node.counterAxisSizingMode = 'FIXED';
  node.counterAxisAlignItems = 'MIN';
  node.clipsContent = true;
  node.fills = [ctx.paint('accordion-bg')];
  node.strokes = [ctx.paint('accordion-border-color')];
  node.strokeAlign = 'INSIDE';
  ctx.bind(node, 'strokeWeight', 'accordion-border-width');
  ctx.bind(node, 'cornerRadius', 'accordion-radius');
  const trigger = ctx.auto(node, 'trigger');
  trigger.layoutSizingHorizontal = 'FILL';
  ctx.bind(trigger, 'minHeight', 'accordion-trigger-min-height');
  ctx.bind(trigger, 'itemSpacing', 'accordion-trigger-gap');
  ctx.padding(trigger, 'accordion-trigger-padding-x', 'accordion-trigger-padding-y');
  if (state === 'hover') trigger.fills = [ctx.paint('accordion-trigger-bg-hover')];
  const label = await ctx.text(
    trigger,
    'Раздел',
    'label',
    'label-1',
    'accordion-trigger-fg',
    'accordion-trigger',
  );
  label.textAutoResize = 'HEIGHT';
  label.layoutSizingHorizontal = 'FILL';
  if (ctx.value('accordion-indicator-size', node) !== '1em')
    throw new Error('Изменился размер индикатора Accordion; обновите перевод em в px.');
  const size = ctx.value('font-size-accordion-trigger', node);
  const indicator = ctx.auto(trigger, 'indicator');
  indicator.resize(size, size);
  const icon = ctx.icon(indicator, 'down', 'accordion-trigger-fg', size);
  icon.layoutPositioning = 'ABSOLUTE';
  const angle = ctx.value(
    `accordion-indicator-rotation-${open === 'true' ? 'open' : 'closed'}`,
    node,
  );
  if (!['0deg', '180deg'].includes(angle))
    throw new Error('Изменилась геометрия поворота Accordion.');
  icon.rotation = angle === '180deg' ? 180 : 0;
  icon.x = icon.y = angle === '180deg' ? size : 0;
  if (state === 'focused') outline(ctx, trigger, 'accordion');
  if (state === 'disabled') await ctx.opacity(trigger, ctx.token('accordion-disabled-opacity'));
  const panel = ctx.auto(node, 'panel', 'VERTICAL');
  panel.layoutSizingHorizontal = 'FILL';
  panel.counterAxisAlignItems = 'MIN';
  ctx.padding(panel, 'accordion-panel-padding-x', 'accordion-panel-padding-y');
  panel.strokes = [ctx.paint('accordion-border-color')];
  panel.strokeAlign = 'INSIDE';
  ctx.bind(panel, 'strokeTopWeight', 'accordion-border-width');
  panel.strokeLeftWeight = panel.strokeRightWeight = panel.strokeBottomWeight = 0;
  const content = await ctx.text(
    panel,
    'Содержимое раздела.',
    'content',
    'body-2',
    'accordion-panel-fg',
    'accordion-panel',
  );
  content.textAutoResize = 'HEIGHT';
  content.layoutSizingHorizontal = 'FILL';
  panel.visible = open === 'true';
}

export function renderAccordion(ctx, node, { expanded }, items) {
  node.layoutMode = 'VERTICAL';
  ctx.bind(node, 'itemSpacing', 'accordion-root-gap');
  for (let index = 0; index < 3; index++)
    instance(
      ctx,
      node,
      items,
      {
        open: index < (expanded === 'two' ? 2 : expanded === 'one' ? 1 : 0) ? 'true' : 'false',
        state: 'default',
      },
      ['Основное', 'Настройки', 'Дополнительно'][index],
    );
}

export async function renderBreadcrumbItem(ctx, node, { kind, state }) {
  const current = kind === 'current' || kind === 'current-link';
  const link = kind === 'link' || kind === 'current-link';
  const label = await ctx.text(
    node,
    'Раздел',
    'label',
    'body-3',
    current
      ? 'breadcrumb-current-fg'
      : link
        ? state === 'hover'
          ? 'breadcrumb-link-fg-hover'
          : 'breadcrumb-link-fg'
        : 'breadcrumb-current-fg',
    'breadcrumb',
  );
  if (current) ctx.bind(label, 'fontWeight', 'font-weight-breadcrumb-current');
  if (state === 'hover') label.textDecoration = 'UNDERLINE';
  if (state === 'focused') outline(ctx, node, 'breadcrumb', null, 'OUTSIDE');
}

export async function renderBreadcrumb(ctx, node, { depth }, items) {
  ctx.bind(node, 'itemSpacing', 'breadcrumb-gap');
  const count = Number(depth);
  for (let index = 0; index < count; index++) {
    if (index) {
      const raw = ctx.value('breadcrumb-separator-content', node);
      const text = raw.replace(/^(['"])(.*)\1$/, '$2');
      await ctx.text(node, text, 'separator', 'body-3', 'breadcrumb-separator-fg', 'breadcrumb');
    }
    instance(
      ctx,
      node,
      items,
      { kind: index === count - 1 ? 'current' : 'link', state: 'default' },
      ['Главная', 'Компоненты', 'Документация'][index],
    );
  }
}

export async function renderTab(ctx, node, { selected, state }, more = false) {
  ctx.padding(node, 'tabs-tab-padding-x', 'tabs-tab-padding-y');
  ctx.bind(node, 'minHeight', 'tabs-tab-min-height');
  ctx.bind(node, 'cornerRadius', 'tabs-tab-radius');
  node.primaryAxisAlignItems = 'CENTER';
  const active = selected === 'true';
  const suffix = active
    ? state === 'hover'
      ? '-selected-hover'
      : '-selected'
    : state === 'hover'
      ? '-hover'
      : '';
  node.fills = [ctx.paint('tabs-tab-bg' + suffix)];
  if (more) ctx.icon(node, 'ellipsis', 'tabs-tab-fg', ctx.value('font-size-tabs-tab', node));
  else
    await ctx.text(
      node,
      'Раздел',
      'label',
      'label-1',
      active ? 'tabs-tab-fg-selected' : 'tabs-tab-fg',
      'tabs-tab',
    );
  if (state === 'focused') outline(ctx, node, 'tabs', 'tabs-tab-radius');
  if (state === 'disabled') await ctx.opacity(node, ctx.token('tabs-disabled-opacity'));
}

export async function renderTabs(ctx, node, { orientation, selected }, tabs) {
  const vertical = orientation === 'vertical';
  node.layoutMode = vertical ? 'HORIZONTAL' : 'VERTICAL';
  node.resize(480, 180);
  node.primaryAxisSizingMode = vertical ? 'FIXED' : 'AUTO';
  node.counterAxisSizingMode = vertical ? 'AUTO' : 'FIXED';
  node.counterAxisAlignItems = 'MIN';
  if (vertical) ctx.bind(node, 'itemSpacing', 'tabs-panel-padding-block');
  const list = ctx.auto(node, 'list', vertical ? 'VERTICAL' : 'HORIZONTAL');
  ctx.padding(list, 'tabs-list-padding');
  ctx.bind(list, 'itemSpacing', 'tabs-list-gap');
  ctx.bind(list, 'cornerRadius', 'tabs-list-radius');
  list.fills = [ctx.paint('tabs-list-bg')];
  for (let index = 0; index < 3; index++)
    instance(
      ctx,
      list,
      tabs,
      { selected: selected === String(index + 1) ? 'true' : 'false', state: 'default' },
      ['Обзор', 'Настройки', 'История'][index],
    );
  if (vertical) {
    const width = Math.max(...list.children.map((tab) => tab.width));
    for (const tab of list.children) tab.minWidth = width;
  }
  const panel = ctx.auto(node, 'panel', 'VERTICAL');
  panel.layoutSizingHorizontal = 'FILL';
  panel.counterAxisAlignItems = 'MIN';
  if (!vertical) {
    ctx.bind(panel, 'paddingTop', 'tabs-panel-padding-block');
    ctx.bind(panel, 'paddingBottom', 'tabs-panel-padding-block');
  }
  const content = await ctx.text(
    panel,
    'Содержимое выбранной вкладки.',
    'content',
    'body-2',
    'color-text-primary',
    'tabs-panel',
  );
  content.textAutoResize = 'HEIGHT';
  content.layoutSizingHorizontal = 'FILL';
}
