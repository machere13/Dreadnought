import { useState } from 'react';
import { Button, ScatterChart } from '@dreadnought/ui/react';

const series = [
  {
    id: 'search',
    label: 'Поиск',
    data: [
      { id: 'a', label: 'Кампания A', x: 10, y: 24, size: 60 },
      { id: 'b', label: 'Кампания B', x: 25, y: 55, size: 240 },
      { id: 'c', label: 'Кампания C', x: 40, y: 72, size: 360 },
    ],
  },
  {
    id: 'social',
    label: 'Соцсети',
    data: [
      { id: 'd', label: 'Кампания D', x: 12, y: 18, size: 45 },
      { id: 'e', label: 'Кампания E', x: 28, y: 38, size: 95 },
      { id: 'f', label: 'Кампания F', x: 45, y: 63, size: 180 },
    ],
  },
];

export function ScatterBubbleDemo() {
  const [visible, setVisible] = useState(['search', 'social']);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ScatterChart
        label="Бюджет, заказы и выручка"
        description="Площадь пузырька показывает выручку. Учебные данные."
        series={series}
        xDomain={[0, 60]}
        yDomain={[0, 100]}
        xLabel="Бюджет, тыс. ₽"
        yLabel="Заказы"
        sizeLabel="Выручка, тыс. ₽"
        maxBubbleRadius={28}
        visibleSeries={visible}
        onVisibleSeriesChange={setVisible}
      />
      <Button
        variant="secondary"
        style={{ justifySelf: 'start' }}
        onClick={() => setVisible(['search', 'social'])}
      >
        Показать все серии
      </Button>
    </div>
  );
}
