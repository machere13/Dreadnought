import { useState } from 'react';
import { Button, Gauge } from '@dreadnought/ui/react';

export function GaugeStatesDemo() {
  const [value, setValue] = useState<number | null>(0);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          disabled={value === null || value === 0}
          onClick={() => setValue((current) => (current === null ? null : current - 10))}
        >
          −10
        </Button>
        <Button
          disabled={value === null || value === 100}
          onClick={() => setValue((current) => (current === null ? null : current + 10))}
        >
          +10
        </Button>
        <Button onClick={() => setValue((current) => (current === null ? 0 : null))}>
          {value === null ? 'Вернуть ноль' : 'Убрать значение'}
        </Button>
      </div>
      <Gauge label="Использованный лимит" value={value} formatValue={(number) => `${number}%`} />
    </div>
  );
}
