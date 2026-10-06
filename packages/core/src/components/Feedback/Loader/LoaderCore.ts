export interface LoaderCoreOptions { loading?: boolean }
export interface LoaderCore {
  loading: boolean;
  rootProps: { 'aria-busy': boolean };
  indicatorProps: { role: 'status' | undefined; 'aria-live': 'polite' | undefined };
}
