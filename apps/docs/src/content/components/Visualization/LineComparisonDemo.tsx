import { LineChart } from '@dreadnought/ui/react';

const series = [
  {
    id: 'plan',
    label: 'План',
    data: [
      { x: 1, y: 20 },
      { x: 2, y: 45 },
      { x: 3, y: 35 },
      { x: 4, y: 70 },
      { x: 5, y: 60 },
      { x: 6, y: 85 },
    ],
  },
  {
    id: 'actual',
    label: 'Факт',
    data: [
      { x: 1, y: 40 },
      { x: 2, y: 30 },
      { x: 3, y: 65 },
      { x: 4, y: 50 },
      { x: 5, y: 80 },
      { x: 6, y: 70 },
    ],
  },
];

export function LineComparisonDemo() {
  return (
    <LineChart
      label="Заказы по дням"
      description="План и фактическое число заказов за шесть дней."
      series={series}
      xDomain={[1, 6]}
      yDomain={[0, 100]}
      xLabel="День"
      yLabel="Заказы, шт."
      formatX={(value) => `День ${value}`}
      formatY={(value) => `${value} заказов`}
      zoom={false}
    />
  );
}
