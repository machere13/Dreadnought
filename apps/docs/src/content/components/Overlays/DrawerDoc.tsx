import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { DrawerProfileDemo } from './DrawerProfileDemo.tsx';
import example0Code from './DrawerProfileDemo.tsx?raw';
import { DrawerPlacementDemo } from './DrawerPlacementDemo.tsx';
import placementCode from './DrawerPlacementDemo.tsx?raw';
import { DrawerControlledDemo } from './DrawerControlledDemo.tsx';
import controlledCode from './DrawerControlledDemo.tsx?raw';

export const drawerDoc: ComponentDoc = {
  ...getCatalogDoc('drawer'),
  title: 'Drawer',
  description:
    'Модальная панель у края экрана для настроек, формы или подробностей. Как Modal, блокирует фон; в отличие от Popover, не привязана к кнопке.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  footnote:
    'Заголовок и кнопку закрытия Drawer задаёт приложение в content; автоматической шапки и footer нет. Передайте свойства триггера целиком в Button. mountPolicy работает как у Modal. Нужна поддержка dialog.showModal() в браузере. Открытие без анимации.',
  examples: [
    {
      id: 'profile',
      title: 'Настройки профиля',
      description:
        'Откройте панель справа, введите имя и сохраните. Результат появится под кнопкой и останется при повторном открытии. «Отмена» и Escape закрывают панель без сохранения черновика. Данные хранятся в памяти этого примера, без сервера.',
      demo: <DrawerProfileDemo />,
      code: example0Code,
    },
    {
      id: 'drawer-placement',
      title: 'Четыре стороны и размер',
      description:
        'Откройте панели по очереди. placement выбирает right, left, top или bottom. size — ширина боковых панелей и высота верхней/нижней: справа 360 px, слева 400 px, сверху 35vh, снизу 320 px. Число означает пиксели, строка — CSS-размер.',
      demo: <DrawerPlacementDemo />,
      code: placementCode,
    },
    {
      id: 'drawer-controlled',
      title: 'Управление из приложения',
      description:
        '«Открыть Drawer извне» меняет open. Кнопка внутри и Escape запрашивают закрытие через onOpenChange, родитель обновляет open. Статус под кнопками отражает фактическое состояние панели.',
      demo: <DrawerControlledDemo />,
      code: controlledCode,
    },
  ],
};

export function DrawerPage() {
  return <ComponentPage component="drawer" doc={drawerDoc} />;
}
