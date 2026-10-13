import { useState } from 'react';
import { Button, Toast, ToastViewport } from '@dreadnought/ui/react';
import { useToastQueue } from '@dreadnought/react/logic';

export function ToastQueueDemo() {
  const queue = useToastQueue({ maxCount: 3 });
  const [savingId, setSavingId] = useState<string | null>(null);
  const saving = queue.items.some((item) => item.id === savingId);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <Button
        onClick={() =>
          queue.add({
            title: 'Ещё одно уведомление',
            type: 'success',
            closeLabel: 'Закрыть уведомление',
          })
        }
      >
        Добавить в очередь
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          if (saving && savingId) {
            queue.update(savingId, { title: 'Сохранено', type: 'success', duration: 3000 });
            setSavingId(null);
          } else {
            setSavingId(
              queue.add({ title: 'Сохраняем', duration: 0, closeLabel: 'Закрыть уведомление' }),
            );
          }
        }}
      >
        {saving ? 'Завершить сохранение' : 'Начать сохранение'}
      </Button>
      <Button
        variant="ghosted"
        onClick={() => {
          queue.clear();
          setSavingId(null);
        }}
      >
        Закрыть все
      </Button>
      <ToastViewport placement="top-end" aria-label="Очередь сохранения">
        {queue.items.map(({ id, props }) => (
          <Toast key={id} {...props} />
        ))}
      </ToastViewport>
    </div>
  );
}
