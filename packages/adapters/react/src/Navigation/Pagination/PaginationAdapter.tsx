import type { ComponentPropsWithRef } from 'react';
import { ButtonAdapter } from '../../Controls/Button/index.ts';
import { usePagination } from './usePagination.ts';
import type { UsePaginationOptions } from './usePagination.ts';

export type PaginationSlotClassNames = { button?: string; summary?: string; ellipsis?: string };
export type PaginationAdapterProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'onChange'> &
  UsePaginationOptions & {
    simple?: boolean;
    slotClassNames?: PaginationSlotClassNames;
  };

export function PaginationAdapter({
  total,
  current,
  defaultCurrent,
  pageSize,
  disabled,
  onChange,
  simple = false,
  slotClassNames,
  'aria-label': label = 'Пагинация',
  ...props
}: PaginationAdapterProps) {
  const state = usePagination({ total, current, defaultCurrent, pageSize, disabled, onChange });
  return (
    <nav {...props} aria-label={label}>
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
    </nav>
  );
}
