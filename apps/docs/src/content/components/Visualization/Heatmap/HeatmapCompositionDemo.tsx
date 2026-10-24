import { Button, Heatmap, useHeatmap } from '@dreadnought/ui/react';

const columns = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => ({ id: day, label: day }));
const rows = ['Разработка', 'Дизайн'].map((team) => ({ id: team, label: team }));
const values = [
  [0, 4, 8, 12, 16, 20],
  [20, 16, 12, 8, 4, null],
];
const data = rows.flatMap((row, r) =>
  columns.map((column, c) => ({ row: row.id, column: column.id, value: values[r][c] })),
);

function Controls() {
  const { layout, page } = useHeatmap();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <p>
        {layout.cells.length} ячеек · таблица: {page.page} из {page.count}
      </p>
      <Button
        variant="secondary"
        disabled={page.page === page.count}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие строки
      </Button>
    </div>
  );
}
export function HeatmapCompositionDemo() {
  return (
    <Heatmap
      label="Свои маркеры активности"
      columns={columns}
      rows={rows}
      data={data}
      domain={[0, 20]}
      pageSize={6}
      labels={{ row: 'Команда', column: 'День', value: 'Задачи' }}
    >
      <Controls />
      <Heatmap.Legend />
      <Heatmap.Plot
        tooltipContent={({ defaultContent }) => (
          <>
            {defaultContent}
            <p>Круг дополняет цвет; числа остаются точными.</p>
          </>
        )}
      >
        {({ cell, defaultContent }) => (
          <span style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              {cell.intensity !== null && (
                <circle
                  cx="14"
                  cy="14"
                  r={3 + cell.intensity * 9}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              )}
            </svg>
            <span>{defaultContent}</span>
          </span>
        )}
      </Heatmap.Plot>
      <Heatmap.Empty />
      <Heatmap.Table />
      <Heatmap.Pagination />
    </Heatmap>
  );
}
