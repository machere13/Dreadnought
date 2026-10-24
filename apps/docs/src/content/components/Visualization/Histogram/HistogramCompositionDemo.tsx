import { Button, Histogram, useHistogram } from '@dreadnought/ui/react';

const data = [1, 3, 5, 12, 15, 18, 22, 24, 25, 29, 34, 38];
const domain = [0, 40] as const;

function Summary() {
  const { layout, page } = useHistogram();
  return (
    <>
      <p>
        {layout.total} измерений, {layout.bins.length} интервала. Таблица: страница {page.page} из{' '}
        {page.count}.
      </p>
      <Button
        size="compact"
        variant="secondary"
        style={{ justifySelf: 'start' }}
        disabled={page.page === page.count}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие интервалы
      </Button>
    </>
  );
}

export function HistogramCompositionDemo() {
  return (
    <Histogram
      label="Интервалы с подписями количества"
      data={data}
      bins={4}
      domain={domain}
      pageSize={2}
    >
      <Summary />
      <Histogram.Plot
        tooltipContent={({ bin, defaultContent }) => (
          <div>
            {defaultContent}
            <p>{bin.inclusiveUpper ? 'Правая граница включена' : 'Правая граница не включена'}</p>
          </div>
        )}
      >
        {({ bar, bin, defaultContent }) => (
          <>
            {defaultContent}
            <text
              x={bar.x + bar.width / 2}
              y={bar.y + 20}
              textAnchor="middle"
              style={{ fill: 'var(--dreadnought-color-text-inverse)' }}
              pointerEvents="none"
              aria-hidden="true"
            >
              {bin.count}
            </text>
          </>
        )}
      </Histogram.Plot>
      <Histogram.Table />
      <Histogram.Pagination />
      <Histogram.Empty />
    </Histogram>
  );
}
