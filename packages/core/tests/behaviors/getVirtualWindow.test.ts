import { expect, it } from 'vitest';
import * as behaviors from '../../src/behaviors/index.ts';

it('returns a bounded exclusive range with overscan and an exact total height', () => {
  expect(
    behaviors.getVirtualWindow({
      count: 1000,
      itemHeight: 32,
      height: 128,
      scrollTop: 16000,
      overscan: 1,
    }),
  ).toEqual({ start: 499, end: 505, offset: 15968, totalHeight: 32000, scrollTop: 16000 });
});

it('clamps scrolling after the list shrinks, including an empty list', () => {
  expect(
    behaviors.getVirtualWindow({
      count: 2,
      itemHeight: 32,
      height: 128,
      scrollTop: 16000,
    }),
  ).toEqual({ start: 0, end: 2, offset: 0, totalHeight: 64, scrollTop: 0 });
  expect(
    behaviors.getVirtualWindow({
      count: 0,
      itemHeight: 32,
      height: 128,
      scrollTop: -10,
    }),
  ).toEqual({ start: 0, end: 0, offset: 0, totalHeight: 0, scrollTop: 0 });
});

it('scrolls only enough to show the active row', () => {
  const settings = { count: 1000, itemHeight: 32, height: 128, scrollTop: 0 };
  expect(behaviors.getVirtualWindow({ ...settings, activeIndex: 998 }).scrollTop).toBe(31840);
  expect(behaviors.getVirtualWindow({ ...settings, activeIndex: 2 }).scrollTop).toBe(0);
  expect(
    behaviors.getVirtualWindow({ ...settings, scrollTop: 1000, activeIndex: 1 }).scrollTop,
  ).toBe(32);
});

it.each([
  { count: -1 },
  { count: 1.5 },
  { itemHeight: 0 },
  { height: 0 },
  { scrollTop: Infinity },
  { overscan: -1 },
  { overscan: 1.2 },
  { activeIndex: NaN },
])('rejects invalid geometry %j', (invalid) => {
  expect(() =>
    behaviors.getVirtualWindow({
      count: 10,
      itemHeight: 32,
      height: 128,
      scrollTop: 0,
      ...invalid,
    }),
  ).toThrow();
});
