import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getVirtualWindow } from '@dreadnought/core';
import type { SelectOption, SelectOptionSection } from '@dreadnought/core';
import type { CSSProperties } from 'react';
import type { SelectAdapterProps } from './SelectAdapter.types.ts';
import type { useSelect } from './useSelect.ts';

interface Row {
  group: SelectOptionSection;
  groupIndex: number;
  rowIndex: number;
  option?: SelectOption;
  optionIndex?: number;
}

export function SelectOptionList({
  select,
  props,
}: {
  select: ReturnType<typeof useSelect>;
  props: SelectAdapterProps;
}) {
  const { slotProps = {}, optionRender } = props;
  const { state, virtual, open, activeValue } = select;
  const viewport = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const rows = useMemo(() => {
    const result: Row[] = [];
    let optionIndex = 0;
    state.filteredGroups.forEach((group, groupIndex) => {
      if (group.label !== undefined) {
        result.push({ group, groupIndex, rowIndex: result.length });
      }
      group.options.forEach((option) => {
        result.push({
          group,
          groupIndex,
          option,
          optionIndex: optionIndex++,
          rowIndex: result.length,
        });
      });
    });
    return result;
  }, [state.filteredGroups]);
  const indices = useMemo(
    () =>
      new Map(
        rows.flatMap((row) => (row.option ? [[row.option.value, row.rowIndex] as const] : [])),
      ),
    [rows],
  );
  const activeIndex = activeValue ? indices.get(activeValue) : undefined;
  const [position, setPosition] = useState({
    rows,
    activeValue: undefined as string | undefined,
    open: false,
    scrollTop: 0,
  });
  const followActive =
    position.rows !== rows || position.activeValue !== activeValue || position.open !== open;
  const window = getVirtualWindow({
    ...virtual,
    count: rows.length,
    height: height || virtual.height,
    scrollTop: position.scrollTop,
    activeIndex: followActive && open ? activeIndex : undefined,
  });

  useLayoutEffect(() => {
    const node = viewport.current;
    if (!virtual.enabled || !open || !node) return;
    function measure() {
      setHeight(node!.clientHeight || virtual.height);
    }
    measure();
    const Observer = node.ownerDocument.defaultView?.ResizeObserver;
    const observer = Observer ? new Observer(measure) : undefined;
    observer?.observe(node);
    return () => observer?.disconnect();
  }, [virtual.enabled, virtual.height, open]);

  useLayoutEffect(() => {
    if (virtual.enabled) {
      if (viewport.current) viewport.current.scrollTop = window.scrollTop;
      if (followActive || position.scrollTop !== window.scrollTop) {
        setPosition({ rows, activeValue, open, scrollTop: window.scrollTop });
      }
    } else if (open && activeValue) {
      select.popup.current?.ownerDocument
        .getElementById(select.optionId(activeValue))
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [virtual.enabled, window.scrollTop, followActive, open, activeValue, rows]);

  function rowStyle(row: Row, style?: CSSProperties): CSSProperties | undefined {
    if (!virtual.enabled) return style;
    return {
      ...style,
      position: 'absolute',
      top: row.rowIndex * virtual.itemHeight,
      left: 0,
      right: 0,
      height: virtual.itemHeight,
      boxSizing: 'border-box',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    };
  }

  function renderRow(row: Row) {
    const option = row.option;
    if (!option) {
      return (
        <div
          {...slotProps.groupLabel}
          key={`group-${row.groupIndex}`}
          id={`${select.id}-group-${row.groupIndex}`}
          data-slot="group-label"
          style={rowStyle(row, slotProps.groupLabel?.style)}
        >
          {row.group.label}
        </div>
      );
    }
    const selected = state.values.includes(option.value);
    return (
      <div
        {...slotProps.option}
        key={`option-${option.value}`}
        id={select.optionId(option.value)}
        aria-label={option.label}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        aria-posinset={virtual.enabled ? row.optionIndex! + 1 : undefined}
        aria-setsize={virtual.enabled ? state.filteredOptions.length : undefined}
        data-slot="option"
        data-active={option.value === activeValue ? '' : undefined}
        style={rowStyle(row, slotProps.option?.style)}
        onClick={(event) => {
          slotProps.option?.onClick?.(event);
          if (!event.defaultPrevented) select.choose(option.value);
        }}
      >
        {optionRender
          ? optionRender(option, {
              active: option.value === activeValue,
              selected,
              index: row.optionIndex!,
            })
          : option.label}
      </div>
    );
  }

  const visible = virtual.enabled ? rows.slice(window.start, window.end) : rows;
  if (
    virtual.enabled &&
    activeIndex !== undefined &&
    (activeIndex < window.start || activeIndex >= window.end)
  ) {
    visible.push(rows[activeIndex]);
    visible.sort((a, b) => a.rowIndex - b.rowIndex);
  }
  const groups = new Map<number, Row[]>();
  visible.forEach((row) => {
    const group = groups.get(row.groupIndex);
    if (group) group.push(row);
    else groups.set(row.groupIndex, [row]);
  });
  const content = Array.from(groups, ([index, groupRows]) => {
    const group = groupRows[0].group;
    return group.label === undefined ? (
      groupRows.map(renderRow)
    ) : (
      <div
        {...slotProps.group}
        key={index}
        role="group"
        data-slot="group"
        aria-label={virtual.enabled ? group.label : undefined}
        aria-labelledby={virtual.enabled ? undefined : `${select.id}-group-${index}`}
      >
        {groupRows.map(renderRow)}
      </div>
    );
  });
  if (!virtual.enabled) return content;
  return (
    <div
      {...slotProps.viewport}
      ref={viewport}
      data-slot="viewport"
      style={{
        ...slotProps.viewport?.style,
        overflow: 'auto',
        overflowAnchor: 'none',
        height: Math.min(virtual.height, window.totalHeight),
        maxHeight: 'calc(100dvh - 64px)',
      }}
      onScroll={(event) => {
        slotProps.viewport?.onScroll?.(event);
        setPosition({ rows, activeValue, open, scrollTop: event.currentTarget.scrollTop });
      }}
    >
      <div role="presentation" style={{ position: 'relative', height: window.totalHeight }}>
        {content}
      </div>
    </div>
  );
}
