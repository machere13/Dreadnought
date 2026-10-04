import { RadioAdapter, RadioGroupAdapter } from '@dreadnought/react/unstyled';
import type { RadioAdapterProps, RadioGroupAdapterProps } from '@dreadnought/react/unstyled';
import { radioPresentation } from '#presentation/Fields/Radio/radioPresentation.ts';

export type RadioProps = RadioAdapterProps;
export type RadioGroupProps = RadioGroupAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
function RadioComponent({ className, slotProps, ...props }: RadioProps) {
  return <RadioAdapter {...props} className={classes(radioPresentation.root, className)} slotProps={{
    ...slotProps, indicator: { ...slotProps?.indicator, children: slotProps?.indicator?.children ?? <span className={radioPresentation.dot} /> },
  }} />;
}
function RadioGroup({ className, slotProps, ...props }: RadioGroupProps) {
  return <RadioGroupAdapter {...props} className={classes(radioPresentation.group, className)} slotProps={{
    ...slotProps, item: { ...slotProps?.item, className: classes(radioPresentation.root, slotProps?.item?.className),
      slotProps: { ...slotProps?.item?.slotProps, indicator: { ...slotProps?.item?.slotProps?.indicator,
        children: slotProps?.item?.slotProps?.indicator?.children ?? <span className={radioPresentation.dot} /> } } },
  }} />;
}
export const Radio = Object.assign(RadioComponent, { Group: RadioGroup });
