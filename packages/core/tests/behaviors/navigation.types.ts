import { getNextEnabledValue } from '@dreadnought/core';
import type { NavigationOptions } from '@dreadnought/core';

const options: NavigationOptions = { loop: false };
const next: string | undefined = getNextEnabledValue([{ value: 'a' }], 'a', 'next', options);
// @ts-expect-error Loop accepts a boolean, not a mode string.
getNextEnabledValue([], '', 'next', { loop: 'off' });
void next;
