import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { LineChartAdapter, BarChartAdapter, RadarChartAdapter } from '../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
  vi.unstubAllGlobals();
});

it('keeps adaptive radar labels at a readable scale in a narrow container', () => {
  let callback: ResizeObserverCallback;
  let target: Element;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(next: ResizeObserverCallback) {
        callback = next;
      }
      observe(element: Element) {
        target = element;
      }
      disconnect() {}
    },
  );
  const { container } = render(
    <RadarChartAdapter
      label="Quality"
      metrics={['a', 'b', 'c'].map((id) => ({ id, label: id, domain: [0, 100] as const }))}
      series={[{ id: 'one', label: 'One', values: { a: 20, b: 40, c: 60 } }]}
    />,
  );
  act(() =>
    callback(
      [{ target, contentRect: { width: 250 } }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    ),
  );
  const plot = container.querySelector('svg')!;
  expect(Number(plot.getAttribute('height'))).toBeGreaterThanOrEqual(280);
  expect(Number(plot.getAttribute('width'))).toBeGreaterThan(250);
  act(() =>
    callback(
      [{ target, contentRect: { width: 640 } }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    ),
  );
  expect(plot.getAttribute('width')).toBe('640');
});

function textBox(element: Element) {
  const width = (element.textContent?.length ?? 0) * 7;
  const x = Number(element.getAttribute('x'));
  const anchor = element.getAttribute('text-anchor');
  return {
    x: x - (anchor === 'end' ? width : anchor === 'middle' ? width / 2 : 0),
    y: 0,
    width,
    height: 12,
  };
}

it.each(['line', 'bar'] as const)(
  '%s reserves room for formatted values and avoids crowded ticks',
  (kind) => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: function (this: Element) {
        return textBox(this);
      },
    });
    const chart = (width: number) =>
      kind === 'line' ? (
        <LineChartAdapter
          label="Orders"
          width={width}
          height={300}
          xDomain={[1, 6]}
          yDomain={[0, 100]}
          formatX={(value) => `Day ${value}`}
          formatY={(value) => `${value} orders`}
          series={[
            {
              id: 'orders',
              label: 'Orders',
              data: [
                { x: 1, y: 20 },
                { x: 6, y: 100 },
              ],
            },
          ]}
        />
      ) : (
        <BarChartAdapter
          label="Orders"
          width={width}
          height={300}
          domain={[0, 100]}
          formatTick={(value) => `${value} orders`}
          categories={[
            { id: 'a', label: 'January' },
            { id: 'b', label: 'February' },
          ]}
          series={[{ id: 'orders', label: 'Orders', values: { a: 20, b: 100 } }]}
        />
      );
    const { container, rerender } = render(chart(250));
    const labels = () => [...container.querySelectorAll(`svg text[data-ui="${kind}-axis-label"]`)];
    const valueLabels = labels().filter((node) => node.textContent?.endsWith(' orders'));
    const group = valueLabels[0].parentElement!;
    const left = Number(group.getAttribute('transform')!.match(/translate\(([^ ]+)/)![1]);
    expect(valueLabels.every((node) => left + textBox(node).x >= 0)).toBe(true);
    const visibleTicks = () =>
      labels().filter(
        (node) =>
          node.textContent?.startsWith('Day ') && node.getAttribute('visibility') !== 'hidden',
      );
    if (kind === 'line') {
      const narrow = visibleTicks().map(textBox);
      expect(narrow.length).toBeGreaterThanOrEqual(2);
      expect(
        narrow.every((box, i) => i === 0 || box.x >= narrow[i - 1].x + narrow[i - 1].width + 8),
      ).toBe(true);
      rerender(chart(640));
      expect(visibleTicks().length).toBeGreaterThan(narrow.length);
    }
  },
);
