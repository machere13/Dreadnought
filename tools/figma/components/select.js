import { axes } from './context.js';

export const selectSpecs = ['outlined', 'filled', 'borderless'].map((variant) => ({
  name: 'Dreadnought/Select/' + variant,
  columns: 4,
  variants: axes({
    controlSize: ['default', 'compact'],
    selection: ['empty', 'single', 'multiple'],
    state: ['default', 'focused', 'invalid', 'disabled'],
  }),
  properties: [
    {
      name: 'Placeholder',
      type: 'TEXT',
      value: 'Выберите',
      slot: 'placeholder',
      field: 'characters',
    },
    { name: 'Value', type: 'TEXT', value: 'Frontend', slot: 'value', field: 'characters' },
    { name: 'Show clear', type: 'BOOLEAN', value: false, slot: 'clear', field: 'visible' },
  ],
  description: `Select variant="${variant}". controlSize × selection × state. Крестик перед стрелкой. Popup представлен отдельным компонентом. Поиск, выбор, виртуализация и клавиатурная логика в Figma не исполняются.`,
}));
export const optionSpec = {
  name: 'Dreadnought/Select/Option',
  columns: 4,
  variants: axes({ state: ['default', 'active', 'selected', 'disabled'] }),
  properties: [
    { name: 'Label', type: 'TEXT', value: 'Вариант', slot: 'label', field: 'characters' },
  ],
  description:
    'Пункт списка Select: default / active / selected / disabled. Цвета и отступы из Select.module.css.',
};
export const popupSpec = {
  name: 'Dreadnought/Select/Popup',
  columns: 3,
  variants: axes({ status: ['options', 'loading', 'empty'] }),
  description:
    'Popup Select с тёмным полупрозрачным фоном и background blur 24px. options / loading / empty. Это отдельный компонент, а не картинка выпадающего списка.',
};

function action(ctx, parent, icon, name, size) {
  const slot = ctx.auto(parent, name);
  slot.resize(size, size);
  slot.primaryAxisSizingMode = slot.counterAxisSizingMode = 'FIXED';
  slot.primaryAxisAlignItems = 'CENTER';
  ctx.icon(slot, icon, 'select-placeholder');
  return slot;
}

export async function renderSelect(ctx, node, { controlSize, selection, state }, variant) {
  const compact = controlSize === 'compact';
  const height = ctx.value(compact ? 'size-control-compact-min-height' : 'select-min-height', node);
  const padding = ctx.value('select-padding-y', node);
  const border = ctx.value('select-border-width', node);
  const actionSize = compact
    ? height - 2 * (padding + border)
    : ctx.value('select-action-size', node);
  node.resize(ctx.value('select-width', node), height);
  node.primaryAxisSizingMode = 'FIXED';
  node.counterAxisSizingMode = 'AUTO';
  ctx.bind(node, 'minHeight', compact ? 'size-control-compact-min-height' : 'select-min-height');
  ctx.padding(node, 'select-padding-x', 'select-padding-y');
  ctx.bind(node, 'cornerRadius', 'select-radius');
  ctx.bind(node, 'itemSpacing', 'select-gap');
  ctx.bind(node, 'strokeWeight', 'select-border-width');
  node.strokeAlign = 'INSIDE';
  node.fills =
    variant === 'borderless'
      ? []
      : [ctx.paint(variant === 'filled' ? 'color-surface-subtle' : 'select-bg')];
  const stroke =
    state === 'invalid'
      ? 'select-invalid'
      : state === 'focused'
        ? 'select-focus'
        : variant === 'outlined'
          ? 'select-border'
          : null;
  node.strokes = [stroke ? ctx.paint(stroke) : { ...ctx.paint('select-border'), opacity: 0 }];
  const content = ctx.auto(node, 'selection');
  ctx.bind(content, 'itemSpacing', 'select-gap');
  content.layoutSizingHorizontal = 'FILL';
  content.clipsContent = true;
  if (selection === 'multiple') {
    for (const name of ['React', 'Vue']) {
      const tag = ctx.auto(content, 'tag');
      ctx.bind(tag, 'cornerRadius', 'select-tag-radius');
      ctx.bind(tag, 'itemSpacing', 'select-gap');
      ctx.bind(tag, 'paddingLeft', 'select-padding-x');
      tag.fills = [ctx.paint('select-tag-bg')];
      await ctx.text(tag, name, 'tag-label', 'body-2', 'select-text', 'select');
      action(ctx, tag, 'close', 'remove', actionSize);
    }
  } else {
    const empty = selection === 'empty';
    const value = await ctx.text(
      content,
      empty ? 'Выберите' : 'Frontend',
      empty ? 'placeholder' : 'value',
      'body-2',
      empty ? 'select-placeholder' : 'select-text',
      'select',
    );
    value.textAutoResize = 'HEIGHT';
    value.layoutSizingHorizontal = 'FILL';
  }
  if (selection !== 'empty') {
    const clear = action(ctx, node, 'close', 'clear', actionSize);
    clear.visible = false;
  }
  action(ctx, node, 'down', 'indicator', actionSize);
  if (state === 'disabled') await ctx.opacity(node, ctx.token('select-disabled-opacity'));
}

