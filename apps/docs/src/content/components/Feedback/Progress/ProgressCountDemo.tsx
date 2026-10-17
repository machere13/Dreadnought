import { useState } from 'react';
import { Button, Progress } from '@dreadnought/ui/react';

export function ProgressCountDemo() {
  const [value, setValue] = useState(3);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Progress value={value} max={8} showPercent={false} aria-label="Обработка документов" />
      <span>{value} из 8 документов</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Button
          size="compact"
          disabled={value === 8}
          onClick={() => setValue((current) => Math.min(8, current + 1))}
        >
          Обработать следующий документ
        </Button>
        <Button size="compact" variant="secondary" onClick={() => setValue(0)}>
          Начать заново
        </Button>
      </div>
    </div>
  );
}
