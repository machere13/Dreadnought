import { Button, FloatingPanel } from '@dreadnought/ui/react';
import type { FloatingPanelProps } from '@dreadnought/ui/react';
import { FloatingPanelAdapter } from '@dreadnought/react/unstyled';
import { useFloatingPanel } from '@dreadnought/react/logic';
import { floatingPanelPresentation } from '@dreadnought/ui';

const props: FloatingPanelProps = {
  title: <span>Feedback</span>,
  placement: 'top-left',
  rootStyle: { zIndex: 10 },
  content: 'Information',
  footer: ({ close }) => <Button onClick={close}>Done</Button>,
  children: (trigger) => <Button {...trigger}>Open</Button>,
};
const ready = <FloatingPanel {...props} />;
const adapter = (
  <FloatingPanelAdapter content="Information">
    {(trigger) => <button {...trigger}>Open</button>}
  </FloatingPanelAdapter>
);
void [ready, adapter, useFloatingPanel, floatingPanelPresentation.root];
