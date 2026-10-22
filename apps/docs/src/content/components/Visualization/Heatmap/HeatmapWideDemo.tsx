import { Heatmap } from '@dreadnought/ui/react';

const columns = Array.from({ length: 24 }, (_, hour) => ({
  id: String(hour),
  label: `${hour}:00`,
}));
const rows = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'].map((day) => ({ id: day, label: day }));
const data = rows.flatMap((row, r) =>
  columns.map((column, hour) => ({
    row: row.id,
    column: column.id,
    value: hour >= 9 && hour <= 18 ? 10 + ((hour * 7 + r * 11) % 80) : 0,
  })),
);

export function HeatmapWideDemo() {
  return (
    <Heatmap
      label="Обращения по часам"
      columns={columns}
      rows={rows}
      data={data}
      showValues={false}
      pageSize={5}
      domain={[0, 100]}
      labels={{ row: 'День', column: 'Час', value: 'Обращения' }}
    />
  );
}
