import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ToastBasicDemo } from './ToastBasicDemo.tsx';
import example0Code from './ToastBasicDemo.tsx?raw';
import { ToastQueueDemo } from './ToastQueueDemo.tsx';
import example1Code from './ToastQueueDemo.tsx?raw';

export const toastDoc: ComponentDoc = {
  ...getCatalogDoc('toast'),
  title: 'Toast',
  description:
    'Временное уведомление о результате действия. Не меняет раскладку страницы и не перехватывает фокус.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  footnote:
    'ToastViewport задаёт положение уведомлений. duration измеряется в миллисекундах; 0 отключает таймер. useToastQueue возвращает items и add/update/remove/clear; передавайте item.props в Toast, чтобы закрытие удаляло запись из очереди.',
  examples: [
    {
      id: 'basic',
      title: 'Одно уведомление',
      description:
        'Нажмите кнопку: уведомление появится справа снизу и закроется через 3 секунды либо по крестику. Пока оно видно, повторный запуск недоступен. Наведение или фокус приостанавливают таймер.',
      demo: <ToastBasicDemo />,
      code: example0Code,
    },
    {
      id: 'queue',
      title: 'Очередь и обновление уведомления',
      description:
        'Добавьте несколько уведомлений в очередь справа сверху: одновременно видны не больше трёх. «Начать сохранение» создаёт бессрочное уведомление; «Завершить сохранение» обновляет его на месте и включает таймер на 3 секунды. Это имитация операции, а не реальный запрос. «Закрыть все» очищает очередь.',
      demo: <ToastQueueDemo />,
      code: example1Code,
    },
  ],
};

export function ToastPage() {
  return <ComponentPage component="toast" doc={toastDoc} />;
}
