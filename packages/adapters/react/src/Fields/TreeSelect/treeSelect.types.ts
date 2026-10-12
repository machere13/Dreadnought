import type { TreeKey, VisibleTreeRow } from '@dreadnought/core';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { TooltipPlacement } from '@dreadnought/core';
import type { CheckboxAdapterProps } from '../Checkbox/CheckboxAdapter.tsx';

export type TreeSelectActionProps = ComponentPropsWithoutRef<'button'> & {
  action: 'expand' | 'toggle' | 'clear' | 'remove';
};
export type TreeSelectFieldProps = ComponentPropsWithRef<'input'>;
export type TreeSelectSlotClassNames = Partial<
  Record<
    | 'root'
    | 'field'
    | 'selection'
    | 'tag'
    | 'tagLabel'
    | 'popup'
    | 'viewport'
    | 'tree'
    | 'item'
    | 'content'
    | 'group'
    | 'indicator'
    | 'empty'
    | 'actions',
    string
  >
>;
export type TreeSelectAdapterProps<
  RecordType,
  Key extends TreeKey = TreeKey,
> = UseTreeSelectOptions<RecordType, Key> &
  Omit<
    ComponentPropsWithoutRef<'input'>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'multiple' | 'size' | 'children' | 'prefix'
  > & {
    ref?: Ref<HTMLInputElement>;
    placement?: Extract<TooltipPlacement, 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'>;
    autoAdjustOverflow?: boolean;
    emptyContent?: ReactNode;
    slotClassNames?: TreeSelectSlotClassNames;
    renderField?: (props: TreeSelectFieldProps) => ReactNode;
    renderAction?: (props: TreeSelectActionProps) => ReactNode;
    renderCheckbox?: (
      props: CheckboxAdapterProps,
      row: VisibleTreeRow<RecordType, Key>,
    ) => ReactNode;
    renderLabel?: (row: VisibleTreeRow<RecordType, Key>) => ReactNode;
    tagRender?: (
      tag: TreeSelectTag<RecordType, Key>,
      state: {
        disabled: boolean;
        onRemove(): void;
        removeLabel: string;
      },
    ) => ReactNode;
  };

export type TreeSelectValue<Key extends TreeKey> = Key | null | readonly Key[];
export type TreeSelectSelection<Key extends TreeKey> =
  | {
      multiple?: false;
      checkStrictly?: never;
      value?: Key | null;
      defaultValue?: Key | null;
      onValueChange?: (value: Key | null) => void;
    }
  | {
      multiple: true;
      checkStrictly?: boolean;
      value?: readonly Key[];
      defaultValue?: readonly Key[];
      onValueChange?: (value: Key[]) => void;
    };

export interface TreeSelectSearchOptions<RecordType> {
  searchValue?: string;
  defaultSearchValue?: string;
  onSearch?: (value: string) => void;
  filterNode?: (text: string, record: RecordType) => boolean;
}

export interface TreeSelectCommonOptions<RecordType, Key extends TreeKey> {
  records: readonly RecordType[];
  getKey(record: RecordType): Key;
  getChildren(record: RecordType): readonly RecordType[] | null | undefined;
  getLabel(record: RecordType): string;
  getDisabled?: (record: RecordType) => boolean;
  getCheckDisabled?: (record: RecordType) => boolean;
  getSelectable?: (record: RecordType) => boolean;
  expandedKeys?: readonly Key[];
  defaultExpandedKeys?: readonly Key[];
  onExpandedKeysChange?: (keys: Key[]) => void;
  showSearch?: boolean | TreeSelectSearchOptions<RecordType>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  allowClear?: boolean;
}

export type UseTreeSelectOptions<
  RecordType,
  Key extends TreeKey = TreeKey,
> = TreeSelectCommonOptions<RecordType, Key> & TreeSelectSelection<Key>;

export interface TreeSelectTag<RecordType, Key extends TreeKey = TreeKey> {
  key: Key;
  label: string;
  record: RecordType | undefined;
}

export interface UseTreeSelectResult<RecordType, Key extends TreeKey = TreeKey> {
  value: TreeSelectValue<Key>;
  values: readonly Key[];
  rows: readonly VisibleTreeRow<RecordType, Key>[];
  allRows: readonly VisibleTreeRow<RecordType, Key>[];
  includedKeys: readonly Key[];
  expandedKeys: readonly Key[];
  checkedKeys: readonly Key[];
  halfCheckedKeys: readonly Key[];
  tags: readonly TreeSelectTag<RecordType, Key>[];
  searchValue: string;
  open: boolean;
  multiple: boolean;
  checkStrictly: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  select(key: Key): void;
  check(key: Key, checked: boolean): void;
  remove(key: Key): void;
  clear(): void;
  reset(): void;
  setExpanded(key: Key, open: boolean): void;
  setSearch(text: string): void;
  setOpen(open: boolean): void;
}
