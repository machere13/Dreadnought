import { ToolbarAdapter } from '@dreadnought/react/unstyled';
import type { ToolbarAdapterProps } from '@dreadnought/react/unstyled';
import { toolbarPresentation } from '#presentation/Controls/Toolbar/toolbarPresentation.ts';

export type ToolbarProps = ToolbarAdapterProps;

export function Toolbar({ className, orientation = 'horizontal', ...props }: ToolbarProps) {
  const classes = [
    toolbarPresentation.root,
    toolbarPresentation.orientations[orientation],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <ToolbarAdapter {...props} orientation={orientation} className={classes} />;
}
