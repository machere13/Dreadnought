import { useRef, useState } from 'react';
import { getCollectionNavigation, type HeatmapLayout } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { MarkAdapter } from '../../DataDisplay/Mark/MarkAdapter.tsx';
import { attachRef } from '../../shared/attachRef.ts';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import type { HeatmapLabels, HeatmapSlotProps } from './heatmap.types.ts';

type Target = { id: string; element: HTMLSpanElement };
export function HeatmapGrid({
  layout,
  label,
  labels,
  formatValue,
  showValues,
  slotProps,
}: {
  layout: HeatmapLayout;
  label: string;
  labels: Required<HeatmapLabels>;
  formatValue: (value: number) => string;
  showValues: boolean;
  slotProps: HeatmapSlotProps;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tabStop, setTabStop] = useState<string | null>(null);
  const focused = useRef<Target | null>(null);
  const hovered = useRef<Target | null>(null);
  const elements = useRef(new Map<string, HTMLSpanElement>());
  const anchor = useRef<(element: Element | null) => void>(() => {});
  const item = layout.cells.find((cell) => cell.id === active);
  if (active !== null && !item) {
    setActive(null);
    setOpen(false);
  }
  const tabId = layout.cells.some((cell) => cell.id === tabStop) ? tabStop : layout.cells[0]?.id;
  function restore(target: Target | null) {
    if (target?.element.isConnected && elements.current.get(target.id) === target.element) {
      setActive(target.id);
      anchor.current(target.element);
    }
  }
  const content = item ? (
    <table {...native(slotProps.tooltipTable, ['role', 'hidden', 'aria-hidden'])}>
      <tbody>
        <tr>
          <td />
          <th scope="row">{labels.row}</th>
          <td>{item.row.label || item.row.id}</td>
        </tr>
        <tr>
          <td />
          <th scope="row">{labels.column}</th>
          <td>{item.column.label || item.column.id}</td>
        </tr>
        <tr>
          <td>
            <MarkAdapter
              {...native(slotProps.tooltipMark?.(item), ['aria-hidden'])}
              shape="circle"
            />
          </td>
          <th scope="row">{labels.value}</th>
          <td>{item.value === null ? labels.missing : formatValue(item.value)}</td>
        </tr>
      </tbody>
    </table>
  ) : null;
  return (
    <TooltipAdapter
      {...native(slotProps.tooltip, ['ref'])}
      content={content}
      open={!!item && open}
      onOpenChange={setOpen}
      onPointerLeave={(event) => {
        slotProps.tooltip?.onPointerLeave?.(event);
        if (!event.defaultPrevented) restore(focused.current);
      }}
    >
      {({ ref: attach, ...trigger }) => {
        anchor.current = attach;
        return layout.cells.length === 0 ? null : (
          <div {...native(slotProps.viewport)} data-ui="heatmap-viewport">
            <div
              {...native(slotProps.grid)}
              role="group"
              aria-label={label}
              data-ui="heatmap-grid"
              style={{
                ...slotProps.grid?.style,
                display: 'grid',
                gridTemplateColumns: `minmax(6rem, max-content) repeat(${layout.columns.length}, minmax(var(--dreadnought-heatmap-cell-min-width, 44px), 1fr))`,
              }}
            >
              <span {...native(slotProps.axisLabel)}>
                {labels.row} / {labels.column}
              </span>
              {layout.columns.map((column) => (
                <span {...native(slotProps.axisLabel)} key={column.id}>
                  {column.label || column.id}
                </span>
              ))}
              {layout.rows.map((row, index) => (
                <span
                  {...native(slotProps.axisLabel)}
                  key={row.id}
                  style={{ ...slotProps.axisLabel?.style, gridColumn: 1, gridRow: index + 2 }}
                >
                  {row.label || row.id}
                </span>
              ))}
              {layout.cells.map((cell) => {
                const slot = native(slotProps.cell?.(cell), ['hidden', 'aria-hidden']);
                const selected = item?.id === cell.id;
                const value = cell.value === null ? labels.missing : formatValue(cell.value);
                return (
                  <span
                    {...slot}
                    key={cell.id}
                    role="img"
                    tabIndex={tabId === cell.id ? 0 : -1}
                    aria-label={`${cell.row.label || cell.row.id}, ${cell.column.label || cell.column.id}: ${value}`}
                    aria-describedby={selected ? trigger['aria-describedby'] : undefined}
                    data-ui="heatmap-cell"
                    data-missing={cell.value === null || undefined}
                    data-active={(selected && !!trigger['aria-describedby']) || undefined}
                    style={{
                      ...slot.style,
                      gridColumn: cell.columnIndex + 2,
                      gridRow: cell.rowIndex + 2,
                    }}
                    ref={(element) => {
                      if (!element) return;
                      elements.current.set(cell.id, element);
                      return attachRef(element, slot.ref, () => elements.current.delete(cell.id));
                    }}
                    onClick={(event) => {
                      slot.onClick?.(event);
                      if (!event.defaultPrevented) event.currentTarget.focus();
                    }}
                    onPointerEnter={(event) => {
                      slot.onPointerEnter?.(event);
                      if (event.defaultPrevented) return;
                      hovered.current = { id: cell.id, element: event.currentTarget };
                      setActive(cell.id);
                      trigger.onPointerEnter?.(event);
                    }}
                    onPointerLeave={(event) => {
                      slot.onPointerLeave?.(event);
                      if (event.defaultPrevented) return;
                      hovered.current = null;
                      const popup = trigger['aria-describedby']
                        ? event.currentTarget.ownerDocument.getElementById(
                            trigger['aria-describedby'],
                          )
                        : null;
                      const target = event.relatedTarget;
                      if (!(target instanceof Node && popup?.contains(target)))
                        restore(focused.current);
                      trigger.onPointerLeave?.(event);
                    }}
                    onFocus={(event) => {
                      slot.onFocus?.(event);
                      if (event.defaultPrevented) return;
                      focused.current = { id: cell.id, element: event.currentTarget };
                      setTabStop(cell.id);
                      setActive(cell.id);
                      event.currentTarget.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
                      trigger.onFocus?.(event);
                    }}
                    onBlur={(event) => {
                      slot.onBlur?.(event);
                      if (event.defaultPrevented) return;
                      focused.current = null;
                      restore(hovered.current);
                      trigger.onBlur?.(event);
                    }}
                    onKeyDown={(event) => {
                      slot.onKeyDown?.(event);
                      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
                      trigger.onKeyDown?.(event);
                      if (event.defaultPrevented) return;
                      const vertical = event.key === 'ArrowUp' || event.key === 'ArrowDown';
                      const candidates = layout.cells.filter((other) =>
                        vertical
                          ? other.columnIndex === cell.columnIndex
                          : other.rowIndex === cell.rowIndex,
                      );
                      const next = getCollectionNavigation(
                        candidates.map(({ id }) => ({ value: id })),
                        cell.id,
                        event.key,
                        { orientation: vertical ? 'vertical' : 'horizontal', loop: false },
                      );
                      if (next !== undefined) {
                        event.preventDefault();
                        elements.current.get(next)?.focus();
                      }
                    }}
                  >
                    {cell.value === null ? '—' : showValues ? formatValue(cell.value) : null}
                  </span>
                );
              })}
            </div>
          </div>
        );
      }}
    </TooltipAdapter>
  );
}
