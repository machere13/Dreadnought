import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ToastBasicDemo } from './ToastBasicDemo.tsx';
import example0Code from './ToastBasicDemo.tsx?raw';
import { ToastQueueDemo } from './ToastQueueDemo.tsx';
import example1Code from './ToastQueueDemo.tsx?raw';
import { ToastPlacementDemo } from './ToastPlacementDemo.tsx';
import placementCode from './ToastPlacementDemo.tsx?raw';
import { ToastActionDemo } from './ToastActionDemo.tsx';
import actionCode from './ToastActionDemo.tsx?raw';

export const toastDoc: ComponentDoc = {
  ...getCatalogDoc('toast'),
  title: 'Toast',
  usage:
    'Для короткого результата действия: сохранено, скопировано или не удалось выполнить. Ошибку, которую нужно исправить в поле, показывайте рядом с полем, а не только в Toast.',
  primaryProps: [
    'title',
    'description',
    'type',
    'duration',
    'open',
    'onOpenChange',
    'ToastViewport.placement',
  ],
  description:
    'Временное уведомление о результате действия. Не меняет раскладку страницы и не перехватывает фокус.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  notes: [
    'ToastViewport задаёт положение уведомлений.',
    'duration измеряется в миллисекундах; 0 отключает таймер.',
    'useToastQueue возвращает items и add/update/remove/clear; передавайте item.props в Toast, чтобы закрытие удаляло запись из очереди.',
  ],
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
        'Добавьте несколько уведомлений: справа сверху видны до трёх. «Начать сохранение» создаёт бессрочное уведомление; «Завершить сохранение» обновляет его и закрывает через 3 секунды. «Закрыть все» очищает очередь. Сохранение имитируется локально.',
      demo: <ToastQueueDemo />,
      code: example1Code,
    },
    {
      id: 'toast-placement',
      title: 'Шесть положений',
      description:
        'Выберите положение и откройте уведомление. Закройте его крестиком перед следующим примером. Положение задаётся ToastViewport; в приложении достаточно одного общего контейнера. «Слева/справа» здесь соответствуют направлению LTR.',
      demo: <ToastPlacementDemo />,
      code: placementCode,
    },
    {
      id: 'toast-action',
      title: 'Ошибка с повторной попыткой',
      description:
        '«Показать ошибку» создаёт уведомление type="error" без таймера: duration={0}. «Повторить» в action меняет его на success и включает 3 секунды показа. Это имитация результата, без сетевого запроса. Крестик закрывает оба состояния.',
      demo: <ToastActionDemo />,
      code: actionCode,
    },
  ],
};

export function ToastPage() {
  return <ComponentPage component="toast" doc={toastDoc} />;
}
