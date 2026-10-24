import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(cleanup);
const thresholds = [
  { id: 'normal', label: 'Норма', to: 60 },
  { id: 'warning', label: 'Внимание', to: 100 },
];

it('shares the reading with custom drawing and legend while preserving focus on updates', () => {
  const Gauge = adapters.GaugeAdapter;
  function Reading() {
    const { layout, active } = adapters.useGauge();
    return (
      <output>
        {layout.value}:{active?.id}
      </output>
    );
  }
  const view = (value: number | null) => (
    <Gauge value={value} label="Custom" thresholds={thresholds}>
      <Reading />
      <Gauge.Legend>{({ segment }) => <b>{segment.id}</b>}</Gauge.Legend>
      <Gauge.Plot tooltipContent={({ defaultContent }) => <div>Details{defaultContent}</div>}>
        {({ layout, defaultContent }) => (
          <div data-testid="drawing">
            {layout.ratio}
            {defaultContent}
          </div>
        )}
      </Gauge.Plot>
    </Gauge>
  );
  const { rerender } = render(view(50));
  const plot = screen.getByRole('img');
  act(() => plot.focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Details');
  expect(screen.getByTestId('drawing').textContent).toContain('0.5');
  rerender(view(90));
  expect(document.activeElement).toBe(plot);
  expect(screen.getByRole('status').textContent).toBe('90:warning');
  expect(screen.getByRole('tooltip').textContent).toContain('Значение90');
  expect(screen.getByRole('listitem', { current: true }).textContent).toContain('warning');
  fireEvent.keyDown(plot, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(view(null));
  expect(plot.tabIndex).toBe(-1);
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('allows omitting default parts and disabling a custom tooltip', () => {
  const Gauge = adapters.GaugeAdapter;
  const { rerender } = render(<Gauge value={50} label="Custom" children={null} />);
  expect(screen.queryByRole('img')).toBeNull();
  rerender(
    <Gauge value={50} label="Custom">
      <Gauge.Plot tooltipContent={() => null} />
    </Gauge>,
  );
  act(() => screen.getByRole('img').focus());
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(() => render(<Gauge.Legend />)).toThrow('inside Gauge');
});

it('exposes the value, range, current status and a keyboard tooltip', () => {
  render(
    <adapters.GaugeAdapter
      value={72}
      label="Загрузка"
      thresholds={thresholds}
      formatValue={(v) => `${v}%`}
    />,
  );
  const plot = screen.getByRole('img', { name: 'Загрузка: 72%; 0% — 100%; Внимание' });
  act(() => plot.focus());
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toContain('Значение72%');
  expect(tooltip.textContent).toContain('Минимум0%');
  expect(tooltip.textContent).toContain('СостояниеВнимание');
  expect(screen.getByRole('list', { name: 'Диапазоны' }).textContent).toContain('Норма');
  fireEvent.keyDown(plot, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('updates a focused reading in place and closes its tooltip when the value becomes missing', () => {
  const { rerender, container } = render(
    <adapters.GaugeAdapter value={50} label="Загрузка" thresholds={thresholds} />,
  );
  const plot = screen.getByRole('img');
  act(() => plot.focus());
  rerender(
    <adapters.GaugeAdapter value={90} label="Загрузка" thresholds={thresholds} variant="circle" />,
  );
  expect(document.activeElement).toBe(plot);
  expect(screen.getByRole('tooltip').textContent).toContain('Значение90');
  expect(screen.getByRole('tooltip').textContent).toContain('СостояниеВнимание');
  rerender(<adapters.GaugeAdapter value={null} label="Загрузка" thresholds={thresholds} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(container.querySelector('[data-ui="gauge-needle"]')).toBeNull();
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('preserves slot refs and lets the consumer cancel Escape', () => {
  let element: HTMLSpanElement | null = null;
  render(
    <adapters.GaugeAdapter
      value={50}
      label="План"
      slotProps={{
        plot: {
          ref: (e) => {
            element = e;
          },
          onKeyDown: (e) => e.preventDefault(),
        },
      }}
    />,
  );
  expect(element).toBe(screen.getByRole('img'));
  act(() => element?.focus());
  fireEvent.keyDown(screen.getByRole('img'), { key: 'Escape' });
  expect(screen.getByRole('tooltip')).toBeTruthy();
});

it('does not resurrect a tooltip when data returns after focus left the missing reading', () => {
  const { rerender } = render(<adapters.GaugeAdapter value={50} label="План" />);
  const plot = screen.getByRole('img');
  act(() => plot.focus());
  rerender(<adapters.GaugeAdapter value={null} label="План" />);
  act(() => plot.blur());
  rerender(<adapters.GaugeAdapter value={60} label="План" />);
  expect(screen.queryByRole('tooltip')).toBeNull();
});
