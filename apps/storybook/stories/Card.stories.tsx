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
  render: (args) => <Card {...args}>
    <strong>Три слоя компонентов</strong>
    <p>Используйте готовое оформление или соберите свой интерфейс.</p>
    <Button>Подробнее</Button>
  </Card>,
};
