import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { TooltipBasicDemo } from './TooltipBasicDemo.tsx';
import basicCode from './TooltipBasicDemo.tsx?raw';
import { TooltipPlacementDemo } from './TooltipPlacementDemo.tsx';
import placementCode from './TooltipPlacementDemo.tsx?raw';
import { TooltipDelayDemo } from './TooltipDelayDemo.tsx';
import delayCode from './TooltipDelayDemo.tsx?raw';

export const tooltipDoc: ComponentDoc = {
  ...getCatalogDoc('tooltip'),
  title: 'Tooltip',
  description:
    'Короткое пояснение при наведении или фокусе. Для кнопок, ссылок и полей внутри всплывающей панели используйте Popover, а не Tooltip.',
  adapterDescription:
    'TooltipAdapter содержит то же поведение и позиционирование без готового оформления. Render-функция позволяет использовать HTML или SVG без дополнительной обёртки.',
  logicDescription:
    'useTooltip возвращает свойства целевого элемента и подсказки. getTooltipState из core формирует доступную связь aria-describedby независимо от фреймворка.',
  footnote: (
    <>
      Целевой элемент должен быть доступен с клавиатуры и иметь собственное доступное имя. Подсказка
      дополняет его, но не заменяет. Не размещайте внутри кнопки, ссылки и поля. Передайте свойства
      render-функции одному целевому элементу. Оформление меняется через --dreadnought-tooltip-*.
    </>
  ),
  examples: [
    {
      id: 'tooltip-basic',
      title: 'Наведение и фокус',
      description:
        'Наведите мышь на «Настройки» или перейдите к кнопке клавишей Tab. Подсказка поясняет действие; сама кнопка в примере настройки не открывает. Фокус показывает подсказку сразу, Escape закрывает её.',
      demo: <TooltipBasicDemo />,
      code: basicCode,
    },
    {
      id: 'tooltip-placement',
      title: 'Расположение и стрелка',
      description:
        'Сравните подсказки сверху, справа и без стрелки. placement задаёт предпочтительную сторону; у края экрана она может измениться автоматически. arrow={false} убирает стрелку.',
      demo: <TooltipPlacementDemo />,
      code: placementCode,
    },
    {
      id: 'tooltip-delay',
      title: 'С задержкой и без неё',
      description:
        'Наведите мышь на первую кнопку: подсказка появится через 500 мс и исчезнет через 300 мс после ухода. Вторая работает мгновенно. openDelay и closeDelay задаются отдельно в миллисекундах; по умолчанию оба равны 100. Задержки относятся к наведению, не к клавиатурному фокусу.',
      demo: <TooltipDelayDemo />,
      code: delayCode,
    },
  ],
};

export function TooltipPage() {
  return <ComponentPage component="tooltip" doc={tooltipDoc} />;
}
