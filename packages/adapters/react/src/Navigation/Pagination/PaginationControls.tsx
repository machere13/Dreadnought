import { useState } from 'react';
import type { ReactNode } from 'react';
import { InputAdapter } from '../../Fields/Input/InputAdapter.tsx';
import type { InputAdapterProps } from '../../Fields/Input/InputAdapter.tsx';
import { SelectAdapter } from '../../Fields/Select/SelectAdapter.tsx';
import type { SelectAdapterProps } from '../../Fields/Select/SelectAdapter.types.ts';
import type { UsePaginationResult } from './usePagination.ts';

export type PaginationControlSlots = {
  renderSizeChanger?: (props: SelectAdapterProps) => ReactNode;
  renderQuickJumper?: (props: InputAdapterProps) => ReactNode;
};

export type PaginationDisplayOptions = {
  showSizeChanger?: boolean;
  pageSizeOptions?: readonly number[];
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
};

export function PaginationControls({
  state,
  showSizeChanger,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper,
  slotProps,
}: Omit<PaginationDisplayOptions, 'showTotal'> & {
  state: UsePaginationResult;
  slotProps?: PaginationControlSlots;
}) {
  const [draft, setDraft] = useState('');
  const inputProps: InputAdapterProps = {
    'aria-label': 'Перейти на страницу',
    inputMode: 'numeric',
    value: draft,
    disabled: state.disabled,
    onChange: (event) => setDraft(event.currentTarget.value),
    onKeyDown: (event) => {
      if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
      event.preventDefault();
      const page = Number(draft.trim());
      if (state.disabled || !/^\d+$/.test(draft.trim()) || !Number.isSafeInteger(page) || page < 1)
        return;
      state.changePage(page);
      setDraft('');
    },
  };
  const sizes = [...new Set([...pageSizeOptions, state.pageSize])].sort((a, b) => a - b);
  if (showSizeChanger && sizes.some((size) => !Number.isSafeInteger(size) || size < 1)) {
    throw new RangeError('pageSizeOptions must contain positive safe integers.');
  }
  const selectProps: SelectAdapterProps = {
    'aria-label': 'Строк на странице',
    options: sizes.map((size) => ({ value: String(size), label: `${size} / стр.` })),
    value: String(state.pageSize),
    disabled: state.disabled,
    onValueChange: (value) => {
      if (value !== null) state.changePageSize(Number(value));
    },
  };
  return (
    <>
      {showSizeChanger && (
        <div data-slot="size-changer">
          {slotProps?.renderSizeChanger ? (
            slotProps.renderSizeChanger(selectProps)
          ) : (
            <SelectAdapter {...selectProps} />
          )}
        </div>
      )}
      {showQuickJumper && (
        <div data-slot="quick-jumper">
          {slotProps?.renderQuickJumper ? (
            slotProps.renderQuickJumper(inputProps)
          ) : (
            <InputAdapter {...inputProps} />
          )}
        </div>
      )}
    </>
  );
}
