import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';
import type { SelectOption, SelectCoreOptions } from '@dreadnought/core';

export type SelectAdapterProps = Omit<
  ComponentPropsWithRef<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'multiple' | 'children' | 'readOnly' | 'size'
> & {
  options: SelectCoreOptions['options'];
  searchable?: boolean;
  showSearch?:
    | boolean
    | (Pick<SelectCoreOptions, 'filterOption' | 'optionFilterProp' | 'filterSort'> & {
        searchValue?: string;
        onSearch?: (value: string) => void;
      });
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearch?: (value: string) => void;
  filterOption?: SelectCoreOptions['filterOption'];
  loading?: boolean;
  loadingContent?: ReactNode;
  optionRender?: (
    option: SelectOption,
    state: { active: boolean; selected: boolean; index: number },
  ) => ReactNode;
  allowClear?: boolean;
  invalid?: boolean;
  emptyContent?: ReactNode;
  clearLabel?: string;
  indicator?: ReactNode;
  clearContent?: ReactNode;
  removeLabel?: (option: SelectOption) => string;
  removeContent?: ReactNode;
  maxTagCount?: number;
  maxCount?: number;
  tagRender?: (
    option: SelectOption,
    state: { disabled: boolean; removeLabel: string; onRemove: () => void },
  ) => ReactNode;
  slotProps?: {
    root?: ComponentPropsWithoutRef<'div'>;
    control?: ComponentPropsWithoutRef<'input'>;
    popup?: ComponentPropsWithoutRef<'div'>;
    option?: ComponentPropsWithoutRef<'div'>;
    group?: ComponentPropsWithoutRef<'div'>;
    groupLabel?: ComponentPropsWithoutRef<'div'>;
    clear?: ComponentPropsWithoutRef<'button'>;
    selection?: ComponentPropsWithoutRef<'div'>;
    tag?: ComponentPropsWithoutRef<'span'>;
    tagLabel?: ComponentPropsWithoutRef<'span'>;
    remove?: ComponentPropsWithoutRef<'button'>;
  };
} & (
    | {
        multiple?: false;
        value?: string | null;
        defaultValue?: string | null;
        onValueChange?: (value: string | null) => void;
      }
    | {
        multiple: true;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onValueChange?: (value: string[]) => void;
      }
  );
