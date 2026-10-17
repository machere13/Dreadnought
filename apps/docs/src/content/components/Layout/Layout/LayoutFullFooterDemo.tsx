import { Button, Layout } from '@dreadnought/ui/react';

export function LayoutFullFooterDemo() {
  return (
    <Layout style={{ minHeight: '18rem' }}>
      <Layout.Header>Шапка</Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sidebar
          aria-label="Пример боковой области"
          expandLabel="Открыть пример меню"
          collapseLabel="Свернуть пример меню"
        >
          <nav aria-label="Разделы примера">
            <Button href="/getting-started/" variant="ghosted" size="compact">
              Начало работы
            </Button>
          </nav>
        </Layout.Sidebar>
        <Layout.Content>Основное содержимое</Layout.Content>
      </Layout>
      <Layout.Footer>Подвал на всю ширину</Layout.Footer>
    </Layout>
  );
}
