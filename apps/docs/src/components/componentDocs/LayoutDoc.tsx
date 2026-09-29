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
  title: 'Layout',
  description: 'Каркас страницы из шапки, боковой области, содержимого и подвала. Боковая область умеет сворачиваться, в том числе на узком экране.',
  readyCode: `import { Layout } from '@dreadnought/ui/react';

<Layout>
  <Layout.Header>Шапка</Layout.Header>
  <Layout direction="horizontal">
    <Layout.Sidebar aria-label="Навигация">
      <nav>Разделы</nav>
    </Layout.Sidebar>
    <Layout.Content>Содержимое</Layout.Content>
  </Layout>
  <Layout.Footer>Подвал</Layout.Footer>
</Layout>`,
  adapterCode: `import { LayoutAdapter, LayoutHeaderAdapter, LayoutSidebarAdapter,
  LayoutContentAdapter, LayoutFooterAdapter } from '@dreadnought/react/unstyled';

<LayoutAdapter className={styles.page}>
  <LayoutHeaderAdapter>Шапка</LayoutHeaderAdapter>
  <LayoutAdapter direction="horizontal">
    <LayoutSidebarAdapter aria-label="Навигация">Разделы</LayoutSidebarAdapter>
    <LayoutContentAdapter>Содержимое</LayoutContentAdapter>
  </LayoutAdapter>
  <LayoutFooterAdapter>Подвал</LayoutFooterAdapter>
</LayoutAdapter>`,
  adapterDescription: 'Адаптеры сохраняют семантические области и переключение боковой панели, но не подключают оформление. Раскладку задайте своими стилями.',
  apiRows: [
    ['direction', 'vertical | horizontal', 'vertical', 'Направление вложенного Layout'],
    ['Layout.Header', 'свойства <header>', '—', 'Шапка страницы'],
    ['Layout.Sidebar', 'свойства <aside> + collapsed, defaultCollapsed, onCollapsedChange', 'развёрнута', 'Сворачиваемая боковая область'],
    ['Layout.Content', 'свойства <main>', '—', 'Основное содержимое'],
    ['Layout.Footer', 'свойства <footer>', '—', 'Подвал страницы'],
  ],
  footnote: <>Для кнопки боковой панели можно задать <code>expandLabel</code> и <code>collapseLabel</code>. На экранах до 40rem оформленный Sidebar по умолчанию свёрнут и раскрывается поверх содержимого.</>,
  demo: <LayoutDemo />,
};
