import { ProgressAdapter, type ProgressAdapterProps } from '@dreadnought/react/unstyled';
import { progressPresentation } from '#presentation/Feedback/Progress/progressPresentation.ts';

export type ProgressProps = ProgressAdapterProps & { status?: 'normal' | 'success' | 'error' };

export function Progress({ status = 'normal', slotClassNames, className, ...props }: ProgressProps) {
  const slots = {
    track: [progressPresentation.track, slotClassNames?.track].filter(Boolean).join(' '),
    fill: [progressPresentation.fill, slotClassNames?.fill].filter(Boolean).join(' '),
    label: [progressPresentation.label, slotClassNames?.label].filter(Boolean).join(' '),
  };
  return <ProgressAdapter {...props} data-status={status} slotClassNames={slots}
    className={[progressPresentation.root, className].filter(Boolean).join(' ')} />;
}
