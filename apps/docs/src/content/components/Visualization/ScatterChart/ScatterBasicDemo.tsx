import { ScatterChart } from '@dreadnought/ui/react';

const series = [
  {
    id: 'search',
    label: 'Поиск',
    data: [
      { id: 'a', label: 'Кампания A', x: 10, y: 24 },
      { id: 'b', label: 'Кампания B', x: 25, y: 55 },
      { id: 'c', label: 'Кампания C', x: 40, y: 72 },
    ],
  },
  {
    id: 'social',
    label: 'Соцсети',
    data: [
      { id: 'd', label: 'Кампания D', x: 12, y: 18 },
      { id: 'e', label: 'Кампания E', x: 28, y: 38 },
      { id: 'f', label: 'Кампания F', x: 45, y: 63 },
    ],
  },
];

export function ScatterBasicDemo() {
  return (
    <ScatterChart
      label="Бюджет и число заказов"
      description="Учебные данные: каждая точка — отдельная рекламная кампания."
      series={series}
      xDomain={[0, 60]}
      yDomain={[0, 100]}
      xLabel="Бюджет, тыс. ₽"
      yLabel="Заказы"
    />
  );
}
