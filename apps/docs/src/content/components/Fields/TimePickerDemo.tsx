import { useState } from 'react';
import { useForm } from '@dreadnought/react/logic';
import { Button, Form, FormField, TimePicker } from '@dreadnought/ui/react';
import type { ClockTime } from '@dreadnought/core';

export function TimePickerDemo() {
  return <TimePicker aria-label="Время" defaultValue="09:30:00" />;
}

export function TimePickerSecondsDemo() {
  return <TimePicker aria-label="Время с секундами" showSeconds defaultValue="09:30:15" />;
}

export function TimePickerLimitsDemo() {
  return (
    <TimePicker
      aria-label="Рабочее время"
      defaultValue="09:30:00"
      minTime="09:00:00"
      maxTime="18:00:00"
      minuteStep={15}
      disabledTime={{ hours: [13] }}
    />
  );
}

export function TimePickerFormDemo() {
  const [saved, setSaved] = useState('');
  const form = useForm<{ time: ClockTime | null }>({
    initialValues: { time: '09:30:00' },
  });
  const time = form.field('time');
  return (
    <Form form={form} onFinish={values => setSaved(values.time ?? '')} onReset={() => setSaved('')}>
      <FormField label="Время" error={time.error}>
        {props => (
          <TimePicker
            {...props}
            name="time"
            value={time.value}
            onChange={time.setValue}
            onBlur={time.onBlur}
            minuteStep={15}
          />
        )}
      </FormField>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Сохранить</Button>
        <Button type="reset" variant="secondary">Сбросить</Button>
      </div>
      {saved && <div role="status">{saved}</div>}
    </Form>
  );
}
