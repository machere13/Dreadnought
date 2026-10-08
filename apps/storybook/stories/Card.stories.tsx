import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card } from '@dreadnought/ui/react';
import styles from './Card.stories.module.css';

const meta = {
  title: 'Surfaces/Card',
  component: Card,
  decorators: [(Story) => <div className={styles.canvas}><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'Три слоя компонентов', variant: 'outlined', size: 'default' },
  render: (args) => <Card {...args}>
    <p>Используйте готовое оформление или соберите свой интерфейс.</p>
    <Button>Подробнее</Button>
  </Card>,
};

export const Compact: Story = { ...Default, args: { ...Default.args, size: 'compact' } };
export const Borderless: Story = { ...Default, args: { ...Default.args, variant: 'borderless' } };
export const WithAction: Story = {
  ...Default,
  args: { ...Default.args, extra: <Button size="compact" variant="ghosted">Открыть</Button> },
};
export const ContentOnly: Story = { ...Default, args: { title: undefined } };
