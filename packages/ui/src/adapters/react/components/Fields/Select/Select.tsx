import { SelectAdapter } from '@dreadnought/react/unstyled';
import type { SelectAdapterProps } from '@dreadnought/react/unstyled';
import { selectPresentation } from '#presentation/Fields/Select/selectPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
export type SelectProps = SelectAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
export function Select({ className, slotProps, ...props }: SelectProps) {
  return <SelectAdapter {...props} className={classes(selectPresentation.root, className)}
    indicator={props.indicator ?? <Icon name="down" />} clearContent={props.clearContent ?? <Icon name="close" />}
    slotProps={{ ...slotProps,
      popup: { ...slotProps?.popup, className: classes(selectPresentation.popup, slotProps?.popup?.className) },
      option: { ...slotProps?.option, className: classes(selectPresentation.option, slotProps?.option?.className) },
      groupLabel: { ...slotProps?.groupLabel, className: classes(selectPresentation.groupLabel, slotProps?.groupLabel?.className) },
      clear: { ...slotProps?.clear, className: classes(selectPresentation.clear, slotProps?.clear?.className) },
    }} />;
}
