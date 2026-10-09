import { getFloatingPanelState } from '@dreadnought/core';
import { FloatingPanelAdapter } from '@dreadnought/react/unstyled';
import { useFloatingPanel } from '@dreadnought/react/logic';

const panel = <FloatingPanelAdapter content="Information" defaultOpen>
  {trigger => <button {...trigger}>Open</button>}
</FloatingPanelAdapter>;
void [panel, useFloatingPanel, getFloatingPanelState];
