import { CheckboxAdapter, CheckboxGroupAdapter } from '@dreadnought/react/unstyled';
import type { CheckboxAdapterProps, CheckboxGroupAdapterProps } from '@dreadnought/react/unstyled';
import { checkboxPresentation } from '#presentation/Fields/Checkbox/checkboxPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
export type CheckboxProps = CheckboxAdapterProps;
export type CheckboxGroupProps = CheckboxGroupAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
function CheckboxComponent({ className, slotProps, ...props }: CheckboxProps) {
  return (
    <CheckboxAdapter
      {...props}
      className={classes(checkboxPresentation.root, className)}
      slotProps={{
        ...slotProps,
        indicator: {
          ...slotProps?.indicator,
          children:
            slotProps?.indicator?.children ?? (props.indeterminate ? '−' : <Icon name="check" />),
        },
      }}
    />
  );
}
function CheckboxGroup({ className, slotProps, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupAdapter
      {...props}
      className={classes(checkboxPresentation.group, className)}
      slotProps={{
        ...slotProps,
        item: {
          ...slotProps?.item,
          className: classes(checkboxPresentation.root, slotProps?.item?.className),
          slotProps: {
            ...slotProps?.item?.slotProps,
            indicator: {
              ...slotProps?.item?.slotProps?.indicator,
              children: slotProps?.item?.slotProps?.indicator?.children ?? <Icon name="check" />,
            },
          },
        },
      }}
    />
  );
}
export const Checkbox = Object.assign(CheckboxComponent, { Group: CheckboxGroup });
