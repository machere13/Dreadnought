import { LineChart } from '@dreadnought/ui/react';

const values = [20, 32, 28, 40, 35, 48, 44, 52, 46, 58, 50, 60];
const series = [
  { id: 'orders', label: 'Поступления', data: values.map((y, index) => ({ x: index + 1, y })) },
];

export function LineRangeDemo() {
  return (
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <LineChart
        label="Поступления за 12 дней"
        description="Диапазон изменяет график, а таблица сохраняет все исходные значения."
        series={series}
        xDomain={[1, 12]}
        yDomain={[0, 80]}
        xLabel="День"
        yLabel="Заказы, шт."
        formatX={(value) => `День ${value}`}
        formatY={(value) => `${value} заказов`}
        zoom
        pageSize={4}
        width={560}
        height={280}
      />
    </div>
  );
}
