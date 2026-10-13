import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { DrawerProfileDemo } from './DrawerProfileDemo.tsx';
import example0Code from './DrawerProfileDemo.tsx?raw';

export const drawerDoc: ComponentDoc = {
  ...getCatalogDoc('drawer'),
  title: 'Drawer',
  description:
    'Модальная панель у края экрана для настроек, формы или подробностей. Здесь показана форма с сохранением и отменой.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  footnote:
    'placement выбирает край экрана; по умолчанию right. size — ширина боковой панели или высота верхней/нижней. mountPolicy="unmount" удаляет содержимое при закрытии, но сохраняет внешнее состояние. onOpenChange сообщает открытие и закрытие; приложение обновляет open. Без анимации.',
  examples: [
    {
      id: 'profile',
      title: 'Настройки профиля',
      description:
        'Откройте панель справа, введите имя и сохраните. Результат появится под кнопкой и останется при повторном открытии. «Отмена» и Escape закрывают панель без сохранения черновика. Данные хранятся в памяти этого примера, без сервера.',
      demo: <DrawerProfileDemo />,
      code: example0Code,
    },
  ],
};

export function DrawerPage() {
  return <ComponentPage component="drawer" doc={drawerDoc} />;
}
