import { useState } from 'react';
import { Alert, Button } from '@dreadnought/ui/react';

export function AlertRetryDemo() {
  const [received, setReceived] = useState(false);
  return received ? (
    <Alert
      type="success"
      variant="filled"
      title="Данные получены"
      description="Повторное действие завершено в локальном примере."
      showIcon
      action={
        <Button size="compact" variant="secondary" onClick={() => setReceived(false)}>
          Вернуть ошибку
        </Button>
      }
    />
  ) : (
    <Alert
      type="error"
      variant="filled"
      title="Не удалось получить ответ"
      description="Нажмите «Повторить», чтобы показать успешное состояние."
      showIcon
      action={
        <Button size="compact" onClick={() => setReceived(true)}>
          Повторить
        </Button>
      }
    />
  );
}
