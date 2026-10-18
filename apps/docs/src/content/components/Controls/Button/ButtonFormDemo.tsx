import { useState } from 'react';
import { Button, Form, FormField, Input } from '@dreadnought/ui/react';

export function ButtonFormDemo() {
  const [name, setName] = useState('');
  return (
    <div>
      <Form
        style={{ display: 'grid', gap: 16 }}
        onSubmit={(event) => {
          event.preventDefault();
          const nextName = String(new FormData(event.currentTarget).get('name') ?? '').trim();
          if (nextName) setName(nextName);
        }}
        onReset={() => setName('')}
      >
        <FormField label="Имя для отправки" required>
          {(props) => <Input {...props} name="name" required placeholder="Например, Анна" />}
        </FormField>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Button type="submit">Отправить форму</Button>
          <Button type="reset" variant="secondary">
            Очистить форму
          </Button>
        </div>
      </Form>
      <p role="status">{name ? `Отправлено имя: ${name}` : 'Форма ещё не отправлена'}</p>
    </div>
  );
}
