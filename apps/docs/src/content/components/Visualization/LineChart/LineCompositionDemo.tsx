import { Button, LineChart, useLineChart, type LineChartPlotProps } from '@dreadnought/ui/react';

const series = [
  {
    id: 'plan',
    label: 'План',
    data: [
      { x: 1, y: 20 },
      { x: 2, y: 30 },
      { x: 3, y: 25 },
      { x: 4, y: 40 },
    ],
  },
  {
    id: 'actual',
    label: 'Факт',
    data: [
      { x: 1, y: 15 },
      { x: 2, y: 25 },
      { x: 3, y: null },
      { x: 4, y: 35 },
    ],
  },
];

type Segment = Parameters<NonNullable<LineChartPlotProps['children']>>[0];
function StepLine({ series, points }: Segment) {
  const { slotProps } = useLineChart();
  const slot = slotProps.series?.(series);
  return (
    <path
      className={slot?.className}
      style={slot?.style}
      d={points
        .map((point, index) => (index ? `H${point.x} V${point.y}` : `M${point.x} ${point.y}`))
        .join(' ')}
    />
  );
}

function RangeButtons() {
  const { xs, range } = useLineChart();
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Button size="compact" variant="secondary" onClick={() => range.change(0, 1)}>
        Первые два дня
      </Button>
      <Button size="compact" variant="secondary" onClick={() => range.change(0, xs.length - 1)}>
        Весь диапазон
      </Button>
    </div>
  );
}

export function LineCompositionDemo() {
  return (
    <LineChart
      label="Ступенчатый план и факт"
      series={series}
      xDomain={[1, 4]}
      yDomain={[0, 50]}
      xLabel="День"
      yLabel="Заказы"
      pageSize={2}
    >
      <RangeButtons />
      <LineChart.Legend>
        {({ series, visible }) => (
          <span>
            {series.label}: {visible ? 'видна' : 'скрыта'}
          </span>
        )}
      </LineChart.Legend>
      <LineChart.Plot
        tooltipContent={({ defaultContent }) => (
          <div>
            {defaultContent}
            <p>Точные исходные значения</p>
          </div>
        )}
      >
        {(context) => <StepLine {...context} />}
      </LineChart.Plot>
      <LineChart.RangeControls />
      <LineChart.Table />
      <LineChart.Pagination />
      <LineChart.Empty />
    </LineChart>
  );
}
