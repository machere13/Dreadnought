import { useState } from 'react';
import { Button, ScatterChart } from '@dreadnought/ui/react';

export function ScatterEmptyDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ScatterChart
        label="Первые результаты кампании"
        series={[
          {
            id: 'campaigns',
            label: 'Кампании',
            data: loaded
              ? [
                  { id: 'a', label: 'С заказами', x: 10, y: 24, size: 60 },
                  { id: 'b', label: 'Без выручки', x: 20, y: 0, size: 0 },
                ]
              : [],
          },
        ]}
        xDomain={[0, 60]}
        yDomain={[0, 100]}
        xLabel="Бюджет, тыс. ₽"
        yLabel="Заказы"
        sizeLabel="Выручка, тыс. ₽"
      />
      <Button
        variant="secondary"
        style={{ justifySelf: 'start' }}
        onClick={() => setLoaded(!loaded)}
      >
        {loaded ? 'Очистить данные' : 'Добавить результаты'}
      </Button>
    </div>
  );
}
