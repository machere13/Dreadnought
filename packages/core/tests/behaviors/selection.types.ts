import { getSelectionValue } from '@dreadnought/core';
import type { SelectionAction, SelectionOptions } from '@dreadnought/core';

const single: string | null = getSelectionValue('a', { type: 'clear' });
const multiple: number[] = getSelectionValue([0, 1], { type: 'toggle', value: 1 });
const action: SelectionAction<string> = { type: 'select', value: 'a' };
const options: SelectionOptions<string> = { required: true, disabledValues: ['b'] };
const next: string[] = getSelectionValue(['b'], action, options);
// @ts-expect-error A toggle requires a value.
getSelectionValue('a', { type: 'toggle' });
// @ts-expect-error Keys are identifiers, not arbitrary objects.
getSelectionValue([{ id: 'a' }], { type: 'clear' });
void [single, multiple, next];
