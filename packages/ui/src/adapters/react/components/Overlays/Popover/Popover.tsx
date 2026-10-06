import { PopoverAdapter } from '@dreadnought/react/unstyled';
import type { PopoverAdapterProps } from '@dreadnought/react/unstyled';
import { popoverPresentation } from '#presentation/Overlays/Popover/popoverPresentation.ts';

export type PopoverProps = PopoverAdapterProps;
export function Popover({ className, ...props }: PopoverProps) {
  return <PopoverAdapter {...props} className={[popoverPresentation.root, className].filter(Boolean).join(' ')} />;
}
