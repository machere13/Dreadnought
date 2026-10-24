import { Button, BoxPlot, useBoxPlot, type BoxPlotRenderContext } from '@dreadnought/ui/react';

const data = [
  { id: 'search', label: 'Поиск', values: [80, 90, 100, 110, 120, 130, 140, 150, 320] },
  { id: 'catalog', label: 'Каталог', values: [120, 150, 170, 180, 190, 210, 240] },
  { id: 'checkout', label: 'Оформление', values: [180, 190, 200, 210, 220] },
];

function Summary() {
  const { layout, page } = useBoxPlot();
  return (
    <>
      <p>
        Общая шкала: {layout.domain?.join('–')} мс. Страница {page.page} из {page.count}.
      </p>
      <Button
        size="compact"
        variant="secondary"
        style={{ justifySelf: 'start' }}
        disabled={page.page === page.count}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие сервисы
      </Button>
    </>
  );
}

function RoundedBox({ group }: BoxPlotRenderContext) {
  const positions = group.positions!;
  const x = (position: number) => `${2 + position * 96}%`;
  return (
    <svg width="100%" height="64" aria-hidden="true" style={{ display: 'block' }}>
      <g stroke="currentColor" fill="none">
        <line x1={x(positions.lowerWhisker)} x2={x(positions.upperWhisker)} y1={32} y2={32} />
        <line x1={x(positions.lowerWhisker)} x2={x(positions.lowerWhisker)} y1={24} y2={40} />
        <line x1={x(positions.upperWhisker)} x2={x(positions.upperWhisker)} y1={24} y2={40} />
        <rect
          x={x(positions.q1)}
          y={12}
          width={`${(positions.q3 - positions.q1) * 96}%`}
          height={40}
          rx={8}
          fill="currentColor"
          fillOpacity={0.25}
        />
        <line x1={x(positions.median)} x2={x(positions.median)} y1={12} y2={52} strokeWidth={3} />
        {group.outliers.map((outlier) => (
          <circle key={outlier.value} cx={x(outlier.position)} cy={32} r={4} />
        ))}
      </g>
    </svg>
  );
}

export function BoxPlotCompositionDemo() {
  return (
    <BoxPlot label="Свои боксы на общей шкале" data={data} valueLabel="Время, мс" pageSize={2}>
      <Summary />
      <BoxPlot.Axis />
      <BoxPlot.Plot
        tooltipContent={({ group, defaultContent }) => (
          <div>
            {defaultContent}
            <p>Всего измерений: {group.count}</p>
          </div>
        )}
      >
        {(context) => <RoundedBox {...context} />}
      </BoxPlot.Plot>
      <BoxPlot.Table />
      <BoxPlot.Pagination />
      <BoxPlot.Empty />
    </BoxPlot>
  );
}
