import { useState } from 'react';
import { Alert, Button } from '@dreadnought/ui/react';

export function AlertCloseDemo() {
  const [revision, setRevision] = useState(0);
  const [closed, setClosed] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Alert
        key={revision}
        title="Полезная подсказка"
        description="Это сообщение можно закрыть."
        showIcon
        closable={{ 'aria-label': 'Закрыть подсказку', onClose: () => setClosed(true) }}
      />
      <div>
        <Button
          size="compact"
          variant="secondary"
          disabled={!closed}
          onClick={() => {
            setRevision((value) => value + 1);
            setClosed(false);
          }}
        >
          Показать подсказку снова
        </Button>
      </div>
    </div>
  );
}
