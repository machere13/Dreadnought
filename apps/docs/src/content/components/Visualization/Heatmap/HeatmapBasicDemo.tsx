import { Heatmap } from '@dreadnought/ui/react';

const columns = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => ({ id: day, label: day }));
const rows = ['Поддержка', 'Разработка', 'Дизайн'].map((team) => ({ id: team, label: team }));
const counts = [
  [12, 18, 24, 16, 22, 4, 0],
  [6, 9, 14, 20, 16, 0, 0],
  [8, 12, 6, 10, 14, 0, 0],
];
const data = rows.flatMap((row, r) =>
  columns.map((column, c) => ({
    row: row.id,
    column: column.id,
    value: counts[r][c],
  })),
);

export function HeatmapBasicDemo() {
  return (
    <Heatmap
      label="Закрытые задачи за неделю"
      columns={columns}
      rows={rows}
      data={data}
      domain={[0, 24]}
      labels={{ column: 'День', row: 'Команда', value: 'Задачи' }}
      pageSize={7}
    />
  );
}
