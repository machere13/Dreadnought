import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

it('connects only an open enabled tooltip to its trigger without discarding existing descriptions', () => {
  expect(core).toHaveProperty('getTooltipState');
  expect(core.getTooltipState({ tooltipId: 'tip', open: true, describedBy: 'help' })).toEqual({
    open: true, triggerProps: { 'aria-describedby': 'help tip' }, contentProps: { id: 'tip', role: 'tooltip', hidden: false },
  });
  expect(core.getTooltipState({ tooltipId: 'tip', open: true, disabled: true, describedBy: 'help' }).triggerProps['aria-describedby']).toBe('help');
});

it('rejects tooltip IDs that cannot form an accessible relation', () => {
  expect(core).toHaveProperty('getTooltipState');
  for (const tooltipId of ['', 'bad id', 'bad\tid']) expect(() => core.getTooltipState({ tooltipId })).toThrow();
});
