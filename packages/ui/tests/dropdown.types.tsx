import { Button, Dropdown } from '@dreadnought/ui/react';
import { DropdownAdapter } from '@dreadnought/react/unstyled';
import { dropdownPresentation } from '@dreadnought/ui';

export const Ready = <Dropdown items={[{ value: 'edit', label: 'Edit' }]} placement="bottomRight" arrow={{ pointAtCenter: true }}
  className={dropdownPresentation.root} menuProps={{ slotProps: { item: { onClick: event => event.preventDefault() } } }}
  onAction={value => value.toUpperCase()}>{trigger => <Button {...trigger}>Actions</Button>}</Dropdown>;
export const Plain = <DropdownAdapter defaultOpen items={[{ value: 'save', label: 'Save' }]}>
  {trigger => <button {...trigger}>Actions</button>}
</DropdownAdapter>;
// @ts-expect-error unknown placement
export const InvalidPlacement = <Dropdown items={[]} placement="middle">{trigger => <button {...trigger}>Actions</button>}</Dropdown>;
// @ts-expect-error menu values are strings
export const InvalidItem = <Dropdown items={[{ value: 1, label: 'One' }]}>{trigger => <button {...trigger}>Actions</button>}</Dropdown>;
// @ts-expect-error content belongs to Popover, Dropdown receives items
export const InvalidContent = <Dropdown items={[]} content="Text">{trigger => <button {...trigger}>Actions</button>}</Dropdown>;
