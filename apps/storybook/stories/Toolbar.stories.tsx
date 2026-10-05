import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useToolbarItem } from '@dreadnought/react/logic';
import { Button, Input, Select, Toolbar } from '@dreadnought/ui/react';
import type { ToolbarProps } from '@dreadnought/ui/react';

const meta = {
  title: 'Controls/Toolbar', component: Toolbar, args: { 'aria-label': 'Действия документа' },
  argTypes: { navigation: { control: 'select', options: ['roving', 'native'] }, orientation: { control: 'select', options: ['horizontal', 'vertical'] }, loop: { control: 'boolean' } },
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

function Command({ value, label, disabled = false, own = false, onAction }: { value: string; label: string; disabled?: boolean; own?: boolean; onAction: (value: string) => void }) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({ value, disabled });
  return own ? <button {...itemProps} type="button" disabled={disabled} onClick={() => onAction(value)}>{label}</button>
    : <Button {...itemProps} size="compact" variant="secondary" disabled={disabled} onClick={() => onAction(value)}>{label}</Button>;
}

function Commands({ disabledCopy = false, own = false, ...props }: ToolbarProps & { disabledCopy?: boolean; own?: boolean }) {
  const [action, setAction] = useState('—');
  const [showCopy, setShowCopy] = useState(true);
  return <>
    <Toolbar {...props}>
      <Command value="save" label="Сохранить" onAction={setAction} own={own} />
      {showCopy && <Command value="copy" label="Копировать" onAction={setAction} disabled={disabledCopy} own={own} />}
      <Command value="download" label="Скачать" onAction={setAction} own={own} />
    </Toolbar>
    <p>Действие: {action}</p>
    <Button variant="ghosted" size="compact" onClick={() => setShowCopy((visible) => !visible)}>{showCopy ? 'Убрать команду копирования' : 'Вернуть команду копирования'}</Button>
  </>;
}

export const Default: Story = { render: (args) => <Commands {...args} /> };
export const Disabled: Story = { render: (args) => <Commands {...args} disabledCopy /> };
export const CustomControl: Story = { render: (args) => <Commands {...args} own /> };
export const Vertical: Story = { args: { orientation: 'vertical' }, render: (args) => <Commands {...args} /> };
export const NoLoop: Story = { args: { loop: false }, render: (args) => <Commands {...args} /> };
export const NativeControls: Story = {
  args: { navigation: 'native', 'aria-label': 'Фильтры' },
  render: (args) => <Toolbar {...args}><Input aria-label="Поиск" placeholder="Поиск" /><Select aria-label="Статус" placeholder="Статус" options={[{ value: 'active', label: 'Активные' }, { value: 'archived', label: 'Архив' }]} /><Button size="compact">Применить</Button></Toolbar>,
};
