import { SelectAdapter } from '@dreadnought/react/unstyled';
import type { SelectAdapterProps } from '@dreadnought/react/unstyled';
import { selectPresentation } from '#presentation/Fields/Select/selectPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
export type SelectProps = SelectAdapterProps & {
  controlSize?: 'default' | 'compact';
  variant?: 'outlined' | 'filled' | 'borderless';
};
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
export function Select({
  className,
  slotProps,
  controlSize = 'default',
  variant = 'outlined',
  ...props
}: SelectProps) {
  return (
    <SelectAdapter
      {...props}
      className={classes(
        selectPresentation.root,
        selectPresentation.sizes[controlSize],
        selectPresentation.variants[variant],
        className,
      )}
      indicator={props.indicator ?? <Icon name="down" />}
      clearContent={props.clearContent ?? <Icon name="close" />}
      removeContent={props.removeContent ?? <Icon name="close" />}
      slotProps={{
        ...slotProps,
        popup: {
          ...slotProps?.popup,
          className: classes(selectPresentation.popup, slotProps?.popup?.className),
        },
        option: {
          ...slotProps?.option,
          className: classes(selectPresentation.option, slotProps?.option?.className),
        },
        groupLabel: {
          ...slotProps?.groupLabel,
          className: classes(selectPresentation.groupLabel, slotProps?.groupLabel?.className),
        },
        clear: {
          ...slotProps?.clear,
          className: classes(selectPresentation.clear, slotProps?.clear?.className),
        },
        remove: {
          ...slotProps?.remove,
          className: classes(selectPresentation.clear, slotProps?.remove?.className),
        },
      }}
    />
  );
}
