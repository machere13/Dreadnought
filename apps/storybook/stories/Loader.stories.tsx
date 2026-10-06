import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, Icon, Loader } from '@dreadnought/ui/react';

const meta = {
  title: 'Feedback/Loader', component: Loader,
  args: { loading: true, size: 'default', label: 'Загрузка данных', showLabel: false },
  argTypes: { size: { control: 'select', options: ['small', 'default', 'large'] }, loading: { control: 'boolean' }, showLabel: { control: 'boolean' }, indicator: { control: false }, children: { control: false } },
} satisfies Meta<typeof Loader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithLabel: Story = { args: { showLabel: true } };
export const Small: Story = { args: { size: 'small' } };
export const Large: Story = { args: { size: 'large', showLabel: true } };
export const Content: Story = { args: { showLabel: true, children: <Card title="Данные проекта"><p>Содержимое не размонтируется.</p><Button>Сохранить</Button></Card> } };
export const CustomIndicator: Story = { args: { indicator: <Icon name="ellipsis" />, showLabel: true } };
