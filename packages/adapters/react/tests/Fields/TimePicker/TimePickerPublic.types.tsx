import { useTimePicker } from '@dreadnought/react/logic';
import type { UseTimePickerOptions, UseTimePickerResult } from '@dreadnought/react/logic';
const options: UseTimePickerOptions = { value: '09:30:00', onChange: (value) => void value };
function CustomTime() {
  const state: UseTimePickerResult = useTimePicker(options);
  return <button onClick={() => state.choose('hour', 10)}>{state.draft}</button>;
}
void CustomTime;
// @ts-expect-error Only a single canonical time is supported
const range: UseTimePickerOptions = { value: ['09:00:00', '10:00:00'] };
const native: UseTimePickerOptions = {
  // @ts-expect-error onChange receives a time, not a DOM event
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void event,
};
void [range, native];
