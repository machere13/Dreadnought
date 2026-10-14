import { useState } from 'react';
import { Button, Toast, ToastViewport } from '@dreadnought/ui/react';

export function ToastActionDemo() {
  const [open, setOpen] = useState(false);
  const [retried, setRetried] = useState(false);
  return (
    <div>
      <Button
        disabled={open}
        onClick={() => {
          setRetried(false);
          setOpen(true);
        }}
      >
        Показать ошибку
      </Button>
      <ToastViewport placement="bottom-end" aria-label="Результат повторной попытки">
        <Toast
          open={open}
          onOpenChange={setOpen}
          title={retried ? 'Повторная попытка выполнена' : 'Не удалось сохранить'}
          description={
            retried
              ? 'Демонстрационный результат, без запроса на сервер.'
              : 'Нажмите «Повторить» или закройте уведомление.'
          }
          type={retried ? 'success' : 'error'}
          duration={retried ? 3000 : 0}
          closeLabel="Закрыть результат"
          action={
            retried ? undefined : (
              <Button size="compact" onClick={() => setRetried(true)}>
                Повторить
              </Button>
            )
          }
        />
      </ToastViewport>
    </div>
  );
}
