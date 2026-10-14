import { useState } from 'react';
import { Button, Card } from '@dreadnought/ui/react';

export function CardHeaderDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card
      title="Содержимое и действие в шапке"
      extra={
        <Button size="compact" variant="ghosted" onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Скрыть' : 'Подробнее'}
        </Button>
      }
    >
      <p>Карточка объединяет содержимое и действия.</p>
      {expanded && <p>В карточку можно вложить любые компоненты.</p>}
    </Card>
  );
}
