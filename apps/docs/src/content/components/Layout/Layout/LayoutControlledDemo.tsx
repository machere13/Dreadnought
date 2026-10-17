import { useState } from 'react';
import { Button, Layout } from '@dreadnought/ui/react';

export function LayoutControlledDemo() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Button onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? 'Развернуть панель извне' : 'Свернуть панель извне'}
      </Button>
      <Layout direction="horizontal" style={{ minHeight: '12rem', width: '100%' }}>
        <Layout.Sidebar
          aria-label="Управляемая боковая область"
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          expandLabel="Открыть управляемое меню"
          collapseLabel="Свернуть управляемое меню"
        >
          Содержимое боковой области
        </Layout.Sidebar>
        <Layout.Content>Основное содержимое остаётся смонтированным.</Layout.Content>
      </Layout>
      <span role="status">Панель {collapsed ? 'свёрнута' : 'развёрнута'}</span>
    </div>
  );
}
