import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
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
  ...getCatalogDoc('breadcrumb'),
  title: 'Breadcrumb',
  description: 'Путь от главной страницы до текущей. Уровни с адресом становятся ссылками, а текущая страница помечается для вспомогательных технологий.',
  adapterDescription: 'Адаптер создаёт навигационный список со ссылками и обозначением текущей страницы, но оставляет оформление вам.',
  footnote: <>Последний элемент получает <code>aria-current="page"</code>. Без <code>href</code> элемент выводится текстом; пустой список не создаёт навигационную область.</>,
  demo: <BreadcrumbDemo />,
};
