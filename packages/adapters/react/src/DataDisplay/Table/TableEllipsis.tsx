import type { ReactNode } from 'react';
import { TooltipAdapter } from '../../Overlays/Tooltip/index.ts';
import type { TooltipAdapterProps } from '../../Overlays/Tooltip/index.ts';

export function TableEllipsis({
  children,
  tooltip,
}: {
  children: ReactNode;
  tooltip?: Omit<TooltipAdapterProps, 'children' | 'content'>;
}) {
  if ((typeof children !== 'string' && typeof children !== 'number') || children === '') {
    return <span data-slot="ellipsis">{children}</span>;
  }
  return (
    <TooltipAdapter {...tooltip} content={children}>
      {(trigger) => (
        <span {...trigger} data-slot="ellipsis" tabIndex={0}>
          {children}
        </span>
      )}
    </TooltipAdapter>
  );
}
