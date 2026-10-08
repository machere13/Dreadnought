import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu, type MenuProps } from '@dreadnought/ui/react';

const meta = {
  title: 'Navigation/Menu',
  component: Menu,
  args: { 'aria-label': 'Действия', items: [
    { value: 'copy', label: 'Копировать' },
    { value: 'edit', label: 'Редактировать' },
    { value: 'delete', label: 'Удалить', disabled: true },
  ] },
  argTypes: { items: { control: 'object' }, selectedValue: { control: 'select', options: ['copy', 'edit'] },
    slotProps: { table: { disable: true } } },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Actions: Story = {
  render: (args) => <Menu {...args} />,
};

export const Nested: Story = { args: { defaultOpenKeys: ['export'], items: [
  { value: 'files', type: 'group', label: 'Файл', children: [{ value: 'copy', label: 'Копировать' },
    { value: 'export', label: 'Экспорт', children: [{ value: 'pdf', label: 'PDF' }, { value: 'csv', label: 'CSV' }] }] },
  { value: 'separator', type: 'divider' }, { value: 'delete', label: 'Удалить', disabled: true },
] } };
export const Navigation: Story = { args: { mode: 'navigation', selectedValue: 'button', defaultOpenKeys: ['components'], items: [
  { value: 'start', label: 'Начало', href: '#start' }, { value: 'components', label: 'Компоненты', children: [
    { value: 'button', label: 'Button', href: '#button' }, { value: 'input', label: 'Input', href: '#input' },
  ] },
] } };

export const Typeahead: Story = {
  args: { items: [
    { value: 'news', label: 'Новости' },
    { value: 'locked', label: 'Настройки профиля', disabled: true },
    { value: 'settings', label: 'Настройки' },
    { value: 'notes', label: 'Наши заметки' },
  ] },
  parameters: { docs: { description: { story: 'Перейдите в меню клавишей Tab и наберите «на». Повтор «н» перебирает пункты; Enter запускает действие.' } } },
};

function SelectionExample(args: MenuProps) {
  const [value, setValue] = useState('copy');
  return <Menu {...args} selectedValue={value} onAction={setValue} />;
}

export const Selection: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => <SelectionExample {...args} />,
};
