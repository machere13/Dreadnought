import { BarChart, Button, useBarChart } from '@dreadnought/ui/react';

const categories = [
  { id: 'mon', label: 'Пн' },
  { id: 'tue', label: 'Вт' },
  { id: 'wed', label: 'Ср' },
];
const series = [
  { id: 'plan', label: 'План', values: { mon: 20, tue: 30, wed: 25 } },
  { id: 'actual', label: 'Факт', values: { mon: 15, tue: 0, wed: -5 } },
];

function Summary() {
  const { visible, page } = useBarChart();
  return (
    <>
      <p>
        Видимых серий: {visible.length}. Таблица: страница {page.page} из {page.count}.
      </p>
      <Button
        size="compact"
        variant="secondary"
        disabled={page.page === page.count}
        style={{ justifySelf: 'start' }}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие строки
      </Button>
    </>
  );
}

export function BarCompositionDemo() {
  return (
    <BarChart
      label="Столбцы со своим рисунком"
      categories={categories}
      series={series}
      domain={[-10, 40]}
      categoryLabel="День"
      valueLabel="Заказы"
      pageSize={2}
    >
      <Summary />
      <BarChart.Legend>
        {({ series, visible }) => (
          <span>
            {series.label}: {visible ? 'видна' : 'скрыта'}
          </span>
        )}
      </BarChart.Legend>
      <BarChart.Plot
        tooltipContent={({ defaultContent }) => (
          <div>
            {defaultContent}
            <p>Значения за один день</p>
          </div>
        )}
      >
        {({ bar, defaultContent }) =>
          bar.value === 0 ? (
            defaultContent
          ) : (
            <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx={6} />
          )
        }
      </BarChart.Plot>
      <BarChart.Table />
      <BarChart.Pagination />
      <BarChart.Empty />
    </BarChart>
  );
}
