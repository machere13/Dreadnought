import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '@dreadnought/ui/react';
const options = [{ value: 'anna', label: 'Анна' }, { value: 'boris', label: 'Борис', disabled: true }, { value: 'vera', label: 'Вера' },
  { value: 'long', label: 'Очень длинное название варианта, которое не должно расширять страницу' }];
const meta = { title: 'Fields/Select', component: Select, args: { options, 'aria-label': 'Исполнитель', placeholder: 'Выберите исполнителя' },
  argTypes: { disabled: { control: 'boolean' }, invalid: { control: 'boolean' }, searchable: { control: 'boolean' }, allowClear: { control: 'boolean' },
    options: { control: 'object' }, slotProps: { table: { disable: true } } } } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Search: Story = { args: { searchable: true, allowClear: true } };
export const Multiple: Story = { args: { multiple: true, searchable: true, allowClear: true, defaultValue: ['anna'] } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'anna' } };
export const Invalid: Story = { args: { invalid: true } };
export const Empty: Story = { args: { options: [], searchable: true } };
