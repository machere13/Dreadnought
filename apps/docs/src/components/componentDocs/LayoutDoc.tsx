import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import { Layout } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function LayoutDemo() {
  return <div className={`${styles.demo} ${styles.layoutDemo}`}>
    <Layout className={styles.layoutDemoFrame}>
      <Layout.Header>Шапка</Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sidebar aria-label="Пример боковой области" expandLabel="Открыть пример меню" collapseLabel="Свернуть пример меню">
          <nav aria-label="Разделы примера">Навигация</nav>
        </Layout.Sidebar>
        <Layout.Content>Основное содержимое</Layout.Content>
      </Layout>
      <Layout.Footer>Подвал</Layout.Footer>
    </Layout>
  </div>;
}

export const layoutDoc: ComponentDoc = {
  ...getCatalogDoc('layout'),
  title: 'Layout',
  description: 'Каркас страницы из шапки, боковой области, содержимого и подвала. Боковая область умеет сворачиваться, в том числе на узком экране.',
  adapterDescription: 'Адаптеры сохраняют семантические области и переключение боковой панели, но не подключают оформление. Раскладку задайте своими стилями.',
  footnote: <>Для кнопки боковой панели можно задать <code>expandLabel</code> и <code>collapseLabel</code>. На экранах до 40rem оформленный Sidebar по умолчанию свёрнут и раскрывается поверх содержимого.</>,
  demo: <LayoutDemo />,
};
