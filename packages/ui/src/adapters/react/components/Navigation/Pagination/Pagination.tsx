import { PaginationAdapter, type PaginationAdapterProps } from '@dreadnought/react/unstyled';
import { paginationPresentation } from '#presentation/Navigation/Pagination/paginationPresentation.ts';

export type PaginationProps = PaginationAdapterProps;

export function Pagination({ className, slotClassNames, ...props }: PaginationProps) {
  const slots = {
    button: [paginationPresentation.button, slotClassNames?.button].filter(Boolean).join(' '),
    summary: [paginationPresentation.summary, slotClassNames?.summary].filter(Boolean).join(' '),
    ellipsis: [paginationPresentation.ellipsis, slotClassNames?.ellipsis].filter(Boolean).join(' '),
  };
  return (
    <PaginationAdapter
      {...props}
      slotClassNames={slots}
      className={[paginationPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}
