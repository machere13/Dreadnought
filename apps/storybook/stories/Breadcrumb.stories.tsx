import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from '@dreadnought/ui/react';

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [
      { label: 'Главная', href: '/' },
      { label: 'Документация', href: '/docs' },
      { label: 'Компоненты' },
    ],
  },
  argTypes: { items: { control: false } },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongPath: Story = {
  args: {
    items: [
      { label: 'Главная', href: '/' },
      { label: 'Документация', href: '/docs' },
      { label: 'Компоненты', href: '/docs/components' },
      { label: 'Навигация', href: '/docs/components/navigation' },
      { label: 'Breadcrumb' },
    ],
  },
};

export const CurrentPageLink: Story = {
  args: { items: [{ label: 'Главная', href: '/' }, { label: 'Документация', href: '/docs' }] },
};
