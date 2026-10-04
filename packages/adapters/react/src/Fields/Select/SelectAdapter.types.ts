import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';
import type { SelectOption } from '@dreadnought/core';

export type SelectAdapterProps = Omit<ComponentPropsWithRef<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'multiple' | 'children' | 'readOnly' | 'size'> & {
  options: readonly SelectOption[];
  searchable?: boolean;
  allowClear?: boolean;
  invalid?: boolean;
  emptyContent?: ReactNode;
  clearLabel?: string;
  indicator?: ReactNode;
  clearContent?: ReactNode;
  slotProps?: {
    root?: ComponentPropsWithoutRef<'div'>;
    control?: ComponentPropsWithoutRef<'input'>;
    popup?: ComponentPropsWithoutRef<'div'>;
    option?: ComponentPropsWithoutRef<'div'>;
    clear?: ComponentPropsWithoutRef<'button'>;
  };
} & (
  | { multiple?: false; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void }
  | { multiple: true; value?: readonly string[]; defaultValue?: readonly string[]; onValueChange?: (value: string[]) => void }
);
