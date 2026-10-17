import { useState } from 'react';
import { Button, Card, Input, Loader } from '@dreadnought/ui/react';

export function LoaderOverlayDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Button style={{ justifySelf: 'start' }} onClick={() => setLoading((value) => !value)}>
        {loading ? 'Завершить загрузку' : 'Начать загрузку'}
      </Button>
      <Loader
        role="region"
        aria-label="Данные проекта"
        loading={loading}
        delay={200}
        label="Загрузка данных"
        showLabel
      >
        <Card title="Данные проекта">
          <p>Измените заметку перед загрузкой: после завершения она останется на месте.</p>
          <Input aria-label="Черновик проекта" defaultValue="Заметка" />
        </Card>
      </Loader>
    </div>
  );
}
