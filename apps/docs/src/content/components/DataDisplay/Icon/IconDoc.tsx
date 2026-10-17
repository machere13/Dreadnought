import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { IconNamesDemo } from './IconNamesDemo.tsx';
import namesCode from './IconNamesDemo.tsx?raw';
import { IconAccessibilityDemo } from './IconAccessibilityDemo.tsx';
import accessibilityCode from './IconAccessibilityDemo.tsx?raw';

export const iconDoc: ComponentDoc = {
  ...getCatalogDoc('icon'),
  title: 'Icon',
  usage:
    'Для визуального обозначения действия или объекта. Иконка не заменяет кнопку: используйте её внутри Button, если нужно действие.',
  primaryProps: ['name', 'aria-label'],
  description: 'Иконка из набора библиотеки, выбранная по стабильному имени.',
  adapterDescription:
    'Адаптер принимает вашу графику. Без aria-label он скрывает её от скринридера; с подписью показывает как изображение.',
  notes: [
    'Набор графики можно заменить внутри библиотеки, сохранив имена иконок в коде приложения.',
    <>Если иконка стоит рядом с понятным текстом, оставьте её декоративной.</>,
    <>
      Для одной иконки без текста задайте <code>aria-label</code> самому элементу или доступное имя
      содержащей её кнопке.
    </>,
  ],
  examples: [
    {
      id: 'icon-names',
      title: 'Доступные имена',
      description:
        'Под каждой иконкой указано значение для name. Здесь показан весь текущий набор, не произвольные имена из Ant Design. Иконки декоративные: имя рядом с графикой уже объясняет образец.',
      demo: <IconNamesDemo />,
      code: namesCode,
    },
    {
      id: 'icon-accessibility',
      title: 'Иконка, подпись и кнопка без текста',
      description:
        'Рядом с текстом Icon остаётся декоративной. Самостоятельной смысловой иконке задайте aria-label. У кнопки без текста доступное имя задаётся Button: нажмите глаз, чтобы показать или скрыть подробности. Сама Icon не добавляет поведения кнопки.',
      demo: <IconAccessibilityDemo />,
      code: accessibilityCode,
    },
  ],
};

export function IconPage() {
  return <ComponentPage component="icon" doc={iconDoc} />;
}
