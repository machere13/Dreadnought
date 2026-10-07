import type { ComponentPropsWithoutRef } from 'react';

export interface SliderOptions {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  name?: string;
  form?: string;
}

export interface SliderSlotProps {
  root?: ComponentPropsWithoutRef<'div'>;
  rail?: ComponentPropsWithoutRef<'div'>;
  track?: ComponentPropsWithoutRef<'div'>;
  thumb?: ComponentPropsWithoutRef<'div'>;
  field?: ComponentPropsWithoutRef<'input'>;
}

export type UseSliderOptions = SliderOptions & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'defaultValue' | 'onChange'> & {
  slotProps?: SliderSlotProps;
};
