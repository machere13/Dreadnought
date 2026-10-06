import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Toast, ToastViewport } from '@dreadnought/ui/react';

const meta = {
  title: 'Feedback/Toast', component: Toast,
  args: { title: 'Изменения сохранены', type: 'success', duration: 0, closable: true, closeLabel: 'Закрыть уведомление' },
  argTypes: {
    type: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    duration: { control: { type: 'number', min: 0 } }, closable: { control: 'boolean' },
    icon: { control: false }, action: { control: false }, closeIcon: { control: false },
  },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Error: Story = { args: { type: 'error', title: 'Не удалось сохранить', description: 'Проверьте соединение и повторите попытку.', action: <Button size="compact">Повторить</Button> } };
export const WithoutIcon: Story = { args: { icon: null, title: 'Без иконки' } };
export const Stack: Story = {
  args: { duration: 3000 },
  render: args => {
    const [items, setItems] = useState<number[]>([]);
    const [nextId, setNextId] = useState(0);
    return <><Button onClick={() => { setItems(items => [...items, nextId]); setNextId(nextId + 1); }}>Показать уведомление</Button>
      <ToastViewport placement="bottom-end" aria-label="Уведомления">{items.map(id => <Toast {...args} key={id} onOpenChange={open => { if (!open) setItems(items => items.filter(item => item !== id)); }} />)}</ToastViewport></>;
  },
};