export async function renderOption(ctx, node, { state }) {
  node.resize(248, 40);
  node.primaryAxisSizingMode = 'FIXED';
  node.counterAxisSizingMode = 'AUTO';
  ctx.padding(node, 'select-option-padding-x', 'select-option-padding-y');
  ctx.bind(node, 'cornerRadius', 'select-option-radius');
  node.fills =
    state === 'selected'
      ? [ctx.paint('select-selected')]
      : state === 'active'
        ? [ctx.paint('select-hover')]
        : [];
  const label = await ctx.text(node, 'Вариант', 'label', 'body-2', 'select-text', 'select');
  label.textAutoResize = 'HEIGHT';
  label.layoutSizingHorizontal = 'FILL';
  if (state === 'selected') ctx.bind(label, 'fontWeight', 'font-weight-label-1');
  if (state === 'disabled') await ctx.opacity(node, ctx.token('select-disabled-opacity'));
}

export async function renderPopup(ctx, node, { status }, optionSet) {
  node.layoutMode = 'VERTICAL';
  node.counterAxisAlignItems = 'MIN';
  node.resize(ctx.value('select-width', node), 80);
  node.primaryAxisSizingMode = 'AUTO';
  node.counterAxisSizingMode = 'FIXED';
  ctx.padding(node, 'select-popup-padding');
  ctx.bind(node, 'cornerRadius', 'select-popup-radius');
  ctx.bind(node, 'strokeWeight', 'select-popup-border-width');
  node.strokeAlign = 'INSIDE';
  node.strokes = [ctx.paint('select-border')];
  node.fills = [ctx.paint('select-popup-bg')];
  const filter = ctx.value('popup-backdrop-filter', node);
  const blur = typeof filter === 'string' && filter.match(/^blur\(([\d.]+)px\)$/);
  if (!blur) throw new Error('Неподдерживаемый blur: ' + filter);
  node.effects = [{ type: 'BACKGROUND_BLUR', radius: Number(blur[1]), visible: true }];
  if (status === 'options') {
    for (const [index, main] of optionSet.children.entries()) {
      const instance = ctx.track(main.createInstance());
      node.appendChild(instance);
      instance.layoutSizingHorizontal = 'FILL';
      const key = Object.keys(optionSet.componentPropertyDefinitions).find(
        (key) => key.startsWith('Label#') || key === 'Label',
      );
      instance.setProperties({ [key]: ['Frontend', 'Backend', 'Design', 'Недоступно'][index] });
    }
  } else {
    const message = ctx.auto(node, 'message');
    ctx.padding(message, 'select-option-padding-x', 'select-option-padding-y');
    await ctx.text(
      message,
      status === 'loading' ? 'Загрузка…' : 'Нет вариантов',
      'label',
      'body-2',
      'select-placeholder',
      'select',
    );
  }
}
