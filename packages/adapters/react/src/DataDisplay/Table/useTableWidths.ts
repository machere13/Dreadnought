import { useLayoutEffect, useRef, useState } from 'react';
import type { TableColumn } from './table.types.ts';

export function useTableWidths<RecordType extends object>(columns: readonly TableColumn<RecordType>[], hasSelection: boolean, headerSpans: string) {
  const table = useRef<HTMLTableElement>(null);
  const [measured, setMeasured] = useState<{ columns: typeof columns; widths: number[]; selection: number }>();
  useLayoutEffect(() => {
    const element = table.current;
    if (!element || !columns.some(column => column.fixed)) return;
    const cells = Array.from(element.tHead?.rows[0]?.cells ?? []);
    const measure = () => {
      const byColumn = new Map(cells.map(cell => [Number(cell.dataset.columnIndex), cell]));
      const sizes = columns.map((_, index) => {
        const cell = byColumn.get(index);
        return cell?.colSpan === 1 ? cell.getBoundingClientRect().width : 0;
      });
      const selection = hasSelection ? cells.find(cell => cell.dataset.slot === 'selection-cell')?.getBoundingClientRect().width ?? 0 : 0;
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
  }, [columns, hasSelection, headerSpans]);
  return { table, widths: measured?.columns === columns ? measured.widths : [], selectionWidth: hasSelection ? measured?.selection ?? 0 : 0 };
}
