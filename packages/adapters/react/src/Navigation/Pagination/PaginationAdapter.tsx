import type { ComponentPropsWithRef } from 'react';
import { ButtonAdapter } from '../../Controls/Button/ButtonAdapter.tsx';
import { usePagination } from './usePagination.ts';
import type { UsePaginationOptions } from './usePagination.ts';
import { PaginationControls } from './PaginationControls.tsx';
import type { PaginationControlSlots, PaginationDisplayOptions } from './PaginationControls.tsx';

export type { PaginationControlSlots, PaginationDisplayOptions } from './PaginationControls.tsx';

export type PaginationSlotClassNames = { button?: string; summary?: string; ellipsis?: string };
export type PaginationAdapterProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'onChange'> &
  UsePaginationOptions &
  PaginationDisplayOptions & {
    simple?: boolean;
    slotClassNames?: PaginationSlotClassNames;
    slotProps?: PaginationControlSlots;
  };

export function PaginationAdapter({
  total,
  current,
  defaultCurrent,
  pageSize,
  defaultPageSize,
  disabled,
  onChange,
  simple = false,
  slotClassNames,
  slotProps,
  showSizeChanger = false,
  pageSizeOptions,
  showQuickJumper = false,
  showTotal = false,
  'aria-label': label = 'Пагинация',
  ...props
}: PaginationAdapterProps) {
  const state = usePagination({
    total,
    current,
    defaultCurrent,
    pageSize,
    defaultPageSize,
    disabled,
    onChange,
  });
  const range: [number, number] = [total === 0 ? 0 : state.offset + 1, state.end];
  return (
    <nav {...props} aria-label={label}>
      {showTotal && (
        <span data-slot="total" className={slotClassNames?.summary}>
          {typeof showTotal === 'function'
            ? showTotal(total, range)
            : `${range[0]}–${range[1]} из ${total}`}
        </span>
      )}
      <ButtonAdapter
        type="button"
        className={slotClassNames?.button}
        aria-label="Предыдущая страница"
        disabled={state.previous === undefined}
        onClick={() => state.changePage(state.previous!)}
      >
        ‹
      </ButtonAdapter>
      {simple ? (
        <span className={slotClassNames?.summary}>
          {state.current} / {state.pageCount}
        </span>
      ) : (
        state.items.map((item) =>
          typeof item === 'number' ? (
            <ButtonAdapter
              key={item}
              type="button"
              className={slotClassNames?.button}
              disabled={state.disabled}
              aria-label={`Страница ${item}`}
              aria-current={item === state.current ? 'page' : undefined}
              onClick={() => state.changePage(item)}
            >
              {item}
            </ButtonAdapter>
          ) : (
            <span key={item} aria-hidden="true" className={slotClassNames?.ellipsis}>
              …
            </span>
          ),
        )
      )}
      <ButtonAdapter
        type="button"
        className={slotClassNames?.button}
        aria-label="Следующая страница"
        disabled={state.next === undefined}
        onClick={() => state.changePage(state.next!)}
      >
        ›
      </ButtonAdapter>
      <PaginationControls
        state={state}
        showSizeChanger={showSizeChanger}
        pageSizeOptions={pageSizeOptions}
        showQuickJumper={showQuickJumper}
        slotProps={slotProps}
      />
    </nav>
  );
}
