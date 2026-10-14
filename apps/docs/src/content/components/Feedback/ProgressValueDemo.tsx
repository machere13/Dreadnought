import { useState } from 'react';
import { Button, Progress } from '@dreadnought/ui/react';

export function ProgressValueDemo() {
  const [value, setValue] = useState(35);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Progress value={value} aria-label="Загрузка файла" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Button
          size="compact"
          variant="secondary"
          disabled={value === 0}
          onClick={() => setValue((current) => Math.max(0, current - 10))}
        >
          Уменьшить
        </Button>
        <Button
          size="compact"
          variant="secondary"
          disabled={value === 100}
          onClick={() => setValue((current) => Math.min(100, current + 10))}
        >
          Увеличить
        </Button>
      </div>
    </div>
  );
}
