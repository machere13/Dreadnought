import { useId } from 'react';
import { Button, PieChart, usePieChart, type PieChartPlotProps } from '@dreadnought/ui/react';

const data = [
  { id: 'direct', label: 'Прямые', value: 60 },
  { id: 'search', label: 'Поиск', value: 30 },
  { id: 'email', label: 'Рассылка', value: 10 },
];

type Slice = Parameters<NonNullable<PieChartPlotProps['children']>>[0];
function HatchedSlice({ path, defaultContent }: Slice) {
  const pattern = useId();
  return (
    <>
      {defaultContent}
      <defs>
        <pattern id={pattern} width={6} height={6} patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0" stroke="currentColor" strokeWidth={0.6} opacity={0.35} />
        </pattern>
      </defs>
      <path d={path} fill={`url(#${pattern})`} />
    </>
  );
}
function Summary() {
  const { layout, data, visible, toggle } = usePieChart();
  return (
    <>
      <p>Видимая сумма: {layout.total}. Доли пересчитываются среди видимых категорий.</p>
      <Button
        size="compact"
        variant="secondary"
        style={{ justifySelf: 'start' }}
        disabled={visible.length === data.length}
        onClick={() =>
          data.filter((item) => !visible.includes(item.id)).forEach((item) => toggle(item.id))
        }
      >
        Показать все категории
      </Button>
    </>
  );
}
export function PieCompositionDemo() {
  return (
    <PieChart data={data} label="Секторы со своим оформлением" innerRadius={0.55}>
      <Summary />
      <PieChart.Legend>
        {({ item, visible }) => (
          <span>
            {item.label}: {visible ? 'видна' : 'скрыта'}
          </span>
        )}
      </PieChart.Legend>
      <PieChart.Plot
        tooltipContent={({ defaultContent }) => (
          <div>
            {defaultContent}
            <p>Доля видимой суммы</p>
          </div>
        )}
      >
        {(context) => <HatchedSlice {...context} />}
      </PieChart.Plot>
      <PieChart.Table />
    </PieChart>
  );
}
