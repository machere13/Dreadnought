import { getVisibleTreeRows } from '@dreadnought/core';
import type { TreeKey, VisibleTreeRow, VisibleTreeRowsOptions } from '@dreadnought/core';

type Folder = { id: number; name: string; children?: readonly Folder[] };
const records: readonly Folder[] = [{ id: 0, name: 'Documents' }];
const options: VisibleTreeRowsOptions<Folder, number> = { getKey: n => n.id, getChildren: n => n.children, expandedKeys: [0] };
const rows: VisibleTreeRow<Folder, number>[] = getVisibleTreeRows(records, options);
const key: number = rows[0].key;
const name: string = rows[0].record.name;
const parent: number | null = rows[0].parentKey;
const inferred = getVisibleTreeRows(records, { getKey: n => n.id, getChildren: n => n.children });
const inferredKey: number = inferred[0].key;
const treeKey: TreeKey = 'root';
// @ts-expect-error Object identifiers are not tree keys.
getVisibleTreeRows(records, { getKey: n => ({ id: n.id }), getChildren: n => n.children });
// @ts-expect-error Children must contain Folder records.
getVisibleTreeRows(records, { getKey: n => n.id, getChildren: () => [1] });
void [rows, key, name, parent, inferredKey, treeKey];
