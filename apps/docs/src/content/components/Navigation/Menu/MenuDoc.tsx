import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { MenuActionsDemo } from './MenuActionsDemo.tsx';
import actionsCode from './MenuActionsDemo.tsx?raw';
import { MenuGroupsDemo } from './MenuGroupsDemo.tsx';
import groupsCode from './MenuGroupsDemo.tsx?raw';
import { MenuNavigationDemo } from './MenuNavigationDemo.tsx';
import navigationCode from './MenuNavigationDemo.tsx?raw';

export const menuDoc: ComponentDoc = {
  ...getCatalogDoc('menu'),
  title: 'Menu',
  usage:
    'Для навигации или списка команд с группами и подменю. Если список нужно открыть поверх страницы по кнопке, используйте Dropdown.',
  primaryProps: ['items', 'mode', 'onAction', 'selectedValue', 'openKeys', 'onOpenKeysChange'],
  description: 'Список команд или навигационных ссылок с группами и подменю.',
  adapterDescription: 'MenuAdapter задаёт разметку, выбор и клавиатурную навигацию без оформления.',
  logicDescription:
    'getVisibleMenuRows рассчитывает видимость и ограничения пунктов; getTreeKeyAction, getNextEnabledValue и getTypeaheadValue задают клавиатурные правила.',
  examples: [
    {
      id: 'actions',
      title: 'Действия и вложенное меню',
      description:
        'Нажмите «Копировать» — результат покажет ключ copy. Откройте «Экспорт» и выберите PDF или CSV: onAction получит ключ конечного пункта. Само раскрытие не запускает действие, «Удалить» недоступен. Это демонстрация callback: копирование и экспорт файлов здесь не выполняются.',
      demo: <MenuActionsDemo />,
      code: actionsCode,
    },
    {
      id: 'groups',
      title: 'Группы и разделитель',
      description:
        '«Документ» и «Настройки» — подписи групп, не действия. Стрелки перемещают фокус между доступными пунктами, пропуская подписи, разделитель и «Права доступа». Выбранный пункт хранится через selectedValue, его ключ появляется под меню.',
      demo: <MenuGroupsDemo />,
      code: groupsCode,
    },
    {
      id: 'navigation',
      title: 'Навигация настоящими ссылками',
      description:
        'Выберите «Использование примера»: ссылка ведёт к разделу ниже и меняет якорь страницы. mode="navigation" создаёт ссылки с href, выбранная получает aria-current="page". В этом примере selectedValue обновляет onAction; в приложении его обычно берут из текущего маршрута.',
      demo: <MenuNavigationDemo />,
      code: navigationCode,
    },
  ],
  notes: [
    'В режиме действий стрелки, Home/End и поиск по буквам меняют фокус.',
    'ArrowRight раскрывает подменю, ArrowLeft возвращает к родителю.',
    'Группы и разделители не фокусируются.',
    'openKeys/onOpenKeysChange управляют раскрытием, defaultOpenKeys задаёт начальное состояние.',
    'Подменю раскрываются внутри списка, не в боковом всплывающем окне.',
  ],
};

export function MenuPage() {
  return <ComponentPage component="menu" doc={menuDoc} />;
}
