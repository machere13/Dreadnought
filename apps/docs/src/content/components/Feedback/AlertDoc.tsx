import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { AlertTypesDemo } from './AlertTypesDemo.tsx';
import typesCode from './AlertTypesDemo.tsx?raw';
import { AlertCloseDemo } from './AlertCloseDemo.tsx';
import closeCode from './AlertCloseDemo.tsx?raw';
import { AlertRetryDemo } from './AlertRetryDemo.tsx';
import retryCode from './AlertRetryDemo.tsx?raw';

export const alertDoc: ComponentDoc = {
  ...getCatalogDoc('alert'),
  title: 'Alert',
  description:
    'Сообщение в контексте страницы: подсказка, результат операции, предупреждение или ошибка. Для краткого всплывающего уведомления используйте Toast.',
  adapterDescription:
    'Адаптер сохраняет семантику, структуру и локальное закрытие, но не подключает тему и стандартные иконки.',
  footnote: (
    <>
      Нужен хотя бы <code>title</code> или <code>description</code>. Warning и error имеют роль{' '}
      <code>alert</code>, info и success — <code>status</code>. Закрытое сообщение можно показать
      снова только повторно смонтировав компонент.
    </>
  ),
  examples: [
    {
      id: 'types',
      title: 'Информация, успех, предупреждение и ошибка',
      description:
        'type меняет смысл сообщения и стандартную иконку. showIcon включает её. Здесь все сообщения имеют outlined-оформление; filled показан в примере с повторным действием.',
      demo: <AlertTypesDemo />,
      code: typesCode,
    },
    {
      id: 'close',
      title: 'Закрытие и повторный показ',
      description:
        'Закройте подсказку крестиком, затем нажмите «Показать подсказку снова». Alert закрывается локально; новое значение key создаёт его заново. onClose сообщает приложению о закрытии.',
      demo: <AlertCloseDemo />,
      code: closeCode,
    },
    {
      id: 'retry',
      title: 'Действие рядом с сообщением',
      description:
        'Нажмите «Повторить»: ошибка сменится успешным сообщением. «Вернуть ошибку» позволяет повторить пример. Это локальное переключение состояния, а не сетевой запрос; реальную операцию добавляет приложение.',
      demo: <AlertRetryDemo />,
      code: retryCode,
    },
  ],
};

export function AlertPage() {
  return <ComponentPage component="alert" doc={alertDoc} />;
}
