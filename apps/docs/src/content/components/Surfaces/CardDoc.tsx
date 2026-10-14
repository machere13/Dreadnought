import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { CardHeaderDemo } from './CardHeaderDemo.tsx';
import headerCode from './CardHeaderDemo.tsx?raw';
import { CardAppearanceDemo } from './CardAppearanceDemo.tsx';
import appearanceCode from './CardAppearanceDemo.tsx?raw';
import { CardActionsDemo } from './CardActionsDemo.tsx';
import actionsCode from './CardActionsDemo.tsx?raw';

export const cardDoc: ComponentDoc = {
  ...getCatalogDoc('card'),
  title: 'Card',
  description:
    'Оформленный контейнер для произвольного содержимого: текста, элементов управления и вложенных компонентов.',
  adapterDescription:
    'Адаптер даёт контейнер без темы. Card не требует отдельной логики или состояния в core.',
  footnote: (
    <>
      Без <code>title/extra</code> шапка не создаётся. <code>cover</code> расположен сверху,{' '}
      <code>footer</code> — под содержимым, <code>actions</code> — последним рядом. Для действий
      используйте кнопки или ссылки со стабильными <code>key</code>. Карточка сама не является
      кнопкой. Без дополнительных зон разметка содержимого не меняется.
    </>
  ),
  examples: [
    {
      id: 'card-header',
      title: 'Заголовок и действие',
      description:
        'title задаёт заголовок, extra — действие рядом с ним. «Подробнее» раскрывает дополнительный текст, «Скрыть» убирает его. Это состояние приложения: Card сама не раскрывается и не является кнопкой.',
      demo: <CardHeaderDemo />,
      code: headerCode,
    },
    {
      id: 'card-appearance',
      title: 'Размер, рамка и отсутствие шапки',
      description:
        'Сравните обычные и компактные отступы. variant="borderless" убирает рамку, но не фон. У третьей карточки нет title и extra, поэтому её содержимое начинается без шапки.',
      demo: <CardAppearanceDemo />,
      code: appearanceCode,
    },
    {
      id: 'card-actions',
      title: 'Обложка, подвал и действия',
      description:
        'cover находится сверху, footer — под содержимым, actions — последним рядом. «Обновить» меняет только статус примера; «Документация» открывает раздел начала работы. Обложка — файл /markdown-upload-demo.svg из public документации: при переносе замените src своим изображением.',
      demo: <CardActionsDemo />,
      code: actionsCode,
    },
  ],
};

export function CardPage() {
  return <ComponentPage component="card" doc={cardDoc} />;
}
