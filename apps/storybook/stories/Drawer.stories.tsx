import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Checkbox, Drawer, Input, Modal, Popover } from '@dreadnought/ui/react';

const meta = { title: 'Overlays/Drawer', component: Drawer,
  argTypes: { placement: { control: 'select', options: ['right', 'left', 'top', 'bottom'] }, size: { control: 'text' } },
  args: { placement: 'right', 'aria-label': 'Профиль',
    content: ({ close }) => <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x4)' }}>
      <h2>Профиль</h2><Input aria-label="Имя" placeholder="Ваше имя" /><Button onClick={close}>Готово</Button>
    </div>, children: trigger => <Button {...trigger}>Открыть панель</Button> },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {};
export const Left: Story = { args: { placement: 'left' } };
export const Top: Story = { args: { placement: 'top' } };
export const Bottom: Story = { args: { placement: 'bottom' } };
export const CustomSize: Story = { args: { size: '70vw' } };
export const Oversized: Story = { args: { size: 2000 } };
export const NonDismissible: Story = { args: { closeOnEscape: false, closeOnBackdrop: false } };
export const ControlledRefusal: Story = { render: function ControlledRefusal(args) {
  const [open, setOpen] = useState(false), [allowed, setAllowed] = useState(false);
  return <Drawer {...args} open={open} onOpenChange={next => { if (next || allowed) setOpen(next); }}
    content={({ close }) => <><Checkbox checked={allowed} onChange={event => setAllowed(event.target.checked)}>Разрешить закрытие</Checkbox>
      <Button onClick={close}>Готово</Button></>} />;
} };
export const LongContent: Story = { args: { content: ({ close }) => <><h2>Длинное содержимое</h2>
  {Array.from({ length: 40 }, (_, index) => <p key={index}>Раздел {index + 1}: содержимое прокручивается внутри панели, а фон остаётся неподвижным.</p>)}
  <Button onClick={close}>Готово</Button></> } };
export const WithModal: Story = { args: { content: ({ close }) => <><Modal aria-label="Вложенное окно"
  content={({ close: closeInner }) => <Button onClick={closeInner}>Закрыть вложенное</Button>}>
  {trigger => <Button {...trigger}>Открыть вложенное</Button>}
  </Modal><Button onClick={close}>Закрыть основное</Button></> } };
export const WithPopover: Story = { args: { content: ({ close }) => <><Popover aria-label="Настройки"
  content={({ close: closePopover }) => <><Input aria-label="Значение" /><Button onClick={closePopover}>Закрыть подсказку</Button></>}>
  {trigger => <Button {...trigger}>Настройки</Button>}
  </Popover><Button onClick={close}>Готово</Button></> } };
export const NativeForm: Story = { args: { content: () => <form method="dialog"><Input aria-label="Имя" /><Button type="submit">Сохранить</Button></form> } };
