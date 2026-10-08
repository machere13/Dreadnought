import { MenuAdapter } from '@dreadnought/react/unstyled';
import type { MenuAdapterProps } from '@dreadnought/react/unstyled';
import { menuPresentation } from '#presentation/Navigation/Menu/menuPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

export type MenuProps = MenuAdapterProps;

const classes = (library: string, own?: string) => [library, own].filter(Boolean).join(' ');

export function getMenuSlotProps(slotProps: NonNullable<MenuProps['slotProps']> = {}) {
  return { ...slotProps,
      item: { ...slotProps.item, className: classes(menuPresentation.item, slotProps.item?.className) },
      link: { ...slotProps.link, className: classes(menuPresentation.item, slotProps.link?.className) },
      group: { ...slotProps.group, className: classes(menuPresentation.group, slotProps.group?.className) },
      groupLabel: { ...slotProps.groupLabel, className: classes(menuPresentation.groupLabel, slotProps.groupLabel?.className) },
      submenu: { ...slotProps.submenu, className: classes(menuPresentation.submenu, slotProps.submenu?.className) },
      divider: { ...slotProps.divider, className: classes(menuPresentation.divider, slotProps.divider?.className) },
      indicator: { ...slotProps.indicator, className: classes(menuPresentation.indicator, slotProps.indicator?.className) } };
}

export function Menu({ className, slotProps, renderIndicator = () => <Icon name="down" />, ...props }: MenuProps) {
  return <MenuAdapter {...props} className={classes(menuPresentation.root, className)}
    renderIndicator={renderIndicator} slotProps={getMenuSlotProps(slotProps)} />;
}
