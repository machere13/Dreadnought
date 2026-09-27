import type { Meta, StoryObj } from '@storybook/react-vite';
import { Layout } from '@dreadnought/ui/react';

type LayoutStoryArgs = { collapsed: boolean };

function DocumentationLayout({ collapsed }: LayoutStoryArgs) {
  return <Layout>
    <Layout.Header>Dreadnought · Документация</Layout.Header>
    <Layout direction="horizontal">
      <Layout.Sidebar key={String(collapsed)} defaultCollapsed={collapsed} aria-label="Разделы документации">
        <nav aria-label="Страницы"><a href="#components">Компоненты</a></nav>
      </Layout.Sidebar>
      <Layout.Content><h1 id="components">Компоненты</h1><p>Основное содержимое не зависит от состояния боковой области.</p></Layout.Content>
    </Layout>
    <Layout.Footer>Справка по библиотеке</Layout.Footer>
  </Layout>;
}

const meta = {
  title: 'Layout/Layout',
  component: DocumentationLayout,
  args: { collapsed: false },
  argTypes: { collapsed: { control: 'boolean' } },
} satisfies Meta<typeof DocumentationLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingPage: Story = {
  render: () => <Layout>
    <Layout.Header>Dreadnought</Layout.Header>
    <Layout.Content><h1>Компоненты для разных дизайн-систем</h1><p>Готовый каркас без привязки к содержимому сайта.</p></Layout.Content>
    <Layout.Footer>Документация · Исходный код</Layout.Footer>
  </Layout>,
};

export const Documentation: Story = {};
export const CollapsedSidebar: Story = { args: { collapsed: true } };
