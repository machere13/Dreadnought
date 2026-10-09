import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Checkbox, Input, Modal, Popover } from '@dreadnought/ui/react';

const meta = { title: 'Overlays/Modal', component: Modal,
  args: { 'aria-label': 'Профиль', content: ({ close }) => <div style={{ display: 'grid', gap: 'var(--dreadnought-spacing-x4)' }}>
    <h2>Профиль</h2><Input aria-label="Имя" placeholder="Ваше имя" /><Button onClick={close}>Готово</Button>
  </div>, children: trigger => <Button {...trigger}>Открыть окно</Button> },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NonDismissible: Story = { args: { closable: false, closeOnEscape: false, closeOnBackdrop: false } };
export const WithoutCloseButton: Story = { args: { closable: false } };
export const Controlled: Story = { render: function Controlled(args) {
  const [open, setOpen] = useState(false);
  return <Modal {...args} open={open} onOpenChange={setOpen} />;
} };
export const ControlledRefusal: Story = { render: function ControlledRefusal(args) {
  const [open, setOpen] = useState(false), [allowed, setAllowed] = useState(false);
  return <Modal {...args} open={open} onOpenChange={next => { if (next || allowed) setOpen(next); }}
    content={({ close }) => <><Checkbox checked={allowed} onChange={event => setAllowed(event.target.checked)}>Разрешить закрытие</Checkbox>
      <Button onClick={close}>Готово</Button></>} />;
} };
export const LongContent: Story = { args: { content: ({ close }) => <><h2>Длинное содержимое</h2>
  {Array.from({ length: 40 }, (_, index) => <p key={index}>Раздел {index + 1}: содержимое прокручивается внутри окна, а фон остаётся неподвижным.</p>)}
  <Button onClick={close}>Готово</Button></> } };
export const Nested: Story = { args: { content: ({ close }) => <><Modal aria-label="Вложенное окно"
  content={({ close: closeInner }) => <Button onClick={closeInner}>Закрыть вложенное</Button>}>
  {trigger => <Button {...trigger}>Открыть вложенное</Button>}
  </Modal><Button onClick={close}>Закрыть основное</Button></> } };
export const WithPopover: Story = { args: { content: ({ close }) => <><Popover aria-label="Настройки"
  content={({ close: closePopover }) => <><Input aria-label="Значение" /><Button onClick={closePopover}>Закрыть панель</Button></>}>
  {trigger => <Button {...trigger}>Настройки</Button>}
  </Popover><Button onClick={close}>Готово</Button></> } };
export const NativeForm: Story = { args: { content: () => <form method="dialog"><Input aria-label="Имя" /><Button type="submit">Сохранить</Button></form> } };
export const EmptyContent: Story = { args: { content: () => <></> } };
