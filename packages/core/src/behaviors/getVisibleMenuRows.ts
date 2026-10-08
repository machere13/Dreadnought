import { getTreeRows } from './getVisibleTreeRows.ts';
import type { VisibleTreeRow, VisibleTreeRowsOptions } from './getVisibleTreeRows.ts';

export type MenuRowKind = 'item' | 'submenu' | 'group' | 'divider';
export interface VisibleMenuRow<RecordType> extends VisibleTreeRow<RecordType, string> {
  kind: MenuRowKind;
  disabled: boolean;
}
export interface VisibleMenuRowsOptions<RecordType> extends VisibleTreeRowsOptions<
  RecordType,
  string
> {
  getKind: (record: RecordType) => MenuRowKind;
  getDisabled?: (record: RecordType) => boolean;
}

export function getVisibleMenuRows<RecordType>(
  records: readonly RecordType[],
  options: VisibleMenuRowsOptions<RecordType>,
): VisibleMenuRow<RecordType>[] {
  const seen = new Set<string>();
  const all = getTreeRows(
    records,
    {
      ...options,
      getKey: (record) => {
        const key = options.getKey(record);
        if (typeof key !== 'string' || !key || seen.has(key)) {
          throw new TypeError('Menu item values must be nonempty and unique.');
        }
        seen.add(key);
        return key;
      },
    },
    true,
  );
  const parents = new Map<string, { visible: boolean; expanded: boolean; disabled: boolean }>();
  const rows: VisibleMenuRow<RecordType>[] = [];
  for (const row of all) {
    const kind = options.getKind(row.record);
    if (!['item', 'submenu', 'group', 'divider'].includes(kind)) {
      throw new TypeError('Invalid Menu row kind.');
    }
    if (row.expandable && (kind === 'item' || kind === 'divider')) {
      throw new TypeError('Menu items and dividers cannot have children.');
    }
    const parent = row.parentKey === null ? undefined : parents.get(row.parentKey);
    const visible = !parent || (parent.visible && parent.expanded);
    const expanded = kind === 'group' || (kind === 'submenu' && row.expanded);
    const disabled = Boolean(parent?.disabled || options.getDisabled?.(row.record));
    parents.set(row.key, { visible, expanded, disabled });
    if (visible) {
      rows.push({ ...row, kind, expanded, disabled });
    }
  }
  return rows;
}
