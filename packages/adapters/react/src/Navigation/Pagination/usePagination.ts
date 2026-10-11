import { useState } from 'react';
import { getPaginationState } from '@dreadnought/core';
import type { PaginationState, PaginationStateOptions } from '@dreadnought/core';

export type UsePaginationOptions = Omit<PaginationStateOptions, 'current'> & {
  current?: number;
  defaultCurrent?: number;
  defaultPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
};
export type UsePaginationResult = PaginationState & {
  changePage(page: number): void;
  changePageSize(pageSize: number): void;
};

export function usePagination({
  total,
  current,
  defaultCurrent = 1,
  pageSize: controlledPageSize,
  defaultPageSize = 10,
  disabled = false,
  onChange,
}: UsePaginationOptions): UsePaginationResult {
  const [stored, setStored] = useState(defaultCurrent);
  const [storedSize, setStoredSize] = useState(defaultPageSize);
  const pageSize = controlledPageSize ?? storedSize;
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
  function changePageSize(candidate: number) {
    getPaginationState({ total, pageSize: candidate });
    if (disabled || candidate === pageSize) {
      return;
    }
    if (controlledPageSize === undefined) {
      setStoredSize(candidate);
    }
    if (current === undefined) {
      setStored(1);
    }
    onChange?.(1, candidate);
  }
  return { ...state, changePage, changePageSize };
}
