import { buildLineLayout } from '../../../packages/core/src/domains/charts/buildLineLayout.ts';
import { buildBarLayout } from '../../../packages/core/src/domains/charts/buildBarLayout.ts';
import { buildRadarLayout } from '../../../packages/core/src/domains/charts/buildRadarLayout.ts';
import { spec, prop, sized, skin, fill, use, button, absolute, blur } from './shared.js';

const series = [
  { id: 'a', label: 'План', data: [30, 55, 40, 75, 60, 90] },
  { id: 'b', label: 'Факт', data: [20, 40, 50, 60, 45, 75] },
];
export function chartPath(
  ctx,
  parent,
  name,
  path,
  width,
  height,
  color,
  weight,
  fillColor = null,
  fillOpacity = 1,
) {
  const svg = ctx.track(
    ctx.figma.createNodeFromSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${path}" fill="${fillColor ? 'black' : 'none'}" stroke="black" stroke-width="1"/></svg>`,
    ),
  );
  parent.appendChild(svg);
  svg.name = name;
  svg.resize(width, height);
  for (const vector of svg.findAllWithCriteria({ types: ['VECTOR'] })) {
    ctx.track(vector);
    vector.fills = fillColor ? [{ ...ctx.paint(fillColor), opacity: fillOpacity }] : [];
    vector.strokes = [ctx.paint(color)];
    ctx.bind(vector, 'strokeWeight', weight);
  }
  return svg;
}
async function tooltip(ctx, node, { chart }) {
  const prefix = chart + '-chart';
  sized(node, 240);
  ctx.padding(node, 'tooltip-padding-inline', 'tooltip-padding-block');
  skin(ctx, node, 'tooltip-bg', 'tooltip-border', 'tooltip-radius', 'tooltip-border-width');
  await blur(ctx, node);
  await ctx.text(node, 'Показатель: 4', 'caption', 'label-2');
  for (const [index, item] of series.entries()) {
    const row = ctx.auto(node, 'row');
    ctx.bind(row, 'itemSpacing', prefix + '-tooltip-column-gap');
    const mark = use(ctx, row, 'Mark', { shape: 'circle' });
    for (const shape of mark.children)
      shape.fills = [ctx.paint(`${prefix}-series-${index + 1}-color`)];
    const name = await ctx.text(row, item.label, 'name', 'body-3');
    name.resize(130, name.height);
    name.textAutoResize = 'HEIGHT';
    await ctx.text(row, String(item.data[3]), 'value', 'body-3');
  }
}
async function chartShell(ctx, node, prefix) {
  sized(node, 640);
  ctx.bind(node, 'itemSpacing', prefix + '-gap');
  const title = fill(await ctx.text(node, 'Показатели', 'title', 'label-1', prefix + '-text'));
  ctx.bind(title, 'fontWeight', prefix + '-title-font-weight');
  fill(
    await ctx.text(
      node,
      'План и факт за период',
      'description',
      'body-3',
      prefix + '-description-text',
    ),
  );
  const plot = ctx.auto(node, 'plot');
  plot.resize(640, 320);
  plot.clipsContent = false;
  return plot;
}
async function legend(ctx, node, prefix) {
  const root = ctx.auto(node, 'legend');
  ctx.bind(root, 'itemSpacing', prefix + '-legend-gap');
  for (const [index, item] of series.entries()) {
    const cell = ctx.auto(root, 'series-' + item.id);
    ctx.padding(cell, prefix + '-legend-padding-inline', prefix + '-legend-padding-block');
    ctx.bind(cell, 'itemSpacing', prefix + '-legend-gap');
    skin(
      ctx,
      cell,
      prefix + '-legend-bg',
      prefix + '-border',
      prefix + '-legend-radius',
      prefix + '-border-width',
    );
    const swatch = chartPath(
      ctx,
      cell,
      'swatch',
      'M0 4 L32 4',
      ctx.value(prefix + '-swatch-width', cell),
      8,
      `${prefix}-series-${index + 1}-color`,
      prefix + '-series-width',
    );
    if (index) for (const vector of swatch.children) vector.dashPattern = [6, 3];
    await ctx.text(cell, item.label, 'label', 'body-2', prefix + '-text');
  }
}
async function axisLabel(ctx, plot, prefix, label, x, y) {
  const text = await ctx.text(plot, String(label), 'axis-label', 'caption-2', prefix + '-text');
  ctx.bind(text, 'fontSize', prefix + '-label-font-size');
  absolute(text, x, y);
}
function point(ctx, plot, prefix, x, y, color, active) {
  const radius = ctx.value(prefix + (active ? '-point-active-radius' : '-point-radius'), plot);
  const dot = ctx.shape(plot, active ? 'active-point' : 'point', radius * 2, radius * 2, true);
  absolute(dot, x - radius, y - radius);
  dot.fills = [ctx.paint(color)];
  dot.strokes = [ctx.paint(prefix + (active ? '-focus-color' : '-point-border'))];
  ctx.bind(dot, 'strokeWeight', prefix + (active ? '-focus-width' : '-point-border-width'));
}
async function cartesian(ctx, node, { orientation = 'vertical', state, view }, type) {
  const prefix = type + '-chart';
  const plot = await chartShell(ctx, node, prefix);
  if (type === 'line') {
    const layout = buildLineLayout({
      series: series.map((s) => ({
        id: s.id,
        label: s.label,
        data: s.data.map((y, x) => ({ x, y })),
      })),
      xDomain: [0, 5],
      yDomain: [0, 100],
      width: 560,
      height: 260,
    });
    for (const tick of layout.yTicks) {
      absolute(
        chartPath(
          ctx,
          plot,
          'grid',
          `M0 ${tick.position} L560 ${tick.position}`,
          560,
          260,
          prefix + '-grid-color',
          prefix + '-grid-width',
        ),
        40,
        20,
      );
      await axisLabel(ctx, plot, prefix, tick.value, 0, tick.position + 12);
    }
    for (const tick of layout.xTicks)
      await axisLabel(ctx, plot, prefix, tick.value, tick.position + 36, 288);
    for (const [index, item] of layout.series.entries()) {
      const color = `${prefix}-series-${index + 1}-color`;
      for (const points of item.segments) {
        const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
        const line = chartPath(
          ctx,
          plot,
          'series-' + item.id,
          d,
          560,
          260,
          color,
          prefix + '-series-width',
        );
        absolute(line, 40, 20);
        if (index) for (const vector of line.children) vector.dashPattern = [6, 3];
        for (const [i, p] of points.entries())
          point(ctx, plot, prefix, p.x + 40, p.y + 20, color, state === 'active' && i === 3);
      }
    }
  } else {
    const categories = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'].map((label, index) => ({
      id: String(index),
      label,
    }));
    const layout = buildBarLayout({
      categories,
      series: series.map((s) => ({
        id: s.id,
        label: s.label,
        values: Object.fromEntries(s.data.map((value, i) => [String(i), value])),
      })),
      domain: [0, 100],
      width: 560,
      height: 260,
      orientation,
    });
    for (const tick of layout.ticks) {
      const d =
        orientation === 'vertical'
          ? `M0 ${tick.position} L560 ${tick.position}`
          : `M${tick.position} 0 L${tick.position} 260`;
      absolute(
        chartPath(ctx, plot, 'grid', d, 560, 260, prefix + '-grid-color', prefix + '-grid-width'),
        40,
        20,
      );
      await axisLabel(
        ctx,
        plot,
        prefix,
        tick.value,
        orientation === 'vertical' ? 0 : tick.position + 40,
        orientation === 'vertical' ? tick.position + 12 : 288,
      );
    }
    for (const cat of layout.categories)
      await axisLabel(
        ctx,
        plot,
        prefix,
        cat.label,
        orientation === 'vertical' ? cat.position + 24 : 0,
        orientation === 'vertical' ? 288 : cat.position + 12,
      );
    for (const bar of layout.bars) {
      const index = bar.seriesId === 'a' ? 1 : 2;
      const active = state === 'active' && bar.categoryId === '3';
      const shape = ctx.shape(plot, 'bar', Math.max(0.1, bar.width), Math.max(0.1, bar.height));
      absolute(shape, bar.x + 40, bar.y + 20);
      shape.fills = [ctx.paint(`${prefix}-series-${index}-color`)];
      shape.strokes = [ctx.paint(active ? prefix + '-focus-color' : prefix + '-bar-border')];
      ctx.bind(shape, 'strokeWeight', prefix + (active ? '-focus-width' : '-border-width'));
      if (index === 2) shape.dashPattern = [6, 3];
    }
  }
  await legend(ctx, node, prefix);
  if (state === 'active') {
    const popup = use(ctx, plot, 'ChartTooltip', { chart: type });
    absolute(popup, 270, 50);
  }
  if (view === 'paged') {
    const pages = ctx.auto(node, 'pagination');
    ctx.bind(pages, 'itemSpacing', prefix + '-legend-gap');
    button(ctx, pages, 'Назад', 'secondary');
    await ctx.text(pages, 'Страница', 'page-label');
    const page = use(
      ctx,
      pages,
      'Input',
      { variant: 'outlined', size: 'compact', state: 'default' },
      { Value: '2' },
    );
    page.resize(ctx.value(prefix + '-page-input-width', node), 32);
    button(ctx, pages, 'Далее', 'secondary');
  }
  if (view === 'range')
    use(ctx, node, 'Slider/horizontal', { range: 'true', state: 'default', marks: 'false' });
  if (view === 'scroll') {
    const scroll = ctx.shape(node, 'scrollbar-track', 640, 4);
    scroll.fills = [ctx.paint(prefix + '-scrollbar-track')];
    const thumb = ctx.shape(node, 'scrollbar-thumb', 200, 4);
    thumb.fills = [ctx.paint(prefix + '-scrollbar-thumb')];
  }
}
async function radar(ctx, node, { axes, state }) {
  const prefix = 'radar-chart';
  const plot = await chartShell(ctx, node, prefix);
  const metrics = Array.from({ length: Number(axes) }, (_, index) => ({
    id: String(index),
    label: ['Скорость', 'Качество', 'Надёжность', 'Доступность', 'Гибкость', 'Поддержка'][index],
    domain: [0, 100],
  }));
  const layout = buildRadarLayout({
    metrics,
    series: series.map((s) => ({
      id: s.id,
      label: s.label,
      values: Object.fromEntries(metrics.map((m, i) => [m.id, s.data[i]])),
    })),
    radius: 110,
  });
  const d = (points) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${p.x + 320} ${p.y + 160}`).join(' ') + ' Z';
  for (const scale of [0.25, 0.5, 0.75, 1])
    absolute(
      chartPath(
        ctx,
        plot,
        'grid',
        d(layout.axes.map((p) => ({ x: p.x * scale, y: p.y * scale }))),
        640,
        320,
        prefix + '-grid-color',
        prefix + '-grid-width',
      ),
      0,
      0,
    );
  for (const axis of layout.axes) {
    absolute(
      chartPath(
        ctx,
        plot,
        'axis',
        `M320 160 L${axis.x + 320} ${axis.y + 160}`,
        640,
        320,
        prefix + '-grid-color',
        prefix + '-grid-width',
      ),
      0,
      0,
    );
    await axisLabel(ctx, plot, prefix, axis.label, axis.x * 1.2 + 280, axis.y * 1.2 + 150);
  }
  for (const [index, s] of layout.seriesPoints.entries()) {
    const color = `${prefix}-series-${index + 1}-color`;
    const polygon = chartPath(
      ctx,
      plot,
      'series-' + s.id,
      d(s.points),
      640,
      320,
      color,
      prefix + '-series-width',
      color,
      ctx.value(prefix + '-fill-opacity', node),
    );
    absolute(polygon, 0, 0);
    if (index) for (const vector of polygon.children) vector.dashPattern = [6, 3];
    for (const [i, p] of s.points.entries())
      point(ctx, plot, prefix, p.x + 320, p.y + 160, color, state === 'active' && i === 0);
  }
  await legend(ctx, node, prefix);
  if (state === 'active') {
    const popup = use(ctx, plot, 'ChartTooltip', { chart: 'radar' });
    absolute(popup, 340, 80);
  }
}
export const chartSpecs = [
  spec(
    'ChartTooltip',
    { chart: ['line', 'bar', 'radar'] },
    tooltip,
    'Табличный tooltip: цветной Mark, выровненные названия и значения. Поверхность Tooltip из темы.',
  ),
  spec(
    'LineChart',
    { state: ['default', 'active'], view: ['standard', 'paged', 'range'] },
    (ctx, n, p) => cartesian(ctx, n, p, 'line'),
    'Редактируемые векторы, оси, точки, легенда, tooltip и контролы диапазона/страниц. Координаты вычисляет настоящий core buildLineLayout. Статичный набор данных, без runtime downsampling.',
    [
      prop('Title', 'title', 'Показатели'),
      prop('Description', 'description', 'План и факт за период'),
    ],
    2,
  ),
  spec(
    'BarChart',
    {
      orientation: ['vertical', 'horizontal'],
      state: ['default', 'active'],
      view: ['standard', 'paged', 'scroll'],
    },
    (ctx, n, p) => cartesian(ctx, n, p, 'bar'),
    'Grouped bars, две ориентации, tooltip, легенда, страницы/образец скролла. Геометрию рассчитывает core buildBarLayout; скролл и hit testing не исполняются.',
    [prop('Title', 'title', 'Показатели')],
    2,
  ),
  spec(
    'RadarChart',
    { axes: ['3', '4', '5', '6'], state: ['default', 'active'] },
    radar,
    'Радар с 3–6 осями, сеткой, сериями, точками, легендой и tooltip. Геометрия из core buildRadarLayout; максимум числа осей библиотекой не ограничен шестью.',
    [prop('Title', 'title', 'Показатели')],
    2,
  ),
];
