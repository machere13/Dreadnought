import { expect, it } from 'vitest';
import { getTooltipPosition } from '../../src/behaviors/getTooltipPosition.ts';

const anchor = { left: 100, top: 100, width: 80, height: 40 };
const popup = { width: 60, height: 30 };
const viewport = { width: 400, height: 300 };
it.each([
  ['top', 110, 62],
  ['topLeft', 100, 62],
  ['topRight', 120, 62],
  ['bottom', 110, 148],
  ['bottomLeft', 100, 148],
  ['bottomRight', 120, 148],
  ['left', 32, 105],
  ['leftTop', 32, 100],
  ['leftBottom', 32, 110],
  ['right', 188, 105],
  ['rightTop', 188, 100],
  ['rightBottom', 188, 110],
] as const)('positions %s relative to the trigger', (placement, left, top) => {
  expect(getTooltipPosition({ anchor, popup, viewport, placement, gap: 8 })).toMatchObject({
    left,
    top,
    placement,
  });
});
it('flips at the top edge unless adjustment is disabled', () => {
  const options = { anchor: { ...anchor, top: 5 }, popup, viewport, gap: 8 };
  expect(getTooltipPosition(options)).toMatchObject({ top: 53, placement: 'bottom' });
  expect(getTooltipPosition({ ...options, autoAdjustOverflow: false })).toMatchObject({
    top: -33,
    placement: 'top',
  });
});
it('shifts centered placement and its arrow but preserves edge alignment', () => {
  const options = {
    anchor: { ...anchor, left: 390, width: 10 },
    popup,
    viewport,
    gap: 8,
    arrowPadding: 8,
  };
  expect(getTooltipPosition(options)).toMatchObject({ left: 340, arrow: 52 });
  expect(getTooltipPosition({ ...options, placement: 'topLeft' })).toMatchObject({ left: 390 });
});
it('can point the arrow at the trigger center for edge placement', () => {
  expect(
    getTooltipPosition({
      anchor,
      popup: { width: 120, height: 30 },
      viewport,
      placement: 'topLeft',
      pointAtCenter: true,
    }),
  ).toMatchObject({ left: 100, arrow: 40 });
});
it('moves a short edge-aligned tooltip so its arrow reaches a wide target center', () => {
  expect(
    getTooltipPosition({
      anchor: { ...anchor, width: 200 },
      popup,
      viewport,
      placement: 'topLeft',
      pointAtCenter: true,
      arrowPadding: 8,
    }),
  ).toMatchObject({ left: 148, arrow: 52 });
});
