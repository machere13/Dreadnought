export interface TreemapLeaf {
  id: string;
  label: string;
  value: number;
  children?: never;
}
export interface TreemapGroup {
  id: string;
  label: string;
  children: readonly TreemapNode[];
  value?: never;
}
export type TreemapNode = TreemapLeaf | TreemapGroup;

export interface TreemapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface TreemapSummary {
  id: string;
  label: string;
  value: number;
  group: boolean;
  categoryIndex: number;
}
export interface TreemapItem extends TreemapSummary {
  rect: TreemapRect | null;
  share: number | null;
  totalShare: number | null;
  children: (TreemapSummary & { rect: TreemapRect | null })[];
}
export interface TreemapLayoutOptions {
  data: TreemapGroup;
  rootId?: string;
  width?: number;
  height?: number;
}
export interface TreemapLayout {
  root: TreemapSummary;
  path: TreemapSummary[];
  total: number;
  width: number;
  height: number;
  items: TreemapItem[];
}
