import { useState } from 'react';
import { Button, Histogram } from '@dreadnought/ui/react';

const measurements = [5, 5, 5, 5];

export function HistogramStatesDemo() {
  const [loaded, setLoaded] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Button
        variant="secondary"
        style={{ justifySelf: 'start' }}
        onClick={() => setLoaded(!loaded)}
      >
        {loaded ? 'Очистить данные' : 'Вернуть измерения'}
      </Button>
      <Histogram label="Одинаковые измерения" data={loaded ? measurements : []} bins={1} />
    </div>
  );
}
