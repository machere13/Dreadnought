import { Breadcrumb } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function BreadcrumbDemo() {
  return <div className={styles.demo}>
    <Breadcrumb aria-label="Пример пути" items={[
      { label: 'Главная', href: '/' },
      { label: 'Компоненты' },
      { label: 'Button' },
    ]} />
  </div>;
}

export const breadcrumbDoc: ComponentDoc = {
  title: 'Breadcrumb',
  description: 'Путь от главной страницы до текущей. Уровни с адресом становятся ссылками, а текущая страница помечается для вспомогательных технологий.',
  readyCode: `import { Breadcrumb } from '@dreadnought/ui/react';

<Breadcrumb aria-label="Путь по сайту" items={[
  { label: 'Главная', href: '/' },
  { label: 'Компоненты' },
  { label: 'Button' },
]} />`,
  adapterCode: `import { BreadcrumbAdapter } from '@dreadnought/react/unstyled';

<BreadcrumbAdapter aria-label="Путь по сайту" items={items}
  className={styles.myBreadcrumb} />`,
  adapterDescription: 'Адаптер создаёт навигационный список со ссылками и обозначением текущей страницы, но оставляет оформление вам.',
  apiRows: [
    ['items', 'readonly { label: ReactNode; href?: string }[]', '—', 'Уровни пути по порядку'],
    ['aria-label', 'string', 'Breadcrumb', 'Доступное имя навигационной области'],
    ['slotClassNames', '{ list?, item?, link?, current? }', '—', 'Классы для отдельных частей пути'],
  ],
  footnote: <>Последний элемент получает <code>aria-current="page"</code>. Без <code>href</code> элемент выводится текстом; пустой список не создаёт навигационную область.</>,
  demo: <BreadcrumbDemo />,
};
