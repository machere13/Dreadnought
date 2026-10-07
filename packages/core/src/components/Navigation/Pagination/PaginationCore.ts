export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

export interface PaginationStateOptions {
  total: number;
  current?: number;
  pageSize?: number;
  disabled?: boolean;
}

export interface PaginationState {
  total: number;
  current: number;
  pageSize: number;
  pageCount: number;
  offset: number;
  end: number;
  previous: number | undefined;
  next: number | undefined;
  items: PaginationItem[];
  disabled: boolean;
}
