import type { TreeKey, VisibleTreeRow } from '@dreadnought/core';

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
