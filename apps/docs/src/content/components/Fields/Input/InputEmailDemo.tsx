import { useId, useState } from 'react';
import { Button, Form, Input } from '@dreadnought/ui/react';

export function InputEmailDemo() {
  const id = useId();
  const [saved, setSaved] = useState('');
  return (
    <Form
      style={{ maxWidth: '32rem', width: '100%' }}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(String(new FormData(event.currentTarget).get('email') ?? ''));
      }}
    >
      <label htmlFor={id}>Электронная почта</label>
      <Input
        id={id}
        type="email"
        name="email"
        required
        autoComplete="off"
        placeholder="name@example.com"
      />
      <Button type="submit">Сохранить почту</Button>
      {saved && <p role="status">Сохранённая почта: {saved}</p>}
    </Form>
  );
}
