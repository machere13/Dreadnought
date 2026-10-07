import { createRef } from 'react';
import { Switch } from '@dreadnought/ui/react';
import { SwitchAdapter } from '@dreadnought/react/unstyled';
import { switchPresentation } from '@dreadnought/ui';

export const Ready = <Switch ref={createRef<HTMLInputElement>()} name="alerts" defaultChecked
  className={switchPresentation.root} onChange={event => event.currentTarget.checked}
  slotProps={{ label: { title: 'Settings' }, indicator: { className: 'track' } }}>Alerts</Switch>;
export const Plain = <SwitchAdapter aria-label="Alerts" checked={false} onChange={() => {}} />;
// @ts-expect-error a switch has only two states
export const Mixed = <Switch indeterminate />;
// @ts-expect-error checked is boolean
export const InvalidChecked = <Switch checked="yes" />;
// @ts-expect-error semantics are fixed by the adapter
export const InvalidRole = <Switch role="checkbox" />;
