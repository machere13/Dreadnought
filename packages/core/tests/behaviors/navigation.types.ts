import { getNextEnabledValue, getTypeaheadValue } from '@dreadnought/core';
import type { NavigationOptions, TypeaheadItem, TypeaheadOptions } from '@dreadnought/core';

const options: NavigationOptions = { loop: false };
const next: string | undefined = getNextEnabledValue([{ value: 'a' }], 'a', 'next', options);
// @ts-expect-error Loop accepts a boolean, not a mode string.
getNextEnabledValue([], '', 'next', { loop: 'off' });
void next;

const searchable: readonly TypeaheadItem[] = [{ value: 'settings', text: 'Settings', disabled: false }];
const searchOptions: TypeaheadOptions = { includeCurrent: true };
const found: string | undefined = getTypeaheadValue(searchable, 'settings', 'set', searchOptions);
// @ts-expect-error Search items require a plain text label.
getTypeaheadValue([{ value: 'settings' }], '', 'set');
// @ts-expect-error The query is text, not a numeric key.
getTypeaheadValue(searchable, '', 42);
// @ts-expect-error includeCurrent accepts a boolean.
getTypeaheadValue(searchable, '', 'set', { includeCurrent: 'yes' });
void found;
