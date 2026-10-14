import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { PopoverProfileDemo } from './PopoverProfileDemo.tsx';
import profileCode from './PopoverProfileDemo.tsx?raw';
import { PopoverControlledDemo } from './PopoverControlledDemo.tsx';
import controlledCode from './PopoverControlledDemo.tsx?raw';
import { PopoverPlacementDemo } from './PopoverPlacementDemo.tsx';
import placementCode from './PopoverPlacementDemo.tsx?raw';

export const popoverDoc: ComponentDoc = {
  ...getCatalogDoc('popover'),
  title: 'Popover',
  description:
    'Немодальная панель по нажатию на кнопку. Может содержать поля и действия, но не блокирует остальную страницу. Для короткой подсказки используйте Tooltip, для списка команд — Dropdown.',
  adapterDescription:
    'PopoverAdapter управляет раскрытием, позиционированием и фокусом без оформления. Использует native Popover API для верхнего слоя; контролируемое open остаётся решением родителя.',
  logicDescription:
    'usePopover возвращает triggerProps, contentProps, open, show() и close(). getPopoverState из core задаёт доступную связь между кнопкой и немодальной панелью, а getTooltipPosition рассчитывает положение без привязки к React.',
  footnote: (
    <>
      При открытии фокус переходит на первый доступный элемент или саму панель. Escape и close()
      возвращают его на кнопку; Tab свободно выходит наружу. Если родитель закрывает панель с
      фокусом внутри, он также возвращается на кнопку; фокус снаружи не перехватывается. Задайте
      aria-label для собственного имени панели. Для неинтерактивной подсказки используйте Tooltip,
      для меню — Menu. Оформление меняется через --dreadnought-popover-*.
    </>
  ),
  examples: [
    {
      id: 'popover-profile',
      title: 'Редактирование в панели',
      description:
        'Откройте настройки, измените имя и нажмите «Готово» или Enter. Результат появится под кнопкой. Escape или закрытие без сохранения отменяет черновик. Данные хранятся только в состоянии примера, без запроса на сервер.',
      demo: <PopoverProfileDemo />,
      code: profileCode,
    },
    {
      id: 'popover-controlled',
      title: 'Управление открытием',
      description:
        '«Открыть извне» меняет open из приложения. Панель запрашивает закрытие через onOpenChange, а родитель подтверждает его обновлением open. Кнопка внутри использует close из render-функции content.',
      demo: <PopoverControlledDemo />,
      code: controlledCode,
    },
    {
      id: 'popover-placement',
      title: 'Расположение и стрелка',
      description:
        'Откройте панель сверху справа или вариант справа без стрелки. placement задаёт предпочтительное положение; при нехватке места оно корректируется автоматически. Закройте панель повторным нажатием или Escape.',
      demo: <PopoverPlacementDemo />,
      code: placementCode,
    },
  ],
};

export function PopoverPage() {
  return <ComponentPage component="popover" doc={popoverDoc} />;
}
