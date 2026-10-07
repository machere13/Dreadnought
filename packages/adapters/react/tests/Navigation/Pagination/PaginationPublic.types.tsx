import { createRef } from 'react';
import { usePagination, type UsePaginationOptions, type UsePaginationResult } from '@dreadnought/react/logic';
import { PaginationAdapter, type PaginationAdapterProps, type PaginationSlotClassNames } from '@dreadnought/react/unstyled';

const options: UsePaginationOptions = { total: 50, defaultCurrent: 2 };
const slots: PaginationSlotClassNames = { button: 'button' };
const props: PaginationAdapterProps = { total: 50, simple: true, ref: createRef<HTMLElement>(), slotClassNames: slots };
function Example() {
  const state: UsePaginationResult = usePagination(options);
  return <PaginationAdapter {...props} current={state.current} onChange={state.changePage} />;
}
// @ts-expect-error Pagination owns its children.
const invalid = <PaginationAdapter total={1}>Custom</PaginationAdapter>;
void [Example, invalid];
