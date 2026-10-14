import { useState } from 'react';
import { useForm } from '@dreadnought/react/logic';
import { Button, Form, FormField, TimePicker } from '@dreadnought/ui/react';
import type { ClockTime } from '@dreadnought/core';

export function TimePickerFormDemo() {
  const [saved, setSaved] = useState('');
  const form = useForm<{ time: ClockTime | null }>({
    initialValues: { time: '09:30:00' },
  });
  const time = form.field('time');
  return (
    <Form
      form={form}
      onFinish={(values) => setSaved(values.time ?? '')}
      onReset={() => setSaved('')}
    >
      <FormField label="Время" error={time.error}>
        {(props) => (
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
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button type="submit">Сохранить</Button>
        <Button type="reset" variant="secondary">
          Сбросить
        </Button>
      </div>
      {saved && (
        <p role="status" aria-label="Сохранённое время">
          {saved}
        </p>
      )}
    </Form>
  );
}
