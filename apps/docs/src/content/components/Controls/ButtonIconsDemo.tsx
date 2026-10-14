import { useState } from 'react';
import { Button, Icon } from '@dreadnought/ui/react';

export function ButtonIconsDemo() {
  const [marked, setMarked] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Button
          size="compact"
          variant={marked ? 'primary' : 'outlined'}
          aria-label="Закладка документа"
          aria-pressed={marked}
          icon={<Icon name="check" />}
          onClick={() => setMarked((value) => !value)}
        />
        <Button
          variant="secondary"
          icon={<Icon name="check" />}
          disabled={marked}
          onClick={() => setMarked(true)}
        >
          Добавить закладку
        </Button>
        <Button
          variant="outlined"
          icon={<Icon name="close" />}
          iconPosition="end"
          disabled={!marked}
          onClick={() => setMarked(false)}
        >
          Удалить закладку
        </Button>
      </div>
      <p role="status">{marked ? 'Документ в закладках' : 'Документ без закладки'}</p>
    </div>
  );
}
