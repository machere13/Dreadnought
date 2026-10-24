import { Button, Sankey, useSankey } from '@dreadnought/ui/react';

const nodes = [
  { id: 'site', label: 'Сайт' },
  { id: 'order', label: 'Заказ' },
  { id: 'exit', label: 'Выход' },
];
const links = [
  { id: 'order-flow', source: 'site', target: 'order', value: 60 },
  { id: 'exit-flow', source: 'site', target: 'exit', value: 40 },
];

function Summary() {
  const { layout, page } = useSankey();
  return (
    <>
      <p>
        В графе: {layout.nodes.length} узла и {layout.links.length} потока. Таблица: страница{' '}
        {page.page} из {page.count}.
      </p>
      <Button
        size="compact"
        variant="secondary"
        style={{ justifySelf: 'start' }}
        disabled={page.page === page.count}
        onClick={() => page.change(page.page + 1)}
      >
        Следующие потоки
      </Button>
    </>
  );
}

export function SankeyCompositionDemo() {
  return (
    <Sankey nodes={nodes} links={links} label="Свои узлы и потоки" pageSize={1}>
      <Summary />
      <Sankey.Plot
        tooltipContent={({ item, defaultContent }) => (
          <div>
            {defaultContent}
            <p>
              {item.kind === 'node' ? 'Узел: входящие и исходящие' : 'Поток: точное значение связи'}
            </p>
          </div>
        )}
      >
        {({ item, width, height, path }) => (
          <>
            <svg
              width={width}
              height={height}
              aria-hidden="true"
              style={{ display: 'block', overflow: 'visible' }}
            >
              {item.kind === 'node' ? (
                <rect width={width} height={height} rx={6} fill="currentColor" />
              ) : (
                <path
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={item.width}
                  strokeOpacity={0.6}
                />
              )}
            </svg>
            {item.kind === 'node' && (
              <span
                data-ui="sankey-node-label"
                data-side={item.layer === 0 ? 'right' : 'left'}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 124,
                  ...(item.layer === 0
                    ? { left: 'calc(100% + 8px)' }
                    : { right: 'calc(100% + 8px)' }),
                }}
              >
                {item.label}
              </span>
            )}
          </>
        )}
      </Sankey.Plot>
      <Sankey.Table />
      <Sankey.Pagination />
      <Sankey.Empty />
    </Sankey>
  );
}
