import { DropdownAdapter } from '@dreadnought/react/unstyled';
import type { DropdownAdapterProps } from '@dreadnought/react/unstyled';
import { dropdownPresentation } from '#presentation/Navigation/Dropdown/dropdownPresentation.ts';

export type DropdownProps = DropdownAdapterProps;
export function Dropdown({ className, menuProps = {}, ...props }: DropdownProps) {
  const item = menuProps.slotProps?.item;
  return <DropdownAdapter {...props} className={[dropdownPresentation.root, className].filter(Boolean).join(' ')}
    menuProps={{ ...menuProps, className: [dropdownPresentation.menu, menuProps.className].filter(Boolean).join(' '),
      slotProps: { item: { ...item, className: [dropdownPresentation.item, item?.className].filter(Boolean).join(' ') } } }} />;
}
