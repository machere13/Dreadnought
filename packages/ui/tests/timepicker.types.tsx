import { createRef } from 'react';
import { TimePicker } from '@dreadnought/ui/react';
import type { TimePickerProps } from '@dreadnought/ui/react';
import { timePickerPresentation } from '@dreadnought/ui';
const props: TimePickerProps = {
  ref: createRef<HTMLInputElement>(),
  value: '09:07:03',
  showSeconds: true,
  onChange: (value) => void value,
  'aria-label': 'Time',
  disabledTime: { hours: [0], minutes: (hour) => (hour === 9 ? [30] : []) },
};
const picker = <TimePicker {...props} />;
void [picker, timePickerPresentation.root];
// @ts-expect-error No range mode in TimePicker
const range = <TimePicker mode="range" />;
// @ts-expect-error Ready UI does not expose adapter renderers
const renderer = <TimePicker renderAction={() => null} />;
void [range, renderer];
