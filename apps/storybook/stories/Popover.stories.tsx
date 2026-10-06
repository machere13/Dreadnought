import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Input, Popover } from '@dreadnought/ui/react';

const meta = { title: 'Overlays/Popover', component: Popover,
  args: { 'aria-label': 'Настройки профиля', content: ({ close }) => <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x3)' }}>
    <Input aria-label="Имя" placeholder="Ваше имя" /><Button onClick={close}>Готово</Button>
  </div>, children: trigger => <Button {...trigger}>Настройки</Button> },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithoutArrow: Story = { args: { arrow: false } };
export const Disabled: Story = { args: { disabled: true } };
export const Placements: Story = { render: args => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: '4rem', padding: '6rem' }}>
  {(['topLeft', 'top', 'topRight', 'leftTop', 'left', 'leftBottom', 'rightTop', 'right', 'rightBottom', 'bottomLeft', 'bottom', 'bottomRight'] as const).map(placement =>
    <Popover {...args} key={placement} placement={placement}>{trigger => <Button {...trigger}>{placement}</Button>}</Popover>)}
</div> };
export const Controlled: Story = { render: function Controlled(args) {
  const [open, setOpen] = useState(false);
  return <Popover {...args} open={open} onOpenChange={setOpen} />;
} };
export const Nested: Story = { args: { content: () => <Popover content={({ close }) => <Button onClick={close}>Готово</Button>}>
  {trigger => <Button {...trigger}>Вложенная панель</Button>}
</Popover> } };
