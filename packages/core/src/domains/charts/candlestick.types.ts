export interface CandlestickDatum {
  id: string;
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
}
export interface CandlestickCandle extends CandlestickDatum {
  trend: 'up' | 'down' | 'flat';
  x: number;
  width: number;
  y: number;
  height: number;
  openY: number;
  closeY: number;
  highY: number;
  lowY: number;
}
export interface CandlestickLayoutOptions {
  data: readonly CandlestickDatum[];
  domain?: readonly [number, number];
  width?: number;
  height?: number;
}
export interface CandlestickLayout {
  candles: CandlestickCandle[];
  domain: readonly [number, number];
  width: number;
  height: number;
  ticks: { value: number; position: number }[];
}
