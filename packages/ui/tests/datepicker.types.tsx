import { createRef } from 'react';
import { DatePicker } from '@dreadnought/ui/react';
import type { CalendarDate } from '@dreadnought/ui/react';

<DatePicker ref={createRef<HTMLInputElement>()} value="2026-10-12" aria-label="Date" name="date" />;
<DatePicker mode="range" value={['2026-10-10', '2026-10-20']} />;
<DatePicker value={null} onChange={(value: CalendarDate | null) => value} />;
// @ts-expect-error single value cannot be used in range mode
<DatePicker mode="range" value="2026-10-10" />;
// @ts-expect-error range cannot be used in single mode
<DatePicker value={['2026-10-10', '2026-10-20']} />;
// @ts-expect-error onChange is semantic, not a native input event
<DatePicker onChange={(event: React.ChangeEvent<HTMLInputElement>) => event.target.value} />;
// @ts-expect-error range placeholder has two entries
<DatePicker mode="range" placeholder="Date" />;
