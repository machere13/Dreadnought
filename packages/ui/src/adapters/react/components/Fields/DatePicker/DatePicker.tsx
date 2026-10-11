import { DatePickerAdapter } from '@dreadnought/react/unstyled';
import type { DatePickerAdapterProps, DatePickerActionProps } from '@dreadnought/react/unstyled';
import { Button } from '../../Controls/Button/Button.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
import { Input } from '../Input/Input.tsx';
import { Select } from '../Select/Select.tsx';
import { datePickerPresentation } from '#presentation/Fields/DatePicker/datePickerPresentation.ts';

type ReadyProps<T> = T extends unknown
  ? Omit<T, 'renderField' | 'renderAction' | 'renderMonthSelect'>
  : never;
export type DatePickerProps = ReadyProps<DatePickerAdapterProps>;

function DatePickerAction({ action, children, ...props }: DatePickerActionProps) {
  const icons = { calendar: 'calendar', clear: 'close', previous: 'left', next: 'right' } as const;
  return (
    <Button
      {...props}
      size="compact"
      variant="ghosted"
      icon={action === 'day' ? undefined : <Icon name={icons[action]} />}
    >
      {action === 'day' ? children : undefined}
    </Button>
  );
}

export function DatePicker({ className, slotClassNames, ...props }: DatePickerProps) {
  return (
    <DatePickerAdapter
      {...props}
      className={[datePickerPresentation.root, className].filter(Boolean).join(' ')}
      slotClassNames={{ ...slotClassNames, ...Object.fromEntries(
        Object.entries(datePickerPresentation.slots).map(([name, value]) => [
          name,
          [value, slotClassNames?.[name as keyof typeof slotClassNames]].filter(Boolean).join(' '),
        ]),
      )}}
      renderField={(field) => (
        <Input {...field} controlSize={field.type === 'number' ? 'compact' : 'default'} />
      )}
      renderAction={(action) => <DatePickerAction {...action} />}
      renderMonthSelect={({ onChange, ...select }) => (
        <Select
          {...select}
          controlSize="compact"
          onValueChange={(value) => {
            if (value !== null) onChange(value);
          }}
        />
      )}
    />
  );
}
