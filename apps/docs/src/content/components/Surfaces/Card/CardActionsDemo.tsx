import { useState } from 'react';
import { Button, Card } from '@dreadnought/ui/react';

export function CardActionsDemo() {
  const [updated, setUpdated] = useState(false);
  return (
    <Card
      title="Карточка проекта"
      cover={
        <img
          src="/markdown-upload-demo.svg"
          alt="Обложка проекта Dreadnought"
          style={{ display: 'block', width: '100%' }}
        />
      }
      footer={<span role="status">{updated ? 'Только что обновлено' : 'Обновлено сегодня'}</span>}
      actions={[
        <Button key="update" size="compact" variant="ghosted" onClick={() => setUpdated(true)}>
          Обновить
        </Button>,
        <Button key="docs" size="compact" variant="ghosted" href="/getting-started/">
          Документация
        </Button>,
      ]}
    >
      <p>Обложка, содержимое, подвал и действия — отдельные зоны одной карточки.</p>
    </Card>
  );
}
