import { TimePickerAdapter } from '@dreadnought/react/unstyled';
import type { TimePickerAdapterProps, TimePickerActionProps } from '@dreadnought/react/unstyled';
import { Button } from '../../Controls/Button/Button.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
import { Input } from '../Input/Input.tsx';
import { timePickerPresentation } from '#presentation/Fields/TimePicker/timePickerPresentation.ts';

export type TimePickerProps = Omit<TimePickerAdapterProps, 'renderField' | 'renderAction'>;

function TimeAction({ action, children, ...props }: TimePickerActionProps) {
  const icons = { clock: 'clock', clear: 'close', confirm: 'check' } as const;
  return (
    <Button
      {...props}
      size="compact"
      variant={action === 'confirm' ? 'primary' : 'ghosted'}
      icon={action === 'option' ? undefined : <Icon name={icons[action]} />}
    >
      {action === 'option' || action === 'confirm' ? children : undefined}
    </Button>
  );
}

export function TimePicker({ className, slotClassNames, ...props }: TimePickerProps) {
  return (
    <TimePickerAdapter
      {...props}
      className={[timePickerPresentation.root, className].filter(Boolean).join(' ')}
      slotClassNames={{
        ...slotClassNames,
        ...Object.fromEntries(
          Object.entries(timePickerPresentation.slots).map(([name, value]) => [
            name,
            [value, slotClassNames?.[name as keyof typeof slotClassNames]]
              .filter(Boolean)
              .join(' '),
          ]),
        ),
      }}
      renderField={(field) => <Input {...field} type="text" />}
      renderAction={(action) => <TimeAction {...action} />}
    />
  );
}
