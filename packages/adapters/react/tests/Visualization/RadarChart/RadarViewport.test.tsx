import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { RadarChartAdapter } from '../../../src/unstyled.ts';

const metrics = ['a', 'b', 'c'].map((id) => ({ id, label: id, domain: [0, 100] as const }));
const series = [{ id: 'A', label: 'A', values: { a: 100, b: 50, c: 0 } }];
const props = { label: 'Сравнение', metrics, series };
type Observer = { callback: ResizeObserverCallback; target?: Element; active: boolean };
let observers: Observer[];
beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      record: Observer;
      constructor(callback: ResizeObserverCallback) {
        this.record = { callback, active: true };
        observers.push(this.record);
      }
      observe(target: Element) {
        this.record.target = target;
      }
      disconnect() {
        this.record.active = false;
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function measure(width: number, observer = observers.at(-1)!) {
  act(() =>
    observer.callback(
      [{ target: observer.target, contentRect: { width } }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    ),
  );
}

it('measures only the plot width and preserves selection through zero width', () => {
  const { container } = render(<RadarChartAdapter {...props} />);
  expect(observers[0].target).toBe(container.querySelector('[data-ui="radar-plot-container"]'));
  expect(container.querySelector('svg')).toBeNull();
  measure(500);
  expect(container.querySelector('svg')?.getAttribute('height')).toBe('400');
  fireEvent.click(screen.getByRole('button', { name: 'A' }));
  measure(0);
  expect(container.querySelector('svg')).toBeNull();
  expect(screen.getByRole('table')).toBeTruthy();
  measure(250);
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('250');
  expect(container.querySelector('polygon[data-series-id]')).toBeNull();
});

it('rejects invalid measurements and keeps finite geometry at extreme widths', () => {
  const { container } = render(<RadarChartAdapter {...props} visibleSeries={[]} />);
  for (const width of [NaN, Infinity, -1, 0]) {
    measure(width);
    expect(container.querySelector('svg')).toBeNull();
  }
  measure(Number.MAX_VALUE);
  expect(Number(container.querySelector('svg')?.getAttribute('height'))).toBe(
    Number.MAX_VALUE * 0.8,
  );
  expect(container.querySelector('polygon[data-series-id]')).toBeNull();
});

it('disconnects old observers on mode changes and waits for fresh measurements', () => {
  const { container, rerender, unmount } = render(<RadarChartAdapter {...props} />);
  measure(500);
  const old = observers[0];
  rerender(<RadarChartAdapter {...props} width={400} height={320} />);
  expect(old.active).toBe(false);
  measure(900, old);
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('400');
  rerender(<RadarChartAdapter {...props} />);
  expect(container.querySelector('svg')).toBeNull();
  measure(200, old);
  expect(container.querySelector('svg')).toBeNull();
  measure(250);
  expect(container.querySelector('svg')?.getAttribute('height')).toBe('200');
  const current = observers.at(-1)!;
  unmount();
  measure(700, current);
  expect(current.active).toBe(false);
  expect(container.innerHTML).toBe('');
});

it('keeps one active StrictMode observer and composes consumer ref cleanup', () => {
  const cleaned = vi.fn();
  const attached = vi.fn(() => cleaned);
  const { container, unmount } = render(
    <StrictMode>
      <RadarChartAdapter {...props} slotProps={{ plotContainer: { ref: attached } }} />
    </StrictMode>,
  );
  expect(observers.filter((item) => item.active)).toHaveLength(1);
  const stale = observers.find((item) => !item.active)!;
  measure(800, stale);
  expect(container.querySelector('svg')).toBeNull();
  measure(500);
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('500');
  const calls = attached.mock.calls.length;
  measure(250);
  expect(attached.mock.calls).toHaveLength(calls);
  unmount();
  expect(observers.some((item) => item.active)).toBe(false);
  expect(cleaned).toHaveBeenCalledTimes(calls);
});

it('does not require ResizeObserver for data or fixed SVG', () => {
  vi.stubGlobal('ResizeObserver', undefined);
  const { container, rerender } = render(<RadarChartAdapter {...props} />);
  expect(container.querySelector('svg')).toBeNull();
  expect(screen.getByRole('table')).toBeTruthy();
  rerender(<RadarChartAdapter {...props} width={400} height={320} />);
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('400');
  expect(observers).toHaveLength(0);
});

it('hydrates the same adaptive markup and adds SVG only after measurement', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(<RadarChartAdapter {...props} />);
  const recovered = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <RadarChartAdapter {...props} />, {
      onRecoverableError: recovered,
    });
  });
  expect(recovered).not.toHaveBeenCalled();
  expect(container.querySelector('svg')).toBeNull();
  measure(500);
  expect(container.querySelector('svg')?.getAttribute('height')).toBe('400');
  act(() => root.unmount());
  container.remove();
});
