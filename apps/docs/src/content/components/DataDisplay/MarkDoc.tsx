import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { MarkShapesDemo } from './MarkShapesDemo.tsx';
import shapesCode from './MarkShapesDemo.tsx?raw';
import { MarkStatusDemo } from './MarkStatusDemo.tsx';
import statusCode from './MarkStatusDemo.tsx?raw';

export const markDoc: ComponentDoc = {
  ...getCatalogDoc('mark'),
  title: 'Mark',
  usage:
    'Для небольшого цветного маркера рядом со статусом или в легенде. Смысл статуса должен быть понятен и без цвета — по тексту рядом.',
  primaryProps: ['shape', 'color'],
  description: 'Небольшой декоративный маркер с заданными формой и цветом.',
  adapterDescription:
    'Адаптер выводит декоративный элемент с выбранной формой; размер и цвет задаются вашими стилями.',
  notes: [
    <>Mark всегда скрыт от скринридера.</>,
    <>Если цвет или форма передают смысл, продублируйте его текстом рядом.</>,
    <>
      Без <code>color</code> используется компонентный токен темы.
    </>,
  ],
  examples: [
    {
      id: 'mark-shapes',
      title: 'Форма и локальный цвет',
      description:
        'shape выбирает circle или square; по умолчанию circle. Без color используется цвет темы, с color — CSS-цвет конкретного маркера. Здесь квадрат получает цвет через токен статуса success.',
      demo: <MarkShapesDemo />,
      code: shapesCode,
    },
    {
      id: 'mark-status',
      title: 'Статус рядом с текстом',
      description:
        'Mark можно передать в icon у Badge или поставить рядом с обычным текстом. «Готово» и «В очереди» поясняют значение цвета: маркер всегда декоративный и не имеет собственного доступного имени.',
      demo: <MarkStatusDemo />,
      code: statusCode,
    },
  ],
};

export function MarkPage() {
  return <ComponentPage component="mark" doc={markDoc} />;
}
