import { useState } from 'react';
import { useForm } from '@dreadnought/react/logic';
import { Button, DatePicker, Form, FormField } from '@dreadnought/ui/react';
import type { CalendarDate } from '@dreadnought/ui/react';

export function DatePickerDemo() {
  return <DatePicker aria-label="Дата" defaultValue="2026-10-12" locale="ru-RU" />;
}

export function DatePickerRangeDemo() {
  return (
    <DatePicker
      mode="range"
      aria-label="Период"
      defaultValue={['2026-10-10', '2026-10-20']}
      minDate="2026-01-01"
      maxDate="2026-12-31"
      locale="ru-RU"
    />
  );
}

export function DatePickerFormDemo() {
  const [saved, setSaved] = useState('');
  const form = useForm<{ date: CalendarDate | null }>({
    initialValues: { date: '2026-10-12' },
  });
  const date = form.field('date');
  return (
    <Form form={form} onFinish={values => setSaved(values.date ?? '')} onReset={() => setSaved('')}>
      <FormField label="Дата встречи" error={date.error}>
        {props => <DatePicker {...props} name="date" value={date.value} onChange={date.setValue} onBlur={date.onBlur} locale="ru-RU" />}
      </FormField>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Сохранить</Button>
        <Button type="reset" variant="secondary">Сбросить</Button>
      </div>
      {saved && <div role="status">{saved}</div>}
    </Form>
  );
}
