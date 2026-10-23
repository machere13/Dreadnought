import { useState } from 'react';
import { Button, Histogram } from '@dreadnought/ui/react';

const temperatures = [-18, -12, -7, -5, -4, -2, 0, 1, 2, 3, 4, 5, 7, 9, 12, 18];

export function HistogramIntervalsDemo() {
  const [bins, setBins] = useState(4);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div
        role="group"
        aria-label="Количество интервалов"
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        {[2, 4, 8].map((count) => (
          <Button
            key={count}
            variant={count === bins ? 'primary' : 'secondary'}
            aria-pressed={count === bins}
            onClick={() => setBins(count)}
          >
            {count} {count === 8 ? 'интервалов' : 'интервала'}
          </Button>
        ))}
      </div>
      <Histogram
        label="Температура за период"
        data={temperatures}
        bins={bins}
        domain={[-20, 20]}
        categoryLabel="Температура, °C"
        valueLabel="Измерения"
      />
    </div>
  );
}
