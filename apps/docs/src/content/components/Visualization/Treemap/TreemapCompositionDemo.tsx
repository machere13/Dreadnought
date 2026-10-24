import { Button, Treemap, useTreemap } from '@dreadnought/ui/react';

const data = {
  id: 'budget',
  label: 'Весь бюджет',
  children: [
    {
      id: 'product',
      label: 'Продукт',
      children: [
        { id: 'web', label: 'Веб-приложение', value: 30 },
        { id: 'api', label: 'API', value: 30 },
      ],
    },
    { id: 'marketing', label: 'Маркетинг', value: 30 },
    { id: 'operations', label: 'Поддержка', value: 10 },
    { id: 'reserve', label: 'Резерв', children: [] },
  ],
};

function Controls() {
  const { layout, page, navigate } = useTreemap();
  return (
    <>
      <p>
        Всего: {layout.total}. Таблица: страница {page.page} из {page.count}.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          size="compact"
          variant="secondary"
          disabled={layout.path.length === 1}
          onClick={() => navigate(layout.path[0].id)}
        >
          К общему бюджету
        </Button>
        <Button
          size="compact"
          variant="secondary"
          disabled={page.page === page.count}
          onClick={() => page.change(page.page + 1)}
        >
          Следующие строки
        </Button>
      </div>
    </>
  );
}

export function TreemapCompositionDemo() {
  return (
    <Treemap data={data} label="Плитки с долями и своими действиями" pageSize={2}>
      <Controls />
      <Treemap.Breadcrumb />
      <Treemap.Location />
      <Treemap.Plot
        tooltipContent={({ item, defaultContent }) => (
          <div>
            {defaultContent}
            <p>
              {item.group ? 'Нажмите, чтобы раскрыть группу' : 'Значение листа без агрегирования'}
            </p>
          </div>
        )}
      >
        {({ item, formatPercent, defaultContent }) => (
          <>
            {defaultContent}
            <span
              style={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                padding: '2px 6px',
                borderRadius: 6,
                background: 'var(--dreadnought-color-surface-popup)',
                color: 'var(--dreadnought-color-text-primary)',
                fontSize: 12,
              }}
            >
              {item.share === null ? '—' : formatPercent(item.share)}
            </span>
          </>
        )}
      </Treemap.Plot>
      <Treemap.Empty />
      <Treemap.Table />
      <Treemap.Pagination />
    </Treemap>
  );
}
