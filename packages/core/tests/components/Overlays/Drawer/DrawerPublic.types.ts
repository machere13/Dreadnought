import { getDrawerState } from '@dreadnought/core';
import type { DrawerCore, DrawerCoreOptions } from '@dreadnought/core';

const options: DrawerCoreOptions = { triggerId: 'trigger', panelId: 'drawer', open: true };
const state: DrawerCore = getDrawerState(options);
void state;
// @ts-expect-error placement belongs to presentation, not core
getDrawerState({ ...options, placement: 'left' });
// @ts-expect-error size belongs to presentation, not core
getDrawerState({ ...options, size: 320 });
