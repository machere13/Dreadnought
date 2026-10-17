import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { DropdownActionsDemo } from './DropdownActionsDemo.tsx';
import actionsCode from './DropdownActionsDemo.tsx?raw';
import { DropdownControlledDemo } from './DropdownControlledDemo.tsx';
import controlledCode from './DropdownControlledDemo.tsx?raw';
import { DropdownPlacementDemo } from './DropdownPlacementDemo.tsx';
import placementCode from './DropdownPlacementDemo.tsx?raw';

export const dropdownDoc: ComponentDoc = {
  ...getCatalogDoc('dropdown'),
  title: 'Dropdown',
  usage:
    'Для списка команд под кнопкой, например «Ещё». Для выбора значения формы используйте Select, для произвольного содержимого — Popover.',
  primaryProps: [
    'items',
    'onAction',
    'selectedValue',
    'open',
    'onOpenChange',
    'placement',
    'disabled',
  ],
  description: 'Меню команд, открывающееся по нажатию на кнопку.',
  adapterDescription:
    'DropdownAdapter связывает MenuAdapter и usePopover без оформления. Отдельные core и useDropdown не нужны: для собственной композиции используйте существующие behaviors, MenuAdapter и usePopover.',
  notes: [
    <>Передайте все свойства trigger одной кнопке.</>,
    <>
      ArrowDown открывает меню с первого доступного пункта, ArrowUp — с последнего; Escape закрывает
      его и возвращает фокус.
    </>,
    <>Открытие по наведению и вложенные подменю не поддерживаются.</>,
    <>Для произвольного содержимого используйте Popover.</>,
  ],
  examples: [
    {
      id: 'dropdown-actions',
      title: 'Действия с файлом',
      description:
        'Откройте меню и выберите команду. «Удалить» недоступно. Пример показывает вызов onAction и закрытие меню: файл не скачивается и не изменяется.',
      demo: <DropdownActionsDemo />,
      code: actionsCode,
    },
    {
      id: 'dropdown-controlled',
      title: 'Управление открытием и выбором',
      description:
        'Кнопка «Открыть извне» меняет open из приложения. Выберите PDF или CSV: selectedValue отмечает текущий формат, onAction обновляет его, а onOpenChange закрывает меню. Экспорт здесь не запускается.',
      demo: <DropdownControlledDemo />,
      code: controlledCode,
    },
    {
      id: 'dropdown-placement',
      title: 'Расположение и стрелка',
      description:
        'Откройте оба меню по очереди. placement задаёт предпочтительное расположение, arrow добавляет стрелку. Если у края экрана места недостаточно, меню может изменить положение автоматически.',
      demo: <DropdownPlacementDemo />,
      code: placementCode,
    },
  ],
};

export function DropdownPage() {
  return <ComponentPage component="dropdown" doc={dropdownDoc} />;
}
