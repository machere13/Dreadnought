import { useState } from 'react';
import { Button, Heatmap } from '@dreadnought/ui/react';

const columns = [
  { id: 'a', label: 'Утро' },
  { id: 'b', label: 'День' },
  { id: 'c', label: 'Вечер' },
];
const rows = [{ id: 'sensor', label: 'Датчик' }];

export function HeatmapMissingDemo() {
  const [loaded, setLoaded] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Heatmap
        label="Количество событий"
        columns={columns}
        rows={rows}
        domain={[0, 10]}
        data={
          loaded
            ? [
                { column: 'a', row: 'sensor', value: 0 },
                { column: 'b', row: 'sensor', value: 7 },
                { column: 'c', row: 'sensor', value: null },
              ]
            : []
        }
        labels={{ row: 'Источник', column: 'Период', value: 'События' }}
      />
      <Button
        variant="secondary"
        style={{ justifySelf: 'start' }}
        onClick={() => setLoaded(!loaded)}
      >
        {loaded ? 'Очистить данные' : 'Вернуть данные'}
      </Button>
    </div>
  );
}
