import {
  Button,
  ScatterChart,
  useScatterChart,
  type ScatterChartPlotProps,
} from '@dreadnought/ui/react';

const series = [
  {
    id: 'search',
    label: 'Поиск',
    data: [
      { id: 'a', label: 'Кампания A', x: 20, y: 30, size: 25 },
      { id: 'b', label: 'Кампания B', x: 60, y: 70, size: 100 },
    ],
  },
  {
    id: 'social',
    label: 'Соцсети',
    data: [{ id: 'c', label: 'Кампания C', x: 40, y: 50, size: 50 }],
  },
];
type Point = Parameters<NonNullable<ScatterChartPlotProps['children']>>[0];
function Diamond({ point, series, cx, cy, radius }: Point) {
  const { slotProps } = useScatterChart();
  const slot = slotProps.point?.(series, point);
  return (
    <path
      className={slot?.className}
      style={slot?.style}
      d={`M${cx} ${cy - radius} L${cx + radius} ${cy} L${cx} ${cy + radius} L${cx - radius} ${cy} Z`}
    />
  );
}
function Summary() {
  const { visible, page } = useScatterChart();
  return (
    <>
      <p>
        Видимых серий: {visible.length}. Таблица: страница {page.page} из {page.count}.
      </p>
      <Button
        size="compact"
        variant="secondary"
        style={{ justifySelf: 'start' }}
        disabled={page.page === page.count}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие строки
      </Button>
    </>
  );
}
export function ScatterCompositionDemo() {
  return (
    <ScatterChart
      series={series}
      label="Ромбы вместо пузырьков"
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      xLabel="Бюджет"
      yLabel="Заказы"
      sizeLabel="Выручка"
      pageSize={2}
    >
      <Summary />
      <ScatterChart.Legend>
        {({ series, visible }) => (
          <span>
            {series.label}: {visible ? 'видна' : 'скрыта'}
          </span>
        )}
      </ScatterChart.Legend>
      <ScatterChart.Plot
        tooltipContent={({ defaultContent }) => (
          <div>
            {defaultContent}
            <p>Точные данные кампании</p>
          </div>
        )}
      >
        {(context) => <Diamond {...context} />}
      </ScatterChart.Plot>
      <ScatterChart.Empty />
      <ScatterChart.Table />
      <ScatterChart.Pagination />
    </ScatterChart>
  );
}
