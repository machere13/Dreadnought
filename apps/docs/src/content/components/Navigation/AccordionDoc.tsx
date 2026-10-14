import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { AccordionFaqDemo } from './AccordionFaqDemo.tsx';
import faqCode from './AccordionFaqDemo.tsx?raw';
import { AccordionMultipleDemo } from './AccordionMultipleDemo.tsx';
import multipleCode from './AccordionMultipleDemo.tsx?raw';
import { AccordionLifecycleDemo } from './AccordionLifecycleDemo.tsx';
import lifecycleCode from './AccordionLifecycleDemo.tsx?raw';

export const accordionDoc: ComponentDoc = {
  ...getCatalogDoc('accordion'),
  title: 'Accordion',
  description:
    'Раскрывающиеся разделы для FAQ и пояснений. Поддерживает один или несколько открытых пунктов.',
  adapterDescription:
    'Адаптер даёт доступные кнопки и панели без библиотечного оформления или декоративного индикатора.',
  logicDescription:
    'Чистая функция переключает открытый пункт. Для собственного компонента разметку, ARIA и состояние нужно собрать отдельно.',
  footnote:
    'Каждому Item нужны один Trigger и один Panel. Используйте уникальные value и стабильные React keys. Скрытая панель сохраняет оболочку; сохранённое содержимое не приостанавливает эффекты. unmount очищает эффекты и локальное состояние, но не состояние родителя.',
  examples: [
    {
      id: 'faq',
      title: 'Один открытый раздел',
      description:
        'Откройте вопрос о подключении, затем вопрос об оформлении: первый закроется. Повторное нажатие закрывает текущий раздел. Tab переключает кнопки; Enter и пробел раскрывают выбранный вопрос.',
      demo: <AccordionFaqDemo />,
      code: faqCode,
    },
    {
      id: 'multiple',
      title: 'Несколько открытых разделов',
      description:
        'Откройте «Доставка» и «Оплата»: оба ответа останутся видимыми. «Закрыть все разделы» очищает управляемый массив value. multiple разрешает независимое раскрытие пунктов.',
      demo: <AccordionMultipleDemo />,
      code: multipleCode,
    },
    {
      id: 'lifecycle',
      title: 'Сохранение черновика после закрытия',
      description:
        'Введите текст в lazy, переключитесь на другой раздел и вернитесь: черновик останется. В unmount он сбросится. eager создаёт поле сразу, lazy — при первом открытии; оба сохраняют его после закрытия.',
      demo: <AccordionLifecycleDemo />,
      code: lifecycleCode,
    },
  ],
};

export function AccordionPage() {
  return <ComponentPage component="accordion" doc={accordionDoc} />;
}
