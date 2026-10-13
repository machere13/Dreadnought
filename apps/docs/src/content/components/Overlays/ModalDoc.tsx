import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ModalProfileDemo } from './ModalProfileDemo.tsx';
import example0Code from './ModalProfileDemo.tsx?raw';

export const modalDoc: ComponentDoc = {
  ...getCatalogDoc('modal'),
  title: 'Modal',
  description:
    'Модальное окно для формы или действия: шапка, содержимое и необязательный футер. Блокирует взаимодействие с фоном.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  footnote:
    'title задаёт шапку, content — содержимое, footer — действия. mountPolicy="unmount" удаляет содержимое при закрытии, но не сбрасывает состояние родителя: сохранённое имя в этом примере живёт снаружи окна. open и onOpenChange управляют открытием; closable=false скрывает только крестик.',
  examples: [
    {
      id: 'profile',
      title: 'Редактирование профиля',
      description:
        'Откройте окно, введите имя и нажмите «Сохранить профиль»: результат появится под кнопкой. При повторном открытии показано сохранённое имя. «Отмена», крестик и Escape не сохраняют изменения. Данные хранятся в памяти этого примера, без сервера.',
      demo: <ModalProfileDemo />,
      code: example0Code,
    },
  ],
};

export function ModalPage() {
  return <ComponentPage component="modal" doc={modalDoc} />;
}
