import { useState } from 'react';
import { useForm } from '@dreadnought/react/logic';
import { Button, Form, FormField, Input } from '@dreadnought/ui/react';

const validators = {
  name: (value: string) => (value.trim() ? undefined : 'Введите имя'),
};

export function FormBasicDemo() {
  const [saved, setSaved] = useState('');
  const form = useForm({ initialValues: { name: '' }, validators });
  const name = form.field('name');
  return (
    <Form
      form={form}
      onFinish={(values) => setSaved(values.name.trim())}
      onReset={() => setSaved('')}
      style={{ maxWidth: '32rem', width: '100%' }}
    >
      <FormField label="Имя для сохранения" required error={name.error}>
        {(props) => (
          <Input
            {...props}
            name="name"
            required
            value={name.value}
            onChange={(event) => name.setValue(event.currentTarget.value)}
            onBlur={name.onBlur}
          />
        )}
      </FormField>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button type="submit" loading={form.submitting}>
          Сохранить имя
        </Button>
        <Button type="reset" variant="secondary">
          Очистить форму
        </Button>
      </div>
      {saved && <p role="status">Сохранено имя: {saved}</p>}
    </Form>
  );
}
