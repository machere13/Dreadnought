import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ModalProfileDemo } from './ModalProfileDemo.tsx';
import example0Code from './ModalProfileDemo.tsx?raw';
import { ModalControlledDemo } from './ModalControlledDemo.tsx';
import controlledCode from './ModalControlledDemo.tsx?raw';
import { ModalMountDemo } from './ModalMountDemo.tsx';
import mountCode from './ModalMountDemo.tsx?raw';

export const modalDoc: ComponentDoc = {
  ...getCatalogDoc('modal'),
  title: 'Modal',
  usage:
    'Когда нужно завершить или отменить отдельное действие перед возвратом к странице. Для необязательной вспомогательной панели используйте FloatingPanel.',
  primaryProps: ['open', 'defaultOpen', 'onOpenChange', 'title', 'content', 'footer', 'closable'],
  description: 'Модальное окно с шапкой, содержимым и необязательным футером.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  notes: [
    'title задаёт шапку, content — содержимое, footer — действия.',
    'Передайте свойства триггера целиком в Button.',
    'closable=false скрывает только крестик; Escape и фон отключаются отдельно.',
    'Нужна поддержка dialog.showModal() в браузере.',
  ],
  examples: [
    {
      id: 'profile',
      title: 'Редактирование профиля',
      description:
        'Откройте окно, введите имя и нажмите «Сохранить профиль»: результат появится под кнопкой. При повторном открытии показано сохранённое имя. «Отмена», крестик и Escape не сохраняют изменения. Данные хранятся в памяти этого примера, без сервера.',
      demo: <ModalProfileDemo />,
      code: example0Code,
    },
    {
      id: 'modal-controlled',
      title: 'Открытие извне и явное закрытие',
      description:
        '«Открыть окно извне» меняет open в приложении. onOpenChange подтверждает запросы окна. Здесь крестик, Escape и закрытие по фону отключены разными пропсами; доступный выход остаётся через «Завершить» в footer.',
      demo: <ModalControlledDemo />,
      code: controlledCode,
    },
    {
      id: 'modal-mount',
      title: 'Сохранять или сбрасывать черновик',
      description:
        'Откройте каждый вариант, введите текст, закройте и откройте снова. eager создаёт поле сразу, lazy — при первом открытии; оба сохраняют ввод. unmount удаляет поле при закрытии и сбрасывает ввод. Это не сохранение данных: состояние приложения снаружи окна не сбрасывается.',
      demo: <ModalMountDemo />,
      code: mountCode,
    },
  ],
};

export function ModalPage() {
  return <ComponentPage component="modal" doc={modalDoc} />;
}
