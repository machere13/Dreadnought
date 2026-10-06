import type { LoaderCore, LoaderCoreOptions } from './LoaderCore.ts';

export function getLoaderState({ loading = true }: LoaderCoreOptions = {}): LoaderCore {
  return { loading, rootProps: { 'aria-busy': loading }, indicatorProps: { role: loading ? 'status' : undefined, 'aria-live': loading ? 'polite' : undefined } };
}
