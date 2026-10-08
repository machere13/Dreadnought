import { createRef } from 'react';
import { Pagination, type PaginationProps } from '@dreadnought/ui/react';

const props: PaginationProps = { total: 50, simple: true, ref: createRef<HTMLElement>() };
const example = (
  <Pagination
    {...props}
    onChange={(page, size) => {
      void [page, size];
    }}
  />
);
void example;
