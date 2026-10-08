import { createRef } from 'react';
import { ProgressAdapter } from '@dreadnought/react/unstyled';

export const Valid = (
  <ProgressAdapter value={3} max={8} ref={createRef<HTMLDivElement>()} aria-label="Upload" />
);
// @ts-expect-error semantics belong to core
export const InvalidRole = <ProgressAdapter role="button" />;
// @ts-expect-error semantics belong to core
export const InvalidValue = <ProgressAdapter aria-valuenow={99} />;
// @ts-expect-error presentation belongs to layer three
export const InvalidStatus = <ProgressAdapter status="success" />;
export const InvalidChildren = (
  // @ts-expect-error progress is not a content container
  <ProgressAdapter>
    <button>Action</button>
  </ProgressAdapter>
);
