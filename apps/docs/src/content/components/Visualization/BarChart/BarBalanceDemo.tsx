import { BarChart } from '@dreadnought/ui/react';

const categories = [
  { id: 'mon', label: 'Понедельник' },
  { id: 'tue', label: 'Вторник' },
  { id: 'wed', label: 'Среда' },
  { id: 'thu', label: 'Четверг' },
];
const series = [
  { id: 'balance', label: 'Изменение', values: { mon: 12, tue: -8, wed: 0, thu: null } },
];

export function BarBalanceDemo() {
  return (
    <BarChart
      label="Баланс по дням"
      description="Пополнение, расход, отсутствие изменения и отсутствие измерения — разные состояния."
      categories={categories}
      series={series}
      domain={[-10, 20]}
      categoryLabel="День"
      valueLabel="Изменение, ед."
      formatValue={(value) => `${value} ед.`}
    />
  );
}
