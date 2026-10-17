import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { BreadcrumbBasicDemo } from './BreadcrumbBasicDemo.tsx';
import basicCode from './BreadcrumbBasicDemo.tsx?raw';
import { BreadcrumbAnchorsDemo } from './BreadcrumbAnchorsDemo.tsx';
import anchorsCode from './BreadcrumbAnchorsDemo.tsx?raw';

export const breadcrumbDoc: ComponentDoc = {
  ...getCatalogDoc('breadcrumb'),
  title: 'Breadcrumb',
  usage:
    'Для пути по вложенным страницам и возврата на уровень выше. Breadcrumb дополняет основную навигацию, а не заменяет её.',
  primaryProps: ['items', 'aria-label'],
  description: 'Навигационный путь от родительских разделов до текущей страницы.',
  adapterDescription:
    'Адаптер создаёт навигационный список со ссылками и обозначением текущей страницы, но оставляет оформление вам.',
  notes: [
    <>
      Последний элемент получает <code>aria-current="page"</code>.
    </>,
    <>
      Без <code>href</code> элемент выводится текстом; пустой список не создаёт навигационную
      область.
    </>,
  ],
  examples: [
    {
      id: 'breadcrumb-basic',
      title: 'Ссылки и текущая страница',
      description:
        'Пример пути к странице Button: «Главная» ведёт на главную документации. У «Компоненты» нет href, поэтому это текст. Последний пункт обозначает текущую страницу примера, а не страницу этой документации.',
      demo: <BreadcrumbBasicDemo />,
      code: basicCode,
    },
    {
      id: 'breadcrumb-anchors',
      title: 'Рабочие переходы по разделам',
      description:
        'Первые два пункта ведут к разделам ниже. Их href совпадают с id разделов; useId позволяет размещать несколько таких примеров без конфликтов. Breadcrumb не создаёт маршруты — адреса задаёт приложение.',
      demo: <BreadcrumbAnchorsDemo />,
      code: anchorsCode,
    },
  ],
};

export function BreadcrumbPage() {
  return <ComponentPage component="breadcrumb" doc={breadcrumbDoc} />;
}
