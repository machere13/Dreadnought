import { Button, Popover } from '@dreadnought/ui/react';
import type { PopoverProps } from '@dreadnought/ui/react';
import { PopoverAdapter } from '@dreadnought/react/unstyled';
import { usePopover } from '@dreadnought/react/logic';
import { popoverPresentation } from '@dreadnought/ui';

const props: PopoverProps = {
  placement: 'rightBottom',
  arrow: { pointAtCenter: true },
  content: ({ close }) => <Button onClick={close}>Done</Button>,
  children: (trigger) => <Button {...trigger}>Settings</Button>,
};
const ready = <Popover {...props} />;
const adapter = (
  <PopoverAdapter content="Information" arrow={false}>
    {(trigger) => <button {...trigger}>Details</button>}
  </PopoverAdapter>
);
void [ready, adapter, usePopover, popoverPresentation.root];
