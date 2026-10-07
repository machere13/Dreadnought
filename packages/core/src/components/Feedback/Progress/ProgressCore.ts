export interface ProgressCoreOptions { value?: number; max?: number }

export interface ProgressCore {
  value: number;
  max: number;
  percent: number;
  complete: boolean;
  rootProps: { role: 'progressbar'; 'aria-valuemin': 0; 'aria-valuemax': number; 'aria-valuenow': number };
}
