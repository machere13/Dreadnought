import { MenuAdapter } from '@dreadnought/react/unstyled';
import type { MenuAdapterProps } from '@dreadnought/react/unstyled';
import { menuPresentation } from '#presentation/Navigation/Menu/menuPresentation.ts';

export type MenuProps = MenuAdapterProps;

export function Menu({ className, slotProps = {}, ...props }: MenuProps) {
  return <MenuAdapter {...props} className={[menuPresentation.root, className].filter(Boolean).join(' ')}
    slotProps={{ item: { ...slotProps.item,
      className: [menuPresentation.item, slotProps.item?.className].filter(Boolean).join(' ') } }} />;
}
