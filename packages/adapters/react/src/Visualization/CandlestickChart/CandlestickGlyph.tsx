import type { CandlestickCandle } from '@dreadnought/core';

export function CandlestickGlyph({
  candle,
  height,
  value,
}: {
  candle: CandlestickCandle;
  height: number;
  value: string;
}) {
  const stroke = {
    stroke: 'currentColor',
    strokeWidth: 1.5,
    vectorEffect: 'non-scaling-stroke',
  } as const;
  return (
    <>
      <svg
        width="100%"
        height={height}
        viewBox="0 -2 100 104"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <line x1="50" x2="50" y1={candle.highY} y2={candle.y} {...stroke} />
        <line x1="50" x2="50" y1={candle.y + candle.height} y2={candle.lowY} {...stroke} />
        <rect
          x="20"
          width="60"
          y={candle.y}
          height={candle.height}
          fill={candle.trend === 'up' ? 'none' : 'currentColor'}
          {...stroke}
          data-ui="candlestick-body"
        />
        {candle.height === 0 && (
          <line
            x1="20"
            x2="80"
            y1={candle.y}
            y2={candle.y}
            {...stroke}
            data-ui="candlestick-doji"
          />
        )}
      </svg>
      <span data-ui="candlestick-candle-label">
        {candle.label}
        <span>{value}</span>
      </span>
    </>
  );
}
