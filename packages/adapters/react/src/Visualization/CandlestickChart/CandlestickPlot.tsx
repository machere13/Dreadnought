import { useRef, useState } from 'react';
import {
  getCollectionNavigation,
  type CandlestickLayout,
  type CandlestickCandle,
} from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { CandlestickCandleView } from './CandlestickCandleView.tsx';
import { CandlestickGlyph } from './CandlestickGlyph.tsx';
import type { CandlestickChartPlotProps } from './candlestickChart.types.ts';
import {
  CandlestickTooltip,
  candleDescription,
  type CandlestickStatisticsProps,
} from './CandlestickStatistics.tsx';

export function CandlestickPlot({
  layout,
  candles,
  height = 240,
  children,
  tooltipContent,
  ...statistics
}: CandlestickStatisticsProps &
  CandlestickChartPlotProps & { layout: CandlestickLayout; candles: CandlestickCandle[] }) {
  const { slotProps, formatValue } = statistics;
  const [tabStop, setTabStop] = useState<string>();
  const [open, setOpen] = useState<string | null>(null);
  const interaction = useRef<string | null>(null);
  const elements = useRef(new Map<string, HTMLSpanElement>());
  const candidates = candles.map((candle) => ({ value: candle.id }));
  const tabId = candidates.some((item) => item.value === tabStop) ? tabStop : candidates[0]?.value;
  return (
    <div {...native(slotProps.plot)} data-ui="candlestick-plot">
      <div data-ui="candlestick-axis" aria-hidden="true" style={{ height }}>
        {layout.ticks.map((tick, index) => (
          <span key={index} style={{ top: `${((tick.position + 2) / 104) * 100}%` }}>
            {formatValue(tick.value)}
          </span>
        ))}
      </div>
      <div data-ui="candlestick-scroll">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${candles.length}, minmax(5rem, 1fr))`,
          }}
        >
          {candles.map((candle) => {
            const context = { candle, height, labels: statistics.labels, formatValue };
            const defaultContent = (
              <CandlestickGlyph candle={candle} height={height} value={formatValue(candle.close)} />
            );
            const defaultTooltip = <CandlestickTooltip candle={candle} {...statistics} />;
            const content = tooltipContent
              ? tooltipContent({ ...context, defaultContent: defaultTooltip })
              : defaultTooltip;
            const disabled = content === null || content === undefined || content === false;
            return (
              <CandlestickCandleView
                key={candle.id}
                candle={candle}
                children={children ? children({ ...context, defaultContent }) : defaultContent}
                description={candleDescription(candle, statistics)}
                tabIndex={tabId === candle.id ? 0 : -1}
                slotProps={slotProps}
                elements={elements}
                activate={() => {
                  interaction.current = candle.id;
                }}
                focus={() => setTabStop(candle.id)}
                navigate={(key) => {
                  const next = getCollectionNavigation(candidates, candle.id, key, {
                    orientation: 'horizontal',
                    loop: false,
                  });
                  if (next === undefined) return false;
                  elements.current.get(next)?.focus();
                  return true;
                }}
                tooltip={{
                  ...native(slotProps.tooltip, ['ref']),
                  content,
                  disabled,
                  open: !disabled && open === candle.id,
                  onOpenChange: (next) => {
                    if (next && interaction.current !== candle.id) return;
                    setOpen((current) =>
                      next ? candle.id : current === candle.id ? null : current,
                    );
                  },
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
