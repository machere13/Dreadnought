import type { ComponentPropsWithRef, ReactNode } from 'react';
import { getLoaderState } from '@dreadnought/core';

export type LoaderSlotClassNames = Partial<
  Record<'indicator' | 'graphic' | 'label' | 'content', string>
>;
export type LoaderAdapterProps = ComponentPropsWithRef<'div'> & {
  loading?: boolean;
  label?: string;
  indicator?: ReactNode;
  showLabel?: boolean;
  slotClassNames?: LoaderSlotClassNames;
};

export function LoaderAdapter({
  loading = true,
  label = 'Loading',
  indicator,
  showLabel = false,
  children,
  slotClassNames,
  ...props
}: LoaderAdapterProps) {
  const state = getLoaderState({ loading });
  const overlay = children != null;
  return (
    <div
      {...state.rootProps}
      {...props}
      data-ui="loader"
      data-overlay={overlay || undefined}
      data-loading={loading || undefined}
    >
      {overlay && (
        <div data-slot="content" className={slotClassNames?.content} inert={loading || undefined}>
          {children}
        </div>
      )}
      {loading && (
        <div
          {...state.indicatorProps}
          data-slot="indicator"
          className={slotClassNames?.indicator}
          aria-label={label}
        >
          <span data-slot="graphic" className={slotClassNames?.graphic} aria-hidden="true">
            {indicator}
          </span>
          {showLabel && (
            <span data-slot="label" className={slotClassNames?.label}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
