import { Button, WaterfallChart, useWaterfallChart } from '@dreadnought/ui/react';

const data = [
  { id: 'start', label: 'Начало', kind: 'start', value: 100 },
  { id: 'sales', label: 'Продажи', kind: 'change', value: 40 },
  { id: 'subtotal', label: 'После продаж', kind: 'total' },
  { id: 'rent', label: 'Аренда', kind: 'change', value: -25 },
  { id: 'end', label: 'Остаток', kind: 'total' },
] as const;

function Summary() {
  const { layout, page, formatValue } = useWaterfallChart();
  return (
    <>
      <p>
        Итог всего ряда: {formatValue(layout.steps.at(-1)?.after ?? 0)}. Страница {page.page} из{' '}
        {page.count}.
      </p>
      <Button
        size="compact"
        variant="secondary"
        style={{ justifySelf: 'start' }}
        disabled={page.page === page.count}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие шаги
      </Button>
    </>
  );
}

export function WaterfallChartCompositionDemo() {
  return (
    <WaterfallChart data={data} label="Свой рисунок шагов и общий итог" pageSize={3}>
      <Summary />
      <WaterfallChart.Plot
        tooltipContent={({ defaultContent }) => (
          <div>
            {defaultContent}
            <p>Баланс рассчитан по полному ряду</p>
          </div>
        )}
      >
        {({ step, baseline, connector, labels, formatValue }) => (
          <>
            <svg
              width="100%"
              height="240"
              viewBox="0 -2 100 104"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ display: 'block', overflow: 'visible' }}
            >
              <line
                x1={0}
                x2={100}
                y1={baseline}
                y2={baseline}
                stroke="currentColor"
                strokeOpacity={0.4}
                vectorEffect="non-scaling-stroke"
              />
              <rect x={20} y={step.y} width={60} height={step.height} rx={3} fill="currentColor" />
              {step.height === 0 && (
                <line
                  x1={20}
                  x2={80}
                  y1={step.y}
                  y2={step.y}
                  stroke="currentColor"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {connector && (
                <line
                  x1={80}
                  x2={120}
                  y1={step.endY}
                  y2={step.endY}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
            <span data-ui="waterfall-step-label">
              {step.label}
              <span>
                {labels[step.kind]} · после: {formatValue(step.after)}
              </span>
            </span>
          </>
        )}
      </WaterfallChart.Plot>
      <WaterfallChart.Table />
      <WaterfallChart.Pagination />
      <WaterfallChart.Empty />
    </WaterfallChart>
  );
}
