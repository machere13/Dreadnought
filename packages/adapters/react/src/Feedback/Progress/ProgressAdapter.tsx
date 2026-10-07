import type { ComponentPropsWithRef } from 'react';
import { getProgressState, type ProgressCoreOptions } from '@dreadnought/core';

export type ProgressSlotClassNames = Partial<Record<'track' | 'fill' | 'label', string>>;
export type ProgressAdapterProps = Omit<ComponentPropsWithRef<'div'>,
  'children' | 'role' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuenow'> & ProgressCoreOptions & {
    showPercent?: boolean;
    slotClassNames?: ProgressSlotClassNames;
    'aria-valuemin'?: never;
    'aria-valuemax'?: never;
    'aria-valuenow'?: never;
  };

export function ProgressAdapter({ value, max, showPercent = true, slotClassNames, ...props }: ProgressAdapterProps) {
  const state = getProgressState({ value, max });
  return <div {...props} {...state.rootProps} data-ui="progress">
    <div data-slot="track" className={slotClassNames?.track} aria-hidden="true">
      <div data-slot="fill" className={slotClassNames?.fill} style={{ width: `${state.percent}%` }} />
    </div>
    {showPercent && <span data-slot="label" className={slotClassNames?.label}>{Math.round(state.percent)}%</span>}
  </div>;
}
