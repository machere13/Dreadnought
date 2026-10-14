import { useState } from 'react';
import { Badge, Button } from '@dreadnought/ui/react';

export function BadgeCounterDemo() {
  const [count, setCount] = useState(2);
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge
        target={
          <Button
            variant="secondary"
            aria-label={`Уведомления, ${count} новых`}
            onClick={() => setCount((value) => value + 1)}
          >
            Уведомления
          </Button>
        }
      >
        {count}
      </Badge>
      <Button variant="ghosted" onClick={() => setCount(0)}>
        Отметить прочитанными
      </Button>
    </div>
  );
}
