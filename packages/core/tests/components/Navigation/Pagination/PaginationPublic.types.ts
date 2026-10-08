import {
  getPaginationState,
  type PaginationItem,
  type PaginationState,
  type PaginationStateOptions,
} from '@dreadnought/core';

const options: PaginationStateOptions = { total: 30 };
const state: PaginationState = getPaginationState(options);
const item: PaginationItem = state.items[0]!;
void item;
