import { useState } from 'react';
import { BoxPlot, Button } from '@dreadnought/ui/react';

const data = [
  { id: 'constant', label: 'Три одинаковых измерения', values: [5, 5, 5] },
  { id: 'single', label: 'Одно измерение', values: [5] },
  { id: 'empty', label: 'Измерения ещё не поступили', values: [] },
];

export function BoxPlotStatesDemo() {
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
      <BoxPlot label="Неполные данные" data={loaded ? data : []} />
    </div>
  );
}
