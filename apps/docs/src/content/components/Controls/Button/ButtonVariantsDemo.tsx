import { useState } from 'react';
import { Button } from '@dreadnought/ui/react';

export function ButtonVariantsDemo() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((value) => value + 1);
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Button onClick={increment}>Нажать</Button>
        <Button variant="secondary" onClick={increment}>
          Вторичная
        </Button>
        <Button variant="outlined" onClick={increment}>
          С рамкой
        </Button>
        <Button variant="ghosted" onClick={increment}>
          Без фона
        </Button>
      </div>
      <p role="status">Нажатий: {count}</p>
    </div>
  );
}
