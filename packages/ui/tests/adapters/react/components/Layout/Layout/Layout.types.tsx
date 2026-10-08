import { Layout } from '@dreadnought/ui/react';

void (
  <Layout direction="horizontal">
    <Layout.Header>Top</Layout.Header>
    <Layout.Sidebar
      collapsed={false}
      onCollapsedChange={(next: boolean) => {
        void next;
      }}
    >
      Nav
    </Layout.Sidebar>
    <Layout.Content>Body</Layout.Content>
    <Layout.Footer>Bottom</Layout.Footer>
  </Layout>
);
