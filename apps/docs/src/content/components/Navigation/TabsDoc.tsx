import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { TabsBasicDemo } from './TabsBasicDemo.tsx';
import basicCode from './TabsBasicDemo.tsx?raw';
import { TabsVerticalDemo } from './TabsVerticalDemo.tsx';
import verticalCode from './TabsVerticalDemo.tsx?raw';
import { TabsOverflowDemo } from './TabsOverflowDemo.tsx';
import overflowCode from './TabsOverflowDemo.tsx?raw';
import { TabsLifecycleDemo } from './TabsLifecycleDemo.tsx';
import lifecycleCode from './TabsLifecycleDemo.tsx?raw';

export const tabsDoc: ComponentDoc = {
  ...getCatalogDoc('tabs'),
  title: 'Tabs',
  description:
    'Переключает содержимое разделов без перехода на другую страницу. Каждой Tabs.Tab соответствует Tabs.Panel с тем же value; доступное имя списка задаётся через Tabs.List.',
  adapterDescription:
    'Составной адаптер сохраняет связи вкладок и панелей, управление фокусом и клавиатурой, но не подключает тему.',
  logicDescription:
    'Хук управляет выбранным значением; при собственной разметке семантику и клавиатурное поведение нужно реализовать самостоятельно.',
  examples: [
    {
      id: 'basic',
      title: 'Переключение разделов',
      description:
        'Нажмите «Адаптер» или «Логика»: под вкладками изменится содержимое. value хранит выбранный раздел в React, onValueChange обновляет его. Стрелки влево/вправо, Home и End переключают вкладки с клавиатуры.',
      demo: <TabsBasicDemo />,
      code: basicCode,
    },
    {
      id: 'vertical',
      title: 'Вертикальные вкладки',
      description:
        'orientation="vertical" располагает список слева от панели. ArrowUp и ArrowDown переключают разделы, а не горизонтальные стрелки. Здесь defaultValue задаёт начальный раздел, дальнейший выбор хранится внутри Tabs.',
      demo: <TabsVerticalDemo />,
      code: verticalCode,
    },
    {
      id: 'overflow',
      title: 'Меню вкладок, которые не помещаются',
      description:
        'Ширина примера ограничена 24rem. Не поместившиеся вкладки доступны через кнопку с тремя точками «Остальные разделы»; moreLabel задаёт её доступное имя. Откройте меню и выберите скрытый раздел — появится его панель. Переполнение определяется по реальным размерам, вручную делить список не нужно.',
      demo: <TabsOverflowDemo />,
      code: overflowCode,
    },
    {
      id: 'lifecycle',
      title: 'Сохранение и сброс состояния панели',
      description:
        'Введите текст в каждой вкладке, переключитесь и вернитесь. eager создаёт поле сразу, lazy — при первом открытии; оба сохраняют введённый текст. unmount удаляет поле при закрытии, поэтому текст сбросится. mountPolicy управляет содержимым панели, не внешним состоянием приложения.',
      demo: <TabsLifecycleDemo />,
      code: lifecycleCode,
    },
  ],
  footnote:
    'Скрытие панели не приостанавливает эффекты её сохранённого содержимого. unmount очищает эффекты и локальное состояние. Меню переполнения требует Popover API браузера. Для переполнения вертикального списка ограничьте высоту через Tabs.List slotProps.container.style.maxHeight. При динамическом списке используйте стабильные keys.',
};

export function TabsPage() {
  return <ComponentPage component="tabs" doc={tabsDoc} />;
}
