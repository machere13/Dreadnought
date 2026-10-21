import { spec, prop, sized, skin, fill, use, button, absolute, resolved } from './shared.js';
import { renderInput } from './foundations.js';
import { outline } from './navigation.js';

const states = ['default', 'focused', 'invalid', 'disabled'];
async function textArea(ctx, node, { variant, state, size }) {
  sized(node, 320, 112, 'HORIZONTAL', false);
  const compact = size === 'compact';
  ctx.padding(
    node,
    compact ? 'spacing-x2' : 'text-area-padding-x',
    compact ? 'spacing-x1' : 'text-area-padding-y',
  );
  skin(
    ctx,
    node,
    variant === 'borderless'
      ? null
      : variant === 'filled'
        ? 'color-surface-subtle'
        : 'text-area-bg',
    state === 'invalid'
      ? 'text-area-border-invalid'
      : state === 'focused'
        ? 'text-area-border-focus'
        : variant === 'outlined'
          ? 'text-area-border-default'
          : null,
    'text-area-radius',
    'text-area-border-width',
  );
  fill(
    await ctx.text(
      node,
      'Многострочный текст\nВторая строка',
      'value',
      'body-2',
      'text-area-text',
      'text-area',
    ),
  );
  if (state === 'disabled') await ctx.opacity(node, ctx.token('text-area-disabled-opacity'));
}
async function inputComposition(ctx, node, { kind, state }) {
  await renderInput(ctx, node, { state });
  const value = node.findOne((n) => n.name === 'value');
  value.characters =
    kind === 'password'
      ? '••••••••'
      : kind === 'number'
        ? '42'
        : kind === 'search'
          ? 'Поиск'
          : 'Значение';
  if (kind === 'number') {
    const steps = ctx.auto(node, 'step-controls', 'VERTICAL');
    const width = ctx.value('input-step-width', node);
    steps.resize(width, node.height);
    absolute(steps, node.width - width, 0);
    steps.visible = state === 'focused' || state === 'hover';
    for (const up of [true, false]) {
      const step = ctx.auto(steps, up ? 'increase' : 'decrease');
      step.resize(width, node.height / 2);
      step.primaryAxisAlignItems = 'CENTER';
      const icon = ctx.icon(step, 'down', 'input-text', ctx.value('input-step-icon-size', node));
      if (up) icon.rotation = 180;
    }
  } else
    ctx.icon(
      node,
      kind === 'password' ? 'eye' : kind === 'search' ? 'search' : 'close-circle',
      'input-text',
    );
}
async function formField(ctx, node, { state }) {
  sized(node, 320);
  ctx.bind(node, 'itemSpacing', 'form-field-gap');
  const label = ctx.auto(node, 'label');
  const text = await ctx.text(label, 'Электронная почта', 'label-text');
  text.setBoundVariable(
    'fontWeight',
    await resolved(ctx, 'Form/label-weight', 'FLOAT', 500, ['FONT_WEIGHT'], '500'),
  );
  const required = await ctx.text(label, ' *', 'required', 'body-2', 'form-error-color');
  required.visible = state !== 'default';
  const field = use(
    ctx,
    node,
    'Input',
    { variant: 'outlined', size: 'default', state: state === 'invalid' ? 'invalid' : 'default' },
    { Value: 'name@example.com' },
  );
  field.layoutSizingHorizontal = 'FILL';
  fill(
    await ctx.text(
      node,
      state === 'invalid' ? 'Введите корректный адрес' : 'Адрес для уведомлений',
      state === 'invalid' ? 'error' : 'help',
      'body-3',
      state === 'invalid' ? 'form-error-color' : 'form-help-color',
    ),
  );
}
function form(ctx, node, { state }) {
  sized(node, 320);
  ctx.bind(node, 'itemSpacing', 'form-gap');
  for (let i = 0; i < 2; i++)
    use(ctx, node, 'FormField', { state: state === 'invalid' && i === 0 ? 'invalid' : 'required' });
  button(ctx, node, 'Сохранить', 'primary', null, state === 'submitting' ? 'loading' : 'default');
}
async function progress(ctx, node, { status, value }) {
  sized(node, 320, 30, 'HORIZONTAL');
  node.counterAxisAlignItems = 'CENTER';
  ctx.bind(node, 'itemSpacing', 'progress-gap');
  const rail = ctx.auto(node, 'track');
  rail.resize(260, ctx.value('progress-height', node));
  rail.layoutSizingHorizontal = 'FILL';
  skin(ctx, rail, 'progress-track', null, 'progress-radius');
  const amount = Number(value);
  if (amount > 0) {
    const bar = ctx.shape(rail, 'fill', (260 * amount) / 100, rail.height);
    absolute(bar, 0, 0);
    skin(
      ctx,
      bar,
      status === 'success'
        ? 'progress-success'
        : status === 'error'
          ? 'progress-error'
          : 'progress-fill',
      null,
      'progress-radius',
    );
  }
  await ctx.text(node, value + '%', 'label', 'body-2', 'progress-fg', 'progress');
}
async function slider(ctx, node, { orientation, range, state, marks }) {
  const vertical = orientation === 'vertical';
  const length = vertical ? ctx.value('slider-vertical-height', node) : 280;
  const cross = ctx.value('slider-height', node);
  sized(node, vertical ? cross : length, vertical ? length : cross, 'HORIZONTAL', false);
  const thickness = ctx.value('slider-rail-height', node);
  const start = range === 'true' ? 0.25 : 0,
    end = 0.7;
  for (const [name, a, b, color] of [
    ['rail', 0, 1, 'slider-rail-bg'],
    ['track', start, end, 'slider-track-bg'],
  ]) {
    const shape = ctx.shape(
      node,
      name,
      vertical ? thickness : length * (b - a),
      vertical ? length * (b - a) : thickness,
    );
    absolute(
      shape,
      vertical ? (cross - thickness) / 2 : length * a,
      vertical ? length * (1 - b) : (cross - thickness) / 2,
    );
    skin(ctx, shape, color, null, 'slider-radius');
  }
  for (const value of range === 'true' ? [start, end] : [end]) {
    const size = ctx.value('slider-thumb-size', node);
    const thumb = ctx.shape(node, 'thumb', size, size, true);
    absolute(
      thumb,
      vertical ? (cross - size) / 2 : length * value - size / 2,
      vertical ? length * (1 - value) - size / 2 : (cross - size) / 2,
    );
    thumb.fills = [ctx.paint('slider-thumb-bg')];
    if (state === 'focused') {
      const offset = ctx.value('slider-focus-offset', node);
      const ring = ctx.shape(node, 'focus-ring', size + offset * 2, size + offset * 2, true);
      absolute(ring, thumb.x - offset, thumb.y - offset);
      ring.fills = [];
      ring.strokes = [ctx.paint('slider-focus')];
      ring.strokeAlign = 'OUTSIDE';
      ctx.bind(ring, 'strokeWeight', 'slider-focus-width');
    }
  }
  if (marks === 'true')
    for (const value of [0, 0.5, 1]) {
      const color =
        value >= start && value <= end ? 'slider-mark-active-color' : 'slider-mark-color';
      const text = await ctx.text(node, String(value * 100), 'mark', 'caption-2', color);
      ctx.bind(text, 'fontSize', 'slider-mark-font-size');
      absolute(
        text,
        vertical
          ? cross / 2 + ctx.value('slider-mark-offset', node)
          : length * value - text.width / 2,
        vertical
          ? length * (1 - value) - text.height / 2
          : cross / 2 + ctx.value('slider-mark-offset', node),
      );
      const diameter = ctx.value('slider-mark-size', node);
      const dot = ctx.shape(node, 'mark-dot', diameter, diameter, true);
      absolute(
        dot,
        vertical ? cross / 2 - diameter / 2 : length * value - diameter / 2,
        vertical ? length * (1 - value) - diameter / 2 : cross / 2 - diameter / 2,
      );
      dot.fills = [ctx.paint(color)];
    }
  if (state === 'disabled') await ctx.opacity(node, ctx.token('slider-disabled-opacity'));
}
async function upload(ctx, node, { presentation, state }) {
  sized(node, 360);
  ctx.bind(node, 'itemSpacing', 'upload-gap');
  const zone = ctx.auto(node, 'dropzone', presentation === 'dropzone' ? 'VERTICAL' : 'HORIZONTAL');
  zone.layoutSizingHorizontal = 'FILL';
  if (presentation === 'dropzone') {
    ctx.padding(zone, 'upload-padding');
    skin(
      ctx,
      zone,
      state === 'dragging' ? 'upload-hover-background' : 'upload-background',
      state === 'dragging' ? 'upload-active-border' : 'upload-border',
      'upload-radius',
    );
    zone.strokeWeight = 1;
    zone.dashPattern = [4, 4];
    await ctx.text(zone, 'Перетащите файл сюда', 'hint');
  }
  button(ctx, zone, 'Выбрать файл', 'primary', null, state === 'disabled' ? 'disabled' : 'default');
  if (state === 'disabled') zone.opacity = 0.6;
  if (['uploading', 'done', 'error'].includes(state)) {
    const item = ctx.auto(node, 'file-item', 'VERTICAL');
    item.layoutSizingHorizontal = 'FILL';
    ctx.padding(item, 'upload-gap');
    ctx.bind(item, 'itemSpacing', 'upload-detail-gap');
    skin(ctx, item, null, 'upload-border', 'upload-radius');
    item.strokeWeight = 1;
    const row = ctx.auto(item, 'file');
    fill(await ctx.text(row, 'document.pdf', 'file-name'));
    button(ctx, row, '', 'ghosted', state === 'error' ? 'redo' : 'close');
    await ctx.text(
      item,
      state === 'error' ? 'Не удалось загрузить' : state === 'done' ? 'Загружено' : 'Загрузка…',
      'status',
      'body-3',
      state === 'error' ? 'upload-error-color' : 'upload-muted-color',
    );
    if (state === 'uploading') use(ctx, item, 'Progress', { status: 'default', value: '50' });
  }
}
export const fieldSpecs = [
  spec(
    'Input/Composition',
    { kind: ['password', 'number', 'search', 'clear'], state: [...states, 'hover'] },
    inputComposition,
    'Вариации Input с внутренними действиями. Степперы видимы в hover/focused; пароль, поиск и очистка статичны. Без новой отдельной React API.',
    [],
    4,
  ),
  spec(
    'TextArea',
    { variant: ['outlined', 'filled', 'borderless'], size: ['default', 'compact'], state: states },
    textArea,
    'Многострочное поле: оформления, размеры и состояния. Редактируемый текст; autoSize/maxRows и счётчик не исполняются в Figma.',
    [prop('Value', 'value', 'Многострочный текст\nВторая строка')],
    4,
  ),
  spec(
    'FormField',
    { state: ['default', 'required', 'invalid'] },
    formField,
    'Label + настоящий Input + help/error. Required-маркер отдельный слой.',
    [
      prop('Label', 'label-text', 'Электронная почта'),
      prop('Help', 'help', 'Адрес для уведомлений'),
      prop('Error', 'error', 'Введите корректный адрес'),
    ],
  ),
  spec(
    'Form',
    { state: ['default', 'invalid', 'submitting'] },
    form,
    'Композиция полей и Button. Validation/submit и состояние данных остаются в React.',
  ),
  spec(
    'Progress',
    { status: ['default', 'success', 'error'], value: ['0', '50', '100'] },
    progress,
    'Линейный индикатор с подписью, цвета статусов из темы. Проценты — образцы данных.',
  ),
  ...['horizontal', 'vertical'].map((orientation) =>
    spec(
      'Slider/' + orientation,
      {
        range: ['false', 'true'],
        state: ['default', 'focused', 'disabled'],
        marks: ['false', 'true'],
      },
      (ctx, n, p) => slider(ctx, n, { ...p, orientation }),
      'Ориентация ' +
        orientation +
        '. Один / два бегунка, фокус, disabled, отметки. Геометрия образца 25–70%; drag и ограничения шага не исполняются.',
      [],
      3,
    ),
  ),
  spec(
    'Upload',
    {
      presentation: ['button', 'dropzone'],
      state: ['empty', 'dragging', 'uploading', 'done', 'error', 'disabled'],
    },
    upload,
    'Выбор файла / dropzone и жизненный цикл загрузки. Настоящие Button и Progress; без запросов и доступа к файлам.',
  ),
];
