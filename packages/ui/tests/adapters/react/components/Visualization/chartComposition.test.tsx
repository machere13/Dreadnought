import { type ComponentType, type ReactNode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import * as adapters from '@dreadnought/react/unstyled';
import * as ui from '@dreadnought/ui/react';

afterEach(cleanup);

const series = [
  { id: 'a', label: 'Alpha', data: [{ id: 'one', label: 'One', x: 1, y: 2 }], values: { x: 2 } },
  { id: 'b', label: 'Beta', data: [{ id: 'two', label: 'Two', x: 3, y: 4 }], values: { x: 4 } },
];
const dimensions = { width: 400, height: 320 };
const domains = { xDomain: [0, 10], yDomain: [0, 10] };
const fixtures = {
  LineChart: { ...dimensions, ...domains, series },
  BarChart: { ...dimensions, categories: [{ id: 'x', label: 'X' }], domain: [0, 10], series },
  PieChart: {
    ...dimensions,
    data: [
      { id: 'a', label: 'Alpha', value: 2 },
      { id: 'b', label: 'Beta', value: 4 },
    ],
  },
  ScatterChart: { ...dimensions, ...domains, series },
  Histogram: { ...dimensions, data: [0, 1, 2, 3, 4], bins: 2 },
  BoxPlot: { data: [{ id: 'a', label: 'Alpha', values: [1, 2, 3, 4, 20] }] },
  FunnelChart: {
    data: [
      { id: 'a', label: 'Alpha', value: 100 },
      { id: 'b', label: 'Beta', value: 50 },
    ],
  },
  Treemap: {
    data: {
      id: 'root',
      label: 'Root',
      children: [
        { id: 'a', label: 'Alpha', value: 2 },
        { id: 'b', label: 'Beta', value: 4 },
      ],
    },
  },
  WaterfallChart: {
    data: [
      { id: 'a', label: 'Alpha', kind: 'start', value: 100 },
      { id: 'b', label: 'Beta', kind: 'change', value: -20 },
    ],
  },
  Sankey: {
    nodes: [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ],
    links: [{ id: 'ab', source: 'a', target: 'b', value: 10 }],
  },
  Gauge: { value: 50 },
  RadarChart: {
    ...dimensions,
    metrics: ['x', 'y', 'z'].map((id) => ({ id, label: id, domain: [0, 10] })),
    series: [{ id: 'a', label: 'Alpha', values: { x: 2, y: 4, z: 6 } }],
  },
  Heatmap: {
    columns: [{ id: 'x', label: 'X' }],
    rows: [{ id: 'y', label: 'Y' }],
    data: [{ column: 'x', row: 'y', value: 10 }],
  },
  CandlestickChart: {
    data: [{ id: 'a', label: 'Alpha', open: 100, high: 120, low: 90, close: 110 }],
  },
};
type Name = keyof typeof fixtures;
type Renderer = (context: { defaultContent: ReactNode }) => ReactNode;
type Chart = ComponentType<Record<string, unknown>> & {
  Plot: ComponentType<{ children?: Renderer; tooltipContent?: Renderer }>;
  Table?: ComponentType;
  Legend?: ComponentType;
  Pagination?: ComponentType;
  Empty?: ComponentType;
};
const names = Object.keys(fixtures) as Name[];
const parts = {
  LineChart: ['Plot', 'Legend', 'Table', 'Pagination', 'Empty', 'RangeControls'],
  BarChart: ['Plot', 'Legend', 'Table', 'Pagination', 'Empty'],
  PieChart: ['Plot', 'Legend', 'Table', 'Empty'],
  ScatterChart: ['Plot', 'Legend', 'Table', 'Pagination', 'Empty'],
  Histogram: ['Plot', 'Table', 'Pagination', 'Empty'],
  BoxPlot: ['Plot', 'Axis', 'Table', 'Pagination', 'Empty'],
  FunnelChart: ['Plot', 'Table', 'Pagination', 'Empty'],
  Treemap: ['Plot', 'Breadcrumb', 'Location', 'Table', 'Pagination', 'Empty'],
  WaterfallChart: ['Plot', 'Table', 'Pagination', 'Empty'],
  Sankey: ['Plot', 'Table', 'Pagination', 'Empty'],
  Gauge: ['Plot', 'Legend'],
  RadarChart: ['Plot', 'Legend', 'Table'],
  Heatmap: ['Plot', 'Legend', 'Table', 'Pagination', 'Empty'],
  CandlestickChart: ['Plot', 'Table', 'Pagination', 'Empty'],
} satisfies Record<Name, readonly string[]>;

for (const [layer, exports] of [
  ['adapter', adapters],
  ['ui', ui],
] as const) {
  const chart = (name: Name) =>
    (exports as unknown as Record<string, Chart>)[layer === 'adapter' ? `${name}Adapter` : name];
  describe(`${layer} chart composition contract`, () => {
    for (const name of names) {
      const Root = chart(name);
      const props = { ...fixtures[name], label: name };
      it(`${name} retains native targets, focus, tooltips and tables with a custom drawing`, () => {
        for (const part of parts[name]) {
          expect((Root as unknown as Record<string, unknown>)[part]).toBeTypeOf('function');
        }
        render(
          <Root {...props}>
            <Root.Plot
              tooltipContent={({ defaultContent }) => <div>Custom details{defaultContent}</div>}
            >
              {() => (
                <svg width="20" height="20" data-testid="custom-drawing">
                  <circle cx="10" cy="10" r="8" />
                </svg>
              )}
            </Root.Plot>
            {Root.Table && <Root.Table />}
            {Root.Legend && <Root.Legend />}
            {Root.Pagination && <Root.Pagination />}
            {Root.Empty && <Root.Empty />}
          </Root>,
        );
        const target = screen.getAllByRole('img')[0];
        expect(screen.getAllByTestId('custom-drawing').length).toBeGreaterThan(0);
        expect(target.getAttribute('aria-label')).toBeTruthy();
        act(() => target.focus());
        expect(document.activeElement).toBe(target);
        expect(screen.getByRole('tooltip').textContent).toContain('Custom details');
        fireEvent.keyDown(target, { key: 'Escape' });
        expect(screen.queryByRole('tooltip')).toBeNull();
        if (Root.Table) expect(screen.getAllByRole('table').length).toBeGreaterThan(0);
      });
      it(`${name} shares its root context with consumer components in either layer`, () => {
        const useChart = (exports as unknown as Record<string, () => { label: string }>)[
          `use${name}`
        ];
        function Summary() {
          return <output>{useChart().label}</output>;
        }
        render(
          <Root {...props}>
            <Summary />
          </Root>,
        );
        expect(screen.getByRole('status').textContent).toBe(name);
      });
      it(`${name} can omit every part without dropping its accessible caption`, () => {
        render(<Root {...props}>{null}</Root>);
        expect(screen.getByRole('figure', { name })).toBeTruthy();
        expect(screen.queryByRole('img')).toBeNull();
        expect(screen.queryByRole('table')).toBeNull();
      });
      it(`${name} suppresses a null custom tooltip without losing focus`, () => {
        render(
          <Root {...props}>
            <Root.Plot tooltipContent={() => null} />
          </Root>,
        );
        const target = screen.getAllByRole('img')[0];
        act(() => target.focus());
        expect(document.activeElement).toBe(target);
        expect(screen.queryByRole('tooltip')).toBeNull();
      });
    }
    for (const name of ['PieChart', 'CandlestickChart'] as const) {
      it(`${name} exposes empty content separately from its plot`, () => {
        const Root = chart(name);
        expect(Root.Empty).toBeTypeOf('function');
        const Empty = Root.Empty!;
        const props = {
          ...fixtures[name],
          data: [],
          label: name,
          labels: { empty: 'Empty chart' },
        };
        const view = render(
          <Root {...props}>
            <Root.Plot />
          </Root>,
        );
        expect(screen.queryByText('Empty chart')).toBeNull();
        view.rerender(
          <Root {...props}>
            <Empty />
          </Root>,
        );
        expect(screen.getByText('Empty chart')).toBeTruthy();
        view.rerender(<Root {...props} />);
        expect(screen.getAllByText('Empty chart')).toHaveLength(1);
      });
    }
    for (const name of ['LineChart', 'BarChart', 'PieChart', 'ScatterChart'] as const) {
      it(`${name} opens on the first focus after its previous active item disappears`, () => {
        const Root = chart(name);
        const props = { ...fixtures[name], label: name };
        const visibility = name === 'PieChart' ? 'visibleItems' : 'visibleSeries';
        const view = render(
          <Root {...props}>
            <Root.Plot>{({ defaultContent }) => defaultContent}</Root.Plot>
          </Root>,
        );
        const first = screen.getAllByRole('img')[0];
        act(() => first.focus());
        expect(screen.getByRole('tooltip')).toBeTruthy();
        fireEvent.keyDown(first, { key: 'Escape' });
        view.rerender(
          <Root {...props} {...{ [visibility]: ['b'] }}>
            <Root.Plot>{({ defaultContent }) => defaultContent}</Root.Plot>
          </Root>,
        );
        const next = screen.getAllByRole('img')[0];
        expect(next.getAttribute('aria-label')).toContain('Beta');
        act(() => next.focus());
        expect(screen.getByRole('tooltip')).toBeTruthy();
      });
      it(`${name} does not resurrect a tooltip when a hidden active item returns`, () => {
        const Root = chart(name);
        const props = { ...fixtures[name], label: name };
        const visibility = name === 'PieChart' ? 'visibleItems' : 'visibleSeries';
        const view = render(
          <Root {...props}>
            <Root.Plot />
          </Root>,
        );
        act(() => screen.getAllByRole('img')[0].focus());
        expect(screen.getByRole('tooltip')).toBeTruthy();
        view.rerender(
          <Root {...props} {...{ [visibility]: ['b'] }}>
            <Root.Plot />
          </Root>,
        );
        expect(screen.queryByRole('tooltip')).toBeNull();
        view.rerender(
          <Root {...props} {...{ [visibility]: ['a', 'b'] }}>
            <Root.Plot />
          </Root>,
        );
        expect(screen.queryByRole('tooltip')).toBeNull();
      });
    }
  });
}
