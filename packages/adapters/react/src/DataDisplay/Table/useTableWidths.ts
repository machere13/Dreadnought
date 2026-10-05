import { useLayoutEffect, useRef, useState } from 'react';
import type { TableColumn } from './table.types.ts';

export function useTableWidths<RecordType extends object>(columns: readonly TableColumn<RecordType>[], hasSelection: boolean) {
  const table = useRef<HTMLTableElement>(null);
  const [measured, setMeasured] = useState<{ columns: typeof columns; widths: number[]; selection: number }>();
  useLayoutEffect(() => {
    const element = table.current;
    if (!element || !columns.some(column => column.fixed)) return;
    const cells = Array.from(element.tHead?.rows[0]?.cells ?? []);
    const measure = () => {
      const sizes = cells.map(cell => cell.getBoundingClientRect().width);
      const selection = hasSelection ? sizes.shift() ?? 0 : 0;
      setMeasured(previous => previous?.columns === columns && previous.selection === selection
        && sizes.every((size, index) => size === previous.widths[index]) ? previous : { columns, widths: sizes, selection });
    };
    measure();
    const view = element.ownerDocument.defaultView;
    const Observer = view?.ResizeObserver;
    const observer = Observer ? new Observer(measure) : undefined;
    cells.forEach(cell => observer?.observe(cell, { box: 'border-box' }));
    if (!observer) view?.addEventListener('resize', measure);
    return () => { observer?.disconnect(); if (!observer) view?.removeEventListener('resize', measure); };
  }, [columns, hasSelection]);
  return { table, widths: measured?.columns === columns ? measured.widths : [], selectionWidth: hasSelection ? measured?.selection ?? 0 : 0 };
}
