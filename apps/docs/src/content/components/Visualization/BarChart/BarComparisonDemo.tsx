import { BarChart } from '@dreadnought/ui/react';

const categories = [
  { id: 'jan', label: 'Январь' },
  { id: 'feb', label: 'Февраль' },
  { id: 'mar', label: 'Март' },
];
const series = [
  { id: 'plan', label: 'План', values: { jan: 60, feb: 85, mar: 70 } },
  { id: 'actual', label: 'Факт', values: { jan: 40, feb: 60, mar: 90 } },
];

export function BarComparisonDemo() {
  return (
    <BarChart
      label="Заказы по месяцам"
      description="План и факт показаны рядом для каждого месяца, не суммируются."
      categories={categories}
      series={series}
      domain={[0, 100]}
      categoryLabel="Месяц"
      valueLabel="Заказы, шт."
      formatValue={(value) => `${value} заказов`}
    />
  );
}
