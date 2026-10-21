import { spec, prop, sized, skin, fill, use, button, blur } from './shared.js';
import { outline } from './navigation.js';

function setLabel(ctx, node, setName, label) {
  const set = ctx.catalog.get('Dreadnought/' + setName);
  const key = Object.keys(set.componentPropertyDefinitions).find((key) => key.startsWith('Label#'));
  node.setProperties({ [key]: String(label) });
}
async function treeRow(ctx, node, { kind, checked, state }) {
  sized(node, 256, 44, 'HORIZONTAL');
  node.counterAxisAlignItems = 'CENTER';
  ctx.padding(node, 'tree-padding-x', 'tree-padding-y');
  ctx.bind(node, 'itemSpacing', 'tree-indicator-gap');
  ctx.bind(node, 'minHeight', 'tree-row-min-height');
  skin(
    ctx,
    node,
    state === 'selected' ? 'tree-row-bg-selected' : state === 'hover' ? 'tree-row-bg-hover' : null,
    null,
    'tree-radius',
  );
  const indicator = ctx.auto(node, 'indicator');
  indicator.resize(16, 16);
  if (kind !== 'leaf') {
    const icon = ctx.icon(indicator, 'down', 'tree-fg');
    icon.layoutPositioning = 'ABSOLUTE';
    icon.x = 0;
    icon.y = kind === 'closed' ? 16 : 0;
    if (kind === 'closed') icon.rotation = 90;
  }
  if (checked !== 'none')
    use(ctx, node, 'Checkbox', { checked, state: 'default' }, { 'Show label': false });
  fill(await ctx.text(node, 'Узел', 'label', 'body-2', 'tree-fg', 'tree'));
  if (state === 'disabled') await ctx.opacity(node, ctx.token('tree-disabled-opacity'));
  if (state === 'focused') outline(ctx, node, 'tree', 'tree-radius');
}
function tree(ctx, node, { expanded, checkable }) {
  sized(node, 256);
  node.fills = [ctx.paint('tree-bg')];
  const checked = checkable === 'true' ? 'mixed' : 'none';
  use(
    ctx,
    node,
    'Tree/Row/' + (expanded === 'true' ? 'open' : 'closed'),
    { checked, state: 'default' },
    { Label: 'Разработка' },
  );
  if (expanded === 'true') {
    const group = ctx.auto(node, 'group', 'VERTICAL');
    group.layoutSizingHorizontal = 'FILL';
    ctx.bind(group, 'paddingLeft', 'tree-indent');
    for (const [index, label] of ['Frontend', 'Backend'].entries()) {
      const row = use(
        ctx,
        group,
        'Tree/Row/leaf',
        {
          checked: checkable === 'true' ? (index ? 'false' : 'true') : 'none',
          state: index ? 'default' : 'selected',
        },
        { Label: label },
      );
      row.layoutSizingHorizontal = 'FILL';
    }
  }
}
async function treeSelect(ctx, node, { selection, state }) {
  sized(node, ctx.value('treeselect-width', node), 44, 'HORIZONTAL');
  node.counterAxisAlignItems = 'CENTER';
  ctx.padding(node, 'treeselect-padding', 'treeselect-field-padding-y');
  ctx.bind(node, 'itemSpacing', 'treeselect-gap');
  ctx.bind(node, 'minHeight', 'treeselect-min-height');
  skin(
    ctx,
    node,
    'treeselect-field-bg',
    state === 'invalid'
      ? 'treeselect-invalid'
      : state === 'focused' || state === 'hover'
        ? 'treeselect-focus'
        : 'treeselect-border',
    'treeselect-field-radius',
    'treeselect-border-width',
  );
  const content = ctx.auto(node, 'selection');
  content.layoutSizingHorizontal = 'FILL';
  content.layoutWrap = 'WRAP';
  ctx.bind(content, 'itemSpacing', 'treeselect-gap');
  ctx.bind(content, 'counterAxisSpacing', 'treeselect-gap');
  if (selection === 'multiple')
    for (const label of ['Frontend', 'Design']) {
      const tag = ctx.auto(content, 'tag');
      ctx.bind(tag, 'paddingLeft', 'treeselect-padding');
      skin(ctx, tag, 'treeselect-tag-bg', null, 'treeselect-tag-radius');
      await ctx.text(tag, label, 'tag-label');
      button(ctx, tag, '', 'ghosted', 'close');
    }
  else
    fill(
      await ctx.text(
        content,
        selection === 'empty' ? 'Выберите команды' : 'Frontend',
        selection === 'empty' ? 'placeholder' : 'value',
        'body-2',
        selection === 'empty' ? 'treeselect-placeholder' : 'treeselect-text',
        'treeselect',
      ),
    );
  if (selection !== 'empty') button(ctx, node, '', 'ghosted', 'close');
  button(ctx, node, '', 'ghosted', 'down');
  if (state === 'disabled') await ctx.opacity(node, ctx.token('treeselect-disabled-opacity'));
}
async function treePopup(ctx, node, { status }) {
  sized(node, ctx.value('treeselect-width', node));
  ctx.padding(node, 'treeselect-popup-padding');
  skin(
    ctx,
    node,
    'treeselect-popup-bg',
    'treeselect-border',
    'treeselect-popup-radius',
    'treeselect-border-width',
  );
  await blur(ctx, node);
  if (status === 'empty')
    await ctx.text(node, 'Нет вариантов', 'empty', 'body-2', 'treeselect-placeholder');
  else
    use(ctx, node, 'Tree', {
      expanded: 'true',
      checkable: status === 'checkable' ? 'true' : 'false',
    }).layoutSizingHorizontal = 'FILL';
}
async function pickerField(ctx, node, { selection, state }, prefix) {
  const range = selection === 'range';
  sized(
    node,
    ctx.value(prefix + (range ? '-range-width' : '-field-width'), node),
    44,
    'HORIZONTAL',
  );
  node.counterAxisAlignItems = 'CENTER';
  ctx.padding(node, prefix + '-field-padding-x', prefix + '-field-padding-y');
  ctx.bind(node, 'itemSpacing', prefix + '-field-gap');
  ctx.bind(node, 'minHeight', 'size-control-min-height');
  skin(
    ctx,
    node,
    prefix + '-field-bg',
    prefix +
      (state === 'invalid'
        ? '-error'
        : state === 'focused' || state === 'hover'
          ? '-focus'
          : '-field-border'),
    prefix + '-radius',
    prefix + '-border-width',
  );
  for (let i = 0; i < (range ? 2 : 1); i++) {
    const input = use(
      ctx,
      node,
      'Input',
      {
        variant: 'borderless',
        size: 'compact',
        state: selection === 'empty' ? 'placeholder' : 'default',
      },
      selection === 'empty'
        ? { Placeholder: prefix === 'datepicker' ? 'Выберите дату' : 'Выберите время' }
        : { Value: prefix === 'datepicker' ? (i ? '20.10.2026' : '14.10.2026') : '12:30' },
    );
    input.layoutSizingHorizontal = 'FILL';
    input.fills = [];
    input.strokes = [];
    input.strokeWeight = 0;
    input.paddingLeft = input.paddingRight = input.paddingTop = input.paddingBottom = 0;
  }
  if (selection !== 'empty') button(ctx, node, '', 'ghosted', 'close');
  button(ctx, node, '', 'ghosted', prefix === 'datepicker' ? 'calendar' : 'clock');
  if (state === 'disabled') await ctx.opacity(node, ctx.token('opacity-disabled'));
}
function day(ctx, node, { state }) {
  const b = button(
    ctx,
    node,
    '14',
    'ghosted',
    null,
    state === 'focused' || state === 'hover' ? state : 'default',
  );
  b.resize(
    ctx.value('datepicker-day-size', node),
    ctx.value('size-control-compact-min-height', node),
  );
  b.paddingLeft = b.paddingRight = 0;
  if (state === 'selected') {
    b.fills = [ctx.paint('datepicker-selected')];
    for (const text of b.findAllWithCriteria({ types: ['TEXT'] }))
      text.fills = [ctx.paint('datepicker-selected-text')];
  }
  if (state === 'range' || state === 'preview') node.fills = [ctx.paint('datepicker-' + state)];
  if (state === 'outside' || state === 'disabled')
    return ctx.opacity(node, ctx.token('opacity-disabled'));
  if (state === 'today')
    for (const text of b.findAllWithCriteria({ types: ['TEXT'] }))
      text.textDecoration = 'UNDERLINE';
}
async function datePopup(ctx, node, { mode }) {
  sized(node, ctx.value('datepicker-popup-width', node));
  ctx.padding(node, 'datepicker-padding');
  ctx.bind(node, 'itemSpacing', 'datepicker-gap');
  skin(
    ctx,
    node,
    'datepicker-bg',
    'datepicker-border',
    'datepicker-radius',
    'datepicker-border-width',
  );
  await blur(ctx, node);
  const header = ctx.auto(node, 'header');
  header.layoutSizingHorizontal = 'FILL';
  ctx.bind(header, 'itemSpacing', 'datepicker-gap');
  button(ctx, header, '', 'ghosted', 'left');
  const month = use(
    ctx,
    header,
    'Select/outlined',
    { controlSize: 'compact', selection: 'single', state: 'default' },
    { Value: 'Октябрь' },
  );
  month.resize(150, 32);
  month.layoutSizingHorizontal = 'FILL';
  use(
    ctx,
    header,
    'Input',
    { variant: 'outlined', size: 'compact', state: 'default' },
    { Value: '2026' },
  ).resize(96, 32);
  button(ctx, header, '', 'ghosted', 'right');
  const week = ctx.auto(node, 'week');
  week.layoutSizingHorizontal = 'FILL';
  for (const value of ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']) {
    const cell = ctx.auto(week, 'weekday');
    cell.resize(51, 32);
    cell.layoutSizingHorizontal = 'FILL';
    cell.primaryAxisAlignItems = 'CENTER';
    await ctx.text(cell, value, 'label', 'body-3', 'datepicker-muted');
  }
  for (let row = 0; row < 6; row++) {
    const line = ctx.auto(node, 'week-' + row);
    line.layoutSizingHorizontal = 'FILL';
    for (let col = 0; col < 7; col++) {
      const index = row * 7 + col - 2;
      const date = new Date(Date.UTC(2026, 9, index));
      const value = date.getUTCDate();
      const outside = date.getUTCMonth() !== 9;
      const state = outside
        ? 'outside'
        : value === 14 || (mode === 'range' && value === 20)
          ? 'selected'
          : mode === 'range' && value > 14 && value < 20
            ? 'range'
            : value === 21
              ? 'today'
              : 'default';
      const cell = use(ctx, line, 'DatePicker/Day', { state });
      cell.resize(51, cell.height);
      cell.layoutSizingHorizontal = 'FILL';
      cell.primaryAxisAlignItems = 'CENTER';
      setLabel(ctx, cell.children[0], 'Button/ghosted', value);
    }
  }
}
function timeOption(ctx, node, { state }) {
  sized(node, 66, 32, 'HORIZONTAL');
  const option = button(
    ctx,
    node,
    '30',
    'ghosted',
    null,
    state === 'disabled'
      ? 'disabled'
      : state === 'focused'
        ? 'focused'
        : state.includes('hover')
          ? 'hover'
          : 'default',
  );
  option.resize(66, 32);
  option.layoutSizingHorizontal = 'FILL';
  if (state.startsWith('selected')) {
    option.fills = [
      ctx.paint(
        state === 'selected-hover' ? 'timepicker-selected-hover-bg' : 'timepicker-selected-bg',
      ),
    ];
    for (const text of option.findAllWithCriteria({ types: ['TEXT'] }))
      text.fills = [ctx.paint('timepicker-selected-text')];
  }
}
async function timePopup(ctx, node, { seconds, confirm }) {
  sized(node, ctx.value('timepicker-popup-width', node));
  ctx.padding(node, 'timepicker-padding');
  ctx.bind(node, 'itemSpacing', 'timepicker-gap');
  skin(
    ctx,
    node,
    'timepicker-bg',
    'timepicker-border',
    'timepicker-radius',
    'timepicker-border-width',
  );
  await blur(ctx, node);
  const columns = ctx.auto(node, 'columns');
  columns.layoutSizingHorizontal = 'FILL';
  ctx.bind(columns, 'itemSpacing', 'timepicker-gap');
  for (let col = 0; col < (seconds === 'true' ? 3 : 2); col++) {
    const column = ctx.auto(columns, ['hours', 'minutes', 'seconds'][col], 'VERTICAL');
    column.layoutSizingHorizontal = 'FILL';
    ctx.bind(column, 'itemSpacing', 'timepicker-option-gap');
    ctx.padding(column, 'timepicker-option-gap');
    for (let row = 0; row < 5; row++) {
      const item = use(ctx, column, 'TimePicker/Option', {
        state: row === 2 ? 'selected' : row === 4 ? 'disabled' : 'default',
      });
      item.layoutSizingHorizontal = 'FILL';
      setLabel(
        ctx,
        item.children[0],
        'Button/ghosted',
        String((col ? 28 : 10) + row).padStart(2, '0'),
      );
    }
  }
  if (confirm === 'true') button(ctx, node, 'Подтвердить', 'primary');
}
export const pickerSpecs = [
  ...['leaf', 'closed', 'open'].map((kind) =>
    spec(
      'Tree/Row/' + kind,
      {
        checked: ['none', 'false', 'true', 'mixed'],
        state: ['default', 'hover', 'selected', 'focused', 'disabled'],
      },
      (ctx, n, p) => treeRow(ctx, n, { ...p, kind }),
      'Строка Tree ' +
        kind +
        ': выбор, checkbox/mixed и состояния. Иконка и Checkbox переиспользуются.',
      [prop('Label', 'label', 'Узел')],
      4,
    ),
  ),
  spec(
    'Tree',
    { expanded: ['false', 'true'], checkable: ['false', 'true'] },
    tree,
    'Дерево из экземпляров строк. Развёрнутое и свёрнутое, selectable / checkable. Статичные данные, без клавиатурной логики.',
  ),
  spec(
    'TreeSelect',
    {
      selection: ['empty', 'single', 'multiple'],
      state: ['default', 'hover', 'focused', 'invalid', 'disabled'],
    },
    treeSelect,
    'Поле TreeSelect с тегами и clear перед стрелкой. Popup — отдельный компонент.',
    [prop('Value', 'value', 'Frontend'), prop('Placeholder', 'placeholder', 'Выберите команды')],
    4,
  ),
  spec(
    'TreeSelect/Popup',
    { status: ['tree', 'checkable', 'empty'] },
    treePopup,
    'Popup с настоящим Tree, полупрозрачным фоном и blur. Скролл и поиск не исполняются.',
  ),
  spec(
    'DatePicker',
    {
      selection: ['empty', 'single', 'range'],
      state: ['default', 'hover', 'focused', 'invalid', 'disabled'],
    },
    (ctx, n, p) => pickerField(ctx, n, p, 'datepicker'),
    'Поле даты / диапазона с настоящими Input и Button. Полная ширина desktop; popup отдельно.',
    [],
    4,
  ),
  spec(
    'DatePicker/Day',
    {
      state: [
        'default',
        'hover',
        'selected',
        'range',
        'preview',
        'outside',
        'disabled',
        'today',
        'focused',
      ],
    },
    day,
    'Ячейка календаря с Button. Число редактируется в свойствах вложенной кнопки.',
    [],
    4,
  ),
  spec(
    'DatePicker/Popup',
    { mode: ['single', 'range'] },
    datePopup,
    'Календарь октября 2026 с корректными датами и днями недели. Input года и Select месяца — экземпляры. Это статичный макет, не календарный движок.',
    [],
    2,
  ),
  spec(
    'TimePicker',
    {
      selection: ['empty', 'single'],
      state: ['default', 'hover', 'focused', 'invalid', 'disabled'],
    },
    (ctx, n, p) => pickerField(ctx, n, p, 'timepicker'),
    'Поле времени с Input и Button; состояния из текущей темы.',
    [],
    4,
  ),
  spec(
    'TimePicker/Option',
    { state: ['default', 'hover', 'selected', 'selected-hover', 'focused', 'disabled'] },
    timeOption,
    'Опция колонки времени. Текст редактируется в свойствах вложенной кнопки.',
    [],
    4,
  ),
  spec(
    'TimePicker/Popup',
    { seconds: ['false', 'true'], confirm: ['false', 'true'] },
    timePopup,
    'Часы/минуты/секунды и подтверждение. Показана видимая область пяти строк; виртуальный скролл и commit/cancel не исполняются.',
  ),
];
