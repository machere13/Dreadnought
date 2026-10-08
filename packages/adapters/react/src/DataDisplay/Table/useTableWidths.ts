import { useLayoutEffect, useRef, useState } from 'react';
import type { TableColumn } from './table.types.ts';

export function useTableWidths<RecordType extends object>(columns: readonly TableColumn<RecordType>[],
  { selection: hasSelection, expansion: hasExpansion, sticky, signature }: { selection: boolean; expansion: boolean; sticky: boolean; signature: string }) {
  const table = useRef<HTMLTableElement>(null);
  const [measured, setMeasured] = useState<{ columns: typeof columns; widths: number[]; selection: number; expansion: number; offsets: number[] }>();
  useLayoutEffect(() => {
    const element = table.current;
    if (!element || (!sticky && !columns.some(column => column.fixed) && !(hasSelection && hasExpansion))) return;
    const rows = Array.from(element.tHead?.rows ?? []);
    const cells = rows.flatMap(row => Array.from(row.cells));
    const measure = () => {
      const byColumn = new Map(cells.filter(cell => cell.dataset.columnIndex !== undefined).map(cell => [Number(cell.dataset.columnIndex), cell]));
      const sizes = columns.map((_, index) => {
        const cell = byColumn.get(index);
        return cell?.colSpan === 1 ? cell.getBoundingClientRect().width : 0;
      });
      const selection = hasSelection ? cells.find(cell => cell.dataset.slot === 'selection-cell')?.getBoundingClientRect().width ?? 0 : 0;
      const expansion = hasExpansion ? cells.find(cell => cell.dataset.slot === 'expansion-cell')?.getBoundingClientRect().width ?? 0 : 0;
      let top = 0;
      const offsets = rows.map(row => { const offset = top; top += row.getBoundingClientRect().height; return offset; });
      setMeasured(previous => previous?.columns === columns && previous.selection === selection
        && previous.expansion === expansion && offsets.length === previous.offsets.length && offsets.every((offset, index) => offset === previous.offsets[index])
        && sizes.every((size, index) => size === previous.widths[index]) ? previous : { columns, widths: sizes, selection, expansion, offsets });
    };
    measure();
    const view = element.ownerDocument.defaultView;
    const Observer = view?.ResizeObserver;
    const observer = Observer ? new Observer(measure) : undefined;
    cells.forEach(cell => observer?.observe(cell, { box: 'border-box' }));
    rows.forEach(row => observer?.observe(row, { box: 'border-box' }));
    if (!observer) view?.addEventListener('resize', measure);
    return () => { observer?.disconnect(); if (!observer) view?.removeEventListener('resize', measure); };
  }, [columns, hasSelection, signature, hasExpansion, sticky]);
  return { table, widths: measured?.columns === columns ? measured.widths : [], selectionWidth: hasSelection ? measured?.selection ?? 0 : 0,
    expansionWidth: hasExpansion ? measured?.expansion ?? 0 : 0, headerOffsets: measured?.columns === columns ? measured.offsets : [] };
}
