import { PaginationAdapter, type PaginationAdapterProps } from '@dreadnought/react/unstyled';
import { paginationPresentation } from '#presentation/Navigation/Pagination/paginationPresentation.ts';
import { Select } from '../../Fields/Select/index.ts';
import { Input } from '../../Fields/Input/index.ts';

export type PaginationProps = PaginationAdapterProps;

export function Pagination({ className, slotClassNames, slotProps, ...props }: PaginationProps) {
  const slots = {
    button: [paginationPresentation.button, slotClassNames?.button].filter(Boolean).join(' '),
    summary: [paginationPresentation.summary, slotClassNames?.summary].filter(Boolean).join(' '),
    ellipsis: [paginationPresentation.ellipsis, slotClassNames?.ellipsis].filter(Boolean).join(' '),
  };
  return (
    <PaginationAdapter
      {...props}
      slotClassNames={slots}
      slotProps={{
        renderSizeChanger: (selectProps) => <Select {...selectProps} controlSize="compact" />,
        renderQuickJumper: (inputProps) => <Input {...inputProps} controlSize="compact" />,
        ...slotProps,
      }}
      className={[paginationPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}
