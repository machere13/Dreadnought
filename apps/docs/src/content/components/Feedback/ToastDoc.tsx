import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { useState } from 'react';
import { Button, Toast, ToastViewport } from '@dreadnought/ui/react';
import { useToastQueue } from '@dreadnought/react/logic';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function ToastDemo() {
  const queue = useToastQueue({ maxCount: 3 });
  const [savingId, setSavingId] = useState<string | null>(null);
  const saving = queue.items.some((item) => item.id === savingId);
  return (
    <div className={styles.demo}>
      <Button
        onClick={() =>
          queue.add({
            title: 'Изменения сохранены',
            type: 'success',
            closeLabel: 'Закрыть уведомление',
          })
        }
      >
        Показать уведомление
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
      <ToastViewport placement="top-end" aria-label="Уведомления">
        {queue.items.map(({ id, props }) => (
          <Toast key={id} {...props} />
        ))}
      </ToastViewport>
    </div>
  );
}

export const toastDoc: ComponentDoc = {
  ...getCatalogDoc('toast'),
  title: 'Toast',
  description:
    'Временное всплывающее уведомление о результате операции. Не меняет раскладку страницы и не перехватывает фокус.',
  adapterDescription:
    'Адаптер управляет видимостью, оставшимся временем, паузой при наведении и фокусе. Контейнер второго слоя не задаёт положение и оформление.',
  logicDescription: (
    <>
      Первый слой вычисляет семантику через <code>getToastState</code>, а общее поведение{' '}
      <code>getCountdownRemaining</code> позволяет собрать собственный таймер. Часы и планирование
      остаются в адаптере.
    </>
  ),
  demo: <ToastDemo />,
  footnote: (
    <>
      <code>useToastQueue</code> возвращает <code>items</code> и методы{' '}
      <code>add / update / remove / clear</code>. <code>add</code> возвращает id для обновления и
      удаления. <code>maxCount</code> ограничивает стопку, удаляя старые уведомления; без него
      лимита нет. Передавайте <code>item.props</code> в Toast, чтобы закрытие удаляло запись.
      Обновление текста сохраняет отсчёт, изменение <code>duration</code> запускает новый.{' '}
      <code>duration=0</code> отключает таймер. Положение задаётся через <code>ToastViewport</code>.
    </>
  ),
};

export function ToastPage() {
  return <ComponentPage component="toast" doc={toastDoc} />;
}
