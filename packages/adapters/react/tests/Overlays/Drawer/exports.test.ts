import { expect, it } from 'vitest';
import * as logic from '../../../src/logic.ts';
import * as unstyled from '../../../src/unstyled.ts';
import * as react from '../../../src/index.ts';

it('shares modal lifecycle through the public drawer entries', () => {
  expect(logic).toHaveProperty('useDrawer');
  expect(unstyled).toHaveProperty('DrawerAdapter');
  expect(logic.useDrawer).toBe(logic.useModal);
  expect(unstyled.DrawerAdapter).toBe(unstyled.ModalAdapter);
  expect(react.DrawerAdapter).toBe(unstyled.DrawerAdapter);
  expect(react.useDrawer).toBe(logic.useDrawer);
});
