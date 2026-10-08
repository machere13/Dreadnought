export type ToastType = 'info' | 'success' | 'warning' | 'error';
export interface ToastCoreOptions {
  open?: boolean;
  type?: ToastType;
}
export interface ToastCore {
  open: boolean;
  rootProps: { role: 'alert' | 'status' | undefined; 'aria-atomic': true };
}
