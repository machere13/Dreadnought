import { BarChart } from '@dreadnought/ui/react';

const categories = [
  { id: 'dev', label: 'Разработка' },
  { id: 'design', label: 'Дизайн' },
  { id: 'docs', label: 'Документация' },
];
const series = [{ id: 'hours', label: 'Трудозатраты', values: { dev: 14, design: 8, docs: 5 } }];

export function BarHorizontalDemo() {
  return (
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <BarChart
        label="Часы по направлениям"
        description="Время на разработку, дизайн и документацию."
        categories={categories}
        series={series}
        domain={[0, 20]}
        orientation="horizontal"
        categoryLabel="Направление"
        valueLabel="Время, ч"
        formatValue={(value) => `${value} ч`}
        width={560}
        height={280}
      />
    </div>
  );
}
