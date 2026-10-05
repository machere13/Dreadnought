import { getNavigationDirection, getNextEnabledValue, getTypeaheadValue } from '@dreadnought/core';
import type { NavigationDirection, NavigationKeyOptions, NavigationOptions, TypeaheadItem, TypeaheadOptions } from '@dreadnought/core';

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

const keyOptions: NavigationKeyOptions = { orientation: 'horizontal', homeEnd: false };
const direction: NavigationDirection | undefined = getNavigationDirection('ArrowRight', keyOptions);
// @ts-expect-error Orientation supports only horizontal or vertical navigation.
getNavigationDirection('ArrowRight', { orientation: 'diagonal' });
// @ts-expect-error homeEnd accepts a boolean.
getNavigationDirection('Home', { homeEnd: 'off' });
// @ts-expect-error Core accepts a key string, not a DOM event.
getNavigationDirection(new KeyboardEvent('keydown', { key: 'Home' }));
void direction;
