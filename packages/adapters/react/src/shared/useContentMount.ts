import { useLayoutEffect, useState } from 'react';
import { getContentMountState } from '@dreadnought/core';
import type { ContentMountPolicy } from '@dreadnought/core';

export function useContentMount(active: boolean, mountPolicy: ContentMountPolicy) {
  const [previousActive, setPreviousActive] = useState(active);
  const [visited, setVisited] = useState(active);
  useLayoutEffect(() => {
    setPreviousActive(active);
    if (active) setVisited(true);
  }, [active]);

  return getContentMountState({
    active: active || previousActive,
    visited,
    mountPolicy,
  }).mounted;
}
