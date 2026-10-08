import type { CSSProperties } from 'react';
import { DrawerAdapter } from '@dreadnought/react/unstyled';
import type { DrawerAdapterProps } from '@dreadnought/react/unstyled';
import { drawerPresentation } from '#presentation/Overlays/Drawer/drawerPresentation.ts';

export type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom';
export type DrawerProps = DrawerAdapterProps & {
  placement?: DrawerPlacement;
  size?: number | string;
};
export function Drawer({ placement = 'right', size, className, style, ...props }: DrawerProps) {
  const dimension =
    typeof size === 'number' ? (Number.isFinite(size) && size > 0 ? `${size}px` : undefined) : size;
  return (
    <DrawerAdapter
      {...props}
      className={[drawerPresentation.root, drawerPresentation[placement], className]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          ...style,
          ...(dimension !== undefined ? { '--dreadnought-drawer-size': dimension } : {}),
        } as CSSProperties
      }
    />
  );
}
