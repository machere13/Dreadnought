import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { SwitchBasicDemo } from './SwitchBasicDemo.tsx';
import basicCode from './SwitchBasicDemo.tsx?raw';
import { SwitchLoadingDemo } from './SwitchLoadingDemo.tsx';
import loadingCode from './SwitchLoadingDemo.tsx?raw';
import { SwitchStatesDemo } from './SwitchStatesDemo.tsx';
import statesCode from './SwitchStatesDemo.tsx?raw';

export const switchDoc: ComponentDoc = {
  ...getCatalogDoc('switch'),
  title: 'Switch',
  usage:
    'Для настройки, которая включается и выключается сразу. Если изменение нужно подтвердить отправкой формы, используйте Checkbox.',
  primaryProps: ['checked', 'defaultChecked', 'onChange', 'disabled', 'loading'],
  description: 'Переключатель настройки между включённым и выключенным состояниями.',
  adapterDescription:
    'Адаптер использует общее поведение getCheckableState и нативный input с ролью switch. Оформление подключает только готовый компонент.',
  notes: [
    'Space переключает значение.',
    'onChange получает событие поля; новое состояние — event.currentTarget.checked.',
    'name, value, form и reset работают как у checkbox.',
    'ref указывает на input.',
  ],
  examples: [
    {
      id: 'basic',
      title: 'Мгновенное переключение',
      description:
        'Нажмите переключатель или подпись: настройка и результат ниже изменятся сразу. checked управляется состоянием React, onChange передаёт новое значение через event.currentTarget.checked. Tab переводит фокус, Space переключает настройку.',
      demo: <SwitchBasicDemo />,
      code: basicCode,
    },
    {
      id: 'loading',
      title: 'Сохранение настройки с загрузкой',
      description:
        'Переключите автосохранение: запрос имитируется в течение секунды. loading блокирует повторные клики и Space, но сохраняет фокус. После завершения меняются checked и результат. Здесь нет обращения к серверу; таймер отменяется при удалении примера со страницы.',
      demo: <SwitchLoadingDemo />,
      code: loadingCode,
    },
    {
      id: 'disabled',
      title: 'Недоступная настройка',
      description:
        'Два переключателя показывают выключенное и включённое состояние. disabled не позволяет менять их и пропускает при обходе Tab. В отличие от временного loading, эти настройки постоянно недоступны.',
      demo: <SwitchStatesDemo />,
      code: statesCode,
    },
  ],
};

export function SwitchPage() {
  return <ComponentPage component="switch" doc={switchDoc} />;
}
