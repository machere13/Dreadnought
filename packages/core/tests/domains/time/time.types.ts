import { getTimeOptions, getTimeSelection, formatClockTime } from '../../../src/index.ts';
import type { ClockTime, TimeSelection, TimeOptions } from '../../../src/index.ts';
const selection: TimeSelection = { hour: null, minute: null, second: null };
const options: TimeOptions = { showSeconds: true, minuteStep: 15 };
const value: ClockTime = formatClockTime({ hour: 9, minute: 30, second: 0 });
getTimeOptions('hour', selection, options);
getTimeSelection(selection, 'hour', 9, options);
void value;
// @ts-expect-error Unknown unit
getTimeOptions('day', selection);
// @ts-expect-error Seconds are required in complete parts
formatClockTime({ hour: 9, minute: 30 });
