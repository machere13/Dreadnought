import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type SliderRange = [number, number];

interface SliderCommonOptions {
  min?: number;
  max?: number;
  step?: number | null;
  marks?: Readonly<Record<number, ReactNode>>;
  disabled?: boolean;
  name?: string;
  form?: string;
}

export interface SingleSliderOptions extends SliderCommonOptions {
  range?: false;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

export interface RangeSliderOptions extends SliderCommonOptions {
  range: true;
  value?: readonly [number, number];
  defaultValue?: readonly [number, number];
  onValueChange?: (value: SliderRange) => void;
}

export type SliderOptions = SingleSliderOptions | RangeSliderOptions;

export interface SliderSlotProps {
  root?: ComponentPropsWithoutRef<'div'>;
  rail?: ComponentPropsWithoutRef<'div'>;
  track?: ComponentPropsWithoutRef<'div'>;
  mark?: ComponentPropsWithoutRef<'button'>;
  thumb?: ComponentPropsWithoutRef<'div'> | readonly [ComponentPropsWithoutRef<'div'>, ComponentPropsWithoutRef<'div'>];
  field?: ComponentPropsWithoutRef<'input'> | readonly [ComponentPropsWithoutRef<'input'>, ComponentPropsWithoutRef<'input'>];
}

type SliderDOMOptions = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'defaultValue' | 'onChange'> & {
  slotProps?: SliderSlotProps;
};

export type UseSingleSliderOptions = SingleSliderOptions & SliderDOMOptions;
export type UseRangeSliderOptions = RangeSliderOptions & SliderDOMOptions;
export type UseSliderOptions = UseSingleSliderOptions | UseRangeSliderOptions;
