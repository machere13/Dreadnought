import { spec, prop, sized, skin, fill, use, button, divider, mono } from './shared.js';

async function tableCell(ctx, node, { size, role }) {
  sized(node, 220, 48, 'HORIZONTAL');
  node.counterAxisAlignItems = 'CENTER';
  const suffix = size === 'default' ? '' : '-' + size;
  ctx.padding(node, 'table-cell-padding-inline' + suffix, 'table-cell-padding-block' + suffix);
  const bg =
    role === 'header'
      ? 'table-header-bg'
      : role === 'selected'
        ? 'table-row-bg-selected'
        : role === 'hover'
          ? 'table-row-bg-hover'
          : role === 'selected-hover'
            ? 'table-row-bg-selected-hover'
            : role === 'footer'
              ? 'table-control-bg'
              : 'table-bg';
  node.fills = [ctx.paint(bg)];
  node.strokes = [ctx.paint('table-border')];
  node.strokeWeight = 0;
  ctx.bind(node, 'strokeBottomWeight', 'table-border-width');
  const value = fill(
    await ctx.text(
      node,
      role === 'header' ? 'Столбец' : 'Значение',
      'value',
      'body-3',
      role === 'header' ? 'table-header-text' : 'table-text',
      'table',
    ),
  );
  if (role === 'header') ctx.bind(value, 'fontWeight', 'table-header-font-weight');
}
async function table(ctx, node, { size, bordered, status }) {
  sized(node, 720);
  node.fills = [ctx.paint('table-bg')];
  if (bordered === 'true')
    skin(ctx, node, null, 'table-border', 'table-header-radius', 'table-border-width');
  const rows = [
    ['Имя', 'Роль', 'Статус'],
    ...(status === 'empty'
      ? []
      : [
          ['Анна', 'Frontend', 'Активен'],
          ['Иван', 'Backend', 'Активен'],
          ['Мария', 'Design', 'На проверке'],
        ]),
  ];
  for (const [r, values] of rows.entries()) {
    const row = ctx.auto(node, 'row-' + r);
    row.layoutSizingHorizontal = 'FILL';
    for (const [c, value] of values.entries()) {
      const cell = use(
        ctx,
        row,
        'Table/Cell',
        { size, role: r === 0 ? 'header' : r === 2 ? 'selected' : 'body' },
        { Value: value },
      );
      cell.layoutSizingHorizontal = 'FILL';
      if (bordered === 'true' && c < 2) ctx.bind(cell, 'strokeRightWeight', 'table-border-width');
      if (bordered === 'true' && r === rows.length - 1) cell.strokeBottomWeight = 0;
    }
  }
  if (status === 'empty') {
    const empty = ctx.auto(node, 'empty');
    empty.layoutSizingHorizontal = 'FILL';
    ctx.padding(empty, 'table-cell-padding-inline', 'table-cell-padding-block');
    await ctx.text(empty, 'Нет данных', 'message', 'body-3', 'table-header-text');
  }
  if (status === 'loading') {
    const overlay = ctx.auto(node, 'loading');
    overlay.resize(node.width, node.height);
    overlay.layoutPositioning = 'ABSOLUTE';
    overlay.x = overlay.y = 0;
    overlay.fills = [ctx.paint('loader-overlay-bg')];
    overlay.primaryAxisAlignItems = 'CENTER';
    use(ctx, overlay, 'Loader', { size: 'default' });
  }
}
async function tableFeatures(ctx, node, { example }) {
  sized(node, 720);
  ctx.bind(node, 'itemSpacing', 'table-control-gap');
  const actions = ctx.auto(node, 'controls');
  ctx.bind(actions, 'itemSpacing', 'table-control-gap');
  button(ctx, actions, 'Имя', 'ghosted', 'down');
  button(ctx, actions, 'Фильтр', 'ghosted', 'filter');
  const table = use(ctx, node, 'Table', { size: 'middle', bordered: 'true', status: 'data' });
  if (example === 'selection') {
    const state = ctx.auto(node, 'selection');
    use(
      ctx,
      state,
      'Checkbox',
      { checked: 'mixed', state: 'default' },
      { Label: 'Выбрана 1 строка' },
    );
  }
  if (example === 'expanded') {
    const row = ctx.auto(node, 'detail');
    ctx.padding(row, 'table-cell-padding-inline', 'table-cell-padding-block');
    row.fills = [ctx.paint('table-control-bg')];
    await ctx.text(row, 'Дополнительная информация о строке', 'detail');
  }
  if (example === 'sticky') {
    const note = await ctx.text(
      node,
      'Закреплённая шапка и первый столбец',
      'caption',
      'body-3',
      'table-header-text',
    );
    table.clipsContent = true;
  }
  if (example === 'filter') use(ctx, node, 'Table/FilterMenu', { state: 'selected' });
  use(ctx, node, 'Pagination', { page: 'first', simple: 'false', controls: 'false' });
}
function filterMenu(ctx, node, { state }) {
  sized(node, 240);
  ctx.padding(node, 'table-cell-padding-block');
  ctx.bind(node, 'itemSpacing', 'table-control-gap');
  skin(ctx, node, 'table-control-bg', 'table-border', 'table-header-radius', 'table-border-width');
  for (const [index, label] of ['Frontend', 'Backend', 'Design'].entries())
    use(
      ctx,
      node,
      'Checkbox',
      { checked: state === 'selected' && index === 0 ? 'true' : 'false', state: 'default' },
      { Label: label },
    );
  const actions = ctx.auto(node, 'actions');
  ctx.bind(actions, 'itemSpacing', 'table-control-gap');
  button(ctx, actions, 'Сбросить');
  button(ctx, actions, 'Применить', 'primary');
}
async function codeBlock(ctx, node, { state, header }) {
  sized(node, 560);
  skin(
    ctx,
    node,
    'code-block-bg',
    'code-block-border',
    'code-block-radius',
    'code-block-border-width',
  );
  node.clipsContent = true;
  const head = ctx.auto(node, 'header');
  head.layoutSizingHorizontal = 'FILL';
  ctx.padding(head, 'code-block-padding-inline', 'code-block-header-padding-block');
  fill(await ctx.text(head, 'tsx', 'language', 'caption-2', 'code-block-muted-text'));
  button(
    ctx,
    head,
    '',
    'ghosted',
    state === 'copied' ? 'check' : state === 'error' ? 'warning' : 'copy',
  );
  head.visible = header === 'true';
  if (header === 'true') divider(ctx, node, 'code-block-border');
  const pre = ctx.auto(node, 'pre', 'VERTICAL');
  pre.layoutSizingHorizontal = 'FILL';
  ctx.padding(pre, 'code-block-padding-inline', 'code-block-padding-block');
  await mono(
    ctx,
    pre,
    "import { Button } from '@dreadnought/ui/react';\n\n<Button>Сохранить</Button>",
  );
}
async function markdown(ctx, node, { content }) {
  sized(node, 560);
  ctx.bind(node, 'itemSpacing', 'markdown-preview-block-gap');
  fill(await ctx.text(node, 'Заметки', 'heading', 'h2', 'markdown-preview-text'));
  fill(
    await ctx.text(
      node,
      'Редактируемый пример Markdown. Здесь обычный текст и ссылка.',
      'paragraph',
      'body-2',
      'markdown-preview-text',
    ),
  );
  if (content === 'rich') {
    await ctx.text(node, '• Первый пункт\n• Второй пункт', 'list');
    const quote = ctx.auto(node, 'quote', 'VERTICAL');
    quote.layoutSizingHorizontal = 'FILL';
    ctx.bind(quote, 'paddingLeft', 'markdown-preview-padding');
    quote.strokes = [ctx.paint('markdown-preview-border')];
    quote.strokeWeight = 0;
    ctx.bind(quote, 'strokeLeftWeight', 'markdown-preview-quote-width');
    fill(
      await ctx.text(
        quote,
        'Важная мысль в цитате.',
        'quote-text',
        'body-2',
        'markdown-preview-muted-text',
      ),
    );
    const code = use(ctx, node, 'CodeBlock', { state: 'default', header: 'false' });
    code.layoutSizingHorizontal = 'FILL';
    code.fills = [ctx.paint('markdown-preview-code-bg')];
    code.strokes = [];
    ctx.bind(code, 'cornerRadius', 'markdown-preview-radius');
    for (const text of code
      .findAllWithCriteria({ types: ['TEXT'] })
      .filter((n) => n.name === 'code'))
      ctx.bind(text, 'fontSize', 'font-size-body-2');
    const table = use(ctx, node, 'Table', { size: 'small', bordered: 'true', status: 'data' });
    table.layoutSizingHorizontal = 'FILL';
    table.fills = [];
    for (const cell of table.findAllWithCriteria({ types: ['INSTANCE'] })) {
      cell.fills = cell.name.includes('role=header') ? [ctx.paint('markdown-preview-code-bg')] : [];
      ctx.padding(cell, 'markdown-preview-table-padding');
      for (const text of cell.findAllWithCriteria({ types: ['TEXT'] })) {
        ctx.bind(text, 'fontSize', 'font-size-body-2');
        if (cell.name.includes('role=header')) ctx.bind(text, 'fontWeight', 'font-weight-h6');
      }
    }
  }
}
async function editor(ctx, node, { mode, state }) {
  sized(node, 960);
  skin(
    ctx,
    node,
    'markdown-editor-bg',
    state === 'invalid'
      ? 'markdown-editor-border-invalid'
      : state === 'focused'
        ? 'markdown-editor-border-focus'
        : 'markdown-editor-border-default',
    'markdown-editor-radius',
    'markdown-editor-border-width',
  );
  node.clipsContent = true;
  const toolbar = ctx.auto(node, 'toolbar');
  toolbar.layoutSizingHorizontal = 'FILL';
  ctx.padding(toolbar, 'markdown-editor-toolbar-padding');
  ctx.bind(toolbar, 'itemSpacing', 'markdown-editor-toolbar-gap');
  toolbar.fills = [ctx.paint('markdown-editor-toolbar-bg')];
  const formatting = ctx.auto(toolbar, 'formatting');
  ctx.bind(formatting, 'itemSpacing', 'markdown-editor-toolbar-gap');
  for (const name of [
    'bold',
    'italic',
    'strikethrough',
    'heading',
    'quote',
    'unordered-list',
    'ordered-list',
    'code',
    'code-block',
    'link',
    'image',
    'table',
  ])
    button(ctx, formatting, '', 'ghosted', name, mode === 'preview' ? 'disabled' : 'default');
  const spacer = ctx.auto(toolbar, 'spacer');
  spacer.resize(1, 1);
  spacer.layoutSizingHorizontal = 'FILL';
  const commands = ctx.auto(toolbar, 'commands');
  ctx.bind(commands, 'itemSpacing', 'markdown-editor-toolbar-gap');
  for (const name of ['undo', 'redo', 'code', 'columns', 'eye']) {
    const action = button(
      ctx,
      commands,
      '',
      'ghosted',
      name,
      name === 'undo' || name === 'redo' ? 'disabled' : 'default',
    );
    if (name === (mode === 'edit' ? 'code' : mode === 'live' ? 'columns' : 'eye'))
      action.fills = [ctx.paint('markdown-editor-mode-selected-bg')];
  }
  divider(ctx, node, 'markdown-editor-divider');
  const panels = ctx.auto(node, 'panels');
  panels.layoutSizingHorizontal = 'FILL';
  ctx.bind(panels, 'itemSpacing', 'markdown-editor-divider-width');
  if (mode !== 'preview') {
    const field = ctx.auto(panels, 'edit', 'VERTICAL');
    field.resize(mode === 'live' ? 480 : 960, 260);
    field.layoutSizingHorizontal = 'FILL';
    ctx.padding(field, 'markdown-editor-padding-x', 'markdown-editor-padding-y');
    fill(
      await ctx.text(
        field,
        '# Заметки\n\nРедактируемый текст.\n\n- Первый пункт\n- Второй пункт',
        'value',
        'body-2',
        'markdown-editor-text',
        'markdown-editor',
      ),
    );
  }
  if (mode !== 'edit') {
    const preview = ctx.auto(panels, 'preview', 'VERTICAL');
    preview.layoutSizingHorizontal = 'FILL';
    ctx.padding(preview, 'markdown-editor-padding-x', 'markdown-editor-padding-y');
    use(ctx, preview, 'MarkdownPreview', { content: 'basic' }).layoutSizingHorizontal = 'FILL';
  }
}
export const dataSpecs = [
  spec(
    'Table/Cell',
    {
      size: ['default', 'middle', 'small'],
      role: ['header', 'body', 'hover', 'selected', 'selected-hover', 'footer'],
    },
    tableCell,
    'Ячейка Table: плотности и состояния. Value редактируется; цвета и отступы из темы.',
    [prop('Value', 'value', 'Значение')],
    3,
  ),
  spec(
    'Table',
    {
      size: ['default', 'middle', 'small'],
      bordered: ['false', 'true'],
      status: ['data', 'empty', 'loading'],
    },
    table,
    'Таблица из экземпляров ячеек: три размера, bordered, данные/empty/loading. Три столбца и пример выбранной строки. Сортировка и виртуализация не исполняются.',
    [],
    3,
  ),
  spec(
    'Table/FilterMenu',
    { state: ['default', 'selected'] },
    filterMenu,
    'Меню фильтра с Checkbox и кнопками, источник цвета Table control, не popup blur.',
    [],
    2,
  ),
  spec(
    'Table/Features',
    { example: ['selection', 'expanded', 'sticky', 'filter'] },
    tableFeatures,
    'Составные примеры API таблицы. Sticky — статичная компоновка, не браузерный sticky; scroll/selection/sort остаются в React.',
    [],
    2,
  ),
  spec(
    'CodeBlock',
    { state: ['default', 'copied', 'error'], header: ['false', 'true'] },
    codeBlock,
    'Код и шапка с состояниями copy. Моноширинный шрифт Roboto Mono или Courier New из generic ui-monospace; без выполнения кода.',
    [
      prop('Language', 'language', 'tsx'),
      prop(
        'Code',
        'code',
        "import { Button } from '@dreadnought/ui/react';\n\n<Button>Сохранить</Button>",
      ),
    ],
    2,
  ),
  spec(
    'MarkdownPreview',
    { content: ['basic', 'rich'] },
    markdown,
    'Редактируемый Markdown-макет с заголовком, списком, цитатой, CodeBlock и Table. Не markdown-парсер.',
    [],
    2,
  ),
  spec(
    'MarkdownEditor',
    { mode: ['edit', 'live', 'preview'], state: ['default', 'focused', 'invalid'] },
    editor,
    'Три режима редактора с настоящими Button/иконками и MarkdownPreview. Текст редактируется; undo/redo, загрузка файлов и команды не исполняются.',
    [prop('Value', 'value', '# Заметки\n\nРедактируемый текст.')],
    1,
  ),
];
