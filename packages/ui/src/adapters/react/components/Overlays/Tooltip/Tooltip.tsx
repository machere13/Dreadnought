import { TooltipAdapter } from '@dreadnought/react/unstyled';
import type { TooltipAdapterProps } from '@dreadnought/react/unstyled';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';

export type TooltipProps = TooltipAdapterProps;
export function Tooltip({ className, ...props }: TooltipProps) {
  return (
    <TooltipAdapter
      {...props}
      className={[tooltipPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}
