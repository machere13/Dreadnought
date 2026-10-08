import { DropdownAdapter } from '@dreadnought/react/unstyled';
import type { DropdownAdapterProps } from '@dreadnought/react/unstyled';
import { dropdownPresentation } from '#presentation/Navigation/Dropdown/dropdownPresentation.ts';
import { getMenuSlotProps } from '../Menu/Menu.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

export type DropdownProps = DropdownAdapterProps;
export function Dropdown({ className, menuProps = {}, ...props }: DropdownProps) {
  return (
    <DropdownAdapter
      {...props}
      className={[dropdownPresentation.root, className].filter(Boolean).join(' ')}
      menuProps={{
        ...menuProps,
        className: [dropdownPresentation.menu, menuProps.className].filter(Boolean).join(' '),
        renderIndicator: menuProps.renderIndicator ?? (() => <Icon name="down" />),
        slotProps: getMenuSlotProps(menuProps.slotProps),
      }}
    />
  );
}
