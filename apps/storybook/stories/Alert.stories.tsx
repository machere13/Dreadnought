import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Icon } from '@dreadnought/ui/react';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  args: { title: 'Сохранено', type: 'success', variant: 'outlined', showIcon: true, closable: false },
  argTypes: {
    type: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    variant: { control: 'select', options: ['outlined', 'filled'] },
    showIcon: { control: 'boolean' },
    closable: { control: 'boolean' },
    icon: { control: false },
    action: { control: false },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { variant: 'filled', description: 'Изменения доступны всем участникам проекта.' } };
export const Warning: Story = { args: { type: 'warning', title: 'Проверьте данные', description: 'Некоторые поля требуют внимания.' } };
export const ErrorWithAction: Story = {
  args: {
    type: 'error',
    title: 'Не удалось получить ответ',
    description: 'Попробуйте отправить вопрос ещё раз.',
    action: <Button size="compact" onClick={() => {}}>Повторить</Button>,
  },
};
export const Dismissible: Story = { args: { type: 'info', title: 'Новое обновление', closable: true } };
export const CustomIcon: Story = { args: { type: 'info', title: 'Свой значок', icon: <Icon name="search" /> } };
export const LongDescription: Story = {
  args: { type: 'info', title: 'Проверка перед публикацией', description: 'Этот текст намеренно длинный: уведомление должно оставаться читаемым и корректно переноситься даже в узкой области, сохраняя место для действия и кнопки закрытия.', closable: true },
};
