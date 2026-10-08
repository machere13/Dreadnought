import type { ComponentPropsWithRef, JSX } from 'react';

export type ChartNative<
  Tag extends keyof JSX.IntrinsicElements,
  Owned extends string = never,
> = Omit<ComponentPropsWithRef<Tag>, Owned | 'children' | 'dangerouslySetInnerHTML'> & {
  children?: never;
  dangerouslySetInnerHTML?: never;
};
export function chartNativeProps<T extends object>(
  props: T | undefined,
  owned: readonly string[] = [],
): T {
  const result = { ...props } as T;
  for (const key of ['children', 'dangerouslySetInnerHTML', ...owned]) {
    delete (result as Record<string, unknown>)[key];
  }
  return result;
}
