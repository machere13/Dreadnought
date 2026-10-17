import { useState } from 'react';
import { Button, Toast, ToastViewport } from '@dreadnought/ui/react';

export function ToastBasicDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button disabled={open} onClick={() => setOpen(true)}>
        Показать уведомление
      </Button>
      <ToastViewport placement="bottom-end" aria-label="Уведомления">
        <Toast
          open={open}
          onOpenChange={setOpen}
          title="Изменения сохранены"
          type="success"
          duration={3000}
          closeLabel="Закрыть уведомление"
        />
      </ToastViewport>
    </div>
  );
}
