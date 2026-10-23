export type WaterfallDatum = { id: string; label: string } & (
  { kind: 'start' | 'change'; value: number } | { kind: 'total'; value?: never }
);
export interface WaterfallStep {
  id: string;
  label: string;
  kind: WaterfallDatum['kind'];
  tone: 'positive' | 'negative' | 'neutral' | 'total';
  value: number;
  before: number;
  after: number;
  from: number;
  to: number;
  x: number;
  y: number;
  width: number;
  height: number;
  endY: number;
}
export interface WaterfallLayoutOptions {
  data: readonly WaterfallDatum[];
  domain?: readonly [number, number];
  width?: number;
  height?: number;
}
export interface WaterfallLayout {
  steps: WaterfallStep[];
  domain: readonly [number, number];
  width: number;
  height: number;
  baseline: number;
  total: number;
  ticks: { value: number; position: number }[];
}
