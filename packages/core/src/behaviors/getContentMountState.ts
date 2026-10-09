export type ContentMountPolicy = 'eager' | 'lazy' | 'unmount';

export interface ContentMountOptions {
  active?: boolean;
  visited?: boolean;
  mountPolicy?: ContentMountPolicy;
}

export function getContentMountState({
  active = false,
  visited = false,
  mountPolicy = 'eager',
}: ContentMountOptions = {}) {
  if (mountPolicy !== 'eager' && mountPolicy !== 'lazy' && mountPolicy !== 'unmount') {
    throw new TypeError('Content mount policy must be eager, lazy or unmount.');
  }
  const nextVisited = visited || active;
  const mounted = mountPolicy === 'eager' || active || (mountPolicy === 'lazy' && nextVisited);
  return { mounted, visited: nextVisited };
}
