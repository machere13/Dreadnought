import { Layout } from '@dreadnought/ui/react';

export function LayoutContentFooterDemo() {
  return (
    <Layout style={{ minHeight: '18rem' }}>
      <Layout.Header>Шапка</Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sidebar
          aria-label="Боковая область второго макета"
          expandLabel="Открыть второе меню"
          collapseLabel="Свернуть второе меню"
        >
          Боковая область
        </Layout.Sidebar>
        <Layout>
          <Layout.Content>Основное содержимое</Layout.Content>
          <Layout.Footer>Подвал в колонке содержимого</Layout.Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}
