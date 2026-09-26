import { BadgeAdapter } from '@dreadnought/react/unstyled';
import type { BadgeAdapterProps } from '@dreadnought/react/unstyled';
import { badgePresentation } from '#presentation/DataDisplay/Badge/badgePresentation.ts';

export type BadgeProps = BadgeAdapterProps & {
  appearance?: 'solid' | 'outline';
};

export function Badge({ appearance = 'solid', className, ...props }: BadgeProps) {
  const classes = [badgePresentation.root, badgePresentation.appearances[appearance], className]
    .filter(Boolean)
    .join(' ');

  return <BadgeAdapter {...props} className={classes} data-appearance={appearance} />;
}
