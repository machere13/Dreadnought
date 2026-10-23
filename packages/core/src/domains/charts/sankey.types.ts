export interface SankeyNode {
  id: string;
  label: string;
}
export interface SankeyLink {
  id: string;
  source: string;
  target: string;
  value: number;
}
export interface SankeyLayoutOptions {
  nodes: readonly SankeyNode[];
  links: readonly SankeyLink[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodeGap?: number;
}
export interface SankeyNodeRect extends SankeyNode {
  kind: 'node';
  index: number;
  layer: number;
  incoming: number;
  outgoing: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface SankeyFlow extends SankeyLink {
  kind: 'link';
  sourceLabel: string;
  targetLabel: string;
  sourceIndex: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  width: number;
}
export type SankeyItem = SankeyNodeRect | SankeyFlow;
export interface SankeyLayout {
  nodes: SankeyNodeRect[];
  links: SankeyFlow[];
  width: number;
  height: number;
}
