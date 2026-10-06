import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Tooltip } from '@dreadnought/ui/react';

const meta = { title: 'Overlays/Tooltip', component: Tooltip,
  argTypes: { openDelay: { control: { type: 'number', min: 0, step: 50 } }, closeDelay: { control: { type: 'number', min: 0, step: 50 } } },
  args: { content: 'Открывает настройки приложения', children: trigger => <Button {...trigger}>Настройки</Button> },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const LongContent: Story = { args: { content: 'Подсказка переносится на несколько строк и остаётся открытой, когда указатель находится над ней. Escape закрывает её.' } };
export const Placements: Story = { render: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: '4rem', padding: '6rem' }}>
  {(['topLeft', 'top', 'topRight', 'leftTop', 'left', 'leftBottom', 'rightTop', 'right', 'rightBottom', 'bottomLeft', 'bottom', 'bottomRight'] as const).map(placement =>
    <Tooltip key={placement} content={placement} placement={placement}>{trigger => <Button {...trigger}>{placement}</Button>}</Tooltip>)}
</div> };
export const WithoutArrow: Story = { args: { arrow: false } };
export const CenteredArrow: Story = { args: { placement: 'topLeft', arrow: { pointAtCenter: true } } };
export const WithoutDelay: Story = { args: { openDelay: 0, closeDelay: 0 } };
export const CustomDelays: Story = { args: { openDelay: 500, closeDelay: 250 } };
