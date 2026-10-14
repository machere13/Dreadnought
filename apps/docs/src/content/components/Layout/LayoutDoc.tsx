import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { LayoutFullFooterDemo } from './LayoutFullFooterDemo.tsx';
import fullFooterCode from './LayoutFullFooterDemo.tsx?raw';
import { LayoutContentFooterDemo } from './LayoutContentFooterDemo.tsx';
import contentFooterCode from './LayoutContentFooterDemo.tsx?raw';
import { LayoutControlledDemo } from './LayoutControlledDemo.tsx';
import controlledCode from './LayoutControlledDemo.tsx?raw';

export const layoutDoc: ComponentDoc = {
  ...getCatalogDoc('layout'),
  title: 'Layout',
  description:
    'Каркас страницы из шапки, боковой области, содержимого и подвала. Боковая область умеет сворачиваться, в том числе на узком экране.',
  adapterDescription:
    'Адаптеры сохраняют семантические области и переключение боковой панели, но не подключают оформление. Раскладку задайте своими стилями.',
  footnote: (
    <>
      Для кнопки боковой панели можно задать <code>expandLabel</code> и <code>collapseLabel</code>.
      На экранах до 40rem оформленный Sidebar по умолчанию свёрнут и раскрывается поверх
      содержимого.
    </>
  ),
  examples: [
    {
      id: 'layout-full-footer',
      title: 'Подвал на всю ширину',
      description:
        'Внешний Layout располагает Header, горизонтальную строку Sidebar + Content и Footer друг под другом. Поэтому подвал находится под обеими колонками. Кнопка боковой области сворачивает меню; ссылка внутри ведёт в начало работы документации.',
      demo: <LayoutFullFooterDemo />,
      code: fullFooterCode,
    },
    {
      id: 'layout-content-footer',
      title: 'Подвал только под содержимым',
      description:
        'Здесь Footer вложен во второй вертикальный Layout вместе с Content. Sidebar остаётся соседней колонкой, а подвал занимает только область содержимого. Расположение меняется вложенностью, отдельный пропс для этого не нужен.',
      demo: <LayoutContentFooterDemo />,
      code: contentFooterCode,
    },
    {
      id: 'layout-controlled',
      title: 'Управляемая боковая область',
      description:
        'Панель начинается свёрнутой. Кнопка снаружи меняет collapsed; внутренняя кнопка запрашивает изменение через onCollapsedChange, а приложение подтверждает его. Явный collapsed имеет приоритет над адаптивным поведением Sidebar.',
      demo: <LayoutControlledDemo />,
      code: controlledCode,
    },
  ],
};

export function LayoutPage() {
  return <ComponentPage component="layout" doc={layoutDoc} />;
}
