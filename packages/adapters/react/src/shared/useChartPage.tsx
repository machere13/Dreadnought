import { useState } from 'react';
import { paginateTableRows } from '@dreadnought/core';
import { ButtonAdapter } from '../Controls/Button/index.ts';
import { chartNativeProps, type ChartNative } from './chartNativeProps.ts';

export interface ChartPaginationSlots {
  pagination?: ChartNative<'nav', 'aria-label'>;
  paginationButton?: ChartNative<'button', 'type' | 'disabled' | 'aria-label'>;
  pageInput?: ChartNative<'input', 'type' | 'min' | 'max' | 'value' | 'aria-label'>;
}
export function useChartPage<T>(rows: readonly T[], pageSize: number) {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('Chart page size must be a positive integer');
  }
  const [state, setPage] = useState({ rows, page: 1 });
  const count = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = state.rows === rows ? Math.min(state.page, count) : 1;
  return {
    rows: paginateTableRows(rows, page, pageSize),
    page,
    count,
    change: (next: number) => {
      if (Number.isInteger(next) && next >= 1 && next <= count) {
        setPage({ rows, page: next });
      }
    },
  };
}
export function ChartPagination({
  page,
  count,
  change,
  slotProps,
}: {
  page: number;
  count: number;
  change: (page: number) => void;
  slotProps: ChartPaginationSlots;
}) {
  if (count <= 1) {
    return null;
  }
  const button = chartNativeProps(slotProps.paginationButton);
  const input = chartNativeProps(slotProps.pageInput);
  return (
    <nav
      {...chartNativeProps(slotProps.pagination)}
      aria-label="Страницы данных"
      data-ui="chart-pagination"
    >
      <ButtonAdapter
        {...button}
        type="button"
        disabled={page <= 1}
        aria-label="Предыдущая страница данных"
        onClick={(event) => {
          button.onClick?.(event);
          if (!event.defaultPrevented) {
            change(page - 1);
          }
        }}
      >
        Назад
      </ButtonAdapter>
      <input
        {...input}
        type="number"
        min={1}
        max={count}
        value={page}
        aria-label="Страница данных"
        onChange={(event) => {
          input.onChange?.(event);
          if (!event.defaultPrevented) {
            change(Number(event.currentTarget.value));
          }
        }}
      />
      <span>/ {count}</span>
      <ButtonAdapter
        {...button}
        type="button"
        disabled={page >= count}
        aria-label="Следующая страница данных"
        onClick={(event) => {
          button.onClick?.(event);
          if (!event.defaultPrevented) {
            change(page + 1);
          }
        }}
      >
        Далее
      </ButtonAdapter>
    </nav>
  );
}
