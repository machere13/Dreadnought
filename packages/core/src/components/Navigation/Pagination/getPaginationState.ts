import type { PaginationItem, PaginationState, PaginationStateOptions } from './PaginationCore.ts';

export function getPaginationState({
  total,
  current = 1,
  pageSize = 10,
  disabled = false,
}: PaginationStateOptions): PaginationState {
  for (const [name, value, minimum] of [
    ['total', total, 0],
    ['current', current, 1],
    ['pageSize', pageSize, 1],
  ] as const) {
    if (!Number.isSafeInteger(value) || value < minimum) {
      throw new RangeError(`Pagination ${name} must be a safe integer >= ${minimum}.`);
    }
  }
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(current, pageCount);
  const offset = (page - 1) * pageSize;
  const end = offset + Math.min(pageSize, total - offset);
  const items: PaginationItem[] = [];
  if (pageCount <= 7) {
    for (let number = 1; number <= pageCount; number++) {
      items.push(number);
    }
  } else {
    const start = Math.min(Math.max(page - 2, 1), pageCount - 4);
    const finish = start + 4;
    if (start > 1) {
      items.push(1);
    }
    if (start === 3) {
      items.push(2);
    } else if (start > 3) {
      items.push('ellipsis-start');
    }
    for (let number = start; number <= finish; number++) {
      items.push(number);
    }
    if (finish === pageCount - 2) {
      items.push(pageCount - 1);
    } else if (finish < pageCount - 2) {
      items.push('ellipsis-end');
    }
    if (finish < pageCount) {
      items.push(pageCount);
    }
  }
  return {
    total,
    current: page,
    pageSize,
    pageCount,
    offset,
    end,
    items,
    disabled,
    previous: !disabled && page > 1 ? page - 1 : undefined,
    next: !disabled && page < pageCount ? page + 1 : undefined,
  };
}
