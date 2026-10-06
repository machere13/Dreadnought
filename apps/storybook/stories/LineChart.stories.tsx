import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart } from '@dreadnought/ui/react';

const series = [
  { id: 'a', label: 'Вариант A', data: [{ x: 0, y: 20 }, { x: 2, y: 45 }, { x: 4, y: 35 }, { x: 6, y: 70 }, { x: 8, y: 60 }, { x: 10, y: 85 }] },
  { id: 'b', label: 'Вариант B', data: [{ x: 0, y: 40 }, { x: 2, y: 30 }, { x: 4, y: 65 }, { x: 6, y: 50 }, { x: 8, y: 80 }, { x: 10, y: 70 }] },
];
const meta = { title: 'Visualization/LineChart', component: LineChart,
  args: { label: 'Измерения', series, xDomain: [0, 10], yDomain: [0, 100], xLabel: 'Время', yLabel: 'Значение' },
} satisfies Meta<typeof LineChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Adaptive: Story = {};
export const FixedSize: Story = { args: { width: 600, height: 320 } };
export const Gaps: Story = { args: { series: [{ ...series[0], data: series[0].data.map(point => ({ ...point, y: point.x === 4 ? null : point.y })) }, series[1]] } };
export const Empty: Story = { args: { series: [] } };
export const Negative: Story = { args: { yDomain: [-100, 100], series: [{ id: 'a', label: 'Баланс', data: [{ x: 0, y: -80 }, { x: 5, y: 0 }, { x: 10, y: 60 }] }] } };
export const LargeData: Story = { args: { label: '100 000 исходных точек', width: 600, height: 320, xDomain: [0, 99999], yDomain: [-100, 100],
  series: [{ id: 'a', label: 'Сигнал', data: Array.from({ length: 100000 }, (_, x) => ({ x, y: x % 15000 === 0 ? null : x === 43111 ? 100 : Math.sin(x / 1000) * 60 })) }] } };
