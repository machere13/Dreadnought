import { Button, Dropdown } from '@dreadnought/ui/react';
import { DropdownAdapter } from '@dreadnought/react/unstyled';
import { dropdownPresentation } from '@dreadnought/ui';

export const Ready = (
  <Dropdown
    items={[{ value: 'edit', label: 'Edit' }]}
    placement="bottomRight"
    arrow={{ pointAtCenter: true }}
    className={dropdownPresentation.root}
    menuProps={{ slotProps: { item: { onClick: (event) => event.preventDefault() } } }}
    onAction={(value) => value.toUpperCase()}
  >
    {(trigger) => <Button {...trigger}>Actions</Button>}
  </Dropdown>
);
export const Plain = (
  <DropdownAdapter defaultOpen items={[{ value: 'save', label: 'Save' }]}>
    {(trigger) => <button {...trigger}>Actions</button>}
  </DropdownAdapter>
);
export const InvalidPlacement = (
  // @ts-expect-error unknown placement
  <Dropdown items={[]} placement="middle">
    {(trigger) => <button {...trigger}>Actions</button>}
  </Dropdown>
);
export const InvalidItem = (
  // @ts-expect-error menu values are strings
  <Dropdown items={[{ value: 1, label: 'One' }]}>
    {(trigger) => <button {...trigger}>Actions</button>}
  </Dropdown>
);
export const InvalidContent = (
  // @ts-expect-error content belongs to Popover, Dropdown receives items
  <Dropdown items={[]} content="Text">
    {(trigger) => <button {...trigger}>Actions</button>}
  </Dropdown>
);
