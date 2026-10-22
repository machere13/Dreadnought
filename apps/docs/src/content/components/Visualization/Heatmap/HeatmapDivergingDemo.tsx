import { Heatmap } from '@dreadnought/ui/react';

const columns = ['Январь', 'Февраль', 'Март'].map((month) => ({ id: month, label: month }));
const rows = ['Поиск', 'Соцсети', 'Рассылки'].map((channel) => ({ id: channel, label: channel }));
const changes = [
  [-20, -5, 10],
  [0, 15, 20],
  [-10, 5, 0],
];
const data = rows.flatMap((row, r) =>
  columns.map((column, c) => ({
    row: row.id,
    column: column.id,
    value: changes[r][c],
  })),
);

export function HeatmapDivergingDemo() {
  return (
    <Heatmap
      label="Отклонение от плана"
      description="Синий — ниже плана, светлый — по плану, оранжевый — выше."
      columns={columns}
      rows={rows}
      data={data}
      domain={[-20, 20]}
      colorScale="diverging"
      formatValue={(value) => `${value > 0 ? '+' : ''}${value}%`}
      labels={{ column: 'Месяц', row: 'Канал', value: 'Отклонение' }}
    />
  );
}
