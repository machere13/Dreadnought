import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, FloatingPanel, Popover, TextArea } from '@dreadnought/ui/react';
import type { FloatingPanelProps } from '@dreadnought/ui/react';

const meta = {
  title: 'Overlays/FloatingPanel',
  component: FloatingPanel,
  args: {
    title: 'Обратная связь',
    content: <TextArea aria-label="Сообщение" placeholder="Ваше сообщение" />,
    footer: (({ close }) => (
      <Button onClick={close}>Готово</Button>
    )) as FloatingPanelProps['footer'],
    children: (trigger) => <Button {...trigger}>Обратная связь</Button>,
  },
} satisfies Meta<typeof FloatingPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};
export const FourCorners: Story = {
  render: function Corners(args) {
    const [opened, setOpened] = useState<Record<string, boolean>>({});
    return (
      <>
        {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const).map((placement) => (
          <FloatingPanel
            {...args}
            key={placement}
            placement={placement}
            title={placement}
            open={opened[placement] ?? false}
            onOpenChange={(open) => setOpened((previous) => ({ ...previous, [placement]: open }))}
          >
            {(trigger) => <Button {...trigger}>{placement}</Button>}
          </FloatingPanel>
        ))}
      </>
    );
  },
};
export const LongContent: Story = {
  args: {
    defaultOpen: true,
    content: (
      <>
        <TextArea aria-label="Сообщение" />
        {Array.from({ length: 40 }, (_, i) => (
          <p key={i}>Строка {i + 1}. Прокручивается только содержимое панели.</p>
        ))}
      </>
    ),
  },
};
export const LongTitle: Story = {
  args: {
    defaultOpen: true,
    title: 'Очень длинный заголовок панели с названием раздела и пояснением назначения',
    children: (trigger) => (
      <Button {...trigger}>Открыть панель с очень длинным многострочным названием кнопки</Button>
    ),
  },
};
export const WithoutHeader: Story = {
  args: { title: undefined, closable: false, 'aria-label': 'Обратная связь' },
};
export const WithoutFooter: Story = { args: { footer: null } };
export const Controlled: Story = {
  render: function ControlledPanel(args) {
    const [open, setOpen] = useState(false);
    const [refuse, setRefuse] = useState(false);
    return (
      <>
        <label>
          <input
            type="checkbox"
            checked={refuse}
            onChange={(event) => setRefuse(event.target.checked)}
          />
          Не разрешать закрытие
        </label>
        <Button onClick={() => setOpen(false)}>Закрыть извне</Button>
        <FloatingPanel
          {...args}
          open={open}
          onOpenChange={(next) => {
            if (next || !refuse) setOpen(next);
          }}
        />
      </>
    );
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const NestedPopover: Story = {
  args: {
    content: (
      <Popover aria-label="Настройки" content="Вложенная панель">
        {(trigger) => <Button {...trigger}>Настройки</Button>}
      </Popover>
    ),
  },
};
export const ClippedParent: Story = {
  render: (args) => (
    <div style={{ transform: 'translateZ(0)', overflow: 'hidden', height: 80 }}>
      <FloatingPanel {...args} />
    </div>
  ),
};
