import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { BadgeAppearanceDemo } from './BadgeAppearanceDemo.tsx';
import appearanceCode from './BadgeAppearanceDemo.tsx?raw';
import { BadgeDecorationDemo } from './BadgeDecorationDemo.tsx';
import decorationCode from './BadgeDecorationDemo.tsx?raw';
import { BadgeCounterDemo } from './BadgeCounterDemo.tsx';
import counterCode from './BadgeCounterDemo.tsx?raw';

export const badgeDoc: ComponentDoc = {
  ...getCatalogDoc('badge'),
  title: 'Badge',
  description:
    'Короткая метка или счётчик поверх другого элемента. Поддерживает маркер, иконку и три варианта оформления.',
  adapterDescription:
    'Адаптер собирает метку и расположение иконки без оформления. Отдельной логики в core для Badge нет.',
  footnote: (
    <>
      Метка поверх <code>target</code> скрыта от скринридера. Включайте значение счётчика в
      доступное имя самого целевого элемента.
    </>
  ),
  examples: [
    {
      id: 'badge-appearance',
      title: 'Три варианта оформления',
      description:
        'solid — метка с заливкой, outline — с рамкой, ghosted — только содержимое без заливки и рамки. Смысл метки задаёт её текст; Badge сама не является кнопкой.',
      demo: <BadgeAppearanceDemo />,
      code: appearanceCode,
    },
    {
      id: 'badge-decoration',
      title: 'Без маркера, с маркером или иконкой',
      description:
        'Без icon метка содержит только текст. В один пропс icon можно передать Mark с цветом или Icon по имени. iconPosition="end" ставит его после текста. Цвет маркера задаёт Mark, а не Badge.',
      demo: <BadgeDecorationDemo />,
      code: decorationCode,
    },
    {
      id: 'badge-counter',
      title: 'Счётчик поверх кнопки',
      description:
        'Нажатие «Уведомления» добавляет единицу к счётчику, «Отметить прочитанными» сбрасывает его. Это демонстрация состояния, не открытие списка уведомлений. Значение включено в aria-label кнопки, потому что метка поверх target скрыта от скринридера. Ноль здесь тоже отображается.',
      demo: <BadgeCounterDemo />,
      code: counterCode,
    },
  ],
};

export function BadgePage() {
  return <ComponentPage component="badge" doc={badgeDoc} />;
}
