import { spec, prop, sized, skin, fill, iconMain, resolved } from './shared.js';

export const iconNames = [
  'clock',
  'calendar',
  'left',
  'right',
  'eye',
  'eye-off',
  'search',
  'filter',
  'copy',
  'check',
  'close',
  'down',
  'menu',
  'ellipsis',
  'info-circle',
  'check-circle',
  'warning',
  'close-circle',
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
  'undo',
  'redo',
  'columns',
];
export const iconSpecs = [iconNames.slice(0, 30), iconNames.slice(30)].map((names, index) =>
  spec(
    'Icon/Set' + (index + 1),
    { icon: names },
    (ctx, node, { icon }) => ctx.icon(node, icon, 'color-text-primary'),
    'Исходные SVG установленного Ant Design. Это компоненты для INSTANCE_SWAP, не растровые изображения.',
    [],
    6,
  ),
);

async function renderButton(ctx, node, { size, state }, variant) {
  node.primaryAxisAlignItems = 'CENTER';
  ctx.padding(
    node,
    size === 'compact' ? 'button-compact-padding-x' : 'button-padding-x',
    size === 'compact' ? 'button-compact-padding-y' : 'button-padding-y',
  );
  ctx.bind(
    node,
    'minHeight',
    size === 'compact' ? 'button-compact-min-height' : 'button-min-height',
  );
  ctx.bind(node, 'itemSpacing', 'button-gap');
  skin(
    ctx,
    node,
    `button-${variant}-bg${state === 'hover' ? '-hover' : ''}`,
    `button-${variant}-border-color`,
    'button-radius',
    'button-border-width',
  );
  const icon = ctx.track(iconMain(ctx, 'check').createInstance());
  node.appendChild(icon);
  icon.name = 'icon';
  icon.visible = false;
  await ctx.text(node, 'Кнопка', 'label', 'label-1', `button-${variant}-fg`, 'button');
  if (state === 'loading') {
    const spinner = ctx.track(
      ctx.figma.createNodeFromSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M13 3A7 7 0 1 0 13 13" fill="none" stroke="black" stroke-width="2"/></svg>',
      ),
    );
    node.appendChild(spinner);
    spinner.name = 'spinner';
    spinner.resize(16, 16);
    for (const vector of spinner.findAllWithCriteria({ types: ['VECTOR'] })) {
      ctx.track(vector);
      vector.strokes = [ctx.paint(`button-${variant}-fg`)];
    }
  }
  if (state === 'disabled' || state === 'loading')
    await ctx.opacity(node, ctx.token('button-disabled-opacity'));
  if (state === 'focused') {
    const ring = ctx.shape(node, 'focus-ring', node.width + 6, node.height + 6);
    ring.layoutPositioning = 'ABSOLUTE';
    ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    ring.x = ring.y = -3;
    ring.fills = [];
    ring.strokes = [
      ctx.paint(variant === 'primary' ? 'button-primary-focus-ring' : 'button-focus-ring'),
    ];
    ring.strokeAlign = 'OUTSIDE';
    ctx.bind(ring, 'strokeWeight', 'button-focus-width');
    ctx.bind(ring, 'cornerRadius', 'button-radius');
  }
}
export async function renderInput(
  ctx,
  node,
  { variant = 'outlined', size = 'default', state = 'default' },
) {
  sized(node, 280, 44, 'HORIZONTAL');
  node.counterAxisAlignItems = 'CENTER';
  ctx.padding(
    node,
    size === 'compact' ? 'spacing-x2' : 'input-padding-x',
    size === 'compact' ? 'spacing-x1' : 'input-padding-y',
  );
  ctx.bind(node, 'itemSpacing', 'input-gap');
  ctx.bind(
    node,
    'minHeight',
    size === 'compact' ? 'size-control-compact-min-height' : 'input-min-height',
  );
  const border =
    state === 'invalid'
      ? 'input-border-invalid'
      : state === 'focused'
        ? 'input-border-focus'
        : variant === 'outlined'
          ? 'input-border-default'
          : null;
  skin(
    ctx,
    node,
    variant === 'borderless' ? null : variant === 'filled' ? 'color-surface-subtle' : 'input-bg',
    border,
    'input-radius',
    'input-border-width',
  );
  fill(
    await ctx.text(
      node,
      state === 'placeholder' ? 'Введите значение' : 'Текст',
      state === 'placeholder' ? 'placeholder' : 'value',
      'body-2',
      state === 'placeholder' ? 'input-placeholder-text' : 'input-text',
      'input',
    ),
  );
  if (state === 'disabled') await ctx.opacity(node, ctx.token('input-disabled-opacity'));
}
async function renderCard(ctx, node, { variant, size }) {
  sized(node, 360);
  skin(
    ctx,
    node,
    'card-bg',
    variant === 'outlined' ? 'card-border' : null,
    'card-radius',
    'card-border-width',
  );
  for (const [name, text, role] of [
    ['header', 'Название карточки', 'h6'],
    ['body', 'Содержимое карточки', 'body-2'],
    ['footer', 'Нижняя область', 'body-3'],
  ]) {
    const area = ctx.auto(node, name, 'VERTICAL');
    area.layoutSizingHorizontal = 'FILL';
    if (size === 'compact') ctx.padding(area, 'card-compact-padding');
    else {
      const padding = await resolved(
        ctx,
        'Card/padding',
        'FLOAT',
        ctx.value('spacing-x4', node) * 1.5,
        ['GAP'],
        'var(--dreadnought-card-padding)',
      );
      for (const field of ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'])
        area.setBoundVariable(field, padding);
    }
    if (name !== 'body') {
      area.strokes = [ctx.paint('card-border')];
      area.strokeWeight = 0;
      ctx.bind(
        area,
        name === 'header' ? 'strokeBottomWeight' : 'strokeTopWeight',
        'card-border-width',
      );
    }
    fill(await ctx.text(area, text, name + '-text', role, 'card-text'));
    if (name === 'footer') area.visible = false;
  }
}
export const legacySpecs = [
  ...['primary', 'secondary', 'outlined', 'ghosted'].map((variant) =>
    spec(
      'Button/' + variant,
      {
        size: ['default', 'compact'],
        state: ['default', 'hover', 'focused', 'disabled', 'loading'],
      },
      (ctx, n, p) => renderButton(ctx, n, p, variant),
      'Восстановление отсутствующего набора Button. Существующий набор сохраняется.',
      [
        prop('Label', 'label', 'Кнопка'),
        prop('Show label', 'label', true, 'BOOLEAN'),
        prop('Show icon', 'icon', false, 'BOOLEAN'),
      ],
      5,
    ),
  ),
  spec(
    'Input',
    {
      variant: ['outlined', 'filled', 'borderless'],
      size: ['default', 'compact'],
      state: ['placeholder', 'default', 'focused', 'invalid', 'disabled'],
    },
    renderInput,
    'Базовый Input; существующие варианты и ID сохраняются.',
    [prop('Value', 'value', 'Текст'), prop('Placeholder', 'placeholder', 'Введите значение')],
    5,
  ),
  spec(
    'Card',
    { variant: ['outlined', 'borderless'], size: ['default', 'compact'] },
    renderCard,
    'Секционная Card. Существующий набор не пересоздаётся.',
    [
      prop('Title', 'header-text', 'Название карточки'),
      prop('Body', 'body-text', 'Содержимое карточки'),
      prop('Show header', 'header', true, 'BOOLEAN'),
      prop('Show footer', 'footer', false, 'BOOLEAN'),
    ],
    2,
  ),
];
