import { Button, FunnelChart, useFunnelChart } from '@dreadnought/ui/react';

const data = [
  { id: 'visit', label: 'Посетили сайт', value: 1000 },
  { id: 'cart', label: 'Добавили в корзину', value: 400 },
  { id: 'paid', label: 'Оплатили', value: 100 },
];

function Summary() {
  const { layout, page, formatPercent } = useFunnelChart();
  const conversion = layout.stages.at(-1)?.fromFirst;
  return (
    <>
      <p>
        Конверсия всего процесса: {conversion == null ? '—' : formatPercent(conversion)}. Страница{' '}
        {page.page} из {page.count}.
      </p>
      <Button
        size="compact"
        variant="secondary"
        style={{ justifySelf: 'start' }}
        disabled={page.page === page.count}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие этапы
      </Button>
    </>
  );
}

export function FunnelChartCompositionDemo() {
  return (
    <FunnelChart data={data} label="Этапы со своим рисунком" pageSize={2}>
      <Summary />
      <FunnelChart.Plot
        tooltipContent={({ defaultContent }) => (
          <div>
            {defaultContent}
            <p>Конверсии рассчитаны по полному процессу</p>
          </div>
        )}
      >
        {({ stage }) => (
          <svg
            width="100%"
            height="56"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            {stage.width > 0 && (
              <rect
                x={50 - stage.width * 48}
                y={10}
                width={stage.width * 96}
                height={80}
                rx={4}
                fill="currentColor"
              />
            )}
          </svg>
        )}
      </FunnelChart.Plot>
      <FunnelChart.Table />
      <FunnelChart.Pagination />
      <FunnelChart.Empty />
    </FunnelChart>
  );
}
