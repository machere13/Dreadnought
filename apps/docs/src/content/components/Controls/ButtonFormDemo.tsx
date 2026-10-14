import { useState } from 'react';
import { Button, Input } from '@dreadnought/ui/react';

export function ButtonFormDemo() {
  const [name, setName] = useState('');
  return (
    <div>
      <form
        style={{ display: 'grid', gap: 16 }}
        onSubmit={(event) => {
          event.preventDefault();
          const nextName = String(new FormData(event.currentTarget).get('name') ?? '').trim();
          if (nextName) setName(nextName);
        }}
        onReset={() => setName('')}
      >
        <label htmlFor="button-form-name">Имя для отправки</label>
        <Input id="button-form-name" name="name" required placeholder="Например, Анна" />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Button type="submit">Отправить форму</Button>
          <Button type="reset" variant="secondary">
            Очистить форму
          </Button>
        </div>
      </form>
      <p role="status">{name ? `Отправлено имя: ${name}` : 'Форма ещё не отправлена'}</p>
    </div>
  );
}
