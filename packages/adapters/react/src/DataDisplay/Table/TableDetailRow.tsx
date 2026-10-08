import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export function TableDetailRow({
  id,
  triggerId,
  colSpan,
  children,
}: {
  id: string;
  triggerId: string;
  colSpan: number;
  children: ReactNode;
}) {
  const row = useRef<HTMLTableRowElement>(null);
  useLayoutEffect(() => {
    const element = row.current!;
    return () => {
      const document = element.ownerDocument;
      if (element.contains(document.activeElement)) {
        document.getElementById(triggerId)?.focus();
      }
    };
  }, [triggerId]);
  return (
    <tr ref={row} id={id} aria-labelledby={triggerId} data-slot="detail-row">
      <td data-slot="detail-cell" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}
