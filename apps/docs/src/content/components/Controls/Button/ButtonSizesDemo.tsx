import { useState } from 'react';
import { Button } from '@dreadnought/ui/react';

export function ButtonSizesDemo() {
  const [size, setSize] = useState('не выбрана');
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Button onClick={() => setSize('обычная')}>Обычная кнопка</Button>
        <Button size="compact" onClick={() => setSize('компактная')}>
          Компактная кнопка
        </Button>
      </div>
      <p role="status">Последняя кнопка: {size}</p>
    </div>
  );
}
