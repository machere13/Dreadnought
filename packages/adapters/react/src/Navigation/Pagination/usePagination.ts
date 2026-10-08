import { useState } from 'react';
import { getPaginationState } from '@dreadnought/core';
import type { PaginationState, PaginationStateOptions } from '@dreadnought/core';

export type UsePaginationOptions = Omit<PaginationStateOptions, 'current'> & {
  current?: number;
  defaultCurrent?: number;
  onChange?: (page: number, pageSize: number) => void;
};
export type UsePaginationResult = PaginationState & { changePage(page: number): void };

export function usePagination({
  total,
  current,
  defaultCurrent = 1,
  pageSize = 10,
  disabled = false,
  onChange,
}: UsePaginationOptions): UsePaginationResult {
  const [stored, setStored] = useState(defaultCurrent);
  const state = getPaginationState({ total, current: current ?? stored, pageSize, disabled });
  if (current === undefined && stored !== state.current) {
    setStored(state.current);
  }
  function changePage(candidate: number) {
    const next = getPaginationState({ total, current: candidate, pageSize, disabled }).current;
    if (disabled || next === state.current) {
      return;
    }
    if (current === undefined) {
      setStored(next);
    }
    onChange?.(next, pageSize);
  }
  return { ...state, changePage };
}
